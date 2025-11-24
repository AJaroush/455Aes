import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Zap, 
  Eye, 
  Copy, 
  Download, 
  Upload, 
  Play, 
  Pause, 
  RotateCcw,
  Settings,
  FileText,
  Key,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle,
  AlertCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import MatrixVisualization from '../components/MatrixVisualization';
import RoundVisualization from '../components/RoundVisualization';
import KeyExpansion from '../components/KeyExpansion';

const Encrypt = () => {
  const [message, setMessage] = useState('');
  const [key, setKey] = useState('');
  const [keySize, setKeySize] = useState('128');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('rounds');
  const [autoPlay, setAutoPlay] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [fileContent, setFileContent] = useState('');

  // Example inputs
  const examples = {
    '128': {
      message: '54776F204F6E65204E696E652054776F',
      key: '5468617473206D79204B756E67204675',
      description: 'Classic "Two One Nine Two" example'
    },
    '192': {
      message: '00112233445566778899aabbccddeeff',
      key: '000102030405060708090a0b0c0d0e0f1011121314151617',
      description: 'NIST test vector for AES-192'
    },
    '256': {
      message: '00112233445566778899aabbccddeeff',
      key: '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f',
      description: 'NIST test vector for AES-256'
    }
  };

  const handleExample = (size) => {
    const example = examples[size];
    setMessage(example.message);
    setKey(example.key);
    setKeySize(size);
    toast.success(`Loaded ${example.description}`);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        // Convert file content to hex
        const hex = Array.from(new Uint8Array(content))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
          .toUpperCase();
        
        // Pad to 16 bytes (32 hex chars) for AES
        const padded = hex.padEnd(32, '0').substring(0, 32);
        setMessage(padded);
        setFileContent(content);
        toast.success('File loaded and converted to hex');
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleEncrypt = async () => {
    if (!message || !key) {
      toast.error('Please enter both message and key');
      return;
    }

    const expectedLength = parseInt(keySize) / 4;
    if (key.length !== expectedLength) {
      toast.error(`Key must be ${expectedLength} hex characters for AES-${keySize}`);
      return;
    }

    if (message.length === 0) {
      toast.error('Please enter a message to encrypt');
      return;
    }

    const hexRegex = /^[0-9A-F]+$/;
    if (!hexRegex.test(message)) {
      toast.error('Message contains non-hex characters. Please use only 0-9 and A-F');
      return;
    }
    if (!hexRegex.test(key)) {
      toast.error('Key contains non-hex characters. Please use only 0-9 and A-F');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/encrypt', {
        message,
        key,
        key_size: keySize
      });
      
      setResults(response.data);
      setCurrentRound(0);
      toast.success('Encryption completed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Encryption failed');
    } finally {
      setLoading(false);
    }
  };

  const generateRandomMessage = async () => {
    try {
      // Generate 16 random bytes (32 hex characters)
      const randomBytes = new Uint8Array(16);
      crypto.getRandomValues(randomBytes);
      const hexMessage = Array.from(randomBytes)
        .map(b => b.toString(16).padStart(2, '0').toUpperCase())
        .join('');
      setMessage(hexMessage);
      toast.success('Random message generated!');
    } catch (error) {
      toast.error('Failed to generate message: ' + error.message);
    }
  };

  const generateRandomKey = async () => {
    try {
      const response = await axios.post('/api/generate-key', { key_size: keySize });
      setKey(response.data.key);
      toast.success('Secure random key generated!');
    } catch (error) {
      toast.error('Failed to generate key: ' + (error.response?.data?.error || error.message));
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const downloadResults = () => {
    if (!results) return;
    
    const data = {
      input: { message, key, keySize },
      output: results,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aes-encryption-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Results downloaded!');
  };

  const tabs = [
    { id: 'rounds', label: 'Encryption Rounds', icon: Eye },
    { id: 'keys', label: 'Key Expansion', icon: Key },
    { id: 'matrix', label: 'Matrix View', icon: Shield }
  ];

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="gradient-text">AES Encryption</span>
          </h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Encrypt your data with AES-128, AES-192, or AES-256 and watch every step of the process
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
            <div className="glass rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Lock className="h-6 w-6 mr-3 text-blue-400" />
                Encryption Input
              </h2>

              {/* AES Variant Selection */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-3">AES Variant</label>
                <div className="grid grid-cols-3 gap-2">
                  {['128', '192', '256'].map((size) => (
                    <motion.button
                      key={size}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setKeySize(size)}
                      className={`p-3 rounded-lg font-semibold transition-all duration-300 ${
                        keySize === size
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                          : 'glass text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      AES-{size}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-3">
                  Message to Encrypt
                </label>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generateRandomMessage}
                  className="w-full mb-3 p-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all flex items-center justify-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate Random Message
                </motion.button>
                <div className="relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value.toUpperCase())}
                    placeholder="Enter your message in hexadecimal format (e.g., 54776F204F6E65204E696E652054776F) or use the button above to generate one"
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono"
                    rows={4}
                  />
                  <div className="absolute top-2 right-2 text-xs text-white/50">
                    {message.length} characters
                  </div>
                  {message.length > 0 && (
                    <div className="absolute bottom-2 right-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-white/50">
                  💡 Tip: Enter any hexadecimal characters (0-9, A-F). The message will be padded automatically if needed.
                </p>
              </div>

              {/* Key Input */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-3">
                  Key (Hexadecimal)
                </label>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generateRandomKey}
                  className="w-full mb-3 p-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate Random Key
                </motion.button>
                <div className="relative">
                  <textarea
                    value={key}
                    onChange={(e) => setKey(e.target.value.toUpperCase())}
                    placeholder={`Enter ${parseInt(keySize)/4} hex characters`}
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono"
                    rows={3}
                    maxLength={parseInt(keySize)/4}
                  />
                  <div className="absolute top-2 right-2 text-xs text-white/50">
                    {key.length}/{parseInt(keySize)/4}
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-3">
                  Or Upload File
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".txt,.bin,.dat"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center w-full p-4 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-300 cursor-pointer"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Choose File
                  </label>
                </div>
              </div>

              {/* Example Buttons */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-3">Quick Examples</label>
                <div className="space-y-2">
                  {Object.entries(examples).map(([size, example]) => (
                    <motion.button
                      key={size}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleExample(size)}
                      className="w-full p-3 text-left glass rounded-lg text-white hover:bg-white/20 transition-all duration-300"
                    >
                      <div className="font-semibold">AES-{size}</div>
                      <div className="text-sm text-blue-300">{example.description}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Advanced Options */}
              <div className="mb-6">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full p-3 glass rounded-lg text-white hover:bg-white/20 transition-all duration-300"
                >
                  <span className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Advanced Options
                  </span>
                  {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                
                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-3 space-y-3"
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="auto-play"
                          checked={autoPlay}
                          onChange={(e) => setAutoPlay(e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="auto-play" className="text-white">Auto-play animation</label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Encrypt Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEncrypt}
                disabled={loading}
                className="w-full p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="spinner mr-3" />
                    Encrypting...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    Encrypt Message
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
            {results ? (
              <div className="glass rounded-2xl p-6 border border-white/20">
                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <CheckCircle className="h-6 w-6 mr-3 text-green-400" />
                    Encryption Results
                  </h2>
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyToClipboard(results.final_ciphertext, 'Ciphertext')}
                      className="p-2 glass rounded-lg text-white hover:bg-white/20 transition-all duration-300"
                    >
                      <Copy className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={downloadResults}
                      className="p-2 glass rounded-lg text-white hover:bg-white/20 transition-all duration-300"
                    >
                      <Download className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Final Ciphertext */}
                <div className="mb-6 p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-green-500/30">
                  <h3 className="text-lg font-semibold text-white mb-2">Final Ciphertext</h3>
                  <div className="font-mono text-green-300 text-lg break-all">
                    {results.final_ciphertext}
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 mb-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <motion.button
                        key={tab.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                          activeTab === tab.id
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                  {activeTab === 'rounds' && (
                    <motion.div
                      key="rounds"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <RoundVisualization 
                        rounds={results.rounds}
                        autoPlay={autoPlay}
                        currentRound={currentRound}
                        setCurrentRound={setCurrentRound}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'keys' && (
                    <motion.div
                      key="keys"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <KeyExpansion keys={results.expanded_key} />
                    </motion.div>
                  )}

                  {activeTab === 'matrix' && (
                    <motion.div
                      key="matrix"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MatrixVisualization 
                        initialState={results.initial_state}
                        rounds={results.rounds}
                        currentRound={currentRound}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="glass rounded-2xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Zap className="h-6 w-6 mr-3 text-cyan-400" />
                  Step-by-Step Guide
                </h2>
                
                <div className="space-y-4">
                  {/* Step 1 */}
                  <div className={`p-4 rounded-lg border-2 transition-all ${
                    message.length > 0
                      ? 'bg-green-500/10 border-green-500/50'
                      : 'bg-white/5 border-white/20'
                  }`}>
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        message.length > 0
                          ? 'bg-green-500 text-white'
                          : 'bg-white/20 text-white'
                      }`}>
                        {message.length > 0 ? <CheckCircle className="h-5 w-5" /> : '1'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">
                          Enter Your Message
                        </h3>
                        <p className="text-sm text-white/70 mb-2">
                          Enter your message in hexadecimal format (0-9, A-F). The message should be 32 hexadecimal characters (16 bytes). You can click "Generate Random Message" to create one automatically.
                        </p>
                        {message.length > 0 ? (
                          <div className="flex items-center text-sm">
                            {message.length === 32 ? (
                              <div className="flex items-center text-green-400">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Message is ready! ({message.length} characters)
                              </div>
                            ) : (
                              <div className="flex items-center text-yellow-400">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                {message.length} characters (recommended: 32)
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-white/50 text-sm">
                            💡 Tip: Use the "Generate Random Message" button above for a quick start (generates 32 characters)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className={`p-4 rounded-lg border-2 transition-all ${
                    key.length === parseInt(keySize)/4
                      ? 'bg-green-500/10 border-green-500/50'
                      : 'bg-white/5 border-white/20'
                  }`}>
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        key.length === parseInt(keySize)/4
                          ? 'bg-green-500 text-white'
                          : 'bg-white/20 text-white'
                      }`}>
                        {cleanedKey.length === parseInt(keySize)/4 ? <CheckCircle className="h-5 w-5" /> : '2'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">
                          Enter Your Key
                        </h3>
                        <p className="text-sm text-white/70 mb-2">
                          Enter exactly {parseInt(keySize)/4} hexadecimal characters for AES-{keySize}, or use the refresh button to generate a random key.
                        </p>
                        {cleanedKey.length === parseInt(keySize)/4 ? (
                          <div className="flex items-center text-green-400 text-sm">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Key is ready!
                          </div>
                        ) : cleanedKey.length > 0 ? (
                          <div className="flex items-center text-yellow-400 text-sm">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {parseInt(keySize)/4 - key.length} more characters needed
                          </div>
                        ) : (
                          <div className="text-white/50 text-sm">
                            Use "Quick Examples" below or generate a random key
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className={`p-4 rounded-lg border-2 transition-all ${
                    message.length > 0 && key.length === parseInt(keySize)/4
                      ? 'bg-cyan-500/10 border-cyan-500/50'
                      : 'bg-white/5 border-white/20'
                  }`}>
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        message.length > 0 && key.length === parseInt(keySize)/4
                          ? 'bg-cyan-500 text-white'
                          : 'bg-white/20 text-white'
                      }`}>
                        3
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">
                          Click Encrypt
                        </h3>
                        <p className="text-sm text-white/70 mb-2">
                          Once both message and key are entered, click the "Encrypt Message" button to start the encryption process. You can also press Ctrl+Enter.
                        </p>
                        {message.length > 0 && key.length === parseInt(keySize)/4 ? (
                          <div className="flex items-center text-cyan-400 text-sm">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Ready to encrypt! Click the button above or press Ctrl+Enter.
                          </div>
                        ) : (
                          <div className="text-white/50 text-sm">
                            Complete steps 1 and 2 first
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="p-4 rounded-lg border-2 bg-blue-500/10 border-blue-500/30">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold bg-blue-500 text-white">
                        4
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">
                          View Results
                </h3>
                        <p className="text-sm text-white/70">
                          After encryption, you'll see detailed results including the ciphertext, encryption rounds visualization, key expansion, and matrix transformations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/20">
                  <h3 className="font-semibold text-white mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-2 text-cyan-400" />
                    Quick Tips
                  </h3>
                  <ul className="space-y-1 text-sm text-white/70">
                    <li>• Use "Generate Random Message" and "Generate Random Key" buttons for quick setup</li>
                    <li>• Press Ctrl+Enter to encrypt when ready</li>
                    <li>• You can enter messages of any length - they'll be padded automatically</li>
                    <li>• Switch between Hexadecimal and Password key modes as needed</li>
                    <li>• File encryption is also available - just drag and drop a file</li>
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Encrypt;
