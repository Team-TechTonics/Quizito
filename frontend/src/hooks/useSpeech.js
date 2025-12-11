// src/hooks/useSpeech.js
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for Text-to-Speech functionality
 * Uses Web Speech API to read text aloud
 */
export const useSpeech = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speechEnabled, setSpeechEnabled] = useState(false);
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [speechRate, setSpeechRate] = useState(0.9);
    const [speechPitch, setSpeechPitch] = useState(1.0);
    const utteranceRef = useRef(null);

    // Load available voices
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);

            // Prefer English voices
            const englishVoice = availableVoices.find(v =>
                v.lang.startsWith('en') && v.name.includes('Google')
            ) || availableVoices.find(v =>
                v.lang.startsWith('en')
            );

            setSelectedVoice(englishVoice || availableVoices[0]);
        };

        loadVoices();

        // Some browsers load voices asynchronously
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    /**
     * Speak the given text
     * @param {string} text - Text to speak
     * @param {Object} options - Speech options (rate, pitch, volume)
     */
    const speak = useCallback((text, options = {}) => {
        if (!speechEnabled || !text) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = selectedVoice;
        utterance.rate = options.rate || speechRate;
        utterance.pitch = options.pitch || speechPitch;
        utterance.volume = options.volume || 1.0;

        utterance.onstart = () => {
            setIsSpeaking(true);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            setIsSpeaking(false);
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, [speechEnabled, selectedVoice, speechRate, speechPitch]);

    /**
     * Stop current speech
     */
    const stop = useCallback(() => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, []);

    /**
     * Pause current speech
     */
    const pause = useCallback(() => {
        if (isSpeaking) {
            window.speechSynthesis.pause();
        }
    }, [isSpeaking]);

    /**
     * Resume paused speech
     */
    const resume = useCallback(() => {
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
        }
    }, []);

    /**
     * Toggle speech on/off
     */
    const toggleSpeech = useCallback(() => {
        setSpeechEnabled(prev => {
            if (prev) {
                // If turning off, stop any ongoing speech
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
            }
            return !prev;
        });
    }, []);

    return {
        speak,
        stop,
        pause,
        resume,
        toggleSpeech,
        isSpeaking,
        speechEnabled,
        setSpeechEnabled,
        voices,
        selectedVoice,
        setSelectedVoice,
        speechRate,
        setSpeechRate,
        speechPitch,
        setSpeechPitch
    };
};

export default useSpeech;
