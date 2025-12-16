// src/components/3d/QuizitoExperience.jsx
import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Zap, Users, Trophy, Settings, Maximize, Minimize } from 'lucide-react';
import QuizitoModel from './QuizitoModel';
import Button from '../common/Button';

const QuizitoExperience = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [viewMode, setViewMode] = useState('interactive'); // interactive, auto, showcase

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="relative w-full h-[600px] md:h-[800px] rounded-3xl overflow-hidden border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950">
      {/* 3D Model */}
      <div className="absolute inset-0">
        <QuizitoModel 
          interactive={viewMode === 'interactive'}
          mode={viewMode === 'auto' ? 'hero' : 'interactive'}
        />
      </div>
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent pointer-events-none" />
      
      {/* Controls Panel */}
      {showControls && (
        <div className="absolute top-4 left-4 right-4">
          <div className="flex items-center justify-between bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                <span className="text-white font-semibold">QUIZITO 3D</span>
              </div>
              
              <div className="hidden md:flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('interactive')}
                  className={`px-3 py-1 rounded-lg ${
                    viewMode === 'interactive' 
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Interactive
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('auto')}
                  className={`px-3 py-1 rounded-lg ${
                    viewMode === 'auto' 
                      ? 'bg-accent-500/20 text-accent-300 border border-accent-500/30' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Auto-Rotate
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('showcase')}
                  className={`px-3 py-1 rounded-lg ${
                    viewMode === 'showcase' 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Showcase
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPlaying(!isPlaying)}
                className="hover:bg-white/10"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.location.reload()}
                className="hover:bg-white/10"
              >
                <RotateCcw size={20} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFullscreen}
                className="hover:bg-white/10"
              >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Legend Panel */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <Zap size={16} />
            </div>
            <div>
              <p className="text-white font-medium">Question Cube</p>
              <p className="text-gray-400 text-sm">Current question display</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Users size={16} />
            </div>
            <div>
              <p className="text-white font-medium">Answer Spheres</p>
              <p className="text-gray-400 text-sm">Click to select answers</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Trophy size={16} />
            </div>
            <div>
              <p className="text-white font-medium">Leaderboard</p>
              <p className="text-gray-400 text-sm">Real-time rankings</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Info Panel */}
      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 max-w-xs">
        <h3 className="text-white font-bold mb-2">Quizito 3D Elements</h3>
        <p className="text-gray-400 text-sm mb-3">
          Interactive 3D quiz environment featuring:
        </p>
        <ul className="space-y-2">
          <li className="flex items-center text-gray-300 text-sm">
            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2" />
            AI Brain for quiz generation
          </li>
          <li className="flex items-center text-gray-300 text-sm">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
            Animated answer spheres
          </li>
          <li className="flex items-center text-gray-300 text-sm">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2" />
            Dynamic leaderboard tower
          </li>
          <li className="flex items-center text-gray-300 text-sm">
            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mr-2" />
            Floating quiz particles
          </li>
        </ul>
      </div>
      
      {/* Toggle Controls Button */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full p-2 hover:bg-white/10 transition-colors"
      >
        <Settings size={20} />
      </button>
    </div>
  );
};

export default QuizitoExperience;