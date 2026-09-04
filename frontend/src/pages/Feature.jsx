import { useState, useEffect } from 'react';
import { useAstro } from '../context/AstroContext';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, AlertTriangle, Moon } from 'lucide-react';

export default function Feature() {
  const { type } = useParams();
  const { user, birthDetails } = useAstro();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [question, setQuestion] = useState('');

  if (!user || !birthDetails) return <Navigate to="/login" />;

  const titles = {
    daily: 'Daily Horoscope',
    weekly: 'Weekly Forecast',
    monthly: 'Monthly Forecast',
    yearly: 'Yearly Destiny Forecast',
    chart: 'Birth Chart (Kundli)',
    ask: 'Cosmic Oracle'
  };

  const fetchData = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    const payload = { ...birthDetails, type };
    if (type === 'ask') payload.question = question;

    // Use predict for AI responses, generate_chart for the chart
    const endpoint = type === 'chart' ? '/generate_chart' : '/predict';
    
    try {
      // Change to astromonk-api.onrender.com for production
      const response = await fetch(`https://astromonk-api.onrender.com${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.status === 'success') {
        setResult(data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Connection failed. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch if not asking a custom question
  useEffect(() => {
    if (type !== 'ask') {
      fetchData();
    }
  }, [type]);

  return (
    <div className="min-h-screen p-6 md:p-12 relative flex flex-col">
      <div className="flex items-center mb-8 space-x-4">
        <button onClick={() => navigate('/dashboard')} className="p-2 glass-panel rounded-full hover:bg-white/10 transition text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cosmic-gold to-white">
          {titles[type] || 'Reading'}
        </h1>
      </div>

      <div className="flex-1 flex flex-col items-center max-w-4xl mx-auto w-full">
        {type === 'ask' && !result && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full glass-panel p-8 mb-8">
            <form onSubmit={fetchData} className="flex flex-col space-y-4">
              <label className="text-lg text-purple-200">What clarity do you seek from the cosmos?</label>
              <textarea 
                value={question} 
                onChange={e => setQuestion(e.target.value)} 
                className="input-field resize-none h-32" 
                placeholder="E.g. When will I start my company?" 
                required 
              />
              <button type="submit" className="btn-primary w-full max-w-xs mx-auto">Ask the Oracle</button>
            </form>
          </motion.div>
        )}

        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 mt-20">
            <Loader2 className="w-12 h-12 text-cosmic-gold animate-spin" />
            <p className="text-xl text-purple-200 tracking-widest uppercase font-light animate-pulse">
              Consulting the Stars...
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="glass-panel border-red-500/30 p-8 text-center mt-10">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-red-200 mb-2">Cosmic Interference</h3>
            <p className="text-red-200/80">{error}</p>
          </div>
        )}

        {result && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
            <div className="glass-panel p-8 md:p-12">
              <div className="reading-content text-lg" dangerouslySetInnerHTML={{ __html: type === 'chart' ? result.data : result.gemini_data }} />
            </div>
            {type === 'ask' && (
              <div className="mt-8 text-center">
                <button onClick={() => {setResult(null); setQuestion('');}} className="btn-secondary">Ask Another Question</button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
