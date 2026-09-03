import { useState } from 'react';
import { useAstro } from '../context/AstroContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Details() {
  const { saveDetails, user, birthDetails } = useAstro();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: birthDetails?.name || user?.displayName || '',
    dob: birthDetails?.dob || '',
    time: birthDetails?.time || '',
    place: birthDetails?.place || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveDetails(formData);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 max-w-lg w-full z-10"
      >
        <div className="text-center mb-8">
          <Sparkles className="w-10 h-10 text-cosmic-gold mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-white">Your Cosmic Coordinates</h2>
          <p className="text-purple-200/70 text-sm mt-2">Enter the exact time and place of your birth to align the stars.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
          
          <div className="pt-4">
            <button type="submit" className="btn-primary w-full flex items-center justify-center space-x-2">
              <span>Enter the Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
