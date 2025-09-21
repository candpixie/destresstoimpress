import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Send, Music, Film, Heart, Zap, Coffee, Smile } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fallbackMoodContent } from '../../data/fallbackContent';
import { MoodContent } from '../../types';

interface MuMoProps {
  darkMode: boolean;
}

const moodIcons = {
  Happy: { icon: Smile, color: 'text-yellow-500', bg: 'bg-yellow-500' },
  Sad: { icon: Heart, color: 'text-blue-500', bg: 'bg-blue-500' },
  Stressed: { icon: Zap, color: 'text-red-500', bg: 'bg-red-500' },
  Chill: { icon: Coffee, color: 'text-green-500', bg: 'bg-green-500' }
};

export const MuMo: React.FC<MuMoProps> = ({ darkMode }) => {
  const navigate = useNavigate();
  const [moodInput, setMoodInput] = useState('');
  const [detectedMood, setDetectedMood] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<MoodContent | null>(null);
  const [loading, setLoading] = useState(false);

  const detectMood = async () => {
    if (!moodInput.trim()) return;

    setLoading(true);
    
    // Simulate mood detection with simple keyword matching
    setTimeout(() => {
      let mood = 'Chill'; // default
      const input = moodInput.toLowerCase();
      
      if (input.includes('happy') || input.includes('great') || input.includes('excited') || input.includes('joy')) {
        mood = 'Happy';
      } else if (input.includes('sad') || input.includes('down') || input.includes('depressed') || input.includes('upset')) {
        mood = 'Sad';
      } else if (input.includes('stressed') || input.includes('anxious') || input.includes('worried') || input.includes('overwhelmed')) {
        mood = 'Stressed';
      } else if (input.includes('chill') || input.includes('relaxed') || input.includes('calm') || input.includes('peaceful')) {
        mood = 'Chill';
      }

      setDetectedMood(mood);
      setRecommendations(fallbackMoodContent[mood]);
      setLoading(false);
    }, 1500);
  };

  const resetMood = () => {
    setMoodInput('');
    setDetectedMood(null);
    setRecommendations(null);
  };

  const MoodIcon = detectedMood ? moodIcons[detectedMood as keyof typeof moodIcons]?.icon : Music;

  return (
    <div className={`min-h-screen pt-24 pb-12 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900' 
        : 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50'
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
                MuMo 🎶🎬
              </h1>
              <p className={`text-lg ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } font-['Comic_Neue']`}>
                Music and movies that match your mood!
              </p>
            </div>
          </div>

          {detectedMood && (
            <div className="text-right">
              <div className={`flex items-center space-x-2 ${
                moodIcons[detectedMood as keyof typeof moodIcons]?.color || 'text-purple-500'
              }`}>
                {MoodIcon && <MoodIcon size={24} />}
                <span className="text-xl font-bold font-['Baloo_2']">
                  Feeling {detectedMood}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Mood Input */}
        {!recommendations && (
          <motion.div
            className={`mb-8 p-8 rounded-3xl ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border shadow-2xl`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎭</div>
              <h2 className={`text-3xl font-bold mb-4 ${
                darkMode ? 'text-white' : 'text-gray-800'
              } font-['Baloo_2']`}>
                How are you feeling today?
              </h2>
              <p className={`text-lg ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } font-['Comic_Neue'] mb-8`}>
                Describe your mood and I'll curate the perfect music and movie recommendations for you.
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <textarea
                  value={moodInput}
                  onChange={(e) => setMoodInput(e.target.value)}
                  placeholder="I'm feeling excited about the weekend, but also a bit stressed about work..."
                  rows={4}
                  className={`w-full p-4 pr-16 rounded-xl border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-['Comic_Neue']`}
                />
                
                <motion.button
                  onClick={detectMood}
                  disabled={loading || !moodInput.trim()}
                  className={`absolute bottom-4 right-4 p-3 rounded-full ${
                    loading || !moodInput.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg'
                  } text-white transition-all duration-200`}
                  whileHover={!loading && moodInput.trim() ? { scale: 1.1 } : {}}
                  whileTap={!loading && moodInput.trim() ? { scale: 0.9 } : {}}
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Music size={20} />
                    </motion.div>
                  ) : (
                    <Send size={20} />
                  )}
                </motion.button>
              </div>

              {loading && (
                <motion.p
                  className="text-center mt-4 text-purple-500 font-['Comic_Neue']"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Analyzing your mood... ✨
                </motion.p>
              )}
            </div>
          </motion.div>
        )}

        {/* Recommendations */}
        {recommendations && (
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Mood Summary */}
            <div className={`text-center p-6 rounded-2xl ${
              darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'
            } border backdrop-blur-sm`}>
              <div className="flex items-center justify-center space-x-3 mb-3">
                {MoodIcon && <MoodIcon size={32} className={moodIcons[detectedMood as keyof typeof moodIcons]?.color} />}
                <h2 className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-800'
                } font-['Baloo_2']`}>
                  Perfect! I've detected you're feeling {detectedMood}
                </h2>
              </div>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} font-['Comic_Neue'] mb-4`}>
                Here are some handpicked recommendations to match your vibe:
              </p>
              <motion.button
                onClick={resetMood}
                className="px-6 py-2 bg-gray-500 text-white rounded-full font-semibold hover:bg-gray-600 transition-colors duration-200 font-['Baloo_2']"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Different Mood
              </motion.button>
            </div>

            {/* Music Playlists */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <Music className="text-purple-500" size={32} />
                <h3 className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-800'
                } font-['Baloo_2']`}>
                  Music Playlists
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendations.playlists.map((playlist, index) => (
                  <motion.a
                    key={index}
                    href={playlist.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block p-6 rounded-2xl ${
                      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } border shadow-lg hover:shadow-2xl transition-all duration-300 group`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <div className="flex items-start space-x-4">
                      <img
                        src={playlist.thumbnail}
                        alt={playlist.title}
                        className="w-16 h-16 rounded-xl object-cover shadow-md"
                      />
                      <div className="flex-1">
                        <h4 className={`text-lg font-bold ${
                          darkMode ? 'text-white' : 'text-gray-800'
                        } group-hover:text-purple-500 transition-colors duration-200 font-['Baloo_2']`}>
                          {playlist.title}
                        </h4>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        } font-['Comic_Neue'] mt-2`}>
                          Curated for your {detectedMood.toLowerCase()} mood
                        </p>
                      </div>
                      <Music className="text-purple-400 group-hover:scale-110 transition-transform duration-200" size={20} />
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Movie Recommendations */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <Film className="text-red-500" size={32} />
                <h3 className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-800'
                } font-['Baloo_2']`}>
                  Movie Clips
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendations.movies.map((movie, index) => (
                  <motion.a
                    key={index}
                    href={movie.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block p-6 rounded-2xl ${
                      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } border shadow-lg hover:shadow-2xl transition-all duration-300 group`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (index + 2) * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <div className="flex items-start space-x-4">
                      <img
                        src={movie.thumbnail}
                        alt={movie.title}
                        className="w-16 h-16 rounded-xl object-cover shadow-md"
                      />
                      <div className="flex-1">
                        <h4 className={`text-lg font-bold ${
                          darkMode ? 'text-white' : 'text-gray-800'
                        } group-hover:text-red-500 transition-colors duration-200 font-['Baloo_2']`}>
                          {movie.title}
                        </h4>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        } font-['Comic_Neue'] mt-2`}>
                          Perfect for your current mood
                        </p>
                      </div>
                      <Film className="text-red-400 group-hover:scale-110 transition-transform duration-200" size={20} />
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Mood Examples */}
        {!recommendations && !loading && (
          <motion.div
            className={`p-6 rounded-2xl ${
              darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'
            } border backdrop-blur-sm`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className={`text-xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-800'
            } font-['Baloo_2'] text-center`}>
              Not sure what to write? Try these examples:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(moodIcons).map(([mood, { icon: Icon, color, bg }]) => (
                <motion.button
                  key={mood}
                  onClick={() => {
                    const examples = {
                      Happy: "I'm feeling amazing today! Everything is going perfectly and I want to celebrate!",
                      Sad: "I'm feeling really down today. Could use something uplifting to cheer me up.",
                      Stressed: "I'm super stressed with deadlines at work and need something to help me relax.",
                      Chill: "I'm in a really mellow mood, just want to vibe and take it easy."
                    };
                    setMoodInput(examples[mood as keyof typeof examples]);
                  }}
                  className={`p-4 rounded-xl ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                  } transition-all duration-200 text-center group`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className={`${color} mx-auto mb-2 group-hover:scale-110 transition-transform duration-200`} size={24} />
                  <p className={`text-sm font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  } font-['Comic_Neue']`}>
                    Feeling {mood}
                  </p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};