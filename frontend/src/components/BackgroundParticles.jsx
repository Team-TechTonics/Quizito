// src/components/BackgroundParticles.jsx
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const BackgroundParticles = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationFrameRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = `hsl(${Math.random() * 60 + 200}, 70%, ${Math.random() * 30 + 60}%)`;
        this.alpha = Math.random() * 0.5 + 0.2;
        this.waveOffset = Math.random() * Math.PI * 2;
        this.waveAmplitude = Math.random() * 2;
        this.waveFrequency = Math.random() * 0.02 + 0.01;
      }

      update() {
        this.x += this.speedX + Math.sin(Date.now() * this.waveFrequency + this.waveOffset) * this.waveAmplitude;
        this.y += this.speedY + Math.cos(Date.now() * this.waveFrequency + this.waveOffset) * this.waveAmplitude;

        // Boundary check
        if (this.x > width) this.x = 0;
        else if (this.x < 0) this.x = width;
        if (this.y > height) this.y = 0;
        else if (this.y < 0) this.y = height;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fill();

        // Glow effect
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 3
        );
        gradient.addColorStop(0, this.color.replace('%)', ', 0.3)'));
        gradient.addColorStop(1, this.color.replace('%)', ', 0)'));
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      connect(particles) {
        particles.forEach(particle => {
          const dx = this.x - particle.x;
          const dy = this.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.strokeStyle = this.color.replace('%)', ', 0.1)');
            ctx.lineWidth = 0.5;
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(particle.x, particle.y);
            ctx.stroke();
          }
        });
      }
    }

    // Create particles
    const initParticles = () => {
      particlesRef.current = [];
      const particleCount = Math.min(Math.floor(width * height / 15000), 150);
      
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(new Particle());
      }
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, 'rgba(30, 41, 59, 0.02)');
      gradient.addColorStop(0.5, 'rgba(15, 23, 42, 0.01)');
      gradient.addColorStop(1, 'rgba(30, 41, 59, 0.02)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles
      particlesRef.current.forEach(particle => {
        particle.update();
        particle.draw();
        particle.connect(particlesRef.current);
      });

      // Draw floating elements
      drawFloatingElements();

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Draw additional floating elements (quiz-related shapes)
    const drawFloatingElements = () => {
      const time = Date.now() * 0.001;

      // Draw quiz-related shapes
      ['🔢', '❓', '✅', '⭐', '🎯'].forEach((emoji, index) => {
        const x = (width / 2) + Math.cos(time * 0.2 + index) * 400;
        const y = (height / 2) + Math.sin(time * 0.3 + index) * 200;
        const size = 30 + Math.sin(time + index) * 10;
        const rotation = time * 0.1 + index;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.globalAlpha = 0.05;
        ctx.font = `${size}px Arial`;
        ctx.fillText(emoji, -size/2, size/2);
        ctx.restore();
      });

      // Draw gradient orbs
      for (let i = 0; i < 3; i++) {
        const x = width * 0.2 + Math.cos(time * 0.1 + i * 2) * 100;
        const y = height * 0.3 + Math.sin(time * 0.15 + i * 2) * 100;
        const radius = 50 + Math.sin(time + i) * 10;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(59, 130, 246, ${0.02 + Math.sin(time + i) * 0.01})`);
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    };

    // Handle resize
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    // Initialize and start
    initParticles();
    animate();
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Animated Background Particles */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="fixed inset-0 -z-10 overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ pointerEvents: 'none' }}
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 via-transparent to-purple-50/10" />
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-gray-900/5" />
        
        {/* Animated Orbs */}
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              background: `radial-gradient(circle, rgba(59, 130, 246, ${0.03 / i}) 0%, rgba(59, 130, 246, 0) 70%)`,
              filter: 'blur(40px)'
            }}
            animate={{
              x: [0, Math.sin(i) * 100, 0],
              y: [0, Math.cos(i) * 100, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
        
        {/* Floating Elements */}
        <div className="absolute inset-0">
          {['🔢', '❓', '✅', '⭐', '🎯', '🏆', '📊', '🧠'].map((emoji, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl opacity-5"
              animate={{
                x: [0, Math.sin(i) * 200, 0],
                y: [0, Math.cos(i) * 150, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 20 + i * 3,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                left: `${20 + (i * 12)}%`,
                top: `${10 + (i * 8)}%`,
              }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(to right, #4f46e5 1px, transparent 1px),
              linear-gradient(to bottom, #4f46e5 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
        
        {/* Interactive Light */}
        <motion.div
          className="absolute w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0) 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none'
          }}
          animate={{
            x: ['0%', '100%', '0%'],
            y: ['0%', '100%', '0%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </motion.div>
      
      {/* Mouse Trailer Effect */}
      <MouseTrailer />
    </>
  );
};

// Additional component for mouse trailer effect
const MouseTrailer = () => {
  const trailerRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const trailer = trailerRef.current;
    if (!trailer) return;

    let mouseX = 0;
    let mouseY = 0;
    let trailX = 0;
    let trailY = 0;
    const speed = 0.1;

    const animate = () => {
      // Calculate trailer position with easing
      const dx = mouseX - trailX;
      const dy = mouseY - trailY;
      trailX += dx * speed;
      trailY += dy * speed;

      // Update trailer position
      trailer.style.left = `${trailX}px`;
      trailer.style.top = `${trailY}px`;

      // Create particles
      if (Math.sqrt(dx * dx + dy * dy) > 5) {
        createParticle(trailX, trailY);
      }

      // Update existing particles
      updateParticles();

      requestAnimationFrame(animate);
    };

    const createParticle = (x, y) => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: linear-gradient(45deg, #4f46e5, #7c3aed);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        left: ${x}px;
        top: ${y}px;
      `;

      document.body.appendChild(particle);
      particlesRef.current.push({
        element: particle,
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 1,
        decay: 0.02
      });

      // Remove after 50 particles
      if (particlesRef.current.length > 50) {
        const oldParticle = particlesRef.current.shift();
        if (oldParticle.element.parentNode) {
          oldParticle.element.parentNode.removeChild(oldParticle.element);
        }
      }
    };

    const updateParticles = () => {
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const particle = particlesRef.current[i];
        particle.life -= particle.decay;
        
        if (particle.life <= 0) {
          if (particle.element.parentNode) {
            particle.element.parentNode.removeChild(particle.element);
          }
          particlesRef.current.splice(i, 1);
        } else {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.element.style.opacity = particle.life;
          particle.element.style.transform = `translate(${particle.vx}px, ${particle.vy}px) scale(${particle.life})`;
          particle.element.style.left = `${particle.x}px`;
          particle.element.style.top = `${particle.y}px`;
        }
      }
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      // Cleanup particles
      particlesRef.current.forEach(particle => {
        if (particle.element.parentNode) {
          particle.element.parentNode.removeChild(particle.element);
        }
      });
      particlesRef.current = [];
    };
  }, []);

  return (
    <>
      <div
        ref={trailerRef}
        className="fixed w-8 h-8 rounded-full border-2 border-blue-400/30 pointer-events-none z-50"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0) 70%)',
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'screen',
          filter: 'blur(1px)'
        }}
      />
      
      {/* Interactive Hover Effects */}
      <style jsx>{`
        .particle {
          will-change: transform, opacity;
        }
        
        /* Interactive element hover effects */
        .interactive-hover {
          position: relative;
          overflow: hidden;
        }
        
        .interactive-hover::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
          transform: translate(-50%, -50%);
          transition: width 0.3s, height 0.3s;
        }
        
        .interactive-hover:hover::before {
          width: 200%;
          height: 200%;
        }
      `}</style>
    </>
  );
};

export default BackgroundParticles;
