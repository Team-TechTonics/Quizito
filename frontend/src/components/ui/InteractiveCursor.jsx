// src/components/ui/InteractiveCursor.jsx
import React, { useEffect, useState } from 'react';

const InteractiveCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [clicked, setClicked] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setHidden(false);
    };

    const handleMouseDown = () => setClicked(true);
    const handleMouseUp = () => setClicked(false);
    const handleMouseLeave = () => setHidden(true);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  if (hidden) return null;

  return (
    <>
      <div
        className="fixed z-50 pointer-events-none"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div
          className={`w-8 h-8 rounded-full border-2 border-primary-500 transition-all duration-200 ${
            clicked ? 'scale-75 bg-primary-500/30' : 'scale-100'
          }`}
        />
        <div
          className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500 transition-all duration-200"
          style={{
            transform: `translate(-50%, -50%) scale(${clicked ? 0.5 : 1})`,
          }}
        />
      </div>
      {/* Outer glow trail */}
      <div
        className="fixed z-40 pointer-events-none"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500/10 to-accent-500/10 animate-ping" />
      </div>
    </>
  );
};

export default InteractiveCursor;