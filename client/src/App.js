import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Encrypt from './pages/Encrypt';
import Decrypt from './pages/Decrypt';
import Compare from './pages/Compare';
import Tutorial from './pages/Tutorial';
import About from './pages/About';
import History from './pages/History';
import AESHistory from './pages/AESHistory';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/encrypt" element={<Encrypt />} />
              <Route path="/decrypt" element={<Decrypt />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/tutorial" element={<Tutorial />} />
              <Route path="/about" element={<About />} />
              <Route path="/history" element={<History />} />
              <Route path="/aes-history" element={<AESHistory />} />
            </Routes>
          </main>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(0, 0, 0, 0.9)',
                color: '#fff',
                border: '1px solid rgba(0, 212, 255, 0.3)',
              },
              success: {
                iconTheme: {
                  primary: '#00ff88',
                  secondary: '#000',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ff4444',
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
