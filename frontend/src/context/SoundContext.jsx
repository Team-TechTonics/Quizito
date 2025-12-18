import React, { createContext, useState, useContext, useEffect } from 'react';

const SoundContext = createContext();

export const useSoundSettings = () => useContext(SoundContext);

export const SoundProvider = ({ children }) => {
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [volume, setVolume] = useState(0.5);

    useEffect(() => {
        const saved = localStorage.getItem('quizito_sound');
        if (saved !== null) {
            setSoundEnabled(JSON.parse(saved));
        }
    }, []);

    const toggleSound = () => {
        setSoundEnabled(prev => {
            const newVal = !prev;
            localStorage.setItem('quizito_sound', JSON.stringify(newVal));
            return newVal;
        });
    };

    // Web Audio API Context
    const [audioCtx, setAudioCtx] = useState(null);

    useEffect(() => {
        // Initialize Audio Context on user interaction (or mount, but safe)
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            setAudioCtx(new AudioContext());
        }
    }, []);

    const playTone = (freq, type, duration) => {
        if (!audioCtx || !soundEnabled) return;
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(volume * 0.2, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {
            console.error("Audio Play Error:", e);
        }
    };

    const playSound = (type) => {
        if (!soundEnabled) return;

        // Resume context if suspended (browser policy)
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        switch (type) {
            case 'join': playTone(600, 'sine', 0.1); break;
            case 'start': playTone(440, 'square', 0.5); break; // Dramatic
            case 'correct': playTone(880, 'sine', 0.1); setTimeout(() => playTone(1100, 'sine', 0.2), 100); break;
            case 'incorrect': playTone(300, 'sawtooth', 0.3); break;
            case 'hover': playTone(200, 'sine', 0.05); break;
            case 'click': playTone(400, 'triangle', 0.05); break;
            case 'beep': playTone(800, 'sine', 0.1); break;
            default: break; // No sound
        }
    };

    return (
        <SoundContext.Provider value={{ soundEnabled, toggleSound, playSound, volume, setVolume }}>
            {children}
        </SoundContext.Provider>
    );
};
