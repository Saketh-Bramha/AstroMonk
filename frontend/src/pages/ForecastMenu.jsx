import { useAstro } from '../context/AstroContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ArrowLeft, TrendingUp, Sparkles, Moon } from 'lucide-react';

const forecasts = [
  { id: 'weekly', title: 'Weekly Forecast', icon: TrendingUp, color: 'text-blue-400', desc: 'Cosmic currents for the next 7 days.' },
  { id: 'monthly', title: 'Monthly Forecast', icon: Moon, color: 'text-indigo-400', desc: 'Deep dive into the month ahead.' },
  { id: 'yearly', title: 'Yearly Destiny', icon: Sparkles, color: 'text-purple-400', desc: 'Broad trajectory for the next 12 months.' }
];

export default function ForecastMenu() {
  const { user, birthDetails } = useAstro();
  const navigate = useNavigate();

  if (!user || !birthDetails) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen p-6 md:p-12 relative flex flex-col">
      <div className="flex items-center mb-12 space-x-4">
        <button onClick={() => navigate('/dashboard')} className="p-2 glass-panel rounded-full hover:bg-white/10 transition text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-3">
          <Calendar className="w-8 h-8 text-blue-400" />
          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white">
            Select Forecast
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {forecasts.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(`/feature/${f.id}`)}
              className="glass-panel p-6 cursor-pointer hover:border-blue-400/50 transition-all hover:shadow-[0_0_20px_rgba(96,165,250,0.1)] flex flex-col items-center text-center group"
            >
              <div className={`p-4 rounded-full bg-white/5 ${f.color} group-hover:scale-110 transition-transform mb-4`}>
                <f.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{f.title}</h3>
              <p className="text-purple-200/70 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
