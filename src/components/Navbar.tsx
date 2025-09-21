import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Sun, Moon, LogOut, User, BarChart3 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ darkMode, toggleDarkMode }) => {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-lg ${
        darkMode 
          ? 'bg-gray-900/80 border-gray-700' 
          : 'bg-white/80 border-gray-200'
      } border-b transition-colors duration-300`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-2"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ cursor: 'pointer' }}
          >
            <Gamepad2 className="text-3xl text-pink-500" />
            <span className={`text-2xl font-bold text-gradient font-display`}>
              Destress2Impress
            </span>
          </motion.div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Dashboard Link */}
            {user && (
              <motion.button
                onClick={() => navigate('/dashboard')}
                className={`p-2 rounded-full ${
                  darkMode ? 'bg-gray-700 text-blue-400' : 'bg-gray-100 text-blue-600'
                } hover:scale-110 transition-all duration-200`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Mood Dashboard"
              >
                <BarChart3 size={20} />
              </motion.button>
            )}

            {/* Theme toggle */}
            <motion.button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${
                darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'
              } hover:scale-110 transition-all duration-200`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <motion.button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                    darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
                  } hover:scale-105 transition-all duration-200`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <User size={16} />
                  <span className="text-sm">{user.email.split('@')[0]}</span>
                </motion.button>

                {showUserMenu && (
                  <motion.div
                    className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg ${
                      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } border overflow-hidden`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className={`px-4 py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Games played: {user.gamesPlayed}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Current streak: {user.currentStreak}
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-600 transition-colors duration-200 flex items-center space-x-2`}
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <motion.a
                href="/auth"
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-200"
                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px -10px rgba(236, 72, 153, 0.3)' }}
                whileTap={{ scale: 0.95 }}
              >
                Sign In
              </motion.a>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};