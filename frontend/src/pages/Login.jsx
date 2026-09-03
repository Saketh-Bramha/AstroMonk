import { useEffect } from 'react';
import { useAstro } from '../context/AstroContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Moon, Sun } from 'lucide-react';

export default function Login() {
  const { login, user, birthDetails } = useAstro();
  const navigate = useNavigate();

  // If already logged in, redirect immediately!
  useEffect(() => {
    if (user) {
      if (birthDetails) navigate('/dashboard');
      else navigate('/details');
    }
  }, [user, birthDetails, navigate]);

  const handleLogin = () => {
    login(); // Mock login for now
    navigate('/details');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-12 max-w-md w-full text-center relative z-10"
      >
        <div className="flex justify-center items-center space-x-2 mb-6">
          <Moon className="w-8 h-8 text-cosmic-gold" />
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cosmic-gold to-white">
            M.O.N.K. Astro
          </h1>
          <Sun className="w-8 h-8 text-cosmic-gold" />
        </div>
        
        <p className="text-purple-200/80 mb-8 font-light">
          Unlock the secrets of your cosmic blueprint. Sign in to begin your journey.
        </p>

        <button 
          onClick={handleLogin}
          className="w-full flex items-center justify-center space-x-3 bg-white text-gray-900 py-3 px-4 rounded-xl font-medium hover:bg-gray-100 transition-colors"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
          <span>Sign in with Google</span>
        </button>
      </motion.div>
    </div>
  );
}
