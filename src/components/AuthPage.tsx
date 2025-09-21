import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface AuthPageProps {
  darkMode: boolean;
}

export const AuthPage: React.FC<AuthPageProps> = ({ darkMode }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setError('Your email address has not been confirmed. Please check your inbox for a confirmation link.');
        } else {
          setError(error.message);
        }
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900' 
        : 'bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50'
    }`}>
      <motion.div
        className={`w-full max-w-md p-8 rounded-3xl shadow-2xl backdrop-blur-lg ${
          darkMode 
            ? 'bg-gray-800/80 border-gray-700' 
            : 'bg-white/80 border-gray-200'
        } border`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            🎮
          </motion.div>
          <h2 className={`text-3xl font-bold mb-2 ${
            darkMode ? 'text-white' : 'text-gray-800'
          } font-['Baloo_2']`}>
            {isSignUp ? 'Join the Fun!' : 'Welcome Back!'}
          </h2>
          <p className={`${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          } font-['Comic_Neue']`}>
            {isSignUp ? 'Create your account to start playing' : 'Sign in to continue your journey'}
          </p>
        </div>

        {/* Security note */}
        <motion.div
          className={`mb-6 p-4 rounded-2xl ${
            darkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'
          } border flex items-start space-x-3`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Shield className={`mt-0.5 flex-shrink-0 ${
            darkMode ? 'text-blue-400' : 'text-blue-600'
          }`} size={16} />
          <p className={`text-sm ${
            darkMode ? 'text-blue-300' : 'text-blue-700'
          } font-['Comic_Neue']`}>
            Your account is safe and encrypted. We don't share or store personal data.
          </p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email field */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Email
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`} size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`} size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className={`w-full pl-12 pr-12 py-3 rounded-xl border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <motion.p
              className="text-red-500 text-sm text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}

          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-['Baloo_2']`}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </motion.button>
        </form>

        {/* Toggle sign up/in */}
        <div className="mt-6 text-center">
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} font-['Comic_Neue']`}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-purple-500 hover:text-purple-600 font-semibold transition-colors duration-200"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};