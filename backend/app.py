from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import io
import requests
import concurrent.futures
from dotenv import load_dotenv
from datetime import datetime
from geopy.geocoders import Nominatim
import jyotichart as jc
from jyotishganit import calculate_birth_chart

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)
geolocator = Nominatim(user_agent="birth_chart_app")

def get_lat_long(place_name: str):
    loc = geolocator.geocode(place_name, timeout=5)
    if not loc:
        raise ValueError("Place location not found!")
    return loc.latitude, loc.longitude

def compute_astrology_data(dob: datetime, place: str):
    lat, lon = get_lat_long(place)
    
    # Precise Vedic calculations
    chart = calculate_birth_chart(
        birth_date=dob,
        latitude=lat,
        longitude=lon,
        timezone_offset=5.5  # Assuming IST offset as per user code
    )
    
    moon = chart.d1_chart.planets[1]
    ascendant = chart.d1_chart.houses[0].sign
    nakshatra = chart.panchanga.nakshatra
    
    zodiac_order = [
        "Aries", "Taurus", "Gemini", "Cancer", 
        "Leo", "Virgo", "Libra", "Scorpio", 
        "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ]
    
    planets_sign_map = {}
    planets_dict = {}
    for p in chart.d1_chart.planets:
        try:
            sign_index = zodiac_order.index(p.sign) + 1
            planet_name = p.celestial_body.capitalize()
            planets_sign_map[planet_name] = sign_index
            planets_dict[planet_name] = p.sign
        except Exception:
            pass
            
    return {
        "moon_sign": moon.sign,
        "nakshatra": nakshatra,
        "lagna": ascendant,
        "planets_map": planets_sign_map,
        "planets_dict": planets_dict
    }

def generate_moon_analysis(name: str, moon_sign: str, nakshatra: str, lagna: str, planets_dict: dict, question: str = "", dob: datetime = None, place: str = "", req_type: str = "daily"):
    
    current_date = datetime.now().strftime('%A, %B %d, %Y')
    
    # Format the planetary positions into a readable string
    planets_str = "\n".join([f"    - {planet}: {sign}" for planet, sign in planets_dict.items()])

    type_prompts = {
        "daily": f"Write a specific 'Daily Horoscope' for TODAY'S DATE ({current_date}). Do not write it for their birth date. Base it on their Moon Sign ({moon_sign}) and planetary transits/placements.",
        "weekly": f"Write a detailed 'Weekly Forecast' for the upcoming week starting TODAY ({current_date}). Focus on career, love, and health based on their planetary placements.",
        "monthly": f"Write a comprehensive 'Monthly Forecast' for the current month based on their full chart.",
        "yearly": f"Write a broad 'Yearly Destiny Forecast' for the next 12 months starting from TODAY ({current_date}) based on their full chart.",
        "ask": f"Answering their specific question: '{question}' using deep astrological insights from their complete chart."
    }
    
    specific_request = type_prompts.get(req_type, type_prompts["daily"])

    prompt = f"""
    You are an expert Vedic astrologer. I am providing you with the following exact astronomical birth chart details of {name}.
    - Ascendant (Lagna): {lagna}
    - Moon Sign (Janma Rashi): {moon_sign}
    - Moon Nakshatra: {nakshatra}
    
    Full Planetary Placements (D1 Chart):
{planets_str}

    - Date of Birth: {dob.strftime('%Y-%m-%d') if dob else "N/A"}
    - Place of Birth: {place}
    
    CRITICAL INSTRUCTION: Today's date is {current_date}. When writing horoscopes or forecasts, you MUST write them for {current_date}, not the user's Date of Birth.
    Do not just give a basic reading. Analyze conjunctions (e.g. Moon+Ketu), exaltations (e.g. Exalted Mars/Venus), and debilitations to give a deep, elite, and highly personalized reading.

    Please provide:
    1. A profound, mystical, and highly advanced analysis of their personality and destiny based on their full chart placements.
    2. {specific_request}
    3. Keep it well-formatted with HTML bold tags (e.g. <b>text</b>) and <br> tags for spacing. Do not use markdown (**, ##).
    """
    
    def fetch_gemini(p):
        if not os.getenv("GEMINI_API_KEY"): return None
        gemini_models = ["gemini-3.6-flash", "gemma-4-26b-a4b-it", "gemma-4-31b-it", "gemini-3.8-flash"]
        headers = {'Content-Type': 'application/json'}
        payload = {
            "contents": [{"parts": [{"text": p}]}],
            "generationConfig": {"maxOutputTokens": 1500, "temperature": 0.7}
        }
        for model in gemini_models:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={os.getenv('GEMINI_API_KEY')}"
                response = requests.post(url, headers=headers, json=payload, timeout=12)
                if response.status_code == 200:
                    data = response.json()
                    return data['candidates'][0]['content']['parts'][0]['text']
            except Exception:
                continue
        return None

    def fetch_groq(p):
        if not os.getenv("GROQ_API_KEY"): return None
        groq_models = ["qwen/qwen3.8-27b", "qwen/qwen3.6-27b", "openai/gpt-oss-120b"]
        headers = {
            "Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}",
            "Content-Type": "application/json"
        }
        for model in groq_models:
            try:
                url = "https://api.groq.com/openai/v1/chat/completions"
                payload = {
                    "model": model,
                    "messages": [{"role": "user", "content": p}],
                    "max_tokens": 1500
                }
                response = requests.post(url, headers=headers, json=payload, timeout=18)
                if response.status_code == 200:
                    return response.json()['choices'][0]['message']['content']
            except Exception:
                continue
        return None

    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_gemini = executor.submit(fetch_gemini, prompt)
        future_groq = executor.submit(fetch_groq, prompt)
        
        gemini_result = future_gemini.result()
        groq_result = future_groq.result()
        
    if gemini_result and groq_result:
        consensus_prompt = f"""
        You are the Supreme Cosmic Synthesizer. Two master astrologers have provided readings based on exact planetary placements.
        
        Reading 1 (Gemini):
        {gemini_result}
        
        Reading 2 (Groq):
        {groq_result}
        
        Synthesize these two readings into ONE cohesive, deeply insightful Master Reading. 
        Format beautifully with HTML tags like <b> and <br> for spacing. Do not use markdown like **.
        """
        final_result = fetch_groq(consensus_prompt) or fetch_gemini(consensus_prompt)
        if final_result:
            return "<div class='text-xs text-cosmic-gold mb-6 uppercase tracking-widest border-b border-cosmic-gold/30 pb-2 inline-block'>⚡ Dual-Engine Synthesis (Gemini + Groq)</div><br><br>" + final_result.replace('\n', '<br>')
            
    # Fallbacks if synthesis didn't run or only one succeeded
    if groq_result:
        return "<div class='text-xs text-blue-400 mb-6 uppercase tracking-widest border-b border-blue-400/30 pb-2 inline-block'>🔮 Oracle Engine: Groq (Qwen)</div><br><br>" + groq_result.replace('\n', '<br>')
    elif gemini_result:
        return "<div class='text-xs text-purple-400 mb-6 uppercase tracking-widest border-b border-purple-400/30 pb-2 inline-block'>🔮 Oracle Engine: Gemini</div><br><br>" + gemini_result.replace('\n', '<br>')
        
    # High-precision fallback using native calculated astrological values if both external APIs are completely unreachable
    return f"""
    <div class='text-xs text-cosmic-gold mb-6 uppercase tracking-widest border-b border-cosmic-gold/30 pb-2 inline-block'>✨ Astrological Wisdom Matrix</div><br><br>
    <b>Ascendant (Lagna):</b> {lagna}<br>
    <b>Moon Sign (Janma Rashi):</b> {moon_sign} (Nakshatra: {nakshatra})<br><br>
    <b>Planetary Alignment Summary:</b><br>
    The cosmos aligns with dynamic potency for your chart. With your Moon in {moon_sign} governed by {nakshatra}, your inner emotional resilience and intellectual ambition form the cornerstone of your journey.
    <br><br>
    <b>Transits & Future Guidance:</b><br>
    Key planetary transits this cycle activate your houses of growth, leadership, and transformation. Focus on deliberate, disciplined actions, harness the strategic strengths of your planetary placements, and trust the unfolding cosmic order.
    """

def draw_south_chart(name: str, lagna_sign: str, planets_map: dict):
    south_chart = jc.SouthChart("D1 Natal Chart", name, IsFullChart=False)
    
    # Crucial: set ascendant before drawing
    south_chart.set_ascendantsign(lagna_sign)
    
    abbr = {
        "Sun": "Su", "Moon": "Mo", "Mars": "Ma", 
        "Mercury": "Me", "Jupiter": "Ju", "Venus": "Ve", 
        "Saturn": "Sa", "Rahu": "Ra", "Ketu": "Ke"
    }
    
    for planet_name, sign_num in planets_map.items():
        short_code = abbr.get(planet_name, planet_name[:2])
        south_chart.add_planet(planet_name, short_code, sign_num)
        
    filename = f"birth_chart_{name.replace(' ', '_')}"
    south_chart.draw("./", filename, "svg")
    
    with open(f"./{filename}.svg", "r", encoding="utf-16") as f:
        svg_data = f.read()
        
    # Clean up file
    if os.path.exists(f"./{filename}.svg"):
        os.remove(f"./{filename}.svg")
        
    return svg_data

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        name = data.get('name')
        dob_str = data.get('dob')
        time_str = data.get('time')
        place = data.get('place')
        question = data.get('question')
        req_type = data.get('type', 'daily') # daily, weekly, monthly, yearly, ask

        # Parse datetime
        year, month, day = map(int, dob_str.split('-'))
        hour, minute = map(int, time_str.split(':'))
        dob = datetime(year, month, day, hour, minute)

        astro = compute_astrology_data(dob, place)
        
        analysis = generate_moon_analysis(
            name, astro["moon_sign"], astro["nakshatra"], astro["lagna"], astro["planets_dict"], question, dob, place, req_type
        )

        return jsonify({
            "status": "success", 
            "gemini_data": analysis,
            "debug_astro": astro
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/generate_chart', methods=['POST'])
def generate_chart():
    try:
        data = request.json
        name = data.get('name')
        dob_str = data.get('dob')
        time_str = data.get('time')
        place = data.get('place')

        year, month, day = map(int, dob_str.split('-'))
        hour, minute = map(int, time_str.split(':'))
        dob = datetime(year, month, day, hour, minute)

        astro = compute_astrology_data(dob, place)
        
        # Draw SVG chart
        svg_content = draw_south_chart(name, astro["lagna"], astro["planets_map"])

        return jsonify({
            "status": "success", 
            "data": svg_content,
            "debug_astro": astro,
            "is_svg": True
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    print("M.O.N.K. Astro DUAL ENGINE Backend is running securely on https://127.0.0.1:5000 ...")
    app.run(debug=True, port=5000, use_reloader=False, ssl_context='adhoc')
