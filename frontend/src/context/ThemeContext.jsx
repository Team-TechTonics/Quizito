// src/context/ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Check localStorage, but default to 'dark' if nothing is saved
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme;
        // Default to 'dark' regardless of system preference for now as per user request
        return 'dark';
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove the old theme class and add the new one
        root.classList.remove('light', 'dark');
        root.classList.add(theme);

        // Save to localStorage
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
