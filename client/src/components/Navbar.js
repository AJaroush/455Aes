/**
 * Navigation Bar Component
 * 
 * Provides the main navigation interface for the application with:
 * - Main navigation items (Home, Encrypt, Decrypt)
 * - Dropdown menu for additional pages (History, Tutorial, Attacks, About)
 * - Theme toggle (dark/light mode)
 * - GitHub link
 * - Responsive design with mobile menu
 * - Active route highlighting
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Menu, 
  X, 
  Zap, 
  Unlock,
  BookOpen, 
  Info,
  Github,
  History,
  Sun,
  Moon,
  Calendar,
  ChevronDown,
  AlertTriangle
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  // State management for mobile menu and dropdown visibility
  const [isOpen, setIsOpen] = useState(false); // Controls mobile menu open/close
  const [moreOpen, setMoreOpen] = useState(false); // Controls "More" dropdown open/close
  const location = useLocation(); // Get current route for active link highlighting
  const { theme, toggleTheme } = useTheme(); // Theme context for dark/light mode
  const moreDropdownRef = useRef(null); // Reference to dropdown element for click-outside detection

  // Primary navigation items - always visible on desktop
  const mainNavItems = [
    { path: '/', label: 'Home', icon: Shield },
    { path: '/encrypt', label: 'Encrypt', icon: Zap },
    { path: '/decrypt', label: 'Decrypt', icon: Unlock },
  ];

  // Secondary navigation items - shown in "More" dropdown menu
  const moreNavItems = [
    { path: '/history', label: 'History', icon: History },
    { path: '/aes-history', label: 'AES History', icon: Calendar },
    { path: '/tutorial', label: 'Tutorial', icon: BookOpen },
    { path: '/attacks', label: 'Attacks', icon: AlertTriangle },
    { path: '/about', label: 'About', icon: Info },
  ];

  // Combined navigation items for mobile menu
  const allNavItems = [...mainNavItems, ...moreNavItems];

  /**
   * Close dropdown menu when user clicks outside of it
   * This improves UX by automatically closing the dropdown when user clicks elsewhere
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the dropdown element
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target)) {
        setMoreOpen(false); // Close dropdown
      }
    };

    // Only add event listener when dropdown is open
    if (moreOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup: remove event listener when component unmounts or dropdown closes
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [moreOpen]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-[100] glass border-b border-gray-200 dark:border-white/20 backdrop-blur-xl bg-white/80 dark:bg-black/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg"
            >
              <Shield className="h-6 w-6 text-white" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-gray-900 dark:text-white font-bold text-lg">AES Tool</span>
              <span className="text-xs text-cyan-600 dark:text-cyan-300">Advanced Encryption</span>
            </div>
          </Link>

          {/* Desktop Navigation - hidden on mobile, visible on medium+ screens */}
          <div className="hidden md:flex items-center space-x-1 relative">
            {/* Render main navigation items (Home, Encrypt, Decrypt) */}
            {mainNavItems.map((item) => {
              const Icon = item.icon; // Get icon component for this nav item
              const isActive = location.pathname === item.path; // Check if current route matches
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30'
                      : 'text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              );
            })}
            
            {/* More Dropdown - contains secondary navigation items */}
            <div className="relative" ref={moreDropdownRef}>
              {/* Dropdown toggle button with hover/tap animations */}
              <motion.button
                whileHover={{ scale: 1.02 }} // Slight scale on hover
                whileTap={{ scale: 0.98 }} // Slight scale down on click
                onClick={() => setMoreOpen(!moreOpen)} // Toggle dropdown visibility
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  moreNavItems.some(item => location.pathname === item.path)
                    ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30'
                    : 'text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                }`}
              >
                <span className="font-medium text-sm">More</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${moreOpen ? 'rotate-180' : ''}`} />
              </motion.button>
              
              {moreOpen && (
                <>
                  {/* Backdrop overlay */}
                  <div 
                    className="fixed inset-0 z-[105]" 
                    onClick={() => setMoreOpen(false)}
                  />
                  {/* Dropdown menu */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 w-48 glass rounded-lg border border-gray-200 dark:border-white/20 shadow-xl overflow-hidden z-[110] bg-white dark:bg-gray-900"
                  >
                    <div className="py-2">
                      {moreNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMoreOpen(false)}
                            className={`flex items-center space-x-3 px-4 py-2 transition-all duration-300 ${
                              isActive
                                ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300'
                                : 'text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="font-medium text-sm">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons - Theme toggle and GitHub link (desktop only) */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme toggle button - switches between dark and light mode */}
            <motion.button
              whileHover={{ scale: 1.05 }} // Scale up on hover
              whileTap={{ scale: 0.95 }} // Scale down on click
              onClick={toggleTheme} // Toggle theme via context
              className="p-2 text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all duration-300"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {/* Show sun icon in dark mode, moon icon in light mode */}
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </motion.button>
            
            {/* GitHub repository link - opens in new tab */}
            <motion.a
              href="https://github.com/AJaroush/455Aes"
              target="_blank"
              rel="noopener noreferrer" // Security: prevent new page from accessing window.opener
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all duration-300"
            >
              <Github className="h-5 w-5" />
            </motion.a>
          </div>

          {/* Mobile menu button - only visible on mobile devices */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all duration-300"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation - slides down when menu button is clicked */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} // Start hidden and collapsed
            animate={{ opacity: 1, height: 'auto' }} // Fade in and expand
            exit={{ opacity: 0, height: 0 }} // Fade out and collapse when closing
            transition={{ duration: 0.3 }} // Smooth animation
            className="md:hidden border-t border-gray-200 dark:border-white/20"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Render all navigation items (main + more) in mobile menu */}
              {allNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path; // Highlight active route
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30'
                        : 'text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              
              <div className="pt-4 border-t border-gray-200 dark:border-white/20 space-y-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={toggleTheme}
                  className="flex items-center space-x-3 px-3 py-2 w-full text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all duration-300"
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </motion.button>
                <motion.a
                  href="https://github.com/AJaroush/455Aes"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all duration-300"
                >
                  <Github className="h-5 w-5" />
                  <span className="font-medium">GitHub</span>
                </motion.a>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
