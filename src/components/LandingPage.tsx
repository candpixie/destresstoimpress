import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { GameCard } from './GameCard';
import { GameCard as GameCardType } from '../types';
import { useNavigate } from 'react-router-dom';

interface LandingPageProps {
  darkMode: boolean;
}

const games: GameCardType[] = [
  {
    id: '1',
    title: 'Flappy Breath',
    icon: '🐦',
    tagline: 'Control your breathing, master the flight. A zen twist on the classic game.',
    path: '/flappy-breath',
    color: '#10B981'
  },
  {
    id: '2',
    title: 'FitCheck',
    icon: '👗',
    tagline: 'Express yourself through fashion. Mix, match, and create your perfect look.',
    path: '/fitcheck',
    color: '#F59E0B'
  },
  {
    id: '3',
    title: 'MeMeMeMer',
    icon: '😂',
    tagline: 'Laugh away your stress with fresh memes and fun puzzles.',
    path: '/memememer',
    color: '#EF4444'
  },
  {
    id: '4',
    title: 'MuMo',
    icon: '🎶',
    tagline: 'Music and movies that match your mood. Let AI curate your perfect vibe.',
    path: '/mumo',
    color: '#8B5CF6'
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ darkMode }) => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

  const handleGameClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className={`min-h-screen pt-24 pb-12 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900' 
        : 'bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50'
    }`}>
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          style={{ y, opacity }}
        >
          <motion.h1
            className={`text-6xl md:text-7xl font-bold mb-6 ${
              darkMode ? 'text-white' : 'text-gray-800'
            } font-['Baloo_2']`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            animate={{ 
              opacity: 1,
              y: 0,
              backgroundPosition: ['0%', '100%', '0%'],
            }}
            transition={{ 
              duration: 0.8,
              delay: 0.2,
              backgroundPosition: { duration: 3, repeat: Infinity }
            }}
            style={{
              background: 'linear-gradient(90deg, #ec4899, #8b5cf6, #3b82f6, #ec4899)',
              backgroundSize: '200% 100%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Turn Stress into Play 🎶😂🎬
          </motion.h1>
          
          <motion.p
            className={`text-xl md:text-2xl mb-8 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            } max-w-2xl mx-auto font-['Comic_Neue'] leading-relaxed`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Entertainment that adapts to your mood. Four games designed to help you unwind, 
            express yourself, and find your perfect vibe.
          </motion.p>
          
          <motion.div
            className="flex flex-wrap justify-center gap-4 text-sm font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {['🧘 Mindful Gaming', '🎨 Creative Expression', '😄 Mood Boosting', '📊 Biometric Tracking'].map((feature, index) => (
              <motion.span
                key={feature}
                className={`px-4 py-2 rounded-full ${
                  darkMode ? 'bg-gray-800/50 text-gray-300' : 'bg-white/50 text-gray-700'
                } backdrop-blur-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                {feature}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        {/* Games Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
        >
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                delay: index * 0.1, 
                duration: 0.6,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <GameCard
                game={game}
                darkMode={darkMode}
                onClick={() => handleGameClick(game.path)}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Info */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full ${
            darkMode ? 'bg-gray-800/50 text-gray-300' : 'bg-white/50 text-gray-600'
          } backdrop-blur-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span className="text-2xl">✨</span>
            <span className="font-['Comic_Neue']">
              AI-powered mood detection • EmotiBit biometric tracking • Personalized recommendations
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};