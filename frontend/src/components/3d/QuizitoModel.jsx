// src/components/3d/QuizitoModel.jsx
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const QuizitoModel = () => {
  const mountRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    
    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 5);
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x4f46e5, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0x8b5cf6, 1, 100);
    pointLight.position.set(-3, 3, 3);
    scene.add(pointLight);
    
    // Create Quiz Elements
    
    // 1. Question Cube
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x4f46e5,
      metalness: 0.7,
      roughness: 0.2,
      emissive: 0x4f46e5,
      emissiveIntensity: 0.2,
    });
    const questionCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    questionCube.position.set(0, 1.5, 0);
    scene.add(questionCube);
    
    // Add question mark on cube
    const questionMarkGeometry = new THREE.TorusGeometry(0.3, 0.05, 16, 100);
    const questionMarkMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const questionMark = new THREE.Mesh(questionMarkGeometry, questionMarkMaterial);
    questionMark.position.set(0, 0, 0.51);
    questionCube.add(questionMark);
    
    // 2. Answer Spheres
    const spherePositions = [
      { x: 2, y: 0.5, z: 2 },
      { x: -2, y: 0.5, z: 2 },
      { x: 2, y: 0.5, z: -2 },
      { x: -2, y: 0.5, z: -2 }
    ];
    
    const sphereColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b];
    const answerSpheres = [];
    
    spherePositions.forEach((pos, index) => {
      const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
      const sphereMaterial = new THREE.MeshPhysicalMaterial({
        color: sphereColors[index],
        metalness: 0.5,
        roughness: 0.3,
      });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(pos.x, pos.y, pos.z);
      scene.add(sphere);
      answerSpheres.push(sphere);
      
      // Add selection ring
      const ringGeometry = new THREE.TorusGeometry(0.575, 0.02, 16, 100);

      const ringMaterial = new THREE.MeshBasicMaterial({
        color: sphereColors[index],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.visible = false;
      sphere.add(ring);
      sphere.userData = { ring };
    });
    
    // 3. AI Brain
    const brainGeometry = new THREE.IcosahedronGeometry(0.7, 1);
    const brainMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x8b5cf6,
      metalness: 0.8,
      roughness: 0.1,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.3,
    });
    const aiBrain = new THREE.Mesh(brainGeometry, brainMaterial);
    aiBrain.position.set(-3, 1.5, 0);
    scene.add(aiBrain);
    
    // 4. Leaderboard Tower
    const towerGeometry = new THREE.CylinderGeometry(0.3, 0.4, 3, 8);
    const towerMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      metalness: 0.7,
      roughness: 0.2,
    });
    const leaderboardTower = new THREE.Mesh(towerGeometry, towerMaterial);
    leaderboardTower.position.set(3, 1.5, 0);
    scene.add(leaderboardTower);
    
    // 5. Particles
    const particleCount = 100;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10;
      positions[i + 1] = (Math.random() - 0.5) * 10;
      positions[i + 2] = (Math.random() - 0.5) * 10;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x4f46e5,
      transparent: true,
      opacity: 0.6,
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    
    // 6. Platform
    const platformGeometry = new THREE.CylinderGeometry(4, 4, 0.1, 32);
    const platformMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.2,
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = -0.05;
    scene.add(platform);
    
    // Animation
    let animationFrameId;
    let time = 0;
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      time += 0.01;
      
      // Rotate question cube
      questionCube.rotation.x += 0.005;
      questionCube.rotation.y += 0.005;
      
      // Float answer spheres
      answerSpheres.forEach((sphere, index) => {
        sphere.position.y = 0.5 + Math.sin(time + index) * 0.2;
        sphere.rotation.y += 0.01;
      });
      
      // Rotate AI brain
      aiBrain.rotation.x += 0.003;
      aiBrain.rotation.y += 0.005;
      aiBrain.position.y = 1.5 + Math.sin(time) * 0.1;
      
      // Rotate leaderboard
      leaderboardTower.rotation.y += 0.002;
      
      // Animate particles
      particleSystem.rotation.y += 0.001;
      
      renderer.render(scene, camera);
    };
    
    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Start animation
    animate();
    setIsLoading(false);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose geometries and materials
      [cubeGeometry, brainGeometry, towerGeometry, platformGeometry].forEach(geo => geo.dispose());
      [cubeMaterial, brainMaterial, towerMaterial, platformMaterial].forEach(mat => mat.dispose());
    };
  }, []);
  
  return (
    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden">
      <div 
        ref={mountRef} 
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-950">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary-500/30 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-primary-500 rounded-full animate-spin"></div>
            </div>
            <div>
              <p className="text-white font-medium">Loading 3D Quiz Experience</p>
              <p className="text-gray-400 text-sm mt-1">This may take a moment...</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm border border-white/20 rounded-xl p-4 max-w-xs">
        <h3 className="text-white font-bold mb-2 text-sm">QUIZITO 3D Elements</h3>
        <ul className="space-y-1.5">
          <li className="flex items-center text-gray-200 text-xs">
            <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
            <span>Question Cube - Rotating 3D questions</span>
          </li>
          <li className="flex items-center text-gray-200 text-xs">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            <span>Answer Spheres - Interactive choices</span>
          </li>
          <li className="flex items-center text-gray-200 text-xs">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            <span>AI Brain - Smart quiz generation</span>
          </li>
          <li className="flex items-center text-gray-200 text-xs">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            <span>Leaderboard - Real-time rankings</span>
          </li>
        </ul>
      </div>
      
      {/* Instructions */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm border border-white/20 rounded-xl p-3">
        <p className="text-white text-xs font-medium">🎮 Use mouse to rotate view</p>
      </div>
    </div>
  );
};

export default QuizitoModel;