import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, RotateCcw, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FitCheckProps {
  darkMode: boolean;
}

interface OutfitItem {
  id: string;
  name: string;
  emoji: string;
  category: 'top' | 'bottom' | 'shoes' | 'accessory';
  points: number;
}

const outfitItems: Record<string, OutfitItem[]> = {
  top: [
    { id: '1', name: 'Basic Tee', emoji: '👕', category: 'top', points: 5 },
    { id: '2', name: 'Hoodie', emoji: '🧥', category: 'top', points: 8 },
    { id: '3', name: 'Fancy Shirt', emoji: '👔', category: 'top', points: 12 },
    { id: '4', name: 'Crop Top', emoji: '🎽', category: 'top', points: 10 },
  ],
  bottom: [
    { id: '5', name: 'Jeans', emoji: '👖', category: 'bottom', points: 7 },
    { id: '6', name: 'Shorts', emoji: '🩳', category: 'bottom', points: 5 },
    { id: '7', name: 'Skirt', emoji: '👗', category: 'bottom', points: 9 },
    { id: '8', name: 'Fancy Pants', emoji: '🎩', category: 'bottom', points: 11 },
  ],
  shoes: [
    { id: '9', name: 'Sneakers', emoji: '👟', category: 'shoes', points: 6 },
    { id: '10', name: 'Boots', emoji: '🥾', category: 'shoes', points: 8 },
    { id: '11', name: 'High Heels', emoji: '👠', category: 'shoes', points: 12 },
    { id: '12', name: 'Sandals', emoji: '👡', category: 'shoes', points: 4 },
  ],
  accessory: [
    { id: '13', name: 'Hat', emoji: '🧢', category: 'accessory', points: 5 },
    { id: '14', name: 'Sunglasses', emoji: '🕶️', category: 'accessory', points: 7 },
    { id: '15', name: 'Watch', emoji: '⌚', category: 'accessory', points: 9 },
    { id: '16', name: 'Necklace', emoji: '📿', category: 'accessory', points: 8 },
  ]
};

