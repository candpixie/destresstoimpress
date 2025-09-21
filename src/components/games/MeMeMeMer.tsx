import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Shuffle, Puzzle, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fallbackMemes } from '../../data/fallbackContent';
import { Meme } from '../../types';

interface MeMeMeMemerProps {
  darkMode: boolean;
}

export const MeMeMeMer: React.FC<MeMeMeMemerProps> = ({ darkMode }) => {
  const navigate = useNavigate();
  const [currentMeme, setCurrentMeme] = useState<Meme | null>(null);
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [puzzlePieces, setPuzzlePieces] = useState<number[]>([]);
  const [puzzleSolved, setPuzzleSolved] = useState(false);

  const generateMeme = () => {
    const randomMeme = fallbackMemes[Math.floor(Math.random() * fallbackMemes.length)];
    setCurrentMeme(randomMeme);
    setShowPuzzle(false);
    setPuzzleSolved(false);
  };

  const startPuzzle = () => {
    if (currentMeme) {
      const pieces = Array.from({ length: 9 }, (_, i) => i);
      // Shuffle the pieces
      for (let i = pieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
      }
      setPuzzlePieces(pieces);
      setShowPuzzle(true);
      setPuzzleSolved(false);
    }
  };

  const swapPieces = (index1: number, index2: number) => {
    if (puzzleSolved) return;
    
    const newPieces = [...puzzlePieces];
    [newPieces[index1], newPieces[index2]] = [newPieces[index2], newPieces[index1]];
    setPuzzlePieces(newPieces);

    // Check if puzzle is solved
    const isSolved = newPieces.every((piece, index) => piece === index);
    if (isSolved) {
      setPuzzleSolved(true);
    }
  };

  return (
    <div className={`min-h-screen pt-24 pb-12 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-red-900 to-orange-900' 
        : 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50'
    }`}>
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
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
                MeMeMeMer 😂
              </h1>
              <p className={`text-lg ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } font-['Comic_Neue']`}>
                Laugh away your stress with memes and puzzles!
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            <motion.button
              onClick={generateMeme}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 font-['Baloo_2'] flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Shuffle size={16} />
              <span>New Meme</span>
            </motion.button>
            
            {currentMeme && (
              <motion.button
                onClick={startPuzzle}
                className={`px-6 py-3 ${
                  darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
                } rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 font-['Baloo_2'] flex items-center space-x-2`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Puzzle size={16} />
                <span>Make Puzzle</span>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          className="space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {!currentMeme ? (
            /* Welcome Screen */
            <motion.div
              className={`text-center py-16 rounded-3xl ${
                darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'
              } border backdrop-blur-sm`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-8xl mb-6">😂</div>
              <h2 className={`text-3xl font-bold mb-4 ${
                darkMode ? 'text-white' : 'text-gray-800'
              } font-['Baloo_2']`}>
                Ready for Some Laughs?
              </h2>
              <p className={`text-lg mb-8 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } font-['Comic_Neue'] max-w-md mx-auto`}>
                Generate a fresh meme to brighten your day, then turn it into a fun puzzle to solve!
              </p>
              <motion.button
                onClick={generateMeme}
                className="px-10 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-200 font-['Baloo_2']"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Generate Your First Meme! 🎲
              </motion.button>
            </motion.div>
          ) : (
            /* Meme Display */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Original Meme */}
              {!showPuzzle && (
                <motion.div
                  className={`lg:col-span-2 rounded-3xl overflow-hidden ${
                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  } border shadow-2xl`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="p-6">
                    <h3 className={`text-2xl font-bold mb-4 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    } font-['Baloo_2'] text-center`}>
                      {currentMeme.title}
                    </h3>
                    <div className="flex justify-center">
                      <img
                        src={currentMeme.url}
                        alt={currentMeme.title}
                        className="max-w-full max-h-96 rounded-2xl shadow-lg object-contain"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Puzzle Mode */}
              {showPuzzle && (
                <>
                  {/* Puzzle Grid */}
                  <motion.div
                    className={`rounded-3xl overflow-hidden ${
                      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } border shadow-2xl p-6`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3 className={`text-2xl font-bold mb-4 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    } font-['Baloo_2'] text-center`}>
                      Puzzle Mode {puzzleSolved ? '🎉' : '🧩'}
                    </h3>
                    
                    <div className="grid grid-cols-3 gap-1 max-w-sm mx-auto">
                      {puzzlePieces.map((piece, index) => (
                        <motion.button
                          key={index}
                          onClick={() => {
                            const emptyIndex = puzzlePieces.indexOf(8);
                            if (Math.abs(index - emptyIndex) === 1 || Math.abs(index - emptyIndex) === 3) {
                              swapPieces(index, emptyIndex);
                            }
                          }}
                          className={`aspect-square relative overflow-hidden rounded-lg ${
                            piece === 8 ? 'bg-gray-300' : 'bg-gray-100'
                          } hover:scale-105 transition-transform duration-200`}
                          style={{
                            backgroundImage: piece !== 8 ? `url(${currentMeme.url})` : 'none',
                            backgroundSize: '300% 300%',
                            backgroundPosition: `${(piece % 3) * 50}% ${Math.floor(piece / 3) * 50}%`
                          }}
                          whileHover={piece !== 8 ? { scale: 1.05 } : {}}
                          whileTap={piece !== 8 ? { scale: 0.95 } : {}}
                        >
                          {piece === 8 && !puzzleSolved && (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                              <Puzzle size={20} />
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </div>

                    {puzzleSolved && (
                      <motion.div
                        className="text-center mt-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <p className="text-2xl font-bold text-green-500 mb-2 font-['Baloo_2']">
                          Puzzle Solved! 🎊
                        </p>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} font-['Comic_Neue']`}>
                          Great job! You've completed the meme puzzle.
                        </p>
                      </motion.div>
                    )}

                    <div className="flex justify-center mt-6 space-x-3">
                      <motion.button
                        onClick={() => setShowPuzzle(false)}
                        className={`px-4 py-2 rounded-full ${
                          darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
                        } hover:scale-105 transition-all duration-200 font-['Baloo_2']`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View Original
                      </motion.button>
                      <motion.button
                        onClick={startPuzzle}
                        className={`px-4 py-2 rounded-full ${
                          darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
                        } hover:scale-105 transition-all duration-200 font-['Baloo_2'] flex items-center space-x-1`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <RotateCcw size={16} />
                        <span>Shuffle</span>
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* Reference Image */}
                  <motion.div
                    className={`rounded-3xl overflow-hidden ${
                      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } border shadow-2xl p-6`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <h3 className={`text-xl font-bold mb-4 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    } font-['Baloo_2'] text-center`}>
                      Reference
                    </h3>
                    <div className="flex justify-center">
                      <img
                        src={currentMeme.url}
                        alt="Reference"
                        className="max-w-full max-h-64 rounded-2xl shadow-lg object-contain opacity-75"
                      />
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          )}
        </motion.div>

        {/* Instructions */}
        <motion.div
          className={`mt-8 p-6 rounded-2xl ${
            darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'
          } border backdrop-blur-sm`}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <h3 className={`text-xl font-bold mb-3 ${
            darkMode ? 'text-white' : 'text-gray-800'
          } font-['Baloo_2']`}>
            How to Play
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">🎲</div>
              <p className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } font-['Comic_Neue']`}>
                Generate random memes to discover new content and have a good laugh
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🧩</div>
              <p className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } font-['Comic_Neue']`}>
                Turn any meme into a sliding puzzle and challenge yourself to solve it
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">😄</div>
              <p className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } font-['Comic_Neue']`}>
                All content is family-friendly and designed to boost your mood!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};