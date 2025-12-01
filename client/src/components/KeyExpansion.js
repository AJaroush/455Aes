/**
 * Key Expansion Visualization Component
 * 
 * Displays the AES key expansion process showing all round keys
 * Each round key is displayed as a 4x4 matrix in column-major order
 * 
 * Features:
 * - Expandable/collapsible round keys
 * - Copy key to clipboard functionality
 * - Animated matrix cells
 * - Visual representation of key schedule
 * 
 * @param {array} keys - Array of expanded round keys (4x4 matrices)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';

const KeyExpansion = ({ keys }) => {
  // UI state
  const [expandedRounds, setExpandedRounds] = useState({}); // Track which rounds are expanded
  const [selectedRound, setSelectedRound] = useState(0); // Currently selected round

  const toggleRound = (roundIndex) => {
    setExpandedRounds(prev => ({
      ...prev,
      [roundIndex]: !prev[roundIndex]
    }));
  };

  const copyKey = (keyMatrix, round) => {
    const keyHex = keyMatrix.flat().join('');
    navigator.clipboard.writeText(keyHex);
    toast.success(`Round ${round} key copied to clipboard!`);
  };

  const MatrixCell = ({ value, index }) => (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.02, duration: 0.3 }}
      className="matrix-cell w-8 h-8 flex items-center justify-center rounded font-mono font-bold text-xs bg-white/10 dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20 hover:bg-gray-200 dark:hover:bg-white/20 transition-all duration-300"
    >
      {value}
    </motion.div>
  );

  const KeyMatrix = ({ keyMatrix, round }) => (
    <div className="glass rounded-lg p-4 border border-white/20">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-gray-900 dark:text-white font-semibold">Round {round} Key</h4>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => copyKey(keyMatrix, round)}
          className="p-1 glass rounded text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-all duration-300"
        >
          <Copy className="h-3 w-3" />
        </motion.button>
      </div>
      
      <div className="grid grid-cols-4 gap-1 max-w-xs mx-auto">
        {keyMatrix.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <MatrixCell
              key={`${rowIndex}-${colIndex}`}
              value={cell}
              index={rowIndex * 4 + colIndex}
            />
          ))
        )}
      </div>
      
      <div className="mt-3 text-center">
        <div className="text-xs text-blue-300 font-mono">
          {keyMatrix.flat().join(' ')}
        </div>
      </div>
    </div>
  );

  const KeyExpansionDetails = ({ round }) => {
    const getExpansionInfo = (roundNum) => {
      if (roundNum === 0) {
        return {
          title: 'Initial Key',
          description: 'The original encryption key used as the first round key',
          process: 'Direct copy of the input key'
        };
      }
      
      return {
        title: `Key Expansion Round ${roundNum}`,
        description: 'Generated using the Rijndael key schedule',
        process: roundNum % 4 === 0 
          ? 'RotWord → SubWord → XOR with Rcon → XOR with previous key'
          : 'Direct XOR with previous key'
      };
    };

    const info = getExpansionInfo(round);

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10"
      >
        <h5 className="text-gray-900 dark:text-white font-medium mb-2">{info.title}</h5>
        <p className="text-sm text-blue-600 dark:text-blue-200 mb-2">{info.description}</p>
        <p className="text-xs text-blue-700 dark:text-blue-300 font-mono">{info.process}</p>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center">
          <Key className="h-6 w-6 mr-3 text-blue-600 dark:text-blue-400" />
          Key Expansion
        </h3>
        <p className="text-blue-600 dark:text-blue-200">
          How the encryption key is expanded into round keys for each encryption round
        </p>
      </div>

      {/* Key Overview */}
      <div className="glass rounded-lg p-6 border border-white/20">
        <h4 className="text-gray-900 dark:text-white font-semibold mb-4">Key Schedule Overview</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {keys.map((key, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedRound(index)}
              className={`p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                selectedRound === index
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'glass text-gray-900 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/20'
              }`}
            >
              Round {key.round}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Selected Key Details */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedRound}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <KeyMatrix 
            keyMatrix={keys[selectedRound].key} 
            round={keys[selectedRound].round} 
          />
          <KeyExpansionDetails round={keys[selectedRound].round} />
        </motion.div>
      </AnimatePresence>

      {/* All Keys Grid */}
      <div className="glass rounded-lg p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-gray-900 dark:text-white font-semibold">All Round Keys</h4>
          <div className="text-sm text-blue-300">
            {keys.length} round keys generated
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {keys.map((key, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative"
            >
              <div className="glass rounded-lg p-4 border border-white/20 hover:border-white/40 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-gray-900 dark:text-white font-medium">Round {key.round}</h5>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleRound(index)}
                    className="p-1 glass rounded text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-all duration-300"
                  >
                    {expandedRounds[index] ? 
                      <ChevronUp className="h-3 w-3" /> : 
                      <ChevronDown className="h-3 w-3" />
                    }
                  </motion.button>
                </div>

                <div className="grid grid-cols-4 gap-1 mb-3">
                  {key.key.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <MatrixCell
                        key={`${rowIndex}-${colIndex}`}
                        value={cell}
                        index={rowIndex * 4 + colIndex}
                      />
                    ))
                  )}
                </div>

                <div className="text-xs text-blue-700 dark:text-blue-300 font-mono text-center">
                  {key.key.flat().join(' ')}
                </div>

                <AnimatePresence>
                  {expandedRounds[index] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-3 pt-3 border-t border-white/10"
                    >
                      <KeyExpansionDetails round={key.round} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Key Statistics */}
      <div className="glass rounded-lg p-6 border border-white/20">
        <h4 className="text-gray-900 dark:text-white font-semibold mb-4">Key Expansion Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-500/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-300">{keys.length}</div>
            <div className="text-sm text-gray-900 dark:text-white">Total Rounds</div>
          </div>
          <div className="text-center p-4 bg-green-500/20 rounded-lg">
            <div className="text-2xl font-bold text-green-300">{keys.length * 16}</div>
            <div className="text-sm text-gray-900 dark:text-white">Total Bytes</div>
          </div>
          <div className="text-center p-4 bg-purple-500/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-300">{keys.length * 128}</div>
            <div className="text-sm text-gray-900 dark:text-white">Total Bits</div>
          </div>
          <div className="text-center p-4 bg-orange-500/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-300">4</div>
            <div className="text-sm text-gray-900 dark:text-white">Words per Key</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyExpansion;
