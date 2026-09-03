from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from datetime import datetime
from geopy.geocoders import Nominatim
import requests
import json
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
    for p in chart.d1_chart.planets:
        try:
            sign_index = zodiac_order.index(p.sign) + 1
            planet_name = p.celestial_body.capitalize()
            planets_sign_map[planet_name] = sign_index
        except Exception:
            pass
            
    return {
        "moon_sign": moon.sign,
        "nakshatra": nakshatra,
        "lagna": ascendant,
        "planets_map": planets_sign_map
    }

def generate_moon_analysis(name: str, moon_sign: str, nakshatra: str, lagna: str, question: str = ""):
    prompt = f"""
    You are an expert Vedic astrologer. 
    Analyze this birth chart focusing EXPLICITLY on the Moon Sign (Janma Rashi).
    
    Person Details:
    - Name: {name}
    - Moon Sign (Janma Rashi): {moon_sign}
    - Birth Star (Nakshatra): {nakshatra}
    - Lagna (Ascendant): {lagna}
    """
    if question:
        prompt += f"\n    They asked this specific question: {question}\n    Answer their question incorporating these cosmic alignments.\n"

    prompt += """
    Please provide:
    1. Core personality & emotional nature governed by the Rashi.
    2. Career & leadership traits.
    3. Current cosmic strengths and practical remedies based on the Moon Sign.
    Keep the tone insightful, structured, and use HTML tags (like <strong>, <h3>, <br>) so it renders beautifully. Do not use markdown like **.
    """
    
    # Using REST API
    models_to_try = ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-flash-latest"]
    headers = {'Content-Type': 'application/json'}
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    
    for model in models_to_try:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={os.getenv('GEMINI_API_KEY')}"
            response = requests.post(url, headers=headers, json=payload, timeout=15)
            if response.status_code == 200:
                data = response.json()
                text = data['candidates'][0]['content']['parts'][0]['text']
                return text.replace("\n", "<br>")
        except Exception:
            continue
    return "Error generating analysis from Gemini."

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

        # Parse datetime
        year, month, day = map(int, dob_str.split('-'))
        hour, minute = map(int, time_str.split(':'))
        dob = datetime(year, month, day, hour, minute)

        astro = compute_astrology_data(dob, place)
        
        analysis = generate_moon_analysis(
            name, astro["moon_sign"], astro["nakshatra"], astro["lagna"], question
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
