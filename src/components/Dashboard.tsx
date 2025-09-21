import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Activity, Heart, Zap, Wifi, WifiOff, ToggleLeft, ToggleRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  darkMode: boolean;
}

interface BiometricData {
  hr: number;
  hrv: number;
  eda: number;
  score: number;
  timestamp: number;
}

interface GameRecommendation {
  id: string;
  name: string;
  icon: string;
  path: string;
  description: string;
  color: string;
}

const gameRecommendations: GameRecommendation[] = [
  {
    id: 'flappy-breath',
    name: 'Flappy Breath',
    icon: '🐦',
    path: '/flappy-breath',
    description: 'Calm breathing exercises to reduce stress',
    color: 'from-green-400 to-blue-500'
  },
  {
    id: 'fitcheck',
    name: 'FitCheck',
    icon: '👗',
    path: '/fitcheck',
    description: 'Light interactive fashion exploration',
    color: 'from-yellow-400 to-orange-500'
  },
  {
    id: 'memememer',
    name: 'MeMeMeMer',
    icon: '😂',
    path: '/memememer',
    description: 'Humor therapy with memes and puzzles',
    color: 'from-red-400 to-pink-500'
  },
  {
    id: 'mumo',
    name: 'MuMo',
    icon: '🎶',
    path: '/mumo',
    description: 'Music and movies for mood reset',
    color: 'from-purple-400 to-indigo-500'
  }
];

