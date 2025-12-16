// src/components/3d/QuantumQuizModel.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { gsap } from 'gsap';
import * as TWEEN from '@tweenjs/tween.js';
// import quizData from '../../data/QuizData'; // Unused import - commented out

// Custom shader for neural connections
const neuralShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec3 color1;
    uniform vec3 color2;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      float pulse = sin(time * 2.0 + vPosition.x * 2.0) * 0.5 + 0.5;
      vec3 color = mix(color1, color2, pulse);
      
      float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
      
      gl_FragColor = vec4(color * (0.8 + fresnel * 0.5), 1.0);
    }
  `
};

const QuantumQuizModel = () => {
  const mountRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [interactiveMode, setInteractiveMode] = useState(true);
  const [currentScore, setCurrentScore] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);

  // Three.js references
  const sceneRef = useRef();
  const cameraRef = useRef();
  const rendererRef = useRef();
  const composerRef = useRef();
  const controlsRef = useRef();
  const raycasterRef = useRef();
  const mouseRef = useRef({ x: 0, y: 0 });
  const clockRef = useRef(new THREE.Clock());

  // Interactive elements
  const quizElementsRef = useRef({
    questionCore: null,
    answerNodes: [],
    neuralNetwork: [],
    particles: [],
    leaderboardTower: null,
    dataStreams: []
  });

  // Initialize scene
  const initScene = useCallback(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.Fog(0x0a0a1a, 10, 50);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 3, 10);
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      precision: 'highp',
      stencil: false,
      depth: true
    });

    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    // Post-processing pipeline
    const composer = new EffectComposer(renderer);
    composerRef.current = composer;

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Unreal Bloom Pass
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    composer.addPass(bloomPass);

    // Film grain
    const filmPass = new FilmPass(0.35, 0.025, 2048, false);
    composer.addPass(filmPass);

    // FXAA
    const fxaaPass = new ShaderPass(FXAAShader);
    const pixelRatio = renderer.getPixelRatio();
    fxaaPass.material.uniforms['resolution'].value.x = 1 / (mountRef.current.clientWidth * pixelRatio);
    fxaaPass.material.uniforms['resolution'].value.y = 1 / (mountRef.current.clientHeight * pixelRatio);
    composer.addPass(fxaaPass);

    // RGB Shift
    const rgbShiftPass = new ShaderPass(RGBShiftShader);
    rgbShiftPass.uniforms['amount'].value = 0.0025;
    composer.addPass(rgbShiftPass);

    // Output pass
    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
    scene.add(ambientLight);

    // Main directional light with shadows
    const directionalLight = new THREE.DirectionalLight(0x4f46e5, 2);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    directionalLight.shadow.bias = -0.0001;
    scene.add(directionalLight);

    // Hemisphere light
    const hemisphereLight = new THREE.HemisphereLight(0x8b5cf6, 0x10b981, 0.3);
    scene.add(hemisphereLight);

    // Multiple point lights for dynamic effects
    const pointLights = [
      { color: 0xff6b6b, position: [3, 3, 3], intensity: 2 },
      { color: 0x4ecdc4, position: [-3, 2, 4], intensity: 1.5 },
      { color: 0xffd166, position: [2, 4, -2], intensity: 1.5 },
      { color: 0x06d6a0, position: [-2, 3, -3], intensity: 1.5 },
    ];

    pointLights.forEach((light) => {
      const pointLight = new THREE.PointLight(light.color, light.intensity, 15);
      pointLight.position.set(...light.position);
      pointLight.decay = 2;
      scene.add(pointLight);

      // Animate point light intensity
      gsap.to(pointLight, {
        intensity: light.intensity * 1.3,
        duration: 2 + Math.random(),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: Math.random() * 2
      });
    });

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.maxPolarAngle = Math.PI / 1.8;
    controls.minPolarAngle = Math.PI / 6;
    controls.maxDistance = 20;
    controls.minDistance = 3;
    controlsRef.current = controls;

    // Raycaster for interaction
    raycasterRef.current = new THREE.Raycaster();

    return { scene, camera, renderer, composer, controls };
  }, []);

  // Create Quantum Question Core
  const createQuantumQuestionCore = useCallback((scene) => {
    const coreGroup = new THREE.Group();

    // Main quantum sphere
    const sphereGeometry = new THREE.IcosahedronGeometry(1.2, 4);
    const sphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(0x4f46e5) },
        color2: { value: new THREE.Color(0x8b5cf6) }
      },
      vertexShader: neuralShader.vertexShader,
      fragmentShader: neuralShader.fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });

    const quantumSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    quantumSphere.castShadow = true;
    quantumSphere.receiveShadow = true;
    coreGroup.add(quantumSphere);

    // Inner particle system
    const innerParticles = new THREE.BufferGeometry();
    const innerCount = 500;
    const innerPositions = new Float32Array(innerCount * 3);
    const innerColors = new Float32Array(innerCount * 3);

    for (let i = 0; i < innerCount * 3; i += 3) {
      const radius = 0.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      innerPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      innerPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      innerPositions[i + 2] = radius * Math.cos(phi);

      const color = new THREE.Color(Math.random() > 0.5 ? 0x4f46e5 : 0x8b5cf6);
      innerColors[i] = color.r;
      innerColors[i + 1] = color.g;
      innerColors[i + 2] = color.b;
    }

    innerParticles.setAttribute('position', new THREE.BufferAttribute(innerPositions, 3));
    innerParticles.setAttribute('color', new THREE.BufferAttribute(innerColors, 3));

    const innerParticleMaterial = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const innerParticleSystem = new THREE.Points(innerParticles, innerParticleMaterial);
    coreGroup.add(innerParticleSystem);

    // Floating question symbols
    const symbols = ['?', 'Q', '!', 'i'];
    symbols.forEach((symbol, index) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 256;

      context.fillStyle = '#4f46e5';
      context.font = 'bold 200px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(symbol, 128, 128);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.7
      });

      const sprite = new THREE.Sprite(spriteMaterial);
      const angle = (index / symbols.length) * Math.PI * 2;
      const radius = 2;
      sprite.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle * 2) * 0.5,
        Math.sin(angle) * radius
      );
      sprite.scale.set(0.8, 0.8, 1);

      coreGroup.add(sprite);
    });

    coreGroup.position.set(0, 2, 0);
    quizElementsRef.current.questionCore = { mesh: coreGroup, particles: innerParticleSystem, material: sphereMaterial };
    scene.add(coreGroup);

    return coreGroup;
  }, []);

  // Create Quantum Answer Nodes
  const createAnswerNodes = useCallback((scene) => {
    const nodesGroup = new THREE.Group();
    const answerNodes = [];

    const positions = [
      { x: 3, y: 1, z: 3 },
      { x: -3, y: 1, z: 3 },
      { x: 3, y: 1, z: -3 },
      { x: -3, y: 1, z: -3 }
    ];

    const colors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b];
    const letters = ['A', 'B', 'C', 'D'];

    positions.forEach((pos, index) => {
      const nodeGroup = new THREE.Group();

      // Main node
      const geometry = new THREE.IcosahedronGeometry(0.6, 2);
      const material = new THREE.MeshPhysicalMaterial({
        color: colors[index],
        metalness: 0.8,
        roughness: 0.1,
        emissive: colors[index],
        emissiveIntensity: 0.3,
        clearcoat: 1,
        clearcoatRoughness: 0
      });

      const node = new THREE.Mesh(geometry, material);
      node.castShadow = true;
      node.userData = {
        index,
        selected: false,
        correct: Math.random() > 0.5,
        letter: letters[index]
      };
      nodeGroup.add(node);

      // Halo effect
      const haloGeometry = new THREE.RingGeometry(0.65, 0.75, 32);
      const haloMaterial = new THREE.MeshBasicMaterial({
        color: colors[index],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
      });

      const halo = new THREE.Mesh(haloGeometry, haloMaterial);
      halo.rotation.x = Math.PI / 2;
      halo.visible = false;
      node.userData.halo = halo;
      nodeGroup.add(halo);

      // Answer letter
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 128;
      canvas.height = 128;

      context.fillStyle = '#ffffff';
      context.font = 'bold 80px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(letters[index], 64, 64);

      const texture = new THREE.CanvasTexture(canvas);
      const labelMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
      });

      const label = new THREE.Sprite(labelMaterial);
      label.position.set(0, 0.9, 0);
      label.scale.set(0.5, 0.5, 1);
      nodeGroup.add(label);

      nodeGroup.position.set(pos.x, pos.y, pos.z);
      nodesGroup.add(nodeGroup);
      answerNodes.push(nodeGroup);
    });

    quizElementsRef.current.answerNodes = answerNodes;
    scene.add(nodesGroup);

    return nodesGroup;
  }, []);

  // Create Neural Network Connections
  const createNeuralNetwork = useCallback((scene) => {
    const neuralGroup = new THREE.Group();
    const neuralConnections = [];

    // Create neural nodes
    const nodeCount = 30;
    const nodes = [];

    for (let i = 0; i < nodeCount; i++) {
      const geometry = new THREE.SphereGeometry(0.08, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        transparent: true,
        opacity: 0.6
      });

      const node = new THREE.Mesh(geometry, material);
      const radius = 4 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      node.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        (Math.random() - 0.5) * 3,
        radius * Math.sin(phi) * Math.sin(theta)
      );

      neuralGroup.add(node);
      nodes.push(node);
    }

    // Create connections between nearby nodes
    nodes.forEach((node1, i) => {
      nodes.slice(i + 1).forEach((node2, j) => {
        const distance = node1.position.distanceTo(node2.position);
        if (distance < 2) {
          const curve = new THREE.CatmullRomCurve3([
            node1.position,
            new THREE.Vector3(
              (node1.position.x + node2.position.x) / 2 + (Math.random() - 0.5),
              (node1.position.y + node2.position.y) / 2 + (Math.random() - 0.5),
              (node1.position.z + node2.position.z) / 2 + (Math.random() - 0.5)
            ),
            node2.position
          ]);

          const points = curve.getPoints(50);
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({
            color: 0x4f46e5,
            transparent: true,
            opacity: 0.2,
            linewidth: 1
          });

          const line = new THREE.Line(geometry, material);
          neuralGroup.add(line);
          neuralConnections.push({ line, node1, node2 });
        }
      });
    });

    quizElementsRef.current.neuralNetwork = neuralConnections;
    scene.add(neuralGroup);

    return neuralGroup;
  }, []);

  // Create Quantum Particle System
  const createParticleSystem = useCallback((scene) => {
    const particleGroup = new THREE.Group();

    // Main particle system
    const particleCount = 2000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);

    const colorPalette = [
      new THREE.Color(0x4f46e5),
      new THREE.Color(0x8b5cf6),
      new THREE.Color(0x10b981),
      new THREE.Color(0xf59e0b),
      new THREE.Color(0xef4444),
      new THREE.Color(0x3b82f6)
    ];

    for (let i = 0; i < particleCount * 3; i += 3) {
      // Spherical distribution
      const radius = 8 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = radius * Math.cos(phi);

      velocities[i] = (Math.random() - 0.5) * 0.01;
      velocities[i + 1] = (Math.random() - 0.5) * 0.01;
      velocities[i + 2] = (Math.random() - 0.5) * 0.01;

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;

      sizes[i / 3] = Math.random() * 0.05 + 0.02;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    particles.userData.velocities = velocities;

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    particleGroup.add(particleSystem);
    quizElementsRef.current.particles.push(particleSystem);

    // Data streams
    const streamCount = 8;
    for (let i = 0; i < streamCount; i++) {
      const streamGeometry = new THREE.BufferGeometry();
      const streamPoints = 100;
      const streamPositions = new Float32Array(streamPoints * 3);
      const streamColors = new Float32Array(streamPoints * 3);

      const startAngle = (i / streamCount) * Math.PI * 2;
      const radius = 5;

      for (let j = 0; j < streamPoints; j++) {
        const t = j / streamPoints;
        const angle = startAngle + t * Math.PI * 4;
        const height = t * 10 - 5;

        streamPositions[j * 3] = Math.cos(angle) * radius;
        streamPositions[j * 3 + 1] = height;
        streamPositions[j * 3 + 2] = Math.sin(angle) * radius;

        const color = new THREE.Color(0x4f46e5).lerp(new THREE.Color(0x8b5cf6), t);
        streamColors[j * 3] = color.r;
        streamColors[j * 3 + 1] = color.g;
        streamColors[j * 3 + 2] = color.b;
      }

      streamGeometry.setAttribute('position', new THREE.BufferAttribute(streamPositions, 3));
      streamGeometry.setAttribute('color', new THREE.BufferAttribute(streamColors, 3));

      const streamMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.3,
        linewidth: 2
      });

      const stream = new THREE.Line(streamGeometry, streamMaterial);
      stream.userData.offset = Math.random() * Math.PI * 2;
      particleGroup.add(stream);
      quizElementsRef.current.dataStreams.push(stream);
    }

    scene.add(particleGroup);
    return particleGroup;
  }, []);

  // Create Leaderboard Tower
  const createLeaderboardTower = useCallback((scene) => {
    const towerGroup = new THREE.Group();

    // Main tower structure
    const towerGeometry = new THREE.CylinderGeometry(0.4, 0.6, 6, 12);
    const towerMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.2
    });

    const tower = new THREE.Mesh(towerGeometry, towerMaterial);
    tower.castShadow = true;
    towerGroup.add(tower);

    // Floating platforms for rankings
    const rankings = ['1ST', '2ND', '3RD', '4TH', '5TH'];
    rankings.forEach((rank, i) => {
      const platformGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.05, 8);
      const platformMaterial = new THREE.MeshBasicMaterial({
        color: i === 0 ? 0xffd700 : 0xffffff,
        transparent: true,
        opacity: 0.7
      });

      const platform = new THREE.Mesh(platformGeometry, platformMaterial);
      platform.position.y = 2 - i * 1;
      platform.position.x = 1.5;
      platform.rotation.x = Math.PI / 2;
      towerGroup.add(platform);

      // Rank text
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 64;

      context.fillStyle = i === 0 ? '#ffd700' : '#ffffff';
      context.font = `bold ${i === 0 ? '48' : '32'}px Arial`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(rank, 128, 32);

      const texture = new THREE.CanvasTexture(canvas);
      const textMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
      });

      const textSprite = new THREE.Sprite(textMaterial);
      textSprite.position.set(1.5, 2 - i * 1, 0.9);
      textSprite.scale.set(1.2, 0.3, 1);
      towerGroup.add(textSprite);
    });

    // Crown at top
    const crownGroup = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const spikeGeometry = new THREE.ConeGeometry(0.15, 0.3, 4);
      const spikeMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 });
      const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
      spike.position.y = 0.2;
      spike.position.x = Math.cos((i / 5) * Math.PI * 2) * 0.4;
      spike.position.z = Math.sin((i / 5) * Math.PI * 2) * 0.4;
      spike.rotation.y = (i / 5) * Math.PI * 2;
      crownGroup.add(spike);
    }

    crownGroup.position.y = 3.2;
    towerGroup.add(crownGroup);

    towerGroup.position.set(5, 3, 0);
    quizElementsRef.current.leaderboardTower = towerGroup;
    scene.add(towerGroup);

    return towerGroup;
  }, []);

  // Create interactive floor
  const createInteractiveFloor = useCallback((scene) => {
    const floorGroup = new THREE.Group();

    // Main platform
    const platformGeometry = new THREE.CylinderGeometry(8, 8, 0.2, 64);
    const platformMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.2,
      side: THREE.DoubleSide
    });

    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.receiveShadow = true;
    floorGroup.add(platform);

    // Circuit pattern
    const circuitGeometry = new THREE.RingGeometry(7.5, 8, 64);
    const circuitMaterial = new THREE.MeshBasicMaterial({
      color: 0x4f46e5,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.1
    });

    const circuit = new THREE.Mesh(circuitGeometry, circuitMaterial);
    circuit.rotation.x = Math.PI / 2;
    circuit.position.y = 0.11;
    floorGroup.add(circuit);

    // Animated grid lines
    const gridSize = 16;
    const gridDivisions = 32;
    const gridGeometry = new THREE.PlaneGeometry(gridSize, gridSize, gridDivisions, gridDivisions);

    const gridMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0x4f46e5) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        varying vec2 vUv;
        
        void main() {
          float pulse = sin(time + vUv.x * 10.0) * 0.5 + 0.5;
          float grid = step(0.98, fract(vUv.x * 16.0)) + step(0.98, fract(vUv.y * 16.0));
          float alpha = grid * pulse * 0.1;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });

    const grid = new THREE.Mesh(gridGeometry, gridMaterial);
    grid.rotation.x = -Math.PI / 2;
    grid.position.y = 0.12;
    floorGroup.add(grid);

    scene.add(floorGroup);
    return floorGroup;
  }, []);

  // Handle mouse interaction
  const handleMouseMove = useCallback((event) => {
    if (!mountRef.current || !cameraRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast for hover effects
    if (raycasterRef.current && cameraRef.current && interactiveMode) {
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

      // Check answer nodes
      quizElementsRef.current.answerNodes.forEach((nodeGroup) => {
        const node = nodeGroup.children[0];
        const halo = node.userData.halo;
        const intersects = raycasterRef.current.intersectObject(node);

        if (halo) {
          if (intersects.length > 0 && !node.userData.selected) {
            halo.visible = true;
            gsap.to(halo.scale, {
              x: 1.2,
              y: 1.2,
              duration: 0.3,
              ease: "back.out(1.7)"
            });
          } else if (!node.userData.selected) {
            halo.visible = false;
            halo.scale.set(1, 1, 1);
          }
        }
      });
    }
  }, [interactiveMode]);

  const handleClick = useCallback((event) => {
    if (!interactiveMode || !raycasterRef.current || !cameraRef.current) return;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

    // Check for answer node clicks
    quizElementsRef.current.answerNodes.forEach((nodeGroup, index) => {
      const node = nodeGroup.children[0];
      const intersects = raycasterRef.current.intersectObject(node);

      if (intersects.length > 0 && !node.userData.selected) {
        node.userData.selected = true;

        // Visual feedback
        if (node.userData.halo) {
          node.userData.halo.visible = true;
          node.userData.halo.material.opacity = 0.6;
        }

        // Particle burst
        createParticleBurst(nodeGroup.position, node.userData.correct ? 0x10b981 : 0xef4444);

        // Score update
        if (node.userData.correct) {
          setCurrentScore(prev => prev + 100);

          // Animate question core
          if (quizElementsRef.current.questionCore) {
            gsap.to(quizElementsRef.current.questionCore.mesh.rotation, {
              y: quizElementsRef.current.questionCore.mesh.rotation.y + Math.PI,
              duration: 1,
              ease: "power2.inOut"
            });
          }
        }

        // Next question after delay
        setTimeout(() => {
          setQuestionIndex(prev => (prev + 1) % 5);
          resetAnswerNodes();
        }, 1500);
      }
    });
  }, [interactiveMode]);

  const createParticleBurst = useCallback((position, color) => {
    if (!sceneRef.current) return;

    const burstGeometry = new THREE.BufferGeometry();
    const burstCount = 50;
    const burstPositions = new Float32Array(burstCount * 3);
    const burstColors = new Float32Array(burstCount * 3);
    const burstSizes = new Float32Array(burstCount);
    const burstVelocities = new Float32Array(burstCount * 3);

    const burstColor = new THREE.Color(color);

    for (let i = 0; i < burstCount * 3; i += 3) {
      const radius = 0.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      burstPositions[i] = position.x + radius * Math.sin(phi) * Math.cos(theta);
      burstPositions[i + 1] = position.y + radius * Math.sin(phi) * Math.sin(theta);
      burstPositions[i + 2] = position.z + radius * Math.cos(phi);

      burstVelocities[i] = (Math.random() - 0.5) * 0.1;
      burstVelocities[i + 1] = (Math.random() - 0.5) * 0.1;
      burstVelocities[i + 2] = (Math.random() - 0.5) * 0.1;

      burstColors[i] = burstColor.r;
      burstColors[i + 1] = burstColor.g;
      burstColors[i + 2] = burstColor.b;

      burstSizes[i / 3] = Math.random() * 0.1 + 0.05;
    }

    burstGeometry.setAttribute('position', new THREE.BufferAttribute(burstPositions, 3));
    burstGeometry.setAttribute('color', new THREE.BufferAttribute(burstColors, 3));
    burstGeometry.setAttribute('size', new THREE.BufferAttribute(burstSizes, 1));
    burstGeometry.userData = { velocities: burstVelocities, life: 0 };

    const burstMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const burstSystem = new THREE.Points(burstGeometry, burstMaterial);
    sceneRef.current.add(burstSystem);

    // Animate and remove
    const animateBurst = () => {
      burstGeometry.userData.life += 0.02;
      const positions = burstGeometry.attributes.position.array;
      const velocities = burstGeometry.userData.velocities;

      for (let i = 0; i < burstCount * 3; i += 3) {
        positions[i] += velocities[i];
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];

        // Gravity
        velocities[i + 1] -= 0.001;

        // Fade out
        burstMaterial.opacity = 1 - burstGeometry.userData.life;
      }

      burstGeometry.attributes.position.needsUpdate = true;

      if (burstGeometry.userData.life < 1) {
        requestAnimationFrame(animateBurst);
      } else {
        sceneRef.current.remove(burstSystem);
        burstGeometry.dispose();
        burstMaterial.dispose();
      }
    };

    animateBurst();
  }, []);

  const resetAnswerNodes = useCallback(() => {
    quizElementsRef.current.answerNodes.forEach((nodeGroup) => {
      const node = nodeGroup.children[0];
      node.userData.selected = false;

      if (node.userData.halo) {
        node.userData.halo.visible = false;
        node.userData.halo.material.opacity = 0.3;
      }
    });
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    if (!sceneRef.current || !cameraRef.current || !composerRef.current) return;

    const time = clockRef.current.getElapsedTime();

    // Update question core
    if (quizElementsRef.current.questionCore) {
      const { mesh, particles, material } = quizElementsRef.current.questionCore;

      mesh.rotation.y = time * 0.2;
      mesh.rotation.x = Math.sin(time * 0.1) * 0.1;

      if (material.uniforms.time) {
        material.uniforms.time.value = time;
      }

      // Animate inner particles
      if (particles) {
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          const radius = 0.8;
          const angle = time * 0.5 + i * 0.01;
          positions[i + 1] = Math.sin(angle) * 0.1;
        }
        particles.geometry.attributes.position.needsUpdate = true;
      }
    }

    // Update answer nodes
    quizElementsRef.current.answerNodes.forEach((nodeGroup, index) => {
      const timeOffset = index * 0.5;
      nodeGroup.position.y = 1 + Math.sin(time + timeOffset) * 0.2;
      nodeGroup.rotation.y = time * 0.3;
    });

    // Update neural network
    quizElementsRef.current.neuralNetwork.forEach((connection) => {
      connection.line.material.opacity = 0.2 + Math.sin(time * 2) * 0.1;
    });

    // Update particles
    quizElementsRef.current.particles.forEach((particleSystem) => {
      const positions = particleSystem.geometry.attributes.position.array;
      const velocities = particleSystem.geometry.userData.velocities;

      for (let i = 0; i < positions.length; i += 3) {
        // Add some organic movement
        positions[i] += Math.sin(time + i * 0.01) * 0.001;
        positions[i + 1] += Math.cos(time + i * 0.01) * 0.001;
        positions[i + 2] += Math.sin(time * 0.5 + i * 0.01) * 0.001;

        // Boundary check
        const distance = Math.sqrt(
          positions[i] * positions[i] +
          positions[i + 1] * positions[i + 1] +
          positions[i + 2] * positions[i + 2]
        );

        if (distance > 12) {
          positions[i] *= 0.99;
          positions[i + 1] *= 0.99;
          positions[i + 2] *= 0.99;
        }
      }

      particleSystem.geometry.attributes.position.needsUpdate = true;
      particleSystem.rotation.y += 0.001;
    });

    // Update data streams
    quizElementsRef.current.dataStreams.forEach((stream, index) => {
      const positions = stream.geometry.attributes.position.array;
      const offset = stream.userData.offset;

      for (let i = 0; i < positions.length / 3; i++) {
        const t = i / (positions.length / 3);
        const angle = offset + t * Math.PI * 4 + time * 2;
        const radius = 5 + Math.sin(time + i * 0.1) * 0.5;

        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
      }

      stream.geometry.attributes.position.needsUpdate = true;
    });

    // Update leaderboard tower
    if (quizElementsRef.current.leaderboardTower) {
      quizElementsRef.current.leaderboardTower.rotation.y = time * 0.05;
      quizElementsRef.current.leaderboardTower.position.y = 3 + Math.sin(time * 0.3) * 0.1;
    }

    // Update controls
    if (controlsRef.current) {
      controlsRef.current.update();
    }

    // Render with post-processing
    composerRef.current.render();

    // Update Tween.js
    TWEEN.update();

    // Continue animation loop
    requestAnimationFrame(animate);
  }, []);

  // Initialize everything
  useEffect(() => {
    if (!mountRef.current) return;

    const init = async () => {
      try {
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        canvasRef.current = canvas;
        mountRef.current.appendChild(canvas);

        // Initialize Three.js
        const { scene } = initScene();
        setProgress(20);

        // Create all elements
        createInteractiveFloor(scene);
        setProgress(40);

        createQuantumQuestionCore(scene);
        setProgress(60);

        createAnswerNodes(scene);
        setProgress(70);

        createNeuralNetwork(scene);
        setProgress(80);

        createParticleSystem(scene);
        setProgress(90);

        createLeaderboardTower(scene);
        setProgress(100);

        // Start animation
        setTimeout(() => {
          setLoading(false);
          animate();
        }, 1000);

        // Event listeners
        mountRef.current.addEventListener('mousemove', handleMouseMove);
        mountRef.current.addEventListener('click', handleClick);

      } catch (error) {
        console.error('Error initializing 3D scene:', error);
        setLoading(false);
      }
    };

    init();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;

      cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      composerRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);

      // Update FXAA resolution
      if (composerRef.current.passes[2]?.uniforms?.resolution) {
        const pixelRatio = rendererRef.current.getPixelRatio();
        composerRef.current.passes[2].uniforms.resolution.value.x =
          1 / (mountRef.current.clientWidth * pixelRatio);
        composerRef.current.passes[2].uniforms.resolution.value.y =
          1 / (mountRef.current.clientHeight * pixelRatio);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeEventListener('mousemove', handleMouseMove);
        mountRef.current.removeEventListener('click', handleClick);
        if (canvasRef.current) {
          mountRef.current.removeChild(canvasRef.current);
        }
      }

      // Dispose Three.js resources
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }

      if (composerRef.current) {
        composerRef.current.dispose();
      }
    };
  }, [animate, handleClick, handleMouseMove]);

  return (
    <div className="relative w-full h-full min-h-[600px]">
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden"
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 to-gray-900 flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin"></div>
              <div className="absolute inset-8 border-4 border-transparent border-b-purple-500 rounded-full animate-spin reverse"></div>
              <div className="absolute inset-16 border-4 border-transparent border-r-pink-500 rounded-full animate-spin"></div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Initializing Quantum Quiz Engine
              </h3>
              <p className="text-gray-400 mb-4">
                Loading neural networks and particle systems...
              </p>
              <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mx-auto">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-gray-400 text-sm mt-2">{progress}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Controls overlay */}
      {!loading && (
        <>
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
                <span className="text-white font-medium">QUANTUM MODE ACTIVE</span>
              </div>
              <button
                onClick={() => setInteractiveMode(!interactiveMode)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${interactiveMode
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-800 text-gray-300'
                  }`}
              >
                {interactiveMode ? 'INTERACTIVE' : 'SPECTATOR'}
              </button>
            </div>
          </div>

          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">{currentScore}</div>
              <div className="text-gray-400 text-sm">QUANTUM SCORE</div>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 max-w-sm">
            <h4 className="text-white font-bold mb-3">QUANTUM CONTROLS</h4>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-300 text-sm">
                <div className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></div>
                <span>Drag to rotate • Scroll to zoom</span>
              </li>
              <li className="flex items-center text-gray-300 text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                <span>Click colored spheres to answer</span>
              </li>
              <li className="flex items-center text-gray-300 text-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                <span>Watch neural connections form</span>
              </li>
            </ul>
          </div>

          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <div className="text-center">
              <div className="text-white font-medium mb-1">QUESTION</div>
              <div className="text-2xl font-bold text-cyan-300">
                {questionIndex + 1}/5
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QuantumQuizModel;