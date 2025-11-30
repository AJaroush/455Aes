/**
 * Main Application Component
 * 
 * This is the root component of the AES Encryption Tool application.
 * It sets up routing, theme context, and global UI components like the navbar and toast notifications.
 * 
 * Key Features:
 * - React Router for navigation between pages
 * - Theme context provider for dark/light mode
 * - Toast notifications for user feedback
 * - Responsive layout with navbar and main content area
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Encrypt from './pages/Encrypt';
import Decrypt from './pages/Decrypt';
import Tutorial from './pages/Tutorial';
import About from './pages/About';
import History from './pages/History';
import AESHistory from './pages/AESHistory';
import Attacks from './pages/Attacks';

function App() {
  return (
    // ThemeProvider wraps the entire app to provide dark/light mode context
    <ThemeProvider>
      {/* Router enables client-side routing for single-page application navigation */}
      <Router>
        {/* ScrollToTop component ensures page scrolls to top on route changes */}
        <ScrollToTop />
        
        {/* Main container with theme-aware background colors and smooth transitions */}
        <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
          {/* Navigation bar component - fixed at top of page */}
          <Navbar />
          
          {/* Main content area where page components are rendered */}
          <main>
            {/* Route definitions - maps URL paths to React components */}
            <Routes>
              <Route path="/" element={<Home />} /> {/* Landing page */}
              <Route path="/encrypt" element={<Encrypt />} /> {/* AES encryption page */}
              <Route path="/decrypt" element={<Decrypt />} /> {/* AES decryption page */}
              <Route path="/tutorial" element={<Tutorial />} /> {/* Educational tutorial page */}
              <Route path="/attacks" element={<Attacks />} /> {/* AES attacks information page */}
              <Route path="/about" element={<About />} /> {/* About/project information page */}
              <Route path="/history" element={<History />} /> {/* Encryption/decryption history page */}
              <Route path="/aes-history" element={<AESHistory />} /> {/* AES algorithm history page */}
            </Routes>
          </main>
          
          {/* Toast notification system - displays success/error messages to users */}
          <Toaster
            position="top-right" // Position notifications in top-right corner
            toastOptions={{
              style: {
                background: 'rgba(0, 0, 0, 0.9)', // Dark semi-transparent background
                color: '#fff', // White text
                border: '1px solid rgba(0, 212, 255, 0.3)', // Cyan border for visibility
              },
              success: {
                iconTheme: {
                  primary: '#00ff88', // Green icon for success messages
                  secondary: '#000',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ff4444', // Red icon for error messages
                  secondary: '#000',
                },
              },
            }}
          />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
