import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Moon, Sun, AlertTriangle, Loader2 } from 'lucide-react';
import './index.css';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    time: '',
    place: '',
    question: ''
  });

  const [loading, setLoading] = useState(false);
  const [predictResult, setPredictResult] = useState(null);
  const [chartResult, setChartResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPredictResult(null);
    setChartResult(null);

    try {
      const response = await fetch('https://astromonk-api.onrender.com/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setPredictResult(data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(`Connection failed. Please ensure the backend is running.`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateChart = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setChartResult(null);
    setPredictResult(null);

    try {
      const response = await fetch('https://astromonk-api.onrender.com/generate_chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.status === 'success') {
        setChartResult(data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(`Connection failed. Please ensure the backend is running.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 relative overflow-hidden flex flex-col items-center">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12 relative z-10"
      >
        <div className="inline-flex items-center justify-center space-x-3 mb-4">
          <Moon className="w-8 h-8 text-cosmic-gold" />
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cosmic-gold to-white">
            M.O.N.K. Astro
          </h1>
          <Sun className="w-8 h-8 text-cosmic-gold" />
        </div>
        <p className="text-lg md:text-xl text-purple-200/80 font-light tracking-wide uppercase">
          Dual Engine Cosmic Intelligence
        </p>
      </motion.div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Form Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-span-4 glass-panel p-8"
        >
          <form onSubmit={handlePredict} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-purple-200/80 mb-1 ml-1">Seeker's Name</label>
              <input name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="E.g. Alexander" required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-purple-200/80 mb-1 ml-1">Date of Birth</label>
                <input name="dob" type="date" value={formData.dob} onChange={handleChange} className="input-field text-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-200/80 mb-1 ml-1">Time of Birth</label>
                <input name="time" type="time" value={formData.time} onChange={handleChange} className="input-field text-white" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200/80 mb-1 ml-1">Place of Birth</label>
              <input name="place" value={formData.place} onChange={handleChange} className="input-field" placeholder="City, Country" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200/80 mb-1 ml-1">Your Cosmic Doubt</label>
              <textarea name="question" value={formData.question} onChange={handleChange} className="input-field resize-none" placeholder="What clarity do you seek?" required rows={3} />
            </div>
            
            <div className="pt-4 flex flex-col space-y-3">
              <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span>Consult the Oracles</span>
              </button>
              <button type="button" onClick={handleGenerateChart} disabled={loading} className="btn-secondary">
                Generate Birth Chart
              </button>
            </div>
          </form>
        </motion.div>

        {/* Results Section */}
        <div className="lg:col-span-8 flex flex-col">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center space-y-6 min-h-[400px]"
              >
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 border-t-2 border-cosmic-gold rounded-full animate-spin"></div>
                  <div className="absolute inset-2 border-r-2 border-cosmic-accent rounded-full animate-[spin_2s_linear_reverse]"></div>
                  <div className="absolute inset-4 border-b-2 border-purple-400 rounded-full animate-spin"></div>
                  <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-white animate-pulse" />
                </div>
                <p className="text-xl text-purple-200 tracking-widest uppercase font-light animate-pulse">
                  Aligning the Stars...
                </p>
              </motion.div>
            )}

            {error && !loading && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="glass-panel border-red-500/30 p-8 text-center"
              >
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-red-200 mb-2">Cosmic Interference</h3>
                <p className="text-red-200/80">{error}</p>
              </motion.div>
            )}

            {predictResult && !loading && (
              <motion.div 
                key="predict"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 gap-6"
              >
                <div className="glass-panel p-8 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span>Cosmic Oracle (Gemini)</span>
                  </h2>
                  <div className="reading-content" dangerouslySetInnerHTML={{ __html: predictResult.gemini_data }} />
                </div>
              </motion.div>
            )}

            {chartResult && !loading && (
              <motion.div 
                key="chart"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-8 md:p-12"
              >
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cosmic-gold to-white mb-8 border-b border-white/10 pb-4 inline-block">
                  Astrological Birth Chart
                </h2>
                <div className="reading-content text-lg" dangerouslySetInnerHTML={{ __html: chartResult.data }} />
              </motion.div>
            )}
            
            {!loading && !error && !predictResult && !chartResult && (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 mt-20 lg:mt-0">
                <Moon className="w-24 h-24 mb-6" />
                <p className="text-2xl font-light">The stars await your question.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default App;
