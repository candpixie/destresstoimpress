import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Home, RotateCcw, Heart, Pause, Play, Wind, Mic, MicOff, Settings } from 'lucide-react';
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

interface MicrophoneState {
  isActive: boolean;
  hasPermission: boolean;
  volume: number;
  baseline: number;
  calibrating: boolean;
  error: string | null;
}

export const FlappyBreath: React.FC<FlappyBreathProps> = ({ darkMode }) => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const breathingTimerRef = useRef<number>(0);

  // Audio context and microphone refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const samplesRef = useRef<number[]>([]);
  const monitoringRef = useRef<boolean>(false);

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

  // Microphone state
  const [micState, setMicState] = useState<MicrophoneState>({
    isActive: false,
    hasPermission: false,
    volume: 0,
    baseline: 0,
    calibrating: false,
    error: null
  });

  const [gameStarted, setGameStarted] = useState(false);
  const [breathMeter, setBreathMeter] = useState(50);
  const [difficultyLevel, setDifficultyLevel] = useState(1.0);
  const [sensitivity, setSensitivity] = useState(1.5);
  const [showMicTest, setShowMicTest] = useState(false);

  // Request microphone permission
  const requestMicrophonePermission = useCallback(async () => {
    try {
      setMicState(prev => ({ ...prev, error: null, calibrating: true }));
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      audioStreamRef.current = stream;
      setMicState(prev => ({ 
        ...prev, 
        hasPermission: true, 
        calibrating: false,
        error: null 
      }));

      return true;
    } catch (error) {
      console.error('Microphone permission error:', error);
      setMicState(prev => ({ 
        ...prev, 
        hasPermission: false, 
        calibrating: false,
        error: `Microphone access denied: ${(error as Error).message}` 
      }));
      return false;
    }
  }, []);

  // Start microphone monitoring
  const startMicrophoneMonitoring = useCallback(async () => {
    if (!audioStreamRef.current) {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) return false;
    }

    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(audioStreamRef.current!);
      analyserRef.current = audioContextRef.current.createAnalyser();

      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;

      microphoneRef.current.connect(analyserRef.current);

      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      monitoringRef.current = true;
      setMicState(prev => ({ ...prev, isActive: true, calibrating: true }));

      // Start calibration
      samplesRef.current = [];
      setTimeout(() => {
        if (samplesRef.current.length > 0) {
          const baseline = samplesRef.current.reduce((a, b) => a + b) / samplesRef.current.length;
          setMicState(prev => ({ ...prev, baseline, calibrating: false }));
        }
      }, 3000); // 3 second calibration

      startAudioMonitoring();
      return true;
    } catch (error) {
      console.error('Audio monitoring error:', error);
      setMicState(prev => ({ 
        ...prev, 
        error: `Audio setup failed: ${(error as Error).message}` 
      }));
      return false;
    }
  }, [requestMicrophonePermission]);

  // Stop microphone monitoring
  const stopMicrophoneMonitoring = useCallback(() => {
    monitoringRef.current = false;
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }

    setMicState(prev => ({ 
      ...prev, 
      isActive: false, 
      volume: 0,
      calibrating: false 
    }));
  }, []);

  // Audio monitoring loop
  const startAudioMonitoring = useCallback(() => {
    const monitor = () => {
      if (!monitoringRef.current || !analyserRef.current || !dataArrayRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      // Calculate RMS volume
      let sum = 0;
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        sum += dataArrayRef.current[i] * dataArrayRef.current[i];
      }
      const rms = Math.sqrt(sum / dataArrayRef.current.length);

      setMicState(prev => ({ ...prev, volume: rms }));

      // Collect samples for baseline during calibration
      if (micState.calibrating && samplesRef.current.length < 150) {
        samplesRef.current.push(rms);
      }

      // Process breathing if not calibrating
      if (!micState.calibrating && micState.baseline > 0) {
        processBreathingInput(rms, micState.baseline);
      }

      requestAnimationFrame(monitor);
    };
    monitor();
  }, [micState.calibrating, micState.baseline]);

  // Process breathing input from microphone
  const processBreathingInput = useCallback((volume: number, baseline: number) => {
    if (gameState.gameOver || gameState.isPaused) return;

    const inhaleThreshold = baseline * sensitivity;
    const exhaleThreshold = baseline * (2 - sensitivity); // Inverse relationship

    if (volume > inhaleThreshold) {
      handleBreathingInput('inhale', Math.min((volume - baseline) / baseline, 2.0));
    } else if (volume < exhaleThreshold) {
      handleBreathingInput('exhale', Math.min((baseline - volume) / baseline, 1.5));
    }
  }, [gameState.gameOver, gameState.isPaused, sensitivity]);

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
  const startGame = useCallback(async () => {
    // Start microphone if not already active
    if (!micState.isActive) {
      const micStarted = await startMicrophoneMonitoring();
      if (!micStarted) {
        alert('Microphone access is required to play. Please allow microphone access and try again.');
        return;
      }
    }

    initializeGame();
    setGameStarted(true);
    lastTimeRef.current = performance.now();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [initializeGame, gameLoop, micState.isActive, startMicrophoneMonitoring]);

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

  // Keyboard controls (backup)
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
    ctx.fillStyle = darkMode ? '#1a1a2e' : '#87CEEB';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Add background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, darkMode ? '#16213e' : '#87CEEB');
    gradient.addColorStop(1, darkMode ? '#0f3460' : '#4682B4');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Add floating clouds
    ctx.fillStyle = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)';
    const time = Date.now() * 0.001;
    for (let i = 0; i < 5; i++) {
      const x = (time * 20 + i * 150) % (GAME_WIDTH + 100) - 50;
      const y = 50 + i * 80;
      drawCloud(ctx, x, y, 0.5 + i * 0.2);
    }
    // Draw pipes
    ctx.fillStyle = darkMode ? '#2d5a27' : '#228B22';
    gameState.pipes.forEach(pipe => {
      // Add pipe gradient
      const pipeGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
      pipeGradient.addColorStop(0, darkMode ? '#2d5a27' : '#32CD32');
      pipeGradient.addColorStop(0.5, darkMode ? '#1e3a1a' : '#228B22');
      pipeGradient.addColorStop(1, darkMode ? '#2d5a27' : '#32CD32');
      ctx.fillStyle = pipeGradient;
      
      // Top pipe
      ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapY);
      
      // Bottom pipe
      ctx.fillRect(pipe.x, pipe.gapY + pipe.gapHeight, pipe.width, GAME_HEIGHT - pipe.gapY - pipe.gapHeight);
      
      // Add pipe caps
      ctx.fillStyle = darkMode ? '#1e3a1a' : '#1e7e1e';
      ctx.fillRect(pipe.x - 5, pipe.gapY - 30, pipe.width + 10, 30);
      ctx.fillRect(pipe.x - 5, pipe.gapY + pipe.gapHeight, pipe.width + 10, 30);
    });

    // Draw 3D-style animated bird
    const bird = gameState.bird;
    drawBird3D(ctx, bird, gameState, time);
    
  }, [gameState, darkMode]);

  // Helper function to draw clouds
  const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    ctx.beginPath();
    ctx.arc(-20, 0, 15, 0, Math.PI * 2);
    ctx.arc(-5, -5, 20, 0, Math.PI * 2);
    ctx.arc(10, 0, 18, 0, Math.PI * 2);
    ctx.arc(25, -2, 15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  };

  // Enhanced 3D-style bird drawing function
  const drawBird3D = (ctx: CanvasRenderingContext2D, bird: Bird, gameState: GameState, time: number) => {
    const breathingScale = gameState.breathingForceActive ? 1.3 : 1.0;
    const birdRadius = bird.radius * breathingScale;
    
    // Save context for bird transformations
    ctx.save();
    ctx.translate(bird.x, bird.y);
    
    // Apply breathing rotation and movement
    const breathingRotation = gameState.breathingState === 'inhale' ? -0.3 : 
                             gameState.breathingState === 'exhale' ? 0.3 : 
                             Math.sin(time * 2) * 0.1; // Idle floating animation
    ctx.rotate(breathingRotation);
    
    // Velocity-based tilt
    const velocityTilt = Math.max(-0.5, Math.min(0.5, bird.velocityY * 0.05));
    ctx.rotate(velocityTilt);
    
    // Bird glow effect
    if (gameState.breathingForceActive) {
      const glowColor = gameState.breathingState === 'inhale' ? '#60A5FA' : '#F87171';
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 30;
    }
    
    // Dynamic colors based on breathing
    const bodyColor = gameState.breathingState === 'inhale' ? '#3B82F6' : 
                     gameState.breathingState === 'exhale' ? '#EF4444' : '#F59E0B';
    const wingColor = gameState.breathingState === 'inhale' ? '#1D4ED8' : 
                     gameState.breathingState === 'exhale' ? '#DC2626' : '#D97706';
    
    // Wing flapping animation
    const wingFlap = gameState.breathingForceActive ? 
      Math.sin(time * 20) * 0.5 : 
      Math.sin(time * 8) * 0.2;
    
    // Draw bird shadow (3D effect)
    ctx.save();
    ctx.translate(5, 5);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.scale(1, 0.5);
    ctx.beginPath();
    ctx.ellipse(0, 0, birdRadius * 1.2, birdRadius * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Draw tail feathers (behind body)
    ctx.fillStyle = wingColor;
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.rotate((i - 1) * 0.2);
      ctx.beginPath();
      ctx.ellipse(-birdRadius * 1.2, birdRadius * 0.1 * i, birdRadius * 0.6, birdRadius * 0.3, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    
    // Draw wings (animated)
    ctx.save();
    ctx.rotate(wingFlap);
    
    // Wing gradient for 3D effect
    const wingGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, birdRadius);
    wingGradient.addColorStop(0, wingColor);
    wingGradient.addColorStop(1, bodyColor);
    ctx.fillStyle = wingGradient;
    
    // Left wing
    ctx.beginPath();
    ctx.ellipse(-birdRadius * 0.3, birdRadius * 0.2, birdRadius * 0.9, birdRadius * 0.5, -0.4, 0, Math.PI * 2);
    ctx.fill();
    
    // Right wing
    ctx.beginPath();
    ctx.ellipse(-birdRadius * 0.3, -birdRadius * 0.2, birdRadius * 0.9, birdRadius * 0.5, 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // Draw main body with gradient
    const bodyGradient = ctx.createRadialGradient(-birdRadius * 0.3, -birdRadius * 0.3, 0, 0, 0, birdRadius * 1.5);
    bodyGradient.addColorStop(0, bodyColor);
    bodyGradient.addColorStop(0.7, bodyColor);
    bodyGradient.addColorStop(1, wingColor);
    ctx.fillStyle = bodyGradient;
    
    ctx.beginPath();
    ctx.ellipse(0, 0, birdRadius * 1.2, birdRadius * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw head
    const headGradient = ctx.createRadialGradient(birdRadius * 0.3, -birdRadius * 0.2, 0, birdRadius * 0.6, -birdRadius * 0.3, birdRadius * 0.8);
    headGradient.addColorStop(0, bodyColor);
    headGradient.addColorStop(1, wingColor);
    ctx.fillStyle = headGradient;
    
    ctx.beginPath();
    ctx.ellipse(birdRadius * 0.6, -birdRadius * 0.3, birdRadius * 0.8, birdRadius * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw beak with gradient
    const beakGradient = ctx.createLinearGradient(birdRadius * 1.2, -birdRadius * 0.4, birdRadius * 1.7, -birdRadius * 0.1);
    beakGradient.addColorStop(0, '#FF8C00');
    beakGradient.addColorStop(1, '#FF6347');
    ctx.fillStyle = beakGradient;
    
    ctx.beginPath();
    ctx.moveTo(birdRadius * 1.2, -birdRadius * 0.4);
    ctx.lineTo(birdRadius * 1.7, -birdRadius * 0.2);
    ctx.lineTo(birdRadius * 1.2, -birdRadius * 0.1);
    ctx.closePath();
    ctx.fill();
    
    // Draw eye with shine
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(birdRadius * 0.7, -birdRadius * 0.4, birdRadius * 0.3, birdRadius * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye pupil
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(birdRadius * 0.75, -birdRadius * 0.35, birdRadius * 0.15, birdRadius * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye shine
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(birdRadius * 0.8, -birdRadius * 0.4, birdRadius * 0.05, birdRadius * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Breathing particles effect
    if (gameState.breathingForceActive) {
      const particleColor = gameState.breathingState === 'inhale' ? '#60A5FA' : '#F87171';
      ctx.fillStyle = particleColor;
      
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + time * 3;
        const distance = birdRadius * (1.8 + Math.sin(time * 5 + i) * 0.3);
        const particleX = Math.cos(angle) * distance;
        const particleY = Math.sin(angle) * distance;
        
        ctx.save();
        ctx.globalAlpha = 0.7 + Math.sin(time * 4 + i) * 0.3;
        ctx.beginPath();
        ctx.arc(particleX, particleY, 2 + Math.sin(time * 6 + i) * 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    
    // Speed lines when moving fast
    if (Math.abs(bird.velocityY) > 5) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(-birdRadius * 2 - i * 10, -5 + i * 5);
        ctx.lineTo(-birdRadius * 3 - i * 15, -5 + i * 5);
        ctx.stroke();
      }
    }
    
    // Reset effects
    ctx.shadowBlur = 0;
    ctx.restore();
  };


  // Cleanup
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      stopMicrophoneMonitoring();
    };
  }, [stopMicrophoneMonitoring]);

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
                Control the bird with your breathing!
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

          {/* Microphone & Breathing Controls */}
          <div className="w-80 space-y-6">
            {/* Microphone Status */}
            <div className={`p-6 rounded-3xl ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border-2 shadow-2xl`}>
              <div className="text-center mb-4">
                <div className={`mx-auto mb-2 ${
                  micState.isActive ? 'text-green-500' : 'text-gray-400'
                }`}>
                  {micState.isActive ? <Mic size={32} /> : <MicOff size={32} />}
                </div>
                <p className={`text-lg font-semibold ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                } font-['Comic_Neue']`}>
                  Microphone Status
                </p>
              </div>
              
              <div className={`text-center text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              } font-['Comic_Neue'] mb-4`}>
                {micState.calibrating ? '🔄 Calibrating...' :
                 micState.isActive ? '✅ Active & Ready' :
                 micState.hasPermission ? '⏸️ Ready to Start' :
                 '❌ Permission Needed'}
              </div>

              {micState.error && (
                <div className="text-red-500 text-xs mb-4 p-2 bg-red-100 rounded">
                  {micState.error}
                </div>
              )}

              {/* Volume Meter */}
              <div className={`w-full h-4 ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              } rounded-full overflow-hidden mb-4`}>
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-red-500 transition-all duration-100"
                  style={{ width: `${Math.min(100, (micState.volume / 50) * 100)}%` }}
                />
              </div>

              <div className="flex space-x-2">
                <motion.button
                  onClick={micState.isActive ? stopMicrophoneMonitoring : startMicrophoneMonitoring}
                  className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all duration-200 font-['Baloo_2'] ${
                    micState.isActive 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {micState.isActive ? 'Stop' : 'Start'} Mic
                </motion.button>
                
                <motion.button
                  onClick={() => setShowMicTest(!showMicTest)}
                  className={`px-4 py-2 rounded-xl ${
                    darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
                  } hover:scale-105 transition-all duration-200`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings size={16} />
                </motion.button>
              </div>
            </div>

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

            {/* Sensitivity Control */}
            {showMicTest && (
              <div className={`p-6 rounded-3xl ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } border-2 shadow-2xl`}>
                <h3 className={`text-xl font-bold mb-4 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                } font-['Baloo_2'] text-center`}>
                  Microphone Settings
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    } font-['Comic_Neue']`}>
                      Sensitivity: {sensitivity.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="1.0"
                      max="3.0"
                      step="0.1"
                      value={sensitivity}
                      onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div className={`text-xs ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  } font-['Comic_Neue']`}>
                    <p><strong>Volume:</strong> {micState.volume.toFixed(1)}</p>
                    <p><strong>Baseline:</strong> {micState.baseline.toFixed(1)}</p>
                    <p><strong>Inhale Threshold:</strong> {(micState.baseline * sensitivity).toFixed(1)}</p>
                    <p><strong>Exhale Threshold:</strong> {(micState.baseline * (2 - sensitivity)).toFixed(1)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Manual Controls (Backup) */}
            <div className={`p-6 rounded-3xl ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border-2 shadow-2xl`}>
              <h3 className={`text-xl font-bold mb-4 ${
                darkMode ? 'text-white' : 'text-gray-800'
              } font-['Baloo_2'] text-center`}>
                Manual Controls
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
                  <div className={`flex justify-between ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  } font-['Comic_Neue']`}>
                    <span>Mic Active:</span>
                    <span>{micState.isActive ? '✅' : '❌'}</span>
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
            How to Play with Breathing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">🎤</div>
              <p className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } font-['Comic_Neue']`}>
                <strong>Microphone Control:</strong> Breathe into your microphone to control the bird naturally
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🫁</div>
              <p className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } font-['Comic_Neue']`}>
                <strong>Inhale:</strong> Breathe in deeply to make the bird rise up
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">💨</div>
              <p className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } font-['Comic_Neue']`}>
                <strong>Exhale:</strong> Breathe out to make the bird descend gently
              </p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            } font-['Comic_Neue']`}>
              💡 <strong>Tip:</strong> The game calibrates to your breathing pattern. Breathe normally for 3 seconds when starting!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};