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
        y: -5,
        boxShadow: `0 20px 40px -15px ${game.color}40`
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      layout
      layoutId={`game-card-${game.id}`}
    >
      {/* Glow effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-3xl"
        style={{
          background: `linear-gradient(135deg, ${game.color}20, transparent)`
        }}
      />
      
      <div className="relative z-10">
        {/* Icon */}
        <motion.div 
          className="text-6xl mb-4 filter drop-shadow-lg"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {game.icon}
        </motion.div>
        
        {/* Title */}
        <motion.h3
          className={`text-2xl font-bold mb-3 ${
          darkMode ? 'text-white' : 'text-gray-800'
        } font-display`}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {game.title}
        </motion.h3>
        
        {/* Tagline */}
        <motion.p
          className={`text-base mb-6 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        } leading-relaxed font-body`}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {game.tagline}
        </motion.p>
        
        {/* Play button */}
        <motion.button
          className="px-8 py-3 bg-brand-gradient text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 font-display"
          whileHover={{ scale: 1.05, boxShadow: "0 10px 30px -10px rgba(236, 72, 153, 0.5)" }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Play Now
        </motion.button>
      </div>
      
      {/* Decorative elements */}
      <motion.div 
        className="absolute top-4 right-4 w-20 h-20 rounded-full opacity-10"
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
           style={{ background: game.color }} />
      <motion.div 
        className="absolute bottom-4 left-4 w-12 h-12 rounded-full opacity-5"
        animate={{ rotate: -360, scale: [1, 0.9, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
           style={{ background: game.color }} />
    </motion.div>
  );
};