export const Dashboard: React.FC<DashboardProps> = ({ darkMode }) => {
  const navigate = useNavigate();
  const [biometricData, setBiometricData] = useState<BiometricData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [useEmotiBit, setUseEmotiBit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recommendedGame, setRecommendedGame] = useState<GameRecommendation | null>(null);
  const [pythonServiceActive, setPythonServiceActive] = useState(false);

  // Simulate EmotiBit connection attempt
  useEffect(() => {
    const checkEmotiBitConnection = async () => {
      setLoading(true);
      try {
        // Simulate connection check
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // For demo purposes, randomly determine if "connected"
        const connected = Math.random() > 0.7; // 30% chance of "connection"
        setIsConnected(connected);
        
        if (!connected) {
          setUseEmotiBit(false); // Default to demo mode if not connected
        }
      } catch (error) {
        console.error('EmotiBit connection failed:', error);
        setIsConnected(false);
        setUseEmotiBit(false);
      } finally {
        setLoading(false);
      }
    };

    checkEmotiBitConnection();
  }, []);

  // Fetch biometric data
  useEffect(() => {
    const fetchBiometricData = async () => {
      try {
        let response;
        let usingPythonService = false;
        
        // Try Python service first (real EmotiBit integration)
        try {
          response = await fetch('http://localhost:5000/api/emotibit');
          if (response.ok) {
            usingPythonService = true;
            setPythonServiceActive(true);
          } else {
            throw new Error('Python service not available');
          }
        } catch (pythonError) {
          console.log('Python service not available, using built-in service');
          // Fallback to built-in service
          response = await fetch('/api/emotibit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ useEmotiBit: useEmotiBit && isConnected })
          });
          setPythonServiceActive(false);
        }
        
        if (response.ok) {
          const data = await response.json();
          setBiometricData(data);
          
          // Determine recommended game based on stress score
          const game = getRecommendedGame(data.score);
          setRecommendedGame(game);
        // Use built-in service directly
        const { emotiBitService } = await import('../api/emotibit');
        const data = await emotiBitService.getReading(useEmotiBit && isConnected);
        setBiometricData(data);
        setPythonServiceActive(false);
        const game = getRecommendedGame(data.score);
        setRecommendedGame(game);
        return;
        setRecommendedGame(getRecommendedGame(fallbackData.score));
      }
    };

    fetchBiometricData();
    const interval = setInterval(fetchBiometricData, 5000);

    return () => clearInterval(interval);
  }, [useEmotiBit, isConnected]);

  const generateSimulatedData = (): BiometricData => {
    const baseHR = 70 + Math.random() * 30; // 70-100 bpm
    const baseHRV = 30 + Math.random() * 40; // 30-70 ms
    const baseEDA = 0.1 + Math.random() * 0.8; // 0.1-0.9 μS
    
    // Calculate stress score (0-10) based on biometric values
    const hrStress = Math.max(0, (baseHR - 60) / 40 * 10);
    const hrvStress = Math.max(0, (60 - baseHRV) / 60 * 10);
    const edaStress = baseEDA * 10;
    
    const score = Math.min(10, Math.max(0, (hrStress + hrvStress + edaStress) / 3));
    
    return {
      hr: Math.round(baseHR),
      hrv: Math.round(baseHRV),
      eda: Math.round(baseEDA * 100) / 100,
      score: Math.round(score * 10) / 10,
      timestamp: Date.now()
    };
  };

  const getRecommendedGame = (score: number): GameRecommendation => {
    if (score <= 3) return gameRecommendations[0]; // Flappy Breath
    if (score <= 5) return gameRecommendations[1]; // FitCheck
    if (score <= 7) return gameRecommendations[2]; // MeMeMeMer
    return gameRecommendations[3]; // MuMo
  };

  const getStressLevel = (score: number): { level: string; color: string; emoji: string } => {
    if (score <= 3) return { level: 'Very Low', color: 'text-green-500', emoji: '😌' };
    if (score <= 5) return { level: 'Low', color: 'text-yellow-500', emoji: '🙂' };
    if (score <= 7) return { level: 'Moderate', color: 'text-orange-500', emoji: '😐' };
    return { level: 'High', color: 'text-red-500', emoji: '😰' };
  };

  if (loading) {
    return (
      <div className={`min-h-screen pt-24 pb-12 flex items-center justify-center ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
          : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
      }`}>
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            📊
          </motion.div>
          <p className={`text-xl ${
            darkMode ? 'text-white' : 'text-gray-800'
          } font-['Baloo_2']`}>
            Connecting to EmotiBit...
          </p>
        </motion.div>
      </div>
    );
  }

  const stressInfo = biometricData ? getStressLevel(biometricData.score) : null;

  return (
    <div className={`min-h-screen pt-24 pb-12 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <div className="container mx-auto px-4 max-w-7xl">
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
                Mood Dashboard 📊
              </h1>
              <p className={`text-lg ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } font-['Comic_Neue']`}>
                Real-time biometric monitoring and game recommendations
              </p>
            </div>
          </div>

          {/* Connection Status & Toggle */}
          <div className="flex items-center space-x-4">
            {/* Python Service Status */}
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <div className={`w-2 h-2 rounded-full ${
                pythonServiceActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`} />
              <span className={`text-sm font-medium ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {pythonServiceActive ? 'Python ML Service' : 'Built-in Service'}
              </span>
            </div>
            
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              {isConnected ? (
                <Wifi className="text-green-500" size={20} />
              ) : (
                <WifiOff className="text-red-500" size={20} />
              )}
              <span className={`text-sm font-medium ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {isConnected ? 'EmotiBit Connected' : 'EmotiBit Offline'}
              </span>
            </div>

            <motion.button
              onClick={() => setUseEmotiBit(!useEmotiBit)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                useEmotiBit && isConnected
                  ? 'bg-green-500 text-white' 
                  : darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
              } shadow-lg hover:shadow-xl transition-all duration-200`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!isConnected}
            >
              {useEmotiBit && isConnected ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
              <span className="text-sm font-medium">
                {useEmotiBit && isConnected ? 'Live Data' : 'Demo Mode'}
              </span>
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Biometric Panel */}
          <motion.div
            className={`p-8 rounded-3xl ${
              darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'
            } border backdrop-blur-sm shadow-2xl`}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <Activity className="text-blue-500" size={32} />
              <h2 className={`text-2xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-800'
              } font-['Baloo_2']`}>
                Biometric Data
              </h2>
            </div>

            {biometricData ? (
              <div className="space-y-6">
                {/* Heart Rate */}
                <motion.div
                  className="p-6 rounded-2xl bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Heart className="text-red-500" size={24} />
                      <div>
                        <p className={`text-sm font-medium ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Heart Rate
                        </p>
                        <p className={`text-2xl font-bold ${
                          darkMode ? 'text-white' : 'text-gray-800'
                        }`}>
                          {biometricData.hr} bpm
                        </p>
                      </div>
                    </div>
                    <motion.div
                      className="text-2xl"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      ❤️
                    </motion.div>
                  </div>
                </motion.div>

                {/* HRV */}
                <motion.div
                  className="p-6 rounded-2xl bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Activity className="text-blue-500" size={24} />
                      <div>
                        <p className={`text-sm font-medium ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Heart Rate Variability
                        </p>
                        <p className={`text-2xl font-bold ${
                          darkMode ? 'text-white' : 'text-gray-800'
                        }`}>
                          {biometricData.hrv} ms
                        </p>
                      </div>
                    </div>
                    <div className="text-2xl">📈</div>
                  </div>
                </motion.div>

                {/* EDA */}
                <motion.div
                  className="p-6 rounded-2xl bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Zap className="text-green-500" size={24} />
                      <div>
                        <p className={`text-sm font-medium ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Electrodermal Activity
                        </p>
                        <p className={`text-2xl font-bold ${
                          darkMode ? 'text-white' : 'text-gray-800'
                        }`}>
                          {biometricData.eda} μS
                        </p>
                      </div>
                    </div>
                    <div className="text-2xl">⚡</div>
                  </div>
                </motion.div>

                {/* Stress Score */}
                <motion.div
                  className={`p-6 rounded-2xl bg-gradient-to-r ${
                    biometricData.score <= 3 ? 'from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30' :
                    biometricData.score <= 5 ? 'from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30' :
                    biometricData.score <= 7 ? 'from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30' :
                    'from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full ${
                        biometricData.score <= 3 ? 'bg-green-500' :
                        biometricData.score <= 5 ? 'bg-yellow-500' :
                        biometricData.score <= 7 ? 'bg-orange-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className={`text-sm font-medium ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Stress Level
                        </p>
                        <p className={`text-2xl font-bold ${
                          darkMode ? 'text-white' : 'text-gray-800'
                        }`}>
                          {biometricData.score}/10
                        </p>
                        {stressInfo && (
                          <p className={`text-sm ${stressInfo.color} font-medium`}>
                            {stressInfo.level}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-3xl">
                      {stressInfo?.emoji}
                    </div>
                  </div>
                </motion.div>

                {/* Data Source Indicator */}
                <div className={`text-center text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                } font-['Comic_Neue']`}>
                  {pythonServiceActive ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span>🔴 REAL EmotiBit Data (Python ML Service)</span>
                    </span>
                  ) : useEmotiBit && isConnected ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span>🟡 EmotiBit Connected (Built-in Service)</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span>🔵 Demo Mode (Simulated Data)</span>
                    </span>
                  )}
                  <p className="mt-1">
                    Last updated: {new Date(biometricData.timestamp).toLocaleTimeString()}
                  </p>
                  {pythonServiceActive && (
                    <p className="mt-1 text-xs">
                      🤖 Using YOUR trained ML model with REAL EmotiBit hardware data
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📊</div>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} font-['Comic_Neue']`}>
                  Loading biometric data...
                </p>
              </div>
            )}
          </motion.div>

          {/* Game Recommendation Panel */}
          <motion.div
            className={`p-8 rounded-3xl ${
              darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'
            } border backdrop-blur-sm shadow-2xl`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="text-2xl">🎮</div>
              <h2 className={`text-2xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-800'
              } font-['Baloo_2']`}>
                Recommended Game
              </h2>
            </div>

            {recommendedGame && biometricData ? (
              <div className="space-y-6">
                <motion.div
                  className={`p-8 rounded-3xl bg-gradient-to-r ${recommendedGame.color} text-white relative overflow-hidden`}
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Glow effect */}
                  <motion.div
                    className="absolute inset-0 bg-white/10 rounded-3xl"
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  <div className="relative z-10 text-center">
                    <motion.div
                      className="text-6xl mb-4"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {recommendedGame.icon}
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-2 font-['Baloo_2']">
                      {recommendedGame.name}
                    </h3>
                    <p className="text-lg mb-6 font-['Comic_Neue'] opacity-90">
                      {recommendedGame.description}
                    </p>
                    <motion.button
                      onClick={() => navigate(recommendedGame.path)}
                      className="px-8 py-3 bg-white/20 backdrop-blur-sm rounded-full font-semibold hover:bg-white/30 transition-all duration-200 font-['Baloo_2']"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Play Now →
                    </motion.button>
                  </div>
                </motion.div>

                {/* Recommendation Logic Explanation */}
                <div className={`p-6 rounded-2xl ${
                  darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                } border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <h4 className={`text-lg font-bold mb-3 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  } font-['Baloo_2']`}>
                    Why This Game?
                  </h4>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  } font-['Comic_Neue'] mb-4`}>
                    Based on your stress level of <strong>{biometricData.score}/10</strong> ({stressInfo?.level}), 
                    our AI recommends <strong>{recommendedGame.name}</strong> to help you:
                  </p>
                  <div className="space-y-2">
                    {biometricData.score <= 3 && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Maintain your calm state with mindful breathing exercises
                        </span>
                      </div>
                    )}
                    {biometricData.score > 3 && biometricData.score <= 5 && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Engage in light, creative activities to boost mood
                        </span>
                      </div>
                    )}
                    {biometricData.score > 5 && biometricData.score <= 7 && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Use humor and laughter to reduce moderate stress
                        </span>
                      </div>
                    )}
                    {biometricData.score > 7 && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Reset your mood with personalized music and visual content
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* All Games Quick Access */}
                <div>
                  <h4 className={`text-lg font-bold mb-4 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  } font-['Baloo_2']`}>
                    Or Choose Any Game:
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {gameRecommendations.map((game) => (
                      <motion.button
                        key={game.id}
                        onClick={() => navigate(game.path)}
                        className={`p-4 rounded-xl ${
                          game.id === recommendedGame.id
                            ? 'bg-gradient-to-r ' + game.color + ' text-white'
                            : darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
                        } transition-all duration-200 text-center`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-2xl mb-1">{game.icon}</div>
                        <div className="text-sm font-semibold font-['Baloo_2']">
                          {game.name}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🎮</div>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} font-['Comic_Neue']`}>
                  Analyzing your data to recommend the perfect game...
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};