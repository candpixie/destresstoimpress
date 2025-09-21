import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, RotateCcw, Star, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';

interface FitCheckProps {
  darkMode: boolean;
}

export const FitCheck: React.FC<FitCheckProps> = ({ darkMode }) => {
  const navigate = useNavigate();
  const mountRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    koala?: THREE.Group;
    accessories: THREE.Group[];
    dresses: Array<{
      mesh: THREE.Group;
      color: number;
      position: THREE.Vector3;
      available: boolean;
      originalScale: THREE.Vector3;
    }>;
    shelves: Array<{
      position: THREE.Vector3;
      size: { width: number; height: number; depth: number };
    }>;
    koalaVelocity: THREE.Vector3;
    isJumping: boolean;
    keys: Record<string, boolean>;
    clock: THREE.Clock;
    audioContext?: AudioContext;
    musicPlaying: boolean;
    meditationNodes: any[];
  }>({
    accessories: [],
    dresses: [],
    shelves: [],
    koalaVelocity: new THREE.Vector3(0, 0, 0),
    isJumping: false,
    keys: {},
    clock: new THREE.Clock(),
    musicPlaying: false,
    meditationNodes: []
  });

  const [score, setScore] = useState(0);
  const [accessoryCount, setAccessoryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);

  // Game constants
  const groundLevel = 0;
  const gravity = -0.02;
  const jumpPower = 0.3;
  const moveSpeed = 0.1;
  const gameArea = { minX: -15, maxX: 15, minZ: -15, maxZ: 15 };

  useEffect(() => {
    if (!mountRef.current) return;

    const initGame = async () => {
      try {
        // Initialize Three.js scene
        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0xcccccc, 1, 100);

        const camera = new THREE.PerspectiveCamera(
          75,
          mountRef.current!.clientWidth / mountRef.current!.clientHeight,
          0.1,
          1000
        );
        camera.position.set(0, 5, 10);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mountRef.current!.clientWidth, mountRef.current!.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setClearColor(0x87CEEB);
        mountRef.current!.appendChild(renderer.domElement);

        gameRef.current.scene = scene;
        gameRef.current.camera = camera;
        gameRef.current.renderer = renderer;

        // Setup lighting
        setupLighting(scene);

        // Create game world
        createFloor(scene);
        createFashionStore(scene);
        const koala = createKoala(scene);
        gameRef.current.koala = koala;
        createAccessories(scene);

        // Initialize audio
        initializeMusic();

        setLoading(false);

        // Start game loop
        const animate = () => {
          requestAnimationFrame(animate);
          
          const delta = gameRef.current.clock.getDelta();
          
          updateKoala();
          updateCamera();
          updateAccessories();
          checkDressInteraction();
          
          renderer.render(scene, camera);
        };
        animate();

      } catch (error) {
        console.error('Error initializing 3D game:', error);
        setLoading(false);
      }
    };

    initGame();

    // Event listeners
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          gameRef.current.keys.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          gameRef.current.keys.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          gameRef.current.keys.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          gameRef.current.keys.right = true;
          break;
        case 'Space':
          gameRef.current.keys.jump = true;
          event.preventDefault();
          break;
        case 'KeyR':
          resetKoalaColor();
          break;
        case 'KeyM':
          toggleBackgroundMusic();
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          gameRef.current.keys.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          gameRef.current.keys.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          gameRef.current.keys.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          gameRef.current.keys.right = false;
          break;
        case 'Space':
          gameRef.current.keys.jump = false;
          break;
      }
    };

    const handleResize = () => {
      if (gameRef.current.camera && gameRef.current.renderer && mountRef.current) {
        gameRef.current.camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        gameRef.current.camera.updateProjectionMatrix();
        gameRef.current.renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      
      if (gameRef.current.renderer && mountRef.current) {
        mountRef.current.removeChild(gameRef.current.renderer.domElement);
        gameRef.current.renderer.dispose();
      }
    };
  }, []);

  const setupLighting = (scene: THREE.Scene) => {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 25);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0xffffff, 0.5, 30);
    pointLight1.position.set(10, 8, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.5, 30);
    pointLight2.position.set(-10, 8, -10);
    scene.add(pointLight2);
  };

  const createFloor = (scene: THREE.Scene) => {
    const floorGeometry = new THREE.PlaneGeometry(100, 100);
    const floorMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = groundLevel;
    floor.receiveShadow = true;
    scene.add(floor);

    // Add checkerboard pattern
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const context = canvas.getContext('2d')!;
    const size = 16;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        context.fillStyle = (i + j) % 2 ? '#ff6b9d' : '#ffffff';
        context.fillRect(i * size, j * size, size, size);
      }
    }
    const floorTexture = new THREE.CanvasTexture(canvas);
    floorTexture.repeat.set(10, 10);
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floor.material.map = floorTexture;
  };

  const createFashionStore = (scene: THREE.Scene) => {
    // Create store walls
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xf0f0f0 });

    // Back wall
    const backWallGeometry = new THREE.BoxGeometry(40, 15, 1);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, 7.5, -20);
    scene.add(backWall);

    // Create game boundaries
    const boundaryMaterial = new THREE.MeshLambertMaterial({
      color: 0x4169E1,
      transparent: true,
      opacity: 0.3
    });

    const wallHeight = 5;
    const boundaries = [
      { pos: [0, wallHeight/2, -15], size: [30, wallHeight, 0.2] },
      { pos: [0, wallHeight/2, 15], size: [30, wallHeight, 0.2] },
      { pos: [-15, wallHeight/2, 0], size: [0.2, wallHeight, 30] },
      { pos: [15, wallHeight/2, 0], size: [0.2, wallHeight, 30] }
    ];

    boundaries.forEach(({ pos, size }) => {
      const geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
      const wall = new THREE.Mesh(geometry, boundaryMaterial);
      wall.position.set(pos[0], pos[1], pos[2]);
      scene.add(wall);
    });

    createShelves(scene);
  };

  const createShelves = (scene: THREE.Scene) => {
    const shelfMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    gameRef.current.shelves = [];

    for (let i = 0; i < 6; i++) {
      const shelfGeometry = new THREE.BoxGeometry(4, 0.2, 2);
      const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);

      const angle = (i / 6) * Math.PI * 2;
      const radius = 12;
      shelf.position.set(
        Math.cos(angle) * radius,
        2 + Math.sin(i) * 0.5,
        Math.sin(angle) * radius
      );

      shelf.castShadow = true;
      shelf.receiveShadow = true;
      scene.add(shelf);

      gameRef.current.shelves.push({
        position: shelf.position.clone(),
        size: { width: 4, height: 4, depth: 2 }
      });

      createDressesOnShelf(scene, shelf.position, angle);
    }
  };

  const createDressesOnShelf = (scene: THREE.Scene, shelfPosition: THREE.Vector3, angle: number) => {
    const dressColors = [
      0xFF69B4, 0xFF1493, 0x9370DB, 0x8A2BE2, 0x00CED1, 0x20B2AA,
      0xFF4500, 0xFFD700, 0x32CD32, 0x87CEEB, 0xFF6347, 0xDA70D6
    ];

    for (let j = 0; j < 2; j++) {
      const dress = new THREE.Group();
      const dressColor = dressColors[Math.floor(Math.random() * dressColors.length)];

      const bodyGeometry = new THREE.ConeGeometry(0.3, 1.5, 8);
      const bodyMaterial = new THREE.MeshLambertMaterial({ color: dressColor });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 0.75;
      dress.add(body);

      const topGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.4, 8);
      const top = new THREE.Mesh(topGeometry, bodyMaterial);
      top.position.y = 1.7;
      dress.add(top);

      dress.position.copy(shelfPosition);
      dress.position.y += 1;
      dress.position.x += (j - 0.5) * 2.5;
      dress.rotation.y = angle + Math.PI;
      dress.castShadow = true;
      scene.add(dress);

      gameRef.current.dresses.push({
        mesh: dress,
        color: dressColor,
        position: dress.position.clone(),
        available: true,
        originalScale: dress.scale.clone()
      });
    }
  };

  const createKoala = (scene: THREE.Scene): THREE.Group => {
    const koalaGroup = new THREE.Group();
    const koalaMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });

    // Body
    const bodyGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const body = new THREE.Mesh(bodyGeometry, koalaMaterial);
    body.scale.set(1, 1.2, 0.8);
    body.castShadow = true;
    koalaGroup.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.6, 16, 16);
    const head = new THREE.Mesh(headGeometry, koalaMaterial);
    head.position.y = 1.2;
    head.castShadow = true;
    koalaGroup.add(head);

    // Ears
    const earGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const ear1 = new THREE.Mesh(earGeometry, koalaMaterial);
    ear1.position.set(-0.4, 1.5, 0.2);
    koalaGroup.add(ear1);

    const ear2 = new THREE.Mesh(earGeometry, koalaMaterial);
    ear2.position.set(0.4, 1.5, 0.2);
    koalaGroup.add(ear2);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eye1.position.set(-0.2, 1.3, 0.5);
    koalaGroup.add(eye1);

    const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eye2.position.set(0.2, 1.3, 0.5);
    koalaGroup.add(eye2);

    koalaGroup.position.set(0, 1, 0);
    scene.add(koalaGroup);
    return koalaGroup;
  };

  const createAccessories = (scene: THREE.Scene) => {
    const accessoryTypes = [
      { color: 0x8B4513, name: 'sunhat', category: 'hat' },
      { color: 0xFF69B4, name: 'dress', category: 'clothing' },
      { color: 0xFFD700, name: 'crown', category: 'hat' },
      { color: 0x3498DB, name: 'diamond', category: 'jewelry' }
    ];

    for (let i = 0; i < 20; i++) {
      const type = accessoryTypes[Math.floor(Math.random() * accessoryTypes.length)];
      const accessory = new THREE.Group();

      const geometry = new THREE.SphereGeometry(0.2, 8, 8);
      const material = new THREE.MeshLambertMaterial({ color: type.color });
      const mesh = new THREE.Mesh(geometry, material);
      accessory.add(mesh);

      accessory.position.set(
        (Math.random() - 0.5) * 28,
        2 + Math.random() * 3,
        (Math.random() - 0.5) * 28
      );

      (accessory as any).userData = {
        originalY: accessory.position.y,
        floatSpeed: 0.02 + Math.random() * 0.02,
        floatOffset: Math.random() * Math.PI * 2,
        points: type.category === 'jewelry' ? 25 : 10,
        type: type.name
      };

      gameRef.current.accessories.push(accessory);
      scene.add(accessory);
    }
  };

  const updateKoala = () => {
    const koala = gameRef.current.koala;
    if (!koala) return;

    const moveVector = new THREE.Vector3();
    const keys = gameRef.current.keys;

    if (keys.forward) moveVector.z -= moveSpeed;
    if (keys.backward) moveVector.z += moveSpeed;
    if (keys.left) moveVector.x -= moveSpeed;
    if (keys.right) moveVector.x += moveSpeed;

    koala.position.add(moveVector);

    // Boundary constraints
    koala.position.x = Math.max(gameArea.minX, Math.min(gameArea.maxX, koala.position.x));
    koala.position.z = Math.max(gameArea.minZ, Math.min(gameArea.maxZ, koala.position.z));

    // Jumping
    if (keys.jump && !gameRef.current.isJumping) {
      gameRef.current.koalaVelocity.y = jumpPower;
      gameRef.current.isJumping = true;
    }

    // Gravity
    gameRef.current.koalaVelocity.y += gravity;
    koala.position.y += gameRef.current.koalaVelocity.y;

    if (koala.position.y <= groundLevel + 1) {
      koala.position.y = groundLevel + 1;
      gameRef.current.koalaVelocity.y = 0;
      gameRef.current.isJumping = false;
    }

    if (moveVector.length() > 0) {
      koala.rotation.y = Math.atan2(moveVector.x, moveVector.z);
    }
  };

  const updateCamera = () => {
    const koala = gameRef.current.koala;
    const camera = gameRef.current.camera;
    if (!koala || !camera) return;

    const idealOffset = new THREE.Vector3(0, 5, 8);
    const idealLookAt = new THREE.Vector3(koala.position.x, koala.position.y + 1, koala.position.z);

    idealOffset.applyEuler(new THREE.Euler(0, koala.rotation.y, 0));
    const idealPosition = koala.position.clone().add(idealOffset);

    camera.position.lerp(idealPosition, 0.1);
    camera.lookAt(idealLookAt);
  };

  const updateAccessories = () => {
    const koala = gameRef.current.koala;
    if (!koala) return;

    gameRef.current.accessories.forEach((accessory, index) => {
      const time = gameRef.current.clock.getElapsedTime();
      const userData = (accessory as any).userData;
      
      accessory.position.y = userData.originalY + Math.sin(time * userData.floatSpeed + userData.floatOffset) * 0.5;
      accessory.rotation.y += 0.01;

      const distance = koala.position.distanceTo(accessory.position);
      if (distance < 1.5) {
        gameRef.current.scene?.remove(accessory);
        gameRef.current.accessories.splice(index, 1);
        
        setScore(prev => prev + userData.points);
        setAccessoryCount(prev => prev + 1);
      }
    });
  };

  const checkDressInteraction = () => {
    const koala = gameRef.current.koala;
    if (!koala) return;

    gameRef.current.dresses.forEach(dress => {
      if (!dress.available) return;

      const distance = koala.position.distanceTo(dress.position);
      if (distance < 3.0) {
        changeKoalaColor(dress.color);
        gameRef.current.scene?.remove(dress.mesh);
        dress.available = false;
        setScore(prev => prev + 50);
      }
    });
  };

  const changeKoalaColor = (color: number) => {
    const koala = gameRef.current.koala;
    if (!koala) return;

    koala.children.forEach((child, index) => {
      if ((child as THREE.Mesh).material) {
        if (index === 4 || index === 5) { // Keep eyes black
          ((child as THREE.Mesh).material as THREE.MeshLambertMaterial).color.setHex(0x000000);
        } else {
          ((child as THREE.Mesh).material as THREE.MeshLambertMaterial).color.setHex(color);
        }
      }
    });
  };

  const resetKoalaColor = () => {
    const koala = gameRef.current.koala;
    if (!koala) return;

    koala.children.forEach((child, index) => {
      if ((child as THREE.Mesh).material) {
        if (index === 4 || index === 5) { // Keep eyes black
          ((child as THREE.Mesh).material as THREE.MeshLambertMaterial).color.setHex(0x000000);
        } else {
          ((child as THREE.Mesh).material as THREE.MeshLambertMaterial).color.setHex(0x888888);
        }
      }
    });
  };

  const initializeMusic = () => {
    try {
      gameRef.current.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.log('Web Audio not supported');
    }
  };

  const toggleBackgroundMusic = () => {
    if (!gameRef.current.audioContext) return;

    if (gameRef.current.musicPlaying) {
      gameRef.current.meditationNodes.forEach(node => {
        if (node.oscillator) {
          try {
            node.oscillator.stop();
          } catch(e) {}
        }
      });
      gameRef.current.meditationNodes = [];
      gameRef.current.musicPlaying = false;
      setMusicEnabled(false);
    } else {
      if (gameRef.current.audioContext.state === 'suspended') {
        gameRef.current.audioContext.resume();
      }
      gameRef.current.musicPlaying = true;
      setMusicEnabled(true);
      playMeditationSequence();
    }
  };

  const playMeditationSequence = () => {
    if (!gameRef.current.musicPlaying || !gameRef.current.audioContext) return;

    const healingFreqs = [396, 417, 528, 639, 741, 852];
    const currentTime = gameRef.current.audioContext.currentTime;

    for (let i = 0; i < 3; i++) {
      const freq = healingFreqs[Math.floor(Math.random() * healingFreqs.length)];
      const startTime = currentTime + i * 3;
      const duration = 8 + Math.random() * 4;
      
      const oscillator = gameRef.current.audioContext.createOscillator();
      const gainNode = gameRef.current.audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, startTime);
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.06, startTime + 2);
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(gameRef.current.audioContext.destination);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
      
      gameRef.current.meditationNodes.push({ oscillator, gainNode });
    }

    setTimeout(() => {
      if (gameRef.current.musicPlaying) playMeditationSequence();
    }, 10000);
  };

  const resetGame = () => {
    setScore(0);
    setAccessoryCount(0);
    if (gameRef.current.koala) {
      gameRef.current.koala.position.set(0, 1, 0);
      resetKoalaColor();
    }
  };

  return (
    <div className={`min-h-screen pt-24 pb-12 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-pink-900 to-purple-900' 
        : 'bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50'
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
                3D Fashion Store 🐨
              </h1>
              <p className={`text-lg ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } font-['Comic_Neue']`}>
                Explore the 3D world and collect fashion items!
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className={`text-2xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Score: {score}
              </div>
              <div className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Items: {accessoryCount}
              </div>
            </div>

            <motion.button
              onClick={toggleBackgroundMusic}
              className={`p-3 rounded-full ${
                musicEnabled 
                  ? 'bg-green-500 text-white' 
                  : darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
              } shadow-lg hover:shadow-xl transition-all duration-200`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {musicEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </motion.button>

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

        {/* Game Container */}
        <motion.div
          className={`relative rounded-3xl overflow-hidden ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border-2 shadow-2xl`}
          style={{ height: '70vh' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
              <div className="text-center text-white">
                <motion.div
                  className="text-6xl mb-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  🐨
                </motion.div>
                <p className="text-xl font-['Baloo_2']">Loading 3D Fashion Store...</p>
              </div>
            </div>
          )}
          
          <div ref={mountRef} className="w-full h-full" />
        </motion.div>

        {/* Controls */}
        <motion.div
          className={`mt-8 p-6 rounded-2xl ${
            darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'
          } border backdrop-blur-sm`}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <h3 className={`text-xl font-bold mb-4 ${
            darkMode ? 'text-white' : 'text-gray-800'
          } font-['Baloo_2']`}>
            Controls & Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">🎮</div>
              <p className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } font-['Comic_Neue']`}>
                <strong>WASD/Arrow Keys:</strong> Move koala around the store
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🦘</div>
              <p className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } font-['Comic_Neue']`}>
                <strong>Spacebar:</strong> Jump to reach higher accessories
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">👗</div>
              <p className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } font-['Comic_Neue']`}>
                <strong>Walk near dresses:</strong> Change koala's color automatically
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🎵</div>
              <p className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } font-['Comic_Neue']`}>
                <strong>M Key:</strong> Toggle relaxing meditation music
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};