export const FitCheck: React.FC<FitCheckProps> = ({ darkMode }) => {
  const navigate = useNavigate();
  const [selectedOutfit, setSelectedOutfit] = useState<Record<string, OutfitItem | null>>({
    top: null,
    bottom: null,
    shoes: null,
    accessory: null
  });
  const [totalPoints, setTotalPoints] = useState(0);
  const [streak, setStreak] = useState(0);

  const selectItem = (item: OutfitItem) => {
    const newOutfit = { ...selectedOutfit, [item.category]: item };
    setSelectedOutfit(newOutfit);
    setTotalPoints(prev => prev + item.points);
    setStreak(prev => prev + 1);
  };

  const resetOutfit = () => {
    setSelectedOutfit({
      top: null,
      bottom: null,
      shoes: null,
      accessory: null
    });
    setTotalPoints(0);
    setStreak(0);
  };

  const getStyleRating = () => {
    const points = totalPoints;
    if (points === 0) return { rating: 'Start styling!', color: 'text-gray-500', stars: 0 };
    if (points < 20) return { rating: 'Getting there!', color: 'text-yellow-500', stars: 1 };
    if (points < 30) return { rating: 'Looking good!', color: 'text-green-500', stars: 2 };
    if (points < 40) return { rating: 'Stylish!', color: 'text-blue-500', stars: 3 };
    if (points < 50) return { rating: 'Fashion forward!', color: 'text-purple-500', stars: 4 };
    return { rating: 'Absolutely stunning!', color: 'text-pink-500', stars: 5 };
  };

  const styleRating = getStyleRating();

  return (
    <div className={`min-h-screen pt-24 pb-12 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-pink-900 to-purple-900' 
        : 'bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50'
    }`}>
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => navigate('/')}
              className={`p-3 rounded-full ${
                darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
              } shadow-lg hover:shadow-xl transition-all duration-200`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Home size={20} />
            </motion.button>
            
            <div>
              <h1 className={`text-4xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-800'
              } font-['Baloo_2'] flex items-center`}>
                Fit Check 👗
              </h1>
              <p className={`text-lg ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } font-['Comic_Neue']`}>
                Express yourself through fashion!
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className={`text-3xl font-bold ${styleRating.color} mb-2`}>
              Points: {totalPoints}
            </div>
            <div className="flex items-center justify-end space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={16} 
                  className={i < styleRating.stars ? `${styleRating.color} fill-current` : 'text-gray-300'} 
                />
              ))}
            </div>
            <p className={`text-sm ${styleRating.color} font-['Comic_Neue']`}>
              {styleRating.rating}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar Display */}
          <div className="lg:col-span-1">
            <motion.div
              className={`relative h-96 rounded-3xl overflow-hidden ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } border-2 shadow-2xl p-8`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className={`text-2xl font-bold text-center mb-6 ${
                darkMode ? 'text-white' : 'text-gray-800'
              } font-['Baloo_2']`}>
                Your Avatar
              </h3>

              <div className="flex flex-col items-center space-y-4 h-full justify-center">
                {/* Basic avatar */}
                <div className="relative">
                  <div className="text-6xl">👤</div>
                  
                  {/* Outfit display */}
                  <div className="absolute -top-4 -right-4">
                    {selectedOutfit.accessory && (
                      <span className="text-2xl">{selectedOutfit.accessory.emoji}</span>
                    )}
                  </div>
                  
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    {selectedOutfit.top && (
                      <span className="text-3xl">{selectedOutfit.top.emoji}</span>
                    )}
                  </div>
                  
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
                    {selectedOutfit.bottom && (
                      <span className="text-2xl">{selectedOutfit.bottom.emoji}</span>
                    )}
                  </div>
                  
                  <div className="absolute top-12 left-1/2 transform -translate-x-1/2">
                    {selectedOutfit.shoes && (
                      <span className="text-2xl">{selectedOutfit.shoes.emoji}</span>
                    )}
                  </div>
                </div>

                {/* Selected items list */}
                <div className="text-center space-y-1 mt-8">
                  {Object.entries(selectedOutfit).map(([category, item]) => (
                    item && (
                      <div key={category} className={`text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      } font-['Comic_Neue']`}>
                        {item.emoji} {item.name} (+{item.points} pts)
                      </div>
                    )
                  ))}
                </div>

                <motion.button
                  onClick={resetOutfit}
                  className={`mt-4 px-6 py-2 rounded-full ${
                    darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
                  } hover:scale-105 transition-all duration-200 font-['Baloo_2'] flex items-center space-x-2`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw size={16} />
                  <span>Reset Look</span>
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Outfit Selection */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(outfitItems).map(([category, items]) => (
                <motion.div
                  key={category}
                  className={`p-6 rounded-2xl ${
                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  } border shadow-lg`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <h3 className={`text-xl font-bold mb-4 capitalize ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  } font-['Baloo_2']`}>
                    {category === 'accessory' ? 'Accessories' : `${category}s`}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {items.map((item) => (
                      <motion.button
                        key={item.id}
                        onClick={() => selectItem(item)}
                        className={`p-4 rounded-xl transition-all duration-200 ${
                          selectedOutfit[category]?.id === item.id
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                            : darkMode 
                              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                              : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
                        } hover:scale-105`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-2xl mb-2">{item.emoji}</div>
                        <div className="text-sm font-semibold mb-1 font-['Comic_Neue']">
                          {item.name}
                        </div>
                        <div className="text-xs opacity-75">
                          +{item.points} pts
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Fashion Tips */}
        <motion.div
          className={`mt-8 p-6 rounded-2xl ${
            darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'
          } border backdrop-blur-sm`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className={`text-xl font-bold mb-4 ${
            darkMode ? 'text-white' : 'text-gray-800'
          } font-['Baloo_2']`}>
            Fashion Tips ✨
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">🎨</div>
              <p className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } font-['Comic_Neue']`}>
                Mix and match different styles to create unique looks and earn more points!
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">⭐</div>
              <p className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } font-['Comic_Neue']`}>
                Higher-value items give more points - experiment with premium pieces!
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">💫</div>
              <p className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } font-['Comic_Neue']`}>
                There's no wrong choice - fashion is about expressing yourself!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};