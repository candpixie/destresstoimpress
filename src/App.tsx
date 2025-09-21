import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { FlappyBreath } from './components/games/FlappyBreath';
import { FitCheck } from './components/games/FitCheck';
import { MeMeMeMer } from './components/games/MeMeMeMer';
import { MuMo } from './components/games/MuMo';
import { useAuth } from './hooks/useAuth';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const { user, loading } = useAuth();

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      setDarkMode(JSON.parse(savedTheme));
    }
  }, []);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Protected route wrapper
  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (loading) {
      return (
        <div className={`min-h-screen flex items-center justify-center ${
          darkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="text-4xl"
          >
            🎮
          </motion.div>
        </div>
      );
    }

    return user ? <>{children}</> : <Navigate to="/auth" replace />;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="text-6xl"
        >
          🎮
        </motion.div>
      </div>
    );
  }

  return (
    <Router>
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode ? 'dark bg-gray-900' : 'bg-gray-50'
      }`}>
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        
        <AnimatePresence mode="wait">
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <motion.div
                    key="landing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LandingPage darkMode={darkMode} />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/auth" 
              element={
                <motion.div
                  key="auth"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AuthPage darkMode={darkMode} />
                </motion.div>
              } 
            />
            <Route 
              path="/flappy-breath" 
              element={
                <ProtectedRoute>
                  <motion.div
                    key="flappy-breath"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FlappyBreath darkMode={darkMode} />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/fitcheck" 
              element={
                <ProtectedRoute>
                  <motion.div
                    key="fitcheck"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FitCheck darkMode={darkMode} />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/memememer" 
              element={
                <ProtectedRoute>
                  <motion.div
                    key="memememer"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MeMeMeMer darkMode={darkMode} />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mumo" 
              element={
                <ProtectedRoute>
                  <motion.div
                    key="mumo"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MuMo darkMode={darkMode} />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </AnimatePresence>
        
        <Footer darkMode={darkMode} />
      </div>
    </Router>
  );
}

export default App;