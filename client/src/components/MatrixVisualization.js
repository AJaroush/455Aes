import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

const MatrixVisualization = ({ initialState, rounds, currentRound, setCurrentRound }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);

  // Convert hex string to 4x4 matrix (column-major order)
  const hexToMatrix = (hexString) => {
    if (!hexString || typeof hexString !== 'string') return null;
    
    // Remove whitespace and ensure uppercase
    const cleanHex = hexString.replace(/\s+/g, '').toUpperCase();
    
    // Must be 32 hex characters (16 bytes)
    if (cleanHex.length !== 32) return null;
    
    // Convert hex string to bytes
    const bytes = [];
    for (let i = 0; i < 32; i += 2) {
      bytes.push(parseInt(cleanHex.substr(i, 2), 16));
    }
    
    // Convert bytes to 4x4 matrix (column-major order)
    const matrix = [];
    for (let r = 0; r < 4; r++) {
      const row = [];
      for (let c = 0; c < 4; c++) {
        // Column-major: data[4*j + i] where j is column, i is row
        const byte = bytes[4 * c + r];
        row.push(byte.toString(16).padStart(2, '0').toUpperCase());
      }
      matrix.push(row);
    }
    
    return matrix;
  };

  // Convert initialState and round states to matrices if they're hex strings
  const initialMatrix = typeof initialState === 'string' ? hexToMatrix(initialState) : initialState;
  
  const allStates = [
    { label: 'Initial State', matrix: initialMatrix, operation: 'Initial' },
    ...rounds.map(round => {
      const roundMatrix = typeof round.state === 'string' ? hexToMatrix(round.state) : round.state;
      return {
        label: `Round ${round.round} - ${round.operation}`,
        matrix: roundMatrix,
        operation: round.operation,
        round: round.round
      };
    })
  ].filter(state => state.matrix !== null); // Filter out invalid states

  useEffect(() => {
    let interval;
    if (isPlaying && currentRound < allStates.length - 1) {
      interval = setInterval(() => {
        setCurrentRound(prev => (prev + 1) % allStates.length);
      }, speed);
    } else if (isPlaying && currentRound === allStates.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentRound, allStates.length, speed, setCurrentRound]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentRound(0);
    setIsPlaying(false);
  };

  const handlePrevious = () => {
    setCurrentRound(prev => (prev - 1 + allStates.length) % allStates.length);
  };

  const handleNext = () => {
    setCurrentRound(prev => (prev + 1) % allStates.length);
  };

  const MatrixCell = ({ value, index, isHighlighted = false }) => (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`matrix-cell w-12 h-12 flex items-center justify-center rounded-lg font-mono font-bold text-sm transition-all duration-300 ${
        isHighlighted
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
          : 'bg-white/10 dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20 hover:bg-gray-200 dark:hover:bg-white/20'
      }`}
    >
      {value}
    </motion.div>
  );

  const Matrix = ({ matrix, title, operation }) => {
    if (!matrix || !Array.isArray(matrix) || matrix.length !== 4) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-xl p-6 border border-white/20"
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
            <p className="text-sm text-red-300">Invalid matrix data</p>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-xl p-6 border border-white/20"
      >
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-blue-600 dark:text-blue-300">{operation}</p>
      </div>
        
        <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
          {matrix.map((row, rowIndex) =>
            row && Array.isArray(row) && row.map((cell, colIndex) => (
              <MatrixCell
                key={`${rowIndex}-${colIndex}`}
                value={cell || '00'}
                index={rowIndex * 4 + colIndex}
                isHighlighted={operation.includes('SubBytes') || operation.includes('MixColumns')}
              />
            ))
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between glass rounded-lg p-4 border border-white/20">
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayPause}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 glass text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-all duration-300"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </motion.button>
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevious}
            disabled={currentRound === 0}
            className="p-2 glass text-white rounded-lg hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>

          <div className="text-gray-900 dark:text-white font-mono text-sm px-3">
            {currentRound + 1} / {allStates.length}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            disabled={currentRound === allStates.length - 1}
            className="p-2 glass text-white rounded-lg hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-gray-900 dark:text-white text-sm">Speed:</label>
          <select
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value))}
            className="bg-white/10 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded text-gray-900 dark:text-white text-sm px-2 py-1 focus:outline-none focus:border-blue-500"
          >
            <option value={500}>Fast</option>
            <option value={1000}>Normal</option>
            <option value={2000}>Slow</option>
          </select>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/10 rounded-full h-2">
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentRound + 1) / allStates.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Current Matrix */}
      {allStates.length > 0 && allStates[currentRound] ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRound}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <Matrix
              matrix={allStates[currentRound].matrix}
              title={allStates[currentRound].label}
              operation={allStates[currentRound].operation}
            />
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="glass rounded-xl p-6 border border-white/20 text-center">
          <p className="text-gray-900 dark:text-white">No matrix data available</p>
        </div>
      )}

      {/* Round Timeline */}
      <div className="glass rounded-lg p-4 border border-white/20">
        <h4 className="text-gray-900 dark:text-white font-semibold mb-3">Round Timeline</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {allStates.map((state, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentRound(index)}
              className={`p-2 rounded text-xs font-medium transition-all duration-300 ${
                index === currentRound
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'glass text-gray-900 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/20'
              }`}
            >
              {index === 0 ? 'Init' : `R${state.round}`}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatrixVisualization;
