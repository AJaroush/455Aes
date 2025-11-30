/**
 * Theme Context Provider
 * 
 * Manages dark/light mode theme for the entire application
 * 
 * Features:
 * - Persists theme preference in localStorage
 * - Detects system preference on first visit
 * - Applies theme class to document root
 * - Provides theme toggle function
 * 
 * Usage:
 * - Wrap app with ThemeProvider
 * - Use useTheme() hook to access theme and toggleTheme function
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

// Create theme context
const ThemeContext = createContext();

/**
 * Custom hook to access theme context
 * Throws error if used outside ThemeProvider
 * @returns {object} - Theme context with theme and toggleTheme
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Theme Provider Component
 * Manages theme state and applies it to the document
 * @param {ReactNode} children - Child components
 */
export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or system preference
  const [theme, setTheme] = useState(() => {
    // Check localStorage first for saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  /**
   * Apply theme to document root element
   * Updates CSS classes and saves to localStorage
   */
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark'); // Remove existing theme classes
    root.classList.add(theme); // Add current theme class
    localStorage.setItem('theme', theme); // Persist theme preference
  }, [theme]);

  /**
   * Toggle between dark and light theme
   */
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

