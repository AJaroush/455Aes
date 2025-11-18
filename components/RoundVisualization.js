import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Info } from 'lucide-react';

const RoundVisualization = ({ rounds, autoPlay, currentRound, setCurrentRound }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [showDetails, setShowDetails] = useState({});

  const allRounds = [
    { round: 0, operation: 'Initial AddRoundKey', state: rounds[0]?.state || [], description: 'XOR the plaintext with the first round key' },
    ...rounds.filter(r => r.round > 0).map(round => ({
      ...round,
      description: getOperationDescription(round.operation)
    }))
  ];

  function getOperationDescription(operation) {
    const descriptions = {
      'SubBytes': 'Replace each byte with its corresponding value from the S-box',
      'ShiftRows': 'Shift rows cyclically to the left by different offsets',
      'MixColumns': 'Mix columns using Galois field multiplication',
      'AddRoundKey': 'XOR the state with the round key',
      'Final AddRoundKey': 'Final XOR operation with the last round key'
    };
    return descriptions[operation] || 'AES operation';
  }

  useEffect(() => {
    let interval;
    if (isPlaying && currentRound < allRounds.length - 1) {
      interval = setInterval(() => {
        setCurrentRound(prev => prev + 1);
      }, speed);
    } else if (isPlaying && currentRound === allRounds.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentRound, allRounds.length, speed, setCurrentRound]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentRound(0);
    setIsPlaying(false);
  };

  const handlePrevious = () => {
    setCurrentRound(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentRound(prev => Math.min(allRounds.length - 1, prev + 1));
  };

  const toggleDetails = (index) => {
    setShowDetails(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const MatrixCell = ({ value, index, isHighlighted = false, operation = '' }) => {
    const getHighlightColor = () => {
      if (operation.includes('SubBytes')) return 'from-green-500 to-emerald-600';
      if (operation.includes('ShiftRows')) return 'from-orange-500 to-red-600';
      if (operation.includes('MixColumns')) return 'from-purple-500 to-pink-600';
      if (operation.includes('AddRoundKey')) return 'from-blue-500 to-cyan-600';
      return 'from-gray-500 to-gray-600';
    };

    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: index * 0.02, duration: 0.3 }}
        className={`matrix-cell w-10 h-10 flex items-center justify-center rounded-lg font-mono font-bold text-xs transition-all duration-300 ${
          isHighlighted
            ? `bg-gradient-to-r ${getHighlightColor()} text-white shadow-lg`
            : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
        }`}
      >
        {value}
      </motion.div>
    );
  };

  const RoundCard = ({ round, index, isActive }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={`glass rounded-xl p-6 border transition-all duration-300 ${
        isActive
          ? 'border-blue-500/50 bg-blue-500/10'
          : 'border-white/20 hover:border-white/40'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Round {round.round} - {round.operation}
          </h3>
          <p className="text-sm text-blue-300 mt-1">{round.description}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => toggleDetails(index)}
          className="p-2 glass rounded-lg text-white hover:bg-white/20 transition-all duration-300"
        >
          <Info className="h-4 w-4" />
        </motion.button>
      </div>

      {round.state && (
        <div className="grid grid-cols-4 gap-1 max-w-xs mx-auto mb-4">
          {round.state.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <MatrixCell
                key={`${rowIndex}-${colIndex}`}
                value={cell}
                index={rowIndex * 4 + colIndex}
                isHighlighted={isActive}
                operation={round.operation}
              />
            ))
          )}
        </div>
      )}

      <AnimatePresence>
        {showDetails[index] && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10"
          >
            <h4 className="text-white font-medium mb-2">Technical Details:</h4>
            <ul className="text-sm text-blue-200 space-y-1">
              {round.operation === 'SubBytes' && (
                <>
                  <li>• Uses AES S-box for byte substitution</li>
                  <li>• Provides non-linearity to resist cryptanalysis</li>
                  <li>• Each byte is replaced by its S-box value</li>
                </>
              )}
              {round.operation === 'ShiftRows' && (
                <>
                  <li>• Row 0: no shift</li>
                  <li>• Row 1: shift left by 1 position</li>
                  <li>• Row 2: shift left by 2 positions</li>
                  <li>• Row 3: shift left by 3 positions</li>
                </>
              )}
              {round.operation === 'MixColumns' && (
                <>
                  <li>• Uses Galois field multiplication</li>
                  <li>• Provides diffusion across columns</li>
                  <li>• Fixed matrix multiplication in GF(2^8)</li>
                </>
              )}
              {round.operation.includes('AddRoundKey') && (
                <>
                  <li>• XOR operation with round key</li>
                  <li>• Adds key material to the state</li>
                  <li>• Provides security through key mixing</li>
                </>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

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
            className="flex items-center space-x-2 px-4 py-2 glass text-white rounded-lg hover:bg-white/20 transition-all duration-300"
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

          <div className="text-white font-mono text-sm px-3">
            {currentRound + 1} / {allRounds.length}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            disabled={currentRound === allRounds.length - 1}
            className="p-2 glass text-white rounded-lg hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-white text-sm">Speed:</label>
          <select
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value))}
            className="bg-white/10 border border-white/20 rounded text-white text-sm px-2 py-1 focus:outline-none focus:border-blue-500"
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
          animate={{ width: `${((currentRound + 1) / allRounds.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Rounds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allRounds.map((round, index) => (
          <RoundCard
            key={index}
            round={round}
            index={index}
            isActive={index === currentRound}
          />
        ))}
      </div>

      {/* Round Summary */}
      <div className="glass rounded-lg p-6 border border-white/20">
        <h4 className="text-white font-semibold mb-4">Encryption Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-300">
              {allRounds.filter(r => r.operation === 'SubBytes').length}
            </div>
            <div className="text-sm text-white">SubBytes</div>
          </div>
          <div className="p-3 bg-orange-500/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-300">
              {allRounds.filter(r => r.operation === 'ShiftRows').length}
            </div>
            <div className="text-sm text-white">ShiftRows</div>
          </div>
          <div className="p-3 bg-purple-500/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-300">
              {allRounds.filter(r => r.operation === 'MixColumns').length}
            </div>
            <div className="text-sm text-white">MixColumns</div>
          </div>
          <div className="p-3 bg-green-500/20 rounded-lg">
            <div className="text-2xl font-bold text-green-300">
              {allRounds.filter(r => r.operation.includes('AddRoundKey')).length}
            </div>
            <div className="text-sm text-white">AddRoundKey</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoundVisualization;
