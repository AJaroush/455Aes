import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Eye, 
  EyeOff,
  Copy, 
  Download, 
  Upload, 
  Key,
  Lock,
  Settings,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
  File,
  FileText,
  Shield,
  Hash,
  Clock,
  RefreshCw,
  Save,
  History
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [encryptionHistory, setEncryptionHistory] = useState([]);
  const [keyMode, setKeyMode] = useState('hex'); // 'hex' or 'password'

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('encryptionHistory') || '[]');
    setEncryptionHistory(stored.slice(0, 10)); // Show last 10 in sidebar
  }, []);

  // Sanitize any hex input: strip whitespace and non-hex, uppercase
  const cleanHex = (value) => (value || '')
    .replace(/\s+/g, '')
    .replace(/[^0-9a-fA-F]/g, '')
    .toUpperCase();
  
  // Computed values for display
  const cleanedMessage = cleanHex(message);
  const cleanedKey = cleanHex(key);

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
      setSelectedFile(file);
      toast.success(`File selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      toast.success(`File dropped: ${file.name}`);
    }
  };

  const generateRandomKey = async () => {
    try {
      const response = await axios.post('/api/generate-key', { key_size: keySize });
      setKey(response.data.key);
      if (response.data.iv) {
        // Store IV if needed for future file encryption
        localStorage.setItem('lastIV', response.data.iv);
      }
      toast.success('Secure random key generated!');
    } catch (error) {
      toast.error('Failed to generate key: ' + (error.response?.data?.error || error.message));
    }
  };

  const deriveKeyFromPassword = async () => {
    if (!password) {
      toast.error('Please enter a password');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post('/api/derive-key', { 
        password, 
        key_size: keySize 
      });
      setKey(response.data.key);
      localStorage.setItem('lastSalt', response.data.salt);
      toast.success('Key derived from password successfully!');
      setUsePassword(false);
    } catch (error) {
      toast.error('Key derivation failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const encryptFile = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    let finalKey = cleanedKey;
    let finalIV = null;

    // If using password, derive key first
    if (usePassword && password) {
      try {
        const response = await axios.post('/api/derive-key', { 
          password, 
          key_size: keySize 
        });
        finalKey = response.data.key;
        finalIV = response.data.salt; // Use salt as IV for simplicity
      } catch (error) {
        toast.error('Key derivation failed');
        return;
      }
    } else if (cleanedKey.length !== parseInt(keySize) / 4) {
      toast.error(`Key must be exactly ${parseInt(keySize) / 4} hex characters`);
      return;
    }

    setLoading(true);
    const startTime = performance.now();

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('key', finalKey);
      formData.append('key_size', keySize);
      formData.append('mode', 'CBC');
      if (finalIV) {
        formData.append('iv', finalIV);
      }

      const response = await axios.post('/api/encrypt-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const endTime = performance.now();
      const speed = ((selectedFile.size / 1024) / ((endTime - startTime) / 1000)).toFixed(2);

      // Add to history
      const historyEntry = {
        id: Date.now(),
        type: 'file',
        filename: selectedFile.name,
        keySize,
        timestamp: new Date().toISOString(),
        speed: speed + ' KB/s',
        hashBefore: response.data.hashBefore,
        hashAfter: response.data.hashAfter,
        mode: response.data.mode,
        fileSize: selectedFile.size
      };
      setEncryptionHistory([historyEntry, ...encryptionHistory.slice(0, 9)]);
      
      // Save to localStorage
      const stored = JSON.parse(localStorage.getItem('encryptionHistory') || '[]');
      stored.unshift(historyEntry);
      localStorage.setItem('encryptionHistory', JSON.stringify(stored.slice(0, 100))); // Keep last 100

      // Download encrypted file
      const binaryString = atob(response.data.encryptedData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedFile.name}.aes`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`File encrypted successfully! (${speed} KB/s)`);
      setSelectedFile(null);
    } catch (error) {
      toast.error('File encryption failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEncrypt = async () => {
    const cleanMessage = cleanedMessage;
    const cleanKey = cleanedKey;

    if (!cleanMessage || !cleanKey) {
      toast.error('Please enter both message and key');
      return;
    }

    const expectedLength = parseInt(keySize) / 4;
    if (cleanKey.length !== expectedLength) {
      toast.error(`Key must be exactly ${expectedLength} hex characters for AES-${keySize}`);
      return;
    }

    if (cleanMessage.length !== 32) {
      toast.error('Message must be exactly 32 hex characters (16 bytes)');
      return;
    }

    const hexRegex = /^[0-9A-F]+$/;
    if (!hexRegex.test(cleanMessage)) {
      toast.error('Message contains non-hex characters');
      return;
    }
    if (!hexRegex.test(cleanKey)) {
      toast.error('Key contains non-hex characters');
      return;
    }

    setLoading(true);
    const startTime = performance.now();
    
    try {
      const response = await axios.post('/api/encrypt', {
        message: cleanMessage,
        key: cleanKey,
        key_size: keySize
      });
      
      const endTime = performance.now();
      const speed = ((cleanMessage.length / 2 / 1024) / ((endTime - startTime) / 1000)).toFixed(2);
      
      // Add to history
      const historyEntry = {
        id: Date.now(),
        type: 'text',
        message: cleanMessage.substring(0, 16) + '...',
        keySize,
        timestamp: new Date().toISOString(),
        speed: speed + ' KB/s',
        ciphertext: response.data.final_ciphertext.substring(0, 16) + '...',
        fullCiphertext: response.data.final_ciphertext,
        fullMessage: cleanMessage
      };
      setEncryptionHistory([historyEntry, ...encryptionHistory.slice(0, 9)]);
      
      // Save to localStorage
      const stored = JSON.parse(localStorage.getItem('encryptionHistory') || '[]');
      stored.unshift(historyEntry);
      localStorage.setItem('encryptionHistory', JSON.stringify(stored.slice(0, 100))); // Keep last 100
      
      setResults(response.data);
      setCurrentRound(0);
      toast.success('Encryption completed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Encryption failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const saveKey = () => {
    const keyData = `AES Encryption Key\nKey Size: ${keySize} bits\nMode: ${keyMode}\n\nKey: ${cleanedKey}\n\nGenerated: ${new Date().toISOString()}\n\n⚠️ IMPORTANT: Keep this file secure!`;
    
    const blob = new Blob([keyData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aes-key-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Key saved to file!');
  };

  const downloadResults = () => {
    if (!results) return;
    
    const data = {
      input: { message, key, keySize, keyMode },
      output: results,
      timestamp: new Date().toISOString(),
      version: '2.0.0'
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
    { id: 'matrix', label: 'Matrix View', icon: Lock }
  ];

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
            <span className="gradient-text">AES Encryption</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-4">
            Encrypt your data with AES-128, AES-192, or AES-256 and watch every step of the process
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400" />
              <span>File Encryption</span>
            </span>
            <span className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400" />
              <span>Password Keys</span>
            </span>
            <span className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400" />
              <span>Real-time Visualization</span>
            </span>
          </div>
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
                <Lock className="h-6 w-6 mr-3 text-cyan-600 dark:text-cyan-400" />
                Encryption Input
              </h2>

              {/* AES Variant Selection */}
              <div className="mb-6">
                <label className="block text-gray-900 dark:text-white font-medium mb-3">AES Variant</label>
                <div className="grid grid-cols-3 gap-2">
                  {['128', '192', '256'].map((size) => (
                    <motion.button
                      key={size}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setKeySize(size)}
                      className={`p-3 rounded-lg font-semibold transition-all duration-300 ${
                        keySize === size
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                          : 'glass text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                      }`}
                    >
                      AES-{size}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="mb-6">
                <label className="block text-gray-900 dark:text-white font-medium mb-3 flex items-center">
                  Message (16 bytes in Hexadecimal)
                  <div className="group relative ml-2">
                    <Info className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 dark:bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-gray-700 shadow-lg">
                      Enter exactly 32 hexadecimal characters (0-9, A-F) representing 16 bytes of data.
                    </div>
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cleanedMessage}
                    onChange={(e) => {
                      const cleaned = cleanHex(e.target.value);
                      if (cleaned.length <= 32) {
                        setMessage(cleaned);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !loading && cleanedMessage.length === 32 && cleanedKey.length === parseInt(keySize)/4) {
                        handleEncrypt();
                      }
                    }}
                    placeholder="e.g., 54776F204F6E65204E696E652054776F"
                    className={`input-clean w-full p-4 rounded-lg font-mono transition-all ${
                      cleanedMessage.length === 32 
                        ? 'border-green-500/50 bg-green-500/5' 
                        : cleanedMessage.length > 0 && cleanedMessage.length < 32
                        ? 'border-yellow-500/50 bg-yellow-500/5'
                        : ''
                    }`}
                    maxLength={32}
                    inputMode="latin"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <div className={`absolute top-2 right-2 text-xs transition-colors ${
                    cleanedMessage.length === 32 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {cleanedMessage.length}/32
                  </div>
                  {cleanedMessage.length === 32 && (
                    <div className="absolute bottom-2 right-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Key Mode Toggle */}
              <div className="mb-4">
                <label className="block text-gray-900 dark:text-white font-medium mb-3 flex items-center relative">
                  Key Input Method
                  <div className="group relative ml-2">
                    <Info className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-help" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-2 bg-gray-800 dark:bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none border border-gray-700 whitespace-normal shadow-lg">
                      Choose between hexadecimal key or password-based key derivation (PBKDF2).
                    </div>
                  </div>
                </label>
                <div className="grid grid-cols-2 gap-2 relative z-20">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => { 
                      e.preventDefault();
                      e.stopPropagation();
                      setKeyMode('hex'); 
                      setUsePassword(false); 
                    }}
                    className={`p-2 rounded-lg font-semibold text-sm transition-all cursor-pointer ${
                      keyMode === 'hex'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                        : 'glass text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    type="button"
                  >
                    Hexadecimal
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => { 
                      e.preventDefault();
                      e.stopPropagation();
                      setKeyMode('password'); 
                      setUsePassword(true); 
                    }}
                    className={`p-2 rounded-lg font-semibold text-sm transition-all cursor-pointer ${
                      keyMode === 'password'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'glass text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    type="button"
                  >
                    Password
                  </motion.button>
                </div>
              </div>

              {/* Key Input - Hex Mode */}
              {keyMode === 'hex' && (
                <div className="mb-6">
                  <label className="block text-gray-900 dark:text-white font-medium mb-3 flex items-center">
                    Key (Hexadecimal)
                    <div className="group relative ml-2">
                      <Info className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 dark:bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-gray-700 shadow-lg">
                        Enter {parseInt(keySize)/4} hexadecimal characters for AES-{keySize}. Use the example buttons below for test vectors.
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={generateRandomKey}
                      className="ml-auto p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all"
                      title="Generate Random Key"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </motion.button>
                </label>
                <div className="relative">
                  <input
                    type="text"
                      value={cleanedKey}
                      onChange={(e) => {
                        const cleaned = cleanHex(e.target.value);
                        const maxLen = parseInt(keySize)/4;
                        if (cleaned.length <= maxLen) {
                          setKey(cleaned);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !loading && cleanedMessage.length === 32 && cleanedKey.length === parseInt(keySize)/4) {
                          handleEncrypt();
                        }
                      }}
                    placeholder={`Enter ${parseInt(keySize)/4} hex characters`}
                      className={`input-clean w-full p-4 rounded-lg font-mono transition-all ${
                        cleanedKey.length === parseInt(keySize)/4 
                          ? 'border-green-500/50 bg-green-500/5' 
                          : cleanedKey.length > 0 && cleanedKey.length < parseInt(keySize)/4
                          ? 'border-yellow-500/50 bg-yellow-500/5'
                          : ''
                      }`}
                    maxLength={parseInt(keySize)/4}
                    inputMode="latin"
                    autoComplete="off"
                    spellCheck={false}
                  />
                    <div className={`absolute top-2 right-2 text-xs transition-colors ${
                      cleanedKey.length === parseInt(keySize)/4 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {cleanedKey.length}/{parseInt(keySize)/4}
                    </div>
                    {cleanedKey.length === parseInt(keySize)/4 && (
                      <div className="absolute bottom-2 right-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Key Input - Password Mode */}
              {keyMode === 'password' && (
                <div className="mb-6">
                  <label className="block text-gray-900 dark:text-white font-medium mb-3 flex items-center">
                    Password
                    <div className="group relative ml-2">
                      <Info className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 dark:bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-gray-700 shadow-lg">
                        Your password will be converted to a secure key using PBKDF2 with 100,000 iterations.
                      </div>
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter a strong password"
                      className="input-clean w-full p-4 rounded-lg transition-all"
                      autoComplete="new-password"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </motion.button>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={deriveKeyFromPassword}
                    disabled={!password || loading}
                    className="w-full mt-3 p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Derive Key from Password
                  </motion.button>
                  {cleanedKey.length === parseInt(keySize)/4 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-2 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-green-300">Key derived successfully!</span>
                    </motion.div>
                  )}
              </div>
              )}

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-gray-900 dark:text-white font-medium mb-3 flex items-center">
                  <File className="h-4 w-4 mr-2" />
                  File Encryption
                  <div className="group relative ml-2">
                    <Info className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 dark:bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-gray-700 shadow-lg">
                      Encrypt files of any type using AES with CBC mode. Files are encrypted and automatically downloaded.
                    </div>
                  </div>
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {selectedFile ? (
                      <div className="space-y-2">
                        <FileText className="h-12 w-12 mx-auto text-green-400" />
                        <div className="font-semibold text-white">{selectedFile.name}</div>
                        <div className="text-sm text-gray-400">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => { e.stopPropagation(); encryptFile(); }}
                          disabled={loading || (keyMode === 'hex' && cleanedKey.length !== parseInt(keySize)/4) || (keyMode === 'password' && !password)}
                          className="mt-3 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Encrypting...' : 'Encrypt File'}
                        </motion.button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                        <div className="text-gray-900 dark:text-white font-medium mb-1">Drag & drop a file here</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">or click to browse</div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Example Buttons */}
              <div className="mb-6">
                <label className="block text-gray-900 dark:text-white font-medium mb-3">Quick Examples</label>
                <div className="space-y-2">
                  {Object.entries(examples).map(([size, example]) => (
                    <motion.button
                      key={size}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleExample(size)}
                      className="w-full p-3 text-left glass rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/20 transition-all duration-300 border-clean"
                    >
                      <div className="font-semibold">AES-{size}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{example.description}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Key Actions */}
              {cleanedKey.length === parseInt(keySize)/4 && (
                <div className="mb-6 flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => copyToClipboard(cleanedKey, 'Key')}
                    className="flex-1 p-3 glass rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/20 transition-all border-clean flex items-center justify-center"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Key
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={saveKey}
                    className="flex-1 p-3 glass rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/20 transition-all border-clean flex items-center justify-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Key
                  </motion.button>
                </div>
              )}

              {/* Advanced Options */}
              <div className="mb-6">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full p-3 glass rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/20 transition-all duration-300 border-clean"
                >
                  <span className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Advanced Options
                  </span>
                  {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                
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
                        className="w-4 h-4 text-cyan-600 bg-white/10 border-gray-300 dark:border-white/20 rounded focus:ring-cyan-500"
                      />
                      <label htmlFor="auto-play" className="text-gray-900 dark:text-white">Auto-play animation</label>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Encryption History */}
              {encryptionHistory.length > 0 && (
                <div className="mb-6">
                  <label className="block text-gray-900 dark:text-white font-medium mb-3 flex items-center">
                    <History className="h-4 w-4 mr-2" />
                    Recent Encryptions
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {encryptionHistory.slice(0, 5).map((entry) => (
                      <div key={entry.id} className="p-2 glass rounded-lg text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {entry.type === 'file' ? (
                              <File className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
                            ) : (
                              <FileText className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                            )}
                            <span className="text-gray-900 dark:text-white truncate">
                              {entry.type === 'file' ? entry.filename : 'Text Encryption'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        <div className="mt-1 flex items-center space-x-3 text-gray-500 dark:text-gray-400">
                          <span>AES-{entry.keySize}</span>
                          <span>•</span>
                          <span>{entry.speed}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Encrypt Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEncrypt}
                disabled={loading || cleanedMessage.length !== 32 || cleanedKey.length !== parseInt(keySize)/4}
                className={`btn-primary w-full p-4 rounded-lg font-semibold text-lg flex items-center justify-center transition-all ${
                  loading || cleanedMessage.length !== 32 || cleanedKey.length !== parseInt(keySize)/4
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
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
                    <span className="ml-2 text-xs opacity-75">(Press Enter)</span>
                  </>
                )}
              </motion.button>
              
              {/* Validation Status */}
              {cleanedMessage.length === 32 && cleanedKey.length === parseInt(keySize)/4 && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center space-x-2"
                >
                  <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-700 dark:text-green-300">Ready to encrypt!</span>
                </motion.div>
              )}
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
              <div className="glass rounded-2xl p-6 border-clean">
                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <CheckCircle className="h-6 w-6 mr-3 text-green-600 dark:text-green-400" />
                    Encryption Results
                  </h2>
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyToClipboard(results.final_ciphertext, 'Ciphertext')}
                      className="p-2 glass rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/20 transition-all duration-300 border-clean"
                      title="Copy Ciphertext"
                    >
                      <Copy className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={downloadResults}
                      className="p-2 glass rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/20 transition-all duration-300 border-clean"
                      title="Download Results"
                    >
                      <Download className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Encryption Info */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-3 bg-cyan-500/20 rounded-lg">
                    <div className="text-xs text-cyan-700 dark:text-cyan-300 mb-1">Key Size</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">AES-{keySize}</div>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <div className="text-xs text-purple-700 dark:text-purple-300 mb-1">Key Mode</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">{keyMode}</div>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <div className="text-xs text-green-700 dark:text-green-300 mb-1">Status</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Success
                    </div>
                  </div>
                </div>

                {/* Final Ciphertext */}
                <div className="mb-6 p-4 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-lg border border-green-500/30">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Final Ciphertext</h3>
                  <div className="font-mono text-green-700 dark:text-green-300 text-lg break-all">
                    {results.final_ciphertext}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => copyToClipboard(results.final_ciphertext, 'Ciphertext')}
                    className="mt-3 px-4 py-2 bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-500/30 transition-all flex items-center"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Ciphertext
                  </motion.button>
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
                            ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                  {activeTab === 'rounds' && (
                    <RoundVisualization 
                      rounds={results.rounds}
                      autoPlay={autoPlay}
                      currentRound={currentRound}
                      setCurrentRound={setCurrentRound}
                    />
                  )}

                  {activeTab === 'keys' && (
                    <KeyExpansion keys={results.expanded_key} />
                  )}

                  {activeTab === 'matrix' && (
                    <MatrixVisualization 
                      initialState={results.initial_state}
                      rounds={results.rounds}
                      currentRound={currentRound}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="glass rounded-2xl p-12 border-clean text-center">
                <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  No Results Yet
                </h3>
                <p className="text-gray-400">
                  Enter your message and key, then click 'Encrypt Message' to see the results
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Encrypt;
