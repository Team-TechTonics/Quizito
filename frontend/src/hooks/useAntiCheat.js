import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';

export const useAntiCheat = (isActive, onDisqualify) => {
    const [warnings, setWarnings] = useState(0);
    const MAX_WARNINGS = 3;
    const warningsRef = useRef(0);

    useEffect(() => {
        if (!isActive) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                // User switched tabs
                warningsRef.current += 1;
                setWarnings(warningsRef.current);

                if (warningsRef.current >= MAX_WARNINGS) {
                    toast.error("🚨 You have been disqualified for multiple tab switches!");
                    if (onDisqualify) onDisqualify();
                } else {
                    toast('⚠️ Anti-Cheat Warning!', {
                        icon: '⛔',
                        duration: 5000,
                        style: {
                            background: '#333',
                            color: '#fff',
                        },
                        description: `Switching tabs is not allowed. Warning ${warningsRef.current}/${MAX_WARNINGS}`
                    });

                    // Also speak it if possible or make a sound
                    const audio = new Audio('/sounds/warning.mp3'); // Assuming we have one, or just ignore
                }
            }
        };

        const handleBlur = () => {
            // Optional: stricter checking if window loses focus
            // For now relying on visibilitychange as it's less prone to false positives (like notifications)
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [isActive, onDisqualify]);

    return { warnings, maxWarnings: MAX_WARNINGS };
};
