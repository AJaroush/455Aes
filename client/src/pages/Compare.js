import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GitCompare, Zap, Clock, Shield, TrendingUp, BarChart3 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const Compare = () => {
  const [comparisons, setComparisons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('00112233445566778899aabbccddeeff');
  const [key128, setKey128] = useState('000102030405060708090a0b0c0d0e0f');
  const [key192, setKey192] = useState('000102030405060708090a0b0c0d0e0f1011121314151617');
  const [key256, setKey256] = useState('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');

  const cleanHex = (value = '') =>
    value
      .replace(/\s+/g, '')
      .replace(/[^0-9a-fA-F]/g, '')
      .toUpperCase();

  const runComparison = async () => {
    const cleanMessage = cleanHex(message);
    const cleanKey128 = cleanHex(key128);
    const cleanKey192 = cleanHex(key192);
    const cleanKey256 = cleanHex(key256);

    if (!cleanMessage) {
      toast.error('Please enter a message to encrypt');
      return;
    }

    if (cleanMessage.length !== 32) {
      toast.error('Message must be exactly 32 hex characters (16 bytes)');
      return;
    }

    if (cleanKey128.length !== 32) {
      toast.error('AES-128 key must be exactly 32 hex characters');
      return;
    }

    if (cleanKey192.length !== 48) {
      toast.error('AES-192 key must be exactly 48 hex characters');
      return;
    }

    if (cleanKey256.length !== 64) {
      toast.error('AES-256 key must be exactly 64 hex characters');
      return;
    }

    setLoading(true);
    const results = [];

    try {
      // Test AES-128
      const start128 = performance.now();
      const result128 = await axios.post('/api/encrypt', {
        message: cleanMessage,
        key: cleanKey128,
        key_size: '128'
      });
      const time128 = performance.now() - start128;
      results.push({
        variant: 'AES-128',
        result: result128.data,
        time: time128,
        rounds: 10,
        keySize: 128
      });

      // Test AES-192
      const start192 = performance.now();
      const result192 = await axios.post('/api/encrypt', {
        message: cleanMessage,
        key: cleanKey192,
        key_size: '192'
      });
      const time192 = performance.now() - start192;
      results.push({
        variant: 'AES-192',
        result: result192.data,
        time: time192,
        rounds: 12,
        keySize: 192
      });

      // Test AES-256
      const start256 = performance.now();
      const result256 = await axios.post('/api/encrypt', {
        message: cleanMessage,
        key: cleanKey256,
        key_size: '256'
      });
      const time256 = performance.now() - start256;
      results.push({
        variant: 'AES-256',
        result: result256.data,
        time: time256,
        rounds: 14,
        keySize: 256
      });

      setComparisons(results);
      toast.success('Comparison completed successfully!');
    } catch (error) {
      toast.error('Comparison failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const ComparisonCard = ({ comparison, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="glass rounded-xl p-6 border-clean hover:border-accent transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{comparison.variant}</h3>
            <p className="text-cyan-600 dark:text-cyan-300 text-sm">{comparison.rounds} rounds • {comparison.keySize} bits</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">{comparison.time.toFixed(2)}ms</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Encryption Time</div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-gray-900 dark:text-white font-semibold mb-2">Ciphertext</h4>
          <div className="p-3 bg-gray-100 dark:bg-white/10 rounded-lg border-clean">
            <div className="font-mono text-green-700 dark:text-green-300 text-sm break-all">
              {comparison.result.final_ciphertext}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-cyan-500/20 rounded-lg">
            <div className="text-sm text-cyan-700 dark:text-cyan-300 mb-1">Rounds</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{comparison.rounds}</div>
          </div>
          <div className="p-3 bg-green-500/20 rounded-lg">
            <div className="text-sm text-green-700 dark:text-green-300 mb-1">Key Size</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{comparison.keySize} bits</div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="pt-16 min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            <span className="gradient-text">AES Comparison</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Compare AES-128, AES-192, and AES-256 side-by-side with performance metrics
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="glass rounded-2xl p-6 border-clean">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <GitCompare className="h-6 w-6 mr-3 text-cyan-600 dark:text-cyan-400" />
                Comparison Input
              </h2>

              {/* Message Input */}
              <div className="mb-6">
                <label className="block text-gray-900 dark:text-white font-medium mb-3">
                  Message (16 bytes in Hexadecimal)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(cleanHex(e.target.value))}
                  placeholder="e.g., 00112233445566778899aabbccddeeff"
                  className="input-clean w-full p-4 rounded-lg font-mono"
                  rows={3}
                  maxLength={32}
                />
              </div>

              {/* Key Inputs */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-gray-900 dark:text-white font-medium mb-2">AES-128 Key</label>
                  <input
                    type="text"
                    value={key128}
                    onChange={(e) => setKey128(cleanHex(e.target.value))}
                    className="input-clean w-full p-3 rounded-lg font-mono text-sm"
                    maxLength={32}
                  />
                </div>
                <div>
                  <label className="block text-gray-900 dark:text-white font-medium mb-2">AES-192 Key</label>
                  <input
                    type="text"
                    value={key192}
                    onChange={(e) => setKey192(cleanHex(e.target.value))}
                    className="input-clean w-full p-3 rounded-lg font-mono text-sm"
                    maxLength={48}
                  />
                </div>
                <div>
                  <label className="block text-gray-900 dark:text-white font-medium mb-2">AES-256 Key</label>
                  <input
                    type="text"
                    value={key256}
                    onChange={(e) => setKey256(cleanHex(e.target.value))}
                    className="input-clean w-full p-3 rounded-lg font-mono text-sm"
                    maxLength={64}
                  />
                </div>
              </div>

              {/* Compare Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={runComparison}
                disabled={loading}
                className="btn-primary w-full p-4 rounded-lg font-semibold text-lg flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="spinner mr-3" />
                    Comparing...
                  </>
                ) : (
                  <>
                    <GitCompare className="h-5 w-5 mr-2" />
                    Compare All Variants
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            {comparisons.length > 0 ? (
              <div className="space-y-6">
                {/* Performance Chart */}
                <div className="glass rounded-2xl p-6 border-clean">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <BarChart3 className="h-6 w-6 mr-3 text-cyan-600 dark:text-cyan-400" />
                    Performance Comparison
                  </h3>
                  
                  <div className="space-y-4">
                    {comparisons.map((comp, index) => {
                      const maxTime = Math.max(...comparisons.map(c => c.time));
                      const percentage = (comp.time / maxTime) * 100;
                      
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-900 dark:text-white font-medium">{comp.variant}</span>
                            <span className="text-cyan-600 dark:text-cyan-300 font-mono">{comp.time.toFixed(2)}ms</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-3">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ delay: index * 0.2, duration: 0.8 }}
                              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Comparison Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {comparisons.map((comparison, index) => (
                    <ComparisonCard
                      key={index}
                      comparison={comparison}
                      index={index}
                    />
                  ))}
                </div>

                {/* Summary Stats */}
                <div className="glass rounded-2xl p-6 border-clean">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <TrendingUp className="h-6 w-6 mr-3 text-cyan-600 dark:text-cyan-400" />
                    Summary Statistics
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-cyan-500/20 rounded-lg">
                      <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">
                        {comparisons.reduce((sum, c) => sum + c.time, 0).toFixed(2)}ms
                      </div>
                      <div className="text-sm text-gray-900 dark:text-white">Total Time</div>
                    </div>
                    <div className="text-center p-4 bg-green-500/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {(comparisons.reduce((sum, c) => sum + c.time, 0) / comparisons.length).toFixed(2)}ms
                      </div>
                      <div className="text-sm text-gray-900 dark:text-white">Average Time</div>
                    </div>
                    <div className="text-center p-4 bg-purple-500/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                        {Math.min(...comparisons.map(c => c.time)).toFixed(2)}ms
                      </div>
                      <div className="text-sm text-gray-900 dark:text-white">Fastest</div>
                    </div>
                    <div className="text-center p-4 bg-orange-500/20 rounded-lg">
                      <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                        {Math.max(...comparisons.map(c => c.time)).toFixed(2)}ms
                      </div>
                      <div className="text-sm text-gray-900 dark:text-white">Slowest</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass rounded-2xl p-12 border-clean text-center">
                <GitCompare className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  No Comparison Yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Enter your message and keys, then click "Compare All Variants" to see the results
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Compare;
