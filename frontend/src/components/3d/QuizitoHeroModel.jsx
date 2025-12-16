// src/components/3d/QuizitoHeroModel.jsx
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader';

const QuizitoHeroModel = () => {
  const mountRef = useRef(null);
  const requestRef = useRef();
  const mixerRef = useRef();

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1, 5);

    // Renderer with transparency
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    mountRef.current.appendChild(renderer.domElement);

    // Post-processing effects
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Bloom effect
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, // strength
      0.4, // radius
      0.85 // threshold
    );
    composer.addPass(bloomPass);

    // RGB shift effect
    const rgbShiftPass = new ShaderPass(RGBShiftShader);
    rgbShiftPass.uniforms['amount'].value = 0.0015;
    composer.addPass(rgbShiftPass);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x4f46e5, 2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x10b981, 2, 10);
    pointLight1.position.set(2, 2, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8b5cf6, 2, 10);
    pointLight2.position.set(-2, -2, 2);
    scene.add(pointLight2);

    // Floating particles
    const particleCount = 500;
    const particles = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    const colorArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 20;
      posArray[i + 1] = (Math.random() - 0.5) * 20;
      posArray[i + 2] = (Math.random() - 0.5) * 20;
      
      const color = new THREE.Color(
        Math.random() * 0x4f46e5 + 0x8b5cf6
      );
      colorArray[i] = color.r;
      colorArray[i + 1] = color.g;
      colorArray[i + 2] = color.b;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // Create abstract geometric quiz elements
    const createGeometricElements = () => {
      const group = new THREE.Group();

      // Quiz cube
      const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
      const cubeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x4f46e5,
        metalness: 0.8,
        roughness: 0.2,
        transmission: 0.4,
        thickness: 0.5,
      });
      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
      cube.position.set(-1.5, 0, 0);
      group.add(cube);

      // Question mark sphere
      const sphereGeometry = new THREE.IcosahedronGeometry(0.8, 2);
      const sphereMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x10b981,
        metalness: 0.7,
        roughness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0,
      });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(1.5, 0, 0);
      group.add(sphere);

      // Trophy torus
      const torusGeometry = new THREE.TorusGeometry(1, 0.3, 16, 100);
      const torusMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xf59e0b,
        metalness: 0.9,
        roughness: 0.1,
      });
      const torus = new THREE.Mesh(torusGeometry, torusMaterial);
      torus.position.set(0, 0, -1);
      torus.rotation.x = Math.PI / 2;
      group.add(torus);

      return group;
    };

    const quizElements = createGeometricElements();
    scene.add(quizElements);

    // Orbit controls for interactivity
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1;

    // Animation
    const clock = new THREE.Clock();
    
    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      
      const elapsedTime = clock.getElapsedTime();
      
      // Rotate quiz elements
      quizElements.rotation.y = elapsedTime * 0.2;
      quizElements.rotation.x = Math.sin(elapsedTime * 0.1) * 0.1;
      
      // Animate particles
      const positions = particles.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += Math.sin(elapsedTime + i) * 0.005;
      }
      particles.attributes.position.needsUpdate = true;
      
      controls.update();
      composer.render();
    };

    // Handle resize
    const handleResize = () => {
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight
      );
      composer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight
      );
    };

    window.addEventListener('resize', handleResize);
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef.current);
      mountRef.current.removeChild(renderer.domElement);
      
      renderer.dispose();
      particles.dispose();
      composer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default QuizitoHeroModel;