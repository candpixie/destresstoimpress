import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Home, RotateCcw, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FlappyBreathProps {
  darkMode: boolean;
}

export const FlappyBreath: React.FC<FlappyBreathProps> = ({ darkMode }) => {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [birdPosition, setBirdPosition] = useState(50);
  const [breathing, setBreathing] = useState(false);
  const [breathMeter, setBreathMeter] = useState(50);
  const [pipes, setPipes] = useState<Array<{id: number, x: number, gap: number}>>([]);

  const jump = useCallback(() => {
    if (!gameOver) {
      setBirdPosition(prev => Math.max(prev - 15, 0));
      setBreathing(true);
      setBreathMeter(prev => Math.min(prev + 20, 100));
      setTimeout(() => setBreathing(false), 200);
    }
  }, [gameOver]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setBirdPosition(50);
    setBreathMeter(50);
    setPipes([]);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setBirdPosition(50);
    setBreathMeter(50);
    setPipes([]);
  };

  // Game physics
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gravity = setInterval(() => {
      setBirdPosition(prev => Math.min(prev + 3, 90));
      setBreathMeter(prev => Math.max(prev - 1, 0));
    }, 50);

    return () => clearInterval(gravity);
  }, [gameStarted, gameOver]);

  // Generate pipes
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const pipeGenerator = setInterval(() => {
      setPipes(prev => [...prev, {
        id: Date.now(),
        x: 100,
        gap: 30 + Math.random() * 20
      }]);
    }, 2000);

    return () => clearInterval(pipeGenerator);
  }, [gameStarted, gameOver]);

  // Move pipes and check collisions
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const moveInterval = setInterval(() => {
      setPipes(prev => {
        const newPipes = prev.map(pipe => ({ ...pipe, x: pipe.x - 2 }))
                           .filter(pipe => pipe.x > -10);
        
        // Check for scoring
        newPipes.forEach(pipe => {
          if (pipe.x < 45 && pipe.x > 43) {
            setScore(s => s + 1);
          }
        });

        // Simple collision detection
        const collision = newPipes.some(pipe => 
          pipe.x < 55 && pipe.x > 35 && 
          (birdPosition < pipe.gap - 15 || birdPosition > pipe.gap + 15)
        );

        if (collision || birdPosition >= 90 || birdPosition <= 0) {
          setGameOver(true);
        }

        return newPipes;
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [gameStarted, gameOver, birdPosition]);

  return (
    <div className={`min-h-screen pt-24 pb-12 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-teal-900' 
        : 'bg-gradient-to-br from-blue-50 via-teal-50 to-green-50'
    }`}>
      <div className="container mx-auto px-4 max-w-4xl">
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
                Flappy Breath 🐦
              </h1>
              <p className={`text-lg ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } font-['Comic_Neue']`}>
                Click or space to breathe and fly!
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className={`text-3xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Score: {score}
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Game Area */}
          <motion.div
            className={`flex-1 relative h-96 rounded-3xl overflow-hidden ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border-2 shadow-2xl cursor-pointer`}
            onClick={jump}
            tabIndex={0}
            onKeyPress={(e) => e.key === ' ' && jump()}
            style={{
              background: darkMode 
                ? 'linear-gradient(to bottom, #1f2937, #374151)'
                : 'linear-gradient(to bottom, #e0f2fe, #b3e5fc)'
            }}
          >
            {/* Bird */}
            <motion.div
              className={`absolute left-12 w-8 h-8 text-3xl z-20 ${breathing ? 'scale-125' : ''} transition-transform duration-200`}
              style={{ top: `${birdPosition}%` }}
              animate={breathing ? { rotate: [0, -20, 0] } : {}}
            >
              🐦
            </motion.div>

            {/* Pipes */}
            {pipes.map(pipe => (
              <div key={pipe.id} className="absolute w-12" style={{ left: `${pipe.x}%` }}>
                {/* Top pipe */}
                <div
                  className={`w-full ${darkMode ? 'bg-gray-600' : 'bg-green-500'} rounded-b-lg`}
                  style={{ height: `${pipe.gap - 15}%` }}
                />
                {/* Bottom pipe */}
                <div
                  className={`w-full ${darkMode ? 'bg-gray-600' : 'bg-green-500'} rounded-t-lg absolute bottom-0`}
                  style={{ height: `${100 - pipe.gap - 15}%` }}
                />
              </div>
            ))}

            {/* Game Over / Start Screen */}
            {(!gameStarted || gameOver) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-30">
                <div className="text-center">
                  <div className="text-6xl mb-4">🐦</div>
                  <h2 className="text-3xl font-bold text-white mb-4 font-['Baloo_2']">
                    {gameOver ? `Game Over! Score: ${score}` : 'Ready to Fly?'}
                  </h2>
                  <p className="text-white mb-6 font-['Comic_Neue']">
                    {gameOver ? 'Take a deep breath and try again!' : 'Click anywhere or press space to breathe and stay airborne!'}
                  </p>
                  <div className="space-x-4">
                    <motion.button
                      onClick={startGame}
                      className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 font-['Baloo_2']"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {gameOver ? 'Try Again' : 'Start Flying'}
                    </motion.button>
                    {gameOver && (
                      <motion.button
                        onClick={resetGame}
                        className="px-8 py-3 bg-gray-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 font-['Baloo_2']"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <RotateCcw size={16} className="inline mr-2" />
                        Reset
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Breathing Meter */}
          <div className={`w-24 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border-2 rounded-3xl p-6 shadow-2xl`}>
            <div className="text-center mb-4">
              <Heart className={`mx-auto mb-2 ${breathing ? 'text-red-500' : (darkMode ? 'text-gray-400' : 'text-gray-600')}`} size={24} />
              <p className={`text-sm font-semibold ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              } font-['Comic_Neue']`}>
                Breath
              </p>
            </div>
            
            <div className={`relative w-8 h-64 mx-auto rounded-full ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            } overflow-hidden`}>
              <motion.div
                className="absolute bottom-0 w-full rounded-full bg-gradient-to-t from-red-500 to-pink-400"
                style={{ height: `${breathMeter}%` }}
                animate={breathing ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            <div className="text-center mt-4">
              <p className={`text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              } font-['Comic_Neue']`}>
                {breathMeter > 70 ? 'Great!' : breathMeter > 30 ? 'Keep going' : 'Breathe more!'}
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <motion.div
          className={`mt-8 p-6 rounded-2xl ${
            darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'
          } border backdrop-blur-sm`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className={`text-xl font-bold mb-3 ${
            darkMode ? 'text-white' : 'text-gray-800'
          } font-['Baloo_2']`}>
            How to Play
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">🫁</div>
              <p className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } font-['Comic_Neue']`}>
                Each click represents a breath - control your breathing to control the bird
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🎯</div>
              <p className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } font-['Comic_Neue']`}>
                Navigate through pipes by timing your breaths perfectly
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🧘</div>
              <p className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } font-['Comic_Neue']`}>
                Practice mindful breathing while having fun - it's meditation through gaming!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};