import React from 'react';
import { Heart } from 'lucide-react';

interface FooterProps {
  darkMode: boolean;
}

export const Footer: React.FC<FooterProps> = ({ darkMode }) => {
  return (
    <footer className={`mt-16 py-8 border-t ${
      darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
    } transition-colors duration-300`}>
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center space-x-2">
          <span className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Built with
          </span>
          <Heart className="text-red-500 fill-red-500" size={20} />
          <span className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            at PennApps 2025
          </span>
        </div>
      </div>
    </footer>
  );
};