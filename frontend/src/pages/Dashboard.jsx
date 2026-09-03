import { useAstro } from '../context/AstroContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Moon, Calendar, Map, MessageCircle, LogOut } from 'lucide-react';

const features = [
  { id: 'daily', title: 'Daily Horoscope', icon: Sun, color: 'text-yellow-400', desc: 'Cosmic guidance for today based on your Moon sign.' },
  { id: 'weekly', title: 'Weekly Forecast', icon: Calendar, color: 'text-blue-400', desc: 'A deeper look into the week ahead.' },
  { id: 'chart', title: 'Birth Chart (Kundli)', icon: Map, color: 'text-purple-400', desc: 'Generate your exact South Indian Vedic chart.' },
  { id: 'ask', title: 'Ask the Oracle', icon: MessageCircle, color: 'text-emerald-400', desc: 'Ask specific questions to the cosmic AI.' },
];

export default function Dashboard() {
  const { user, birthDetails, logout } = useAstro();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" />;
  if (!birthDetails) return <Navigate to="/details" />;

  return (
    <div className="min-h-screen p-6 md:p-12 relative">
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center space-x-3">
          <Moon className="w-8 h-8 text-cosmic-gold" />
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cosmic-gold to-white">
            M.O.N.K. Astro
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-purple-200/80 text-sm hidden md:block">Welcome, {user.displayName}</span>
          <button onClick={() => { logout(); navigate('/login'); }} className="p-2 hover:bg-white/10 rounded-full transition text-purple-200">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Cosmic Dashboard</h2>
          <p className="text-purple-200/70">Select an oracle to begin your reading.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(`/feature/${f.id}`)}
              className="glass-panel p-6 cursor-pointer hover:border-cosmic-gold/50 transition-all hover:shadow-[0_0_20px_rgba(234,179,8,0.1)] group"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl bg-white/5 ${f.color} group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cosmic-gold transition-colors">{f.title}</h3>
                  <p className="text-purple-200/70 text-sm">{f.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
