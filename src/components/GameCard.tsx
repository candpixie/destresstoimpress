import React from 'react';
import { motion } from 'framer-motion';
import { GameCard as GameCardType } from '../types';

interface GameCardProps {
  game: GameCardType;
  darkMode: boolean;
  onClick: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, darkMode, onClick }) => {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-3xl p-8 cursor-pointer group ${
        darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'
      } border backdrop-blur-sm`}
      style={{
        background: `linear-gradient(135deg, ${game.color}15, ${game.color}05)`
      }}
      whileHover={{ 
        scale: 1.05,
        boxShadow: `0 20px 40px -15px ${game.color}40`
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Glow effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
        style={{
          background: `linear-gradient(135deg, ${game.color}20, transparent)`
        }}
      />
      
      <div className="relative z-10">
        {/* Icon */}
        <div className="text-6xl mb-4 filter drop-shadow-lg">
          {game.icon}
        </div>
        
        {/* Title */}
        <h3 className={`text-2xl font-bold mb-3 ${
          darkMode ? 'text-white' : 'text-gray-800'
        } font-['Baloo_2']`}>
          {game.title}
        </h3>
        
        {/* Tagline */}
        <p className={`text-base mb-6 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        } leading-relaxed font-['Comic_Neue']`}>
          {game.tagline}
        </p>
        
        {/* Play button */}
        <motion.button
          className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 font-['Baloo_2']"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Play Now
        </motion.button>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-4 right-4 w-20 h-20 rounded-full opacity-10"
           style={{ background: game.color }} />
      <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full opacity-5"
           style={{ background: game.color }} />
    </motion.div>
  );
};