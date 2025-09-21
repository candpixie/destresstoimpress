import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Home, RotateCcw, Heart, Pause, Play, Wind } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FlappyBreathProps {
  darkMode: boolean;
}

interface Bird {
  x: number;
  y: number;
  velocityY: number;
  radius: number;
}

interface Pipe {
  x: number;
  gapY: number;
  gapHeight: number;
  width: number;
  passed: boolean;
}

interface GameState {
  bird: Bird;
  pipes: Pipe[];
  score: number;
  highScore: number;
  gameOver: boolean;
  isPaused: boolean;
  breathingState: 'neutral' | 'inhale' | 'exhale';
  breathingForceActive: boolean;
  elapsedTime: number;
}

export const FlappyBreath: React.FC<FlappyBreathProps> = ({ darkMode }) => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const breathingTimerRef = useRef<number>(0);

  // Game constants
  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 600;
  const GRAVITY = 0.5;
  const BREATHING_FORCE = -8.0; // Inhale force (negative = up)
  const EXHALE_FORCE = 4.0; // Exhale force (positive = down)
  const MAX_VELOCITY = 10.0;
  const PIPE_SPEED = 3.0;
  const PIPE_SPAWN_DISTANCE = 300;
  const BREATHING_FORCE_DURATION = 300; // milliseconds

  // Game state
  const [gameState, setGameState] = useState<GameState>({
    bird: { x: 100, y: 250, velocityY: 0, radius: 20 },
    pipes: [],
    score: 0,
    highScore: parseInt(localStorage.getItem('flappyBreathHighScore') || '0'),
    gameOver: false,
    isPaused: false,
    breathingState: 'neutral',
    breathingForceActive: false,
    elapsedTime: 0
  });

  const [gameStarted, setGameStarted] = useState(false);
  const [breathMeter, setBreathMeter] = useState(50);
  const [difficultyLevel, setDifficultyLevel] = useState(1.0);

  // Initialize game
  const initializeGame = useCallback(() => {
    const initialPipes: Pipe[] = [];
    for (let i = 0; i < 3; i++) {
      const pipeX = GAME_WIDTH + (i * PIPE_SPAWN_DISTANCE);
      const minGapY = 100;
      const maxGapY = GAME_HEIGHT - 200;
      const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
      
      initialPipes.push({
        x: pipeX,
        gapY,
        gapHeight: 120,
        width: 50,
        passed: false
      });
    }

    setGameState(prev => ({
      ...prev,
      bird: { x: 100, y: 250, velocityY: 0, radius: 20 },
      pipes: initialPipes,
      score: 0,
      gameOver: false,
      isPaused: false,
      breathingState: 'neutral',
      breathingForceActive: false,
      elapsedTime: 0
    }));

    startTimeRef.current = Date.now();
  }, []);

  // Breathing input handler
  const handleBreathingInput = useCallback((breathType: 'inhale' | 'exhale', volume: number = 1.0) => {
    if (gameState.gameOver || gameState.isPaused) return;

    setGameState(prev => {
      const newBird = { ...prev.bird };
      
      if (breathType === 'inhale') {
        // Apply upward force
        newBird.velocityY = Math.max(BREATHING_FORCE * volume, 
                                   newBird.velocityY + BREATHING_FORCE * volume);
        setBreathMeter(prev => Math.min(prev + 15, 100));
      } else if (breathType === 'exhale') {
        // Apply downward force
        newBird.velocityY = Math.min(EXHALE_FORCE * volume, 
                                   newBird.velocityY + EXHALE_FORCE * volume);
        setBreathMeter(prev => Math.max(prev - 10, 0));
      }

      breathingTimerRef.current = Date.now();

      return {
        ...prev,
        bird: newBird,
        breathingState: breathType,
        breathingForceActive: true
      };
    });
  }, [gameState.gameOver, gameState.isPaused]);

  // Update bird physics
  const updateBirdPhysics = useCallback((bird: Bird, deltaTime: number): Bird => {
    const newBird = { ...bird };
    
    // Apply gravity
    newBird.velocityY += GRAVITY * difficultyLevel;
    
    // Check if breathing force should still be applied
    const breathingActive = Date.now() - breathingTimerRef.current < BREATHING_FORCE_DURATION;
    if (!breathingActive && gameState.breathingForceActive) {
      setGameState(prev => ({
        ...prev,
        breathingState: 'neutral',
        breathingForceActive: false
      }));
    }
    
    // Limit velocity
    newBird.velocityY = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, newBird.velocityY));
    
    // Update position
    newBird.y += newBird.velocityY;
    
    // Keep bird on screen
    if (newBird.y < newBird.radius) {
      newBird.y = newBird.radius;
      newBird.velocityY = 0;
    } else if (newBird.y > GAME_HEIGHT - newBird.radius) {
      newBird.y = GAME_HEIGHT - newBird.radius;
      newBird.velocityY = 0;
    }
    
    return newBird;
  }, [difficultyLevel, gameState.breathingForceActive]);

  // Update pipes
  const updatePipes = useCallback((pipes: Pipe[]): Pipe[] => {
    const newPipes = pipes.map(pipe => ({
      ...pipe,
      x: pipe.x - PIPE_SPEED * difficultyLevel
    })).filter(pipe => pipe.x + pipe.width > 0);

    // Generate new pipes
    if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < GAME_WIDTH - PIPE_SPAWN_DISTANCE) {
      const minGapY = 100;
      const maxGapY = GAME_HEIGHT - 200;
      const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
      
      newPipes.push({
        x: GAME_WIDTH,
        gapY,
        gapHeight: 120,
        width: 50,
        passed: false
      });
    }

    return newPipes;
  }, [difficultyLevel]);

  // Check collisions
  const checkCollisions = useCallback((bird: Bird, pipes: Pipe[]): boolean => {
    const birdLeft = bird.x - bird.radius;
    const birdRight = bird.x + bird.radius;
    const birdTop = bird.y - bird.radius;
    const birdBottom = bird.y + bird.radius;

    for (const pipe of pipes) {
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + pipe.width;

      // Check if bird is horizontally aligned with pipe
      if (birdRight > pipeLeft && birdLeft < pipeRight) {
        const gapTop = pipe.gapY;
        const gapBottom = pipe.gapY + pipe.gapHeight;

        if (birdTop < gapTop || birdBottom > gapBottom) {
          return true;
        }
      }
    }

    // Check ground/ceiling collision
    if (bird.y <= bird.radius || bird.y >= GAME_HEIGHT - bird.radius) {
      return true;
    }

    return false;
  }, []);

  // Update score
  const updateScore = useCallback((bird: Bird, pipes: Pipe[]): { pipes: Pipe[], scoreIncrease: number } => {
    let scoreIncrease = 0;
    const newPipes = pipes.map(pipe => {
      if (!pipe.passed && pipe.x + pipe.width < bird.x) {
        scoreIncrease += 1;
        return { ...pipe, passed: true };
      }
      return pipe;
    });

    return { pipes: newPipes, scoreIncrease };
  }, []);

  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (!gameStarted || gameState.isPaused || gameState.gameOver) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const deltaTime = currentTime - lastTimeRef.current;
    if (deltaTime < 16.67) { // ~60 FPS
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    setGameState(prev => {
      // Update bird
      const newBird = updateBirdPhysics(prev.bird, deltaTime);
      
      // Update pipes
      const newPipes = updatePipes(prev.pipes);
      
      // Check collisions
      const collision = checkCollisions(newBird, newPipes);
      if (collision) {
        const newHighScore = Math.max(prev.score, prev.highScore);
        localStorage.setItem('flappyBreathHighScore', newHighScore.toString());
        return {
          ...prev,
          bird: newBird,
          pipes: newPipes,
          gameOver: true,
          highScore: newHighScore
        };
      }
      
      // Update score
      const { pipes: scoredPipes, scoreIncrease } = updateScore(newBird, newPipes);
      
      return {
        ...prev,
        bird: newBird,
        pipes: scoredPipes,
        score: prev.score + scoreIncrease,
        elapsedTime: (Date.now() - startTimeRef.current) / 1000
      };
    });

    // Gradually decrease breath meter
    setBreathMeter(prev => Math.max(prev - 0.2, 0));

    lastTimeRef.current = currentTime;
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameStarted, gameState.isPaused, gameState.gameOver, updateBirdPhysics, updatePipes, checkCollisions, updateScore]);

  // Start game
  const startGame = useCallback(() => {
    initializeGame();
    setGameStarted(true);
    lastTimeRef.current = performance.now();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [initializeGame, gameLoop]);

  // Pause/Resume game
  const togglePause = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    setGameStarted(false);
    setBreathMeter(50);
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    initializeGame();
  }, [initializeGame]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted) return;
      
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'arrowup':
        case 'w':
          e.preventDefault();
          handleBreathingInput('inhale', 1.0);
          break;
        case 'arrowdown':
        case 's':
          e.preventDefault();
          handleBreathingInput('exhale', 0.8);
          break;
        case 'p':
          togglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, handleBreathingInput, togglePause]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    // Clear canvas
    ctx.fillStyle = darkMode ? '#1f2937' : '#87CEEB';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw pipes
    ctx.fillStyle = darkMode ? '#374151' : '#32CD32';
    gameState.pipes.forEach(pipe => {
      // Top pipe
      ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapY);
      // Bottom pipe
      ctx.fillRect(pipe.x, pipe.gapY + pipe.gapHeight, pipe.width, GAME_HEIGHT - pipe.gapY - pipe.gapHeight);
    });

    // Draw bird with breathing effect
    const bird = gameState.bird;
    const breathingScale = gameState.breathingForceActive ? 1.2 : 1.0;
    const birdRadius = bird.radius * breathingScale;
    
    // Bird glow effect based on breathing
    if (gameState.breathingForceActive) {
      const glowColor = gameState.breathingState === 'inhale' ? '#60A5FA' : '#F87171';
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 20;
    }
    
    ctx.fillStyle = gameState.breathingState === 'inhale' ? '#60A5FA' : 
                   gameState.breathingState === 'exhale' ? '#F87171' : '#FCD34D';
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, birdRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Reset shadow
    ctx.shadowBlur = 0;

    // Draw bird emoji
    ctx.font = `${birdRadius}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐦', bird.x, bird.y);

  }, [gameState, darkMode]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  return (
    <div className={`min-h-screen pt-24 pb-12 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-teal-900' 
        : 'bg-gradient-to-br from-blue-50 via-teal-50 to-green-50'
    }`}>
      <div className="container mx-auto px-4 max-w-6xl">
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
                Flappy Breath 🐦
              </h1>
              <p className={`text-lg ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } font-['Comic_Neue']`}>
                Master your breathing to control the bird!
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className={`text-2xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Score: {gameState.score}
              </div>
              <div className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Best: {gameState.highScore}
              </div>
            </div>

            {gameStarted && (
              <motion.button
                onClick={togglePause}
                className={`p-3 rounded-full ${
                  darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
                } shadow-lg hover:shadow-xl transition-all duration-200`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {gameState.isPaused ? <Play size={20} /> : <Pause size={20} />}
              </motion.button>
            )}

            <motion.button
              onClick={resetGame}
              className={`p-3 rounded-full ${
                darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
              } shadow-lg hover:shadow-xl transition-all duration-200`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <RotateCcw size={20} />
            </motion.button>
          </div>
        </motion.div>

        <motion.div 
          className="flex gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Game Canvas */}
          <motion.div
            className={`flex-1 relative rounded-3xl overflow-hidden ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border-2 shadow-2xl`}
            style={{ maxWidth: '800px', aspectRatio: '4/3' }}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-pointer"
              onClick={() => handleBreathingInput('inhale', 1.0)}
              style={{ imageRendering: 'pixelated' }}
            />

            {/* Game Over / Start Screen */}
            {(!gameStarted || gameState.gameOver || gameState.isPaused) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🐦</div>
                  <h2 className="text-3xl font-bold mb-4 font-['Baloo_2']">
                    {gameState.gameOver ? `Game Over! Score: ${gameState.score}` : 
                     gameState.isPaused ? 'Paused' : 'Ready to Breathe?'}
                  </h2>
                  <p className="mb-6 font-['Comic_Neue'] max-w-md">
                    {gameState.gameOver ? 'Take a deep breath and try again!' : 
                     gameState.isPaused ? 'Press P to resume or click to continue' :
                     'Use your breathing to control the bird. Inhale to rise, exhale to descend!'}
                  </p>
                  <div className="space-x-4">
                    <motion.button
                      onClick={gameState.isPaused ? togglePause : startGame}
                      className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 font-['Baloo_2']"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {gameState.gameOver ? 'Try Again' : 
                       gameState.isPaused ? 'Resume' : 'Start Flying'}
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Breathing Controls & Meter */}
          <div className="w-80 space-y-6">
            {/* Breathing Meter */}
            <div className={`p-6 rounded-3xl ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border-2 shadow-2xl`}>
              <div className="text-center mb-4">
                <Heart className={`mx-auto mb-2 ${
                  gameState.breathingForceActive ? 'text-red-500' : (darkMode ? 'text-gray-400' : 'text-gray-600')
                }`} size={32} />
                <p className={`text-lg font-semibold ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                } font-['Comic_Neue']`}>
                  Breath Control
                </p>
              </div>
              
              <div className={`relative w-full h-64 mx-auto rounded-full ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              } overflow-hidden`}>
                <motion.div
                  className="absolute bottom-0 w-full rounded-full bg-gradient-to-t from-red-500 to-pink-400"
                  style={{ height: `${breathMeter}%` }}
                  animate={gameState.breathingForceActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Breathing state indicator */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className={`text-4xl ${
                      gameState.breathingState === 'inhale' ? 'text-blue-400' :
                      gameState.breathingState === 'exhale' ? 'text-red-400' : 'text-gray-400'
                    }`}
                    animate={gameState.breathingForceActive ? { scale: [1, 1.3, 1] } : {}}
                  >
                    {gameState.breathingState === 'inhale' ? '↑' :
                     gameState.breathingState === 'exhale' ? '↓' : '○'}
                  </motion.div>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                } font-['Comic_Neue']`}>
                  {breathMeter > 70 ? 'Perfect Control!' : 
                   breathMeter > 30 ? 'Keep Breathing' : 'Focus on Breath!'}
                </p>
              </div>
            </div>

            {/* Breathing Controls */}
            <div className={`p-6 rounded-3xl ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border-2 shadow-2xl`}>
              <h3 className={`text-xl font-bold mb-4 ${
                darkMode ? 'text-white' : 'text-gray-800'
              } font-['Baloo_2'] text-center`}>
                Breathing Controls
              </h3>
              
              <div className="space-y-4">
                <motion.button
                  onClick={() => handleBreathingInput('inhale', 1.0)}
                  className="w-full p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 font-['Baloo_2'] flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!gameStarted || gameState.gameOver}
                >
                  <Wind size={20} />
                  <span>Inhale (Rise)</span>
                </motion.button>
                
                <motion.button
                  onClick={() => handleBreathingInput('exhale', 0.8)}
                  className="w-full p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 font-['Baloo_2'] flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!gameStarted || gameState.gameOver}
                >
                  <Wind size={20} className="rotate-180" />
                  <span>Exhale (Descend)</span>
                </motion.button>
              </div>

              {/* Difficulty Slider */}
              <div className="mt-6">
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                } font-['Comic_Neue']`}>
                  Difficulty: {difficultyLevel.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={difficultyLevel}
                  onChange={(e) => setDifficultyLevel(parseFloat(e.target.value))}
                  className="w-full"
                  disabled={gameStarted && !gameState.gameOver}
                />
              </div>
            </div>

            {/* Game Stats */}
            {gameStarted && (
              <div className={`p-6 rounded-3xl ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } border-2 shadow-2xl`}>
                <h3 className={`text-xl font-bold mb-4 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                } font-['Baloo_2'] text-center`}>
                  Game Stats
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className={`flex justify-between ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  } font-['Comic_Neue']`}>
                    <span>Time:</span>
                    <span>{gameState.elapsedTime.toFixed(1)}s</span>
                  </div>
                  <div className={`flex justify-between ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  } font-['Comic_Neue']`}>
                    <span>Pipes Passed:</span>
                    <span>{gameState.score}</span>
                  </div>
                  <div className={`flex justify-between ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  } font-['Comic_Neue']`}>
                    <span>Breathing State:</span>
                    <span className="capitalize">{gameState.breathingState}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
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
            Advanced Breathing Controls
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">🫁</div>
              <p className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } font-['Comic_Neue']`}>
                <strong>Inhale (Space/W/↑):</strong> Powerful upward force to lift the bird
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">💨</div>
              <p className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } font-['Comic_Neue']`}>
                <strong>Exhale (S/↓):</strong> Controlled descent with gentle downward force
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🧘</div>
              <p className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } font-['Comic_Neue']`}>
                <strong>Mindful Control:</strong> Master your breathing rhythm for perfect flight
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};