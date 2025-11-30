import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Unlock, 
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
  Clock,
  RefreshCw,
  Save,
  History,
  X,
  ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import jsPDF from 'jspdf';
import MatrixVisualization from '../components/MatrixVisualization';
import RoundVisualization from '../components/RoundVisualization';
import KeyExpansion from '../components/KeyExpansion';
import { saveHistory, getHistoryPassword, loadHistorySafely, isHistoryEncrypted, decryptHistory } from '../utils/historyEncryption';

const Decrypt = () => {
  const [ciphertext, setCiphertext] = useState('');
  const [key, setKey] = useState('');
  const [iv, setIv] = useState('');
  const [keySize, setKeySize] = useState('128');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('rounds');
  const [currentRound, setCurrentRound] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [showIV, setShowIV] = useState(false);
  const [decryptionHistory, setDecryptionHistory] = useState([]);
  const [keyMode, setKeyMode] = useState('hex'); // 'hex' or 'password'
  const [mode, setMode] = useState('CBC'); // 'CBC', 'ECB', 'CTR', 'CFB', 'OFB', 'XTS', 'GCM'
  const [nonce, setNonce] = useState('');
  const [showAdvancedModes, setShowAdvancedModes] = useState(false);
  const [inputMode, setInputMode] = useState('text'); // 'text' or 'file'
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  // Check if password is set and show prompt on first visit
  useEffect(() => {
    const hasPassword = isHistoryEncrypted();
    const hasSeenPrompt = localStorage.getItem('decryptPasswordPromptSeen') === 'true';
    
    if (!hasPassword && !hasSeenPrompt) {
      setShowPasswordPrompt(true);
    }
  }, []);

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = loadHistorySafely('decryptionHistory');
    setDecryptionHistory(stored.slice(0, 10)); // Show last 10 in sidebar
  }, []);

  // Sanitize any hex input: strip whitespace and non-hex, uppercase
  const cleanHex = (value) => (value || '')
    .replace(/\s+/g, '')
    .replace(/[^0-9a-fA-F]/g, '')
    .toUpperCase();
  
  // Computed values for display
  const cleanedCiphertext = cleanHex(ciphertext);
  const cleanedKey = cleanHex(key);
  const cleanedIV = cleanHex(iv);

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
      const response = await axios.post('/api/generate-key', 
        { key_size: keySize },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      setKey(response.data.key);
      if (response.data.iv) {
        setIv(response.data.iv);
      }
      toast.success('Secure random key generated!');
    } catch (error) {
      console.error('Generate key error:', error);
      console.error('Error response:', error.response);
      toast.error('Failed to generate key: ' + (error.response?.data?.error || error.message || 'Unknown error'));
    }
  };

  const generateRandomIV = () => {
    // XTS mode requires 16 bytes (32 hex chars), other modes can use 16 bytes
    const byteLength = mode === 'XTS' ? 16 : 16;
    const randomBytes = new Uint8Array(byteLength);
    crypto.getRandomValues(randomBytes);
    const hexIV = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0').toUpperCase())
      .join('');
    setIv(hexIV);
    toast.success(mode === 'XTS' ? 'Random Tweak generated!' : 'Random IV generated!');
  };

  const generateRandomNonce = () => {
    const randomBytes = new Uint8Array(12);
    crypto.getRandomValues(randomBytes);
    const hexNonce = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0').toUpperCase())
      .join('');
    setNonce(hexNonce);
    toast.success('Random nonce generated!');
  };


  const generateRandomCiphertext = () => {
    // Generate random bytes (any length from 1-32 bytes, 2-64 hex characters)
    const byteLength = Math.floor(Math.random() * 32) + 1; // 1-32 bytes
    const randomBytes = new Uint8Array(byteLength);
    crypto.getRandomValues(randomBytes);
    const hexCiphertext = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0').toUpperCase())
      .join('');
    setCiphertext(hexCiphertext);
    toast.success(`Random ciphertext generated! (${hexCiphertext.length} hex characters = ${byteLength} bytes)`);
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
      if (response.data.salt && mode === 'CBC') {
        setIv(response.data.salt);
      }
      localStorage.setItem('lastSalt', response.data.salt);
      toast.success('Key derived from password successfully!');
      setUsePassword(false);
    } catch (error) {
      toast.error('Key derivation failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const decryptFile = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    let finalKey = cleanedKey;
    let finalIV = cleanedIV;

    // If using password, derive key first
    if (usePassword && password) {
      try {
        const response = await axios.post('/api/derive-key', { 
          password, 
          key_size: keySize 
        });
        finalKey = response.data.key;
        if (mode === 'CBC' && !cleanedIV) {
          finalIV = response.data.salt;
        }
      } catch (error) {
        toast.error('Key derivation failed');
        return;
      }
    } else if (cleanedKey.length !== parseInt(keySize) / 4) {
      toast.error(`Key must be exactly ${parseInt(keySize) / 4} hex characters`);
      return;
    }

    if (mode === 'CBC' && !finalIV) {
      toast.error('IV is required for CBC mode decryption');
      return;
    }

    setLoading(true);
    const startTime = performance.now();

    try {
      // Check if it's a text file (ends with .txt)
      const isTextFile = selectedFile.name.toLowerCase().endsWith('.txt');
      let response;

      if (isTextFile) {
        // Read file as binary (ArrayBuffer) to handle encrypted binary data
        const fileBuffer = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsArrayBuffer(selectedFile);
        });
        
        const fileBytes = new Uint8Array(fileBuffer);
        let encryptedBytes;
        let extractedIV = finalIV;
        let detectedMode = mode;
        
        // Check if file starts with IV (16 bytes) - indicates CBC mode
        // Try CBC mode first: first 16 bytes are IV, rest is encrypted data
        if (fileBytes.length >= 16 && mode === 'CBC') {
          // Extract first 16 bytes as IV
          const ivBytes = fileBytes.slice(0, 16);
          extractedIV = Array.from(ivBytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase();
          
          // Rest is encrypted data
          encryptedBytes = fileBytes.slice(16);
          detectedMode = 'CBC';
        } else {
          // ECB mode or no IV: entire file is encrypted data
          encryptedBytes = fileBytes;
          detectedMode = mode === 'ECB' ? 'ECB' : mode;
        }
        
        // Convert encrypted bytes to base64 for decrypt-file endpoint
        const binaryString = String.fromCharCode(...encryptedBytes);
        const fileBase64 = btoa(binaryString);
        
        // Use decrypt-file endpoint (supports both ECB and CBC with IV)
        response = await axios.post('/api/decrypt-file', {
          fileData: fileBase64,
          filename: selectedFile.name,
          key: finalKey,
          key_size: keySize,
          mode: detectedMode,
          iv: detectedMode === 'CBC' ? (extractedIV || finalIV) : undefined
        });
        
        // Convert decrypted base64 back to text
        const binaryString2 = atob(response.data.decryptedData);
        const decryptedBytes = new Uint8Array(binaryString2.length);
        for (let i = 0; i < binaryString2.length; i++) {
          decryptedBytes[i] = binaryString2.charCodeAt(i);
        }
        const plaintext = new TextDecoder('utf-8').decode(decryptedBytes);
        
        // Download as text file with plaintext
        const blob = new Blob([plaintext], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = selectedFile.name.replace('_encrypted.txt', '_decrypted.txt').replace('.txt', '_decrypted.txt');
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Binary file - use file decryption API
        const fileBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result.split(',')[1] || reader.result;
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });

        response = await axios.post('/api/decrypt-file', {
          fileData: fileBase64,
          filename: selectedFile.name,
          key: finalKey,
          key_size: keySize,
          mode: mode,
          iv: finalIV
        });

        // Download decrypted binary file
        const binaryString = atob(response.data.decryptedData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = selectedFile.name.replace(/\.aes$/i, '');
        a.click();
        URL.revokeObjectURL(url);
      }

      const endTime = performance.now();
      const speed = ((selectedFile.size / 1024) / ((endTime - startTime) / 1000)).toFixed(2);

      // Add to history
      const historyEntry = {
        id: Date.now(),
        type: 'file',
        filename: selectedFile.name,
        keySize,
        mode,
        timestamp: new Date().toISOString(),
        speed: speed + ' KB/s',
        fileSize: selectedFile.size
      };
      setDecryptionHistory([historyEntry, ...decryptionHistory.slice(0, 9)]);
      
      // Save to localStorage with optional encryption
      // Check if history is encrypted before loading
      const existingData = localStorage.getItem('decryptionHistory');
      const isEncrypted = existingData && existingData !== '[]' && !existingData.startsWith('[');
      const password = getHistoryPassword() || sessionStorage.getItem('historyPassword');
      
      let stored = [];
      if (isEncrypted && password) {
        // Decrypt existing history, add new entry, then re-encrypt
        try {
          stored = await decryptHistory(existingData, password);
        } catch (error) {
          console.error('Failed to decrypt history for update:', error);
          stored = [];
        }
      } else {
        // Load plain history
        stored = loadHistorySafely('decryptionHistory');
      }
      
      stored.unshift(historyEntry);
      await saveHistory('decryptionHistory', stored.slice(0, 100), password);

      toast.success(`File decrypted successfully! (${speed} KB/s)`);
      setSelectedFile(null);
    } catch (error) {
      toast.error('File decryption failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    const cleanCiphertext = cleanedCiphertext;
    const cleanKey = cleanedKey;

    if (!cleanCiphertext || !cleanKey) {
      toast.error('Please enter both ciphertext and key');
      return;
    }

    const expectedLength = parseInt(keySize) / 4;
    if (cleanKey.length !== expectedLength) {
      toast.error(`Key must be exactly ${expectedLength} hex characters for AES-${keySize}`);
      return;
    }

    // Auto-pad odd-length hex strings with a leading zero
    const processedCiphertext = cleanCiphertext.length % 2 !== 0 ? '0' + cleanCiphertext : cleanCiphertext;
    
    if (processedCiphertext.length === 0) {
      toast.error('Please enter ciphertext');
      return;
    }

    const hexRegex = /^[0-9A-F]+$/;
    if (!hexRegex.test(processedCiphertext)) {
      toast.error('Ciphertext contains non-hex characters');
      return;
    }
    if (!hexRegex.test(cleanKey)) {
      toast.error('Key contains non-hex characters');
      return;
    }

    setLoading(true);
    const startTime = performance.now();
    
    try {
      const response = await axios.post('/api/decrypt', {
        ciphertext: processedCiphertext,
        key: cleanKey,
        key_size: keySize
      });
      
      const endTime = performance.now();
      const speed = ((processedCiphertext.length / 2 / 1024) / ((endTime - startTime) / 1000)).toFixed(2);
      
      // Add to history (without sensitive data - fullCiphertext and fullPlaintext removed)
      const historyEntry = {
        id: Date.now(),
        type: 'text',
        ciphertext: processedCiphertext.length > 16 ? processedCiphertext.substring(0, 16) + '...' : processedCiphertext,
        keySize,
        timestamp: new Date().toISOString(),
        speed: speed + ' KB/s',
        plaintext: response.data.final_plaintext?.length > 16 ? response.data.final_plaintext.substring(0, 16) + '...' : response.data.final_plaintext
        // Removed: fullCiphertext, fullPlaintext (sensitive data)
      };
      setDecryptionHistory([historyEntry, ...decryptionHistory.slice(0, 9)]);
      
      // Save to localStorage with optional encryption
      // Check if history is encrypted before loading
      const existingData = localStorage.getItem('decryptionHistory');
      const isEncrypted = existingData && existingData !== '[]' && !existingData.startsWith('[');
      const password = getHistoryPassword() || sessionStorage.getItem('historyPassword');
      
      let stored = [];
      if (isEncrypted && password) {
        // Decrypt existing history, add new entry, then re-encrypt
        try {
          stored = await decryptHistory(existingData, password);
        } catch (error) {
          console.error('Failed to decrypt history for update:', error);
          stored = [];
        }
      } else {
        // Load plain history
        stored = loadHistorySafely('decryptionHistory');
      }
      
      stored.unshift(historyEntry);
      await saveHistory('decryptionHistory', stored.slice(0, 100), password);
      
      setResults(response.data);
      setCurrentRound(0);
      toast.success('Decryption completed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Decryption failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const saveKey = () => {
    const keyData = `AES Decryption Key\nKey Size: ${keySize} bits\nMode: ${keyMode}\n\nKey: ${cleanedKey}\n${mode === 'CBC' ? `IV: ${cleanedIV}\n` : ''}\nGenerated: ${new Date().toISOString()}\n\n⚠️ IMPORTANT: Keep this file secure!`;
    
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
      input: { ciphertext, key, keySize, keyMode, mode, iv: mode === 'CBC' ? iv : null },
      output: results,
      timestamp: new Date().toISOString(),
      version: '2.0.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aes-decryption-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Results downloaded!');
  };

  const exportToPDF = () => {
    if (!results) return;
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = margin;
      const lineHeight = 7;
      const maxWidth = pageWidth - (margin * 2);

      // Helper function to add text with word wrap
      const addText = (text, fontSize = 10, isBold = false, color = [0, 0, 0]) => {
        doc.setFontSize(fontSize);
        doc.setTextColor(color[0], color[1], color[2]);
        if (isBold) {
          doc.setFont(undefined, 'bold');
        } else {
          doc.setFont(undefined, 'normal');
        }
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line) => {
          if (yPos > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            yPos = margin;
          }
          doc.text(line, margin, yPos);
          yPos += lineHeight;
        });
        yPos += 3; // Add spacing after text block
      };

      // Title
      addText('AES Decryption Results', 18, true, [147, 51, 234]);
      yPos += 5;

      // Timestamp
      addText(`Generated: ${new Date().toLocaleString()}`, 10, false, [128, 128, 128]);
      yPos += 5;

      // Decryption Details
      addText('Decryption Details', 14, true, [0, 0, 0]);
      addText(`Key Size: AES-${keySize}`, 10);
      addText(`Key Mode: ${keyMode === 'hex' ? 'Hexadecimal' : 'Password'}`, 10);
      addText(`Decryption Mode: ${mode}`, 10);
      if (mode === 'CBC' && iv) {
        addText(`IV: ${iv}`, 10);
      }
      yPos += 5;

      // Input
      addText('Input', 14, true, [0, 0, 0]);
      if (inputMode === 'text') {
        addText(`Ciphertext: ${ciphertext || 'N/A'}`, 10);
      } else {
        addText(`File: ${selectedFile ? selectedFile.name : 'N/A'}`, 10);
      }
      addText(`Key: ${key.substring(0, 32)}${key.length > 32 ? '...' : ''}`, 10);
      yPos += 5;

      // Output
      addText('Output', 14, true, [0, 0, 0]);
      const plaintext = results.final_plaintext || 'N/A';
      addText(`Plaintext: ${plaintext}`, 10);
      yPos += 5;

      // Round Information
      if (results.rounds && results.rounds.length > 0) {
        addText('Decryption Rounds', 14, true, [0, 0, 0]);
        addText(`Total Rounds: ${results.rounds.length}`, 10);
        yPos += 5;
      }

      // Key Expansion
      if (results.expanded_key && results.expanded_key.length > 0) {
        addText('Key Expansion', 14, true, [0, 0, 0]);
        addText(`Expanded Key Length: ${results.expanded_key.length} bytes`, 10);
        yPos += 5;
      }

      // Footer
      yPos = doc.internal.pageSize.getHeight() - 20;
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('AES Decryption Tool v2.0.0', margin, yPos);
      doc.text('Keep this document secure!', pageWidth - margin - 50, yPos, { align: 'right' });

      // Save PDF
      doc.save(`aes-decryption-${Date.now()}.pdf`);
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF: ' + error.message);
    }
  };

  const tabs = [
    { id: 'rounds', label: 'Decryption Rounds', icon: Eye },
    { id: 'keys', label: 'Key Expansion', icon: Key },
    { id: 'matrix', label: 'Matrix View', icon: Lock }
  ];

  return (
    <div className="pt-16 min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Password Setup Prompt Modal - Shows once on first visit */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-8 border-clean max-w-md w-full"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Lock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Set History Password
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Protect your decryption history
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPasswordPrompt(false);
                  localStorage.setItem('decryptPasswordPromptSeen', 'true');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                To protect your decryption history, please set a password on the History page first. This will encrypt and secure all your encryption/decryption records.
              </p>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <Info className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <p className="font-medium mb-1">Why set a password?</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                      <li>Encrypts your history data</li>
                      <li>Protects sensitive information</li>
                      <li>Required for secure storage</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Link
                to="/history"
                onClick={() => {
                  setShowPasswordPrompt(false);
                  localStorage.setItem('decryptPasswordPromptSeen', 'true');
                }}
                className="flex-1"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Go to History</span>
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowPasswordPrompt(false);
                  localStorage.setItem('decryptPasswordPromptSeen', 'true');
                }}
                className="px-4 py-3 glass text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
              >
                Maybe Later
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            <span className="gradient-text">AES Decryption</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-4">
            Decrypt your encrypted data with AES-128, AES-192, or AES-256 and watch every step of the process
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400" />
              <span>File Decryption</span>
            </span>
            <span className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400" />
              <span>CBC/ECB Support</span>
            </span>
            <span className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400" />
              <span>Step-by-step View</span>
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
                <Unlock className="h-6 w-6 mr-3 text-purple-600 dark:text-purple-400" />
                Decryption Input
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
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'glass text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10'
                      }`}
                    >
                      {size}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Decryption Mode Selection */}
              <div className="mb-6">
                <label className="block text-gray-900 dark:text-white font-medium mb-3 flex items-center">
                  Decryption Mode
                  <div className="group relative ml-2">
                    <Info className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-help" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-80 p-2 bg-gray-800 dark:bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none border border-gray-700 whitespace-normal shadow-lg">
                      <strong>Basic:</strong> CBC (recommended), ECB<br/>
                      <strong>Advanced:</strong> CTR (streaming), CFB, OFB, XTS (disk), GCM (authenticated)
                    </div>
                  </div>
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {['CBC', 'ECB'].map((m) => (
                    <motion.button
                      key={m}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setMode(m)}
                      className={`p-2 rounded-lg font-semibold text-sm transition-all ${
                        mode === m
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'glass text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                      }`}
                    >
                      {m}
                    </motion.button>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAdvancedModes(!showAdvancedModes)}
                  className="w-full p-2 rounded-lg text-sm font-semibold glass text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center"
                >
                  {showAdvancedModes ? 'Hide' : 'Show'} Advanced Modes
                  {showAdvancedModes ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                </motion.button>
                {showAdvancedModes && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 grid grid-cols-2 gap-2"
                  >
                    {['CTR', 'CFB', 'OFB', 'XTS', 'GCM'].map((m) => (
                      <motion.button
                        key={m}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setMode(m)}
                        className={`p-2 rounded-lg font-semibold text-xs transition-all ${
                          mode === m
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : 'glass text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                        }`}
                      >
                        {m}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* IV/Nonce Input (for modes that need it) */}
              {(mode === 'CBC' || mode === 'CFB' || mode === 'OFB' || mode === 'GCM' || mode === 'XTS') && (
                <div className="mb-6">
                  <label className="block text-gray-900 dark:text-white font-medium mb-3 flex items-center">
                    {mode === 'XTS' ? 'Tweak (for XTS mode)' : 'IV (Initialization Vector)'}
                    <div className="group relative ml-2">
                      <Info className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 dark:bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-gray-700 shadow-lg">
                        {mode === 'XTS' 
                          ? 'XTS mode uses a tweak value (similar to IV) for disk encryption. Enter 32 hex characters (16 bytes).'
                          : 'Enter any length hex characters (will be padded automatically)'}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={generateRandomIV}
                      className="ml-2 p-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded text-xs font-semibold hover:from-green-600 hover:to-emerald-700"
                    >
                      Generate
                    </motion.button>
                  </label>
                  <input
                    type="text"
                    value={iv}
                    onChange={(e) => setIv(e.target.value.toUpperCase())}
                    placeholder={mode === 'XTS' ? 'Enter 32 hex characters (16 bytes) for tweak' : 'Enter any length hex characters (will be padded automatically)'}
                    className="input-clean w-full p-3 rounded-lg font-mono text-sm"
                    maxLength={mode === 'XTS' ? 32 : undefined}
                  />
                </div>
              )}

              {/* Nonce Input (for CTR mode) */}
              {mode === 'CTR' && (
                <div className="mb-6">
                  <label className="block text-gray-900 dark:text-white font-medium mb-3 flex items-center">
                    Nonce (for CTR mode)
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={generateRandomNonce}
                      className="ml-2 p-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded text-xs font-semibold hover:from-green-600 hover:to-emerald-700"
                    >
                      Generate
                    </motion.button>
                  </label>
                  <input
                    type="text"
                    value={nonce}
                    onChange={(e) => setNonce(e.target.value.toUpperCase())}
                    placeholder="Enter 24 hex characters (12 bytes)"
                    className="input-clean w-full p-3 rounded-lg font-mono text-sm"
                    maxLength={24}
                  />
                </div>
              )}

              {/* Ciphertext Input / File Upload */}
              <div className="mb-6">
                <label className="block text-gray-900 dark:text-white font-medium mb-3 flex items-center">
                  Input Method
                  <div className="group relative ml-2">
                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none border border-gray-700 whitespace-normal shadow-lg">
                      Choose to decrypt a text ciphertext or upload an encrypted file.
                    </div>
                  </div>
                </label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setInputMode('text');
                      setSelectedFile(null);
                    }}
                    className={`p-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center ${
                      inputMode === 'text'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                        : 'glass text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10'
                    }`}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Text Ciphertext
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setInputMode('file');
                      setCiphertext('');
                    }}
                    className={`p-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center ${
                      inputMode === 'file'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'glass text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10'
                    }`}
                  >
                    <File className="h-4 w-4 mr-2" />
                    File Upload
                  </motion.button>
                </div>

                {/* Text Input Mode */}
                {inputMode === 'text' && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={generateRandomCiphertext}
                      className="w-full mb-3 p-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all flex items-center justify-center"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Generate Random Ciphertext
                    </motion.button>
                <div className="relative">
                      <textarea
                    value={cleanedCiphertext}
                    onChange={(e) => {
                      const cleaned = cleanHex(e.target.value);
                        setCiphertext(cleaned);
                    }}
                    onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey && !loading && cleanedCiphertext.length > 0 && cleanedKey.length === parseInt(keySize)/4) {
                        handleDecrypt();
                      }
                    }}
                        placeholder="Enter your ciphertext in hexadecimal format (e.g., 29C3505F571420F6402299B31A02D73A) or use the button above to generate one"
                        className={`input-clean w-full p-4 rounded-lg font-mono transition-all min-h-[100px] ${
                          cleanedCiphertext.length > 0 
                        ? 'border-green-500/50 bg-green-500/5' 
                        : ''
                    }`}
                    inputMode="latin"
                    autoComplete="off"
                    spellCheck={false}
                        rows={4}
                  />
                      <div className={`absolute top-2 right-2 text-xs transition-colors z-10 ${
                        cleanedCiphertext.length > 0 ? 'text-green-400' : 'text-gray-400'
                  }`}>
                        {cleanedCiphertext.length} characters
                  </div>
                      {cleanedCiphertext.length > 0 && (
                        <div className="absolute bottom-2 right-2 z-10">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    </div>
                  )}
                </div>
                    <p className="mt-2 text-xs text-gray-400">
                      💡 Tip: Enter any hexadecimal characters (0-9, A-F). Any length is supported - ciphertext will be processed in 16-byte blocks.
                    </p>
                  </>
                )}

                {/* File Upload Mode */}
                {inputMode === 'file' && (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
                      isDragging
                        ? 'border-purple-500 bg-purple-500/10'
                        : selectedFile
                        ? 'border-green-500/50 bg-green-500/5'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload-decrypt"
                    />
                    <label htmlFor="file-upload-decrypt" className="cursor-pointer">
                      {selectedFile ? (
                        <div className="space-y-3">
                          <FileText className="h-12 w-12 mx-auto text-green-400" />
                          <div className="font-semibold text-gray-900 dark:text-white">{selectedFile.name}</div>
                          <div className="text-sm text-gray-400">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              e.preventDefault();
                              decryptFile(); 
                            }}
                            disabled={loading || (keyMode === 'hex' && cleanedKey.length !== parseInt(keySize)/4) || (keyMode === 'password' && !password) || (mode === 'CBC' && cleanedIV.length !== 32)}
                            className="mt-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? 'Decrypting...' : 'Decrypt File'}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              e.preventDefault();
                              setSelectedFile(null);
                            }}
                            className="mt-1 px-4 py-2 glass text-gray-300 rounded-lg font-semibold hover:bg-white/10"
                          >
                            Remove File
                          </motion.button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <div className="text-gray-900 dark:text-white font-medium mb-1">Drag & drop an encrypted file here</div>
                          <div className="text-sm text-gray-400">or click to browse</div>
                        </div>
                      )}
                    </label>
                  </div>
                )}
              </div>

              {/* Key Mode Toggle */}
              <div className="mb-4">
                <label className="block text-gray-900 dark:text-white font-medium mb-3 flex items-center relative">
                  Key Input Method
                  <div className="group relative ml-2">
                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none border border-gray-700 whitespace-normal shadow-lg">
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
                        : 'glass text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10'
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
                        : 'glass text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10'
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
                      <Info className="h-4 w-4 text-gray-400 cursor-help" />
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none border border-gray-700 shadow-lg whitespace-normal">
                        Enter {parseInt(keySize)/4} hexadecimal characters for AES-{keySize}.
                      </div>
                    </div>
                  </label>
                    <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                      onClick={generateRandomKey}
                    className="w-full mb-3 p-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all flex items-center justify-center"
                    >
                    <Key className="h-4 w-4 mr-2" />
                    Generate Random Key
                    </motion.button>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={cleanedKey}
                      onChange={(e) => {
                        const cleaned = cleanHex(e.target.value);
                        const maxLen = parseInt(keySize)/4;
                        if (cleaned.length <= maxLen) {
                          setKey(cleaned);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey && !loading && cleanedCiphertext.length > 0 && cleanedKey.length === parseInt(keySize)/4) {
                          handleDecrypt();
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
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-16 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white z-10"
                      title={showKey ? 'Hide key' : 'Show key'}
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </motion.button>
                    <div className={`absolute top-2 right-2 text-xs transition-colors z-10 ${
                      cleanedKey.length === parseInt(keySize)/4 ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      {cleanedKey.length}/{parseInt(keySize)/4}
                    </div>
                    {cleanedKey.length === parseInt(keySize)/4 && (
                      <div className="absolute bottom-2 right-2 z-10">
                        <CheckCircle className="h-4 w-4 text-green-400" />
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
                      <Info className="h-4 w-4 text-gray-400 cursor-help" />
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none border border-gray-700 shadow-lg whitespace-normal">
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

              {/* IV Input (for CBC mode) */}
              {mode === 'CBC' && (
                <div className="mb-6">
                  <label className="block text-gray-900 dark:text-white font-medium mb-3 flex items-center">
                    IV (Initialization Vector)
                    <div className="group relative ml-2">
                      <Info className="h-4 w-4 text-gray-400 cursor-help" />
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none border border-gray-700 shadow-lg whitespace-normal">
                        Enter exactly 32 hexadecimal characters (16 bytes) for the IV used during encryption. Use the Generate button to create a random IV for testing.
                      </div>
                    </div>
                  </label>
                    <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={generateRandomIV}
                    className="w-full mb-3 p-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center"
                    >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate Random IV
                    </motion.button>
                  <div className="relative">
                    <input
                      type={showIV ? 'text' : 'password'}
                      value={cleanedIV}
                      onChange={(e) => {
                        const cleaned = cleanHex(e.target.value);
                        if (cleaned.length <= 32) {
                          setIv(cleaned);
                        }
                      }}
                      placeholder="Enter 32 hex characters"
                      className={`input-clean w-full p-4 rounded-lg font-mono transition-all ${
                        cleanedIV.length === 32 
                          ? 'border-green-500/50 bg-green-500/5' 
                          : cleanedIV.length > 0 && cleanedIV.length < 32
                          ? 'border-yellow-500/50 bg-yellow-500/5'
                          : ''
                      }`}
                      maxLength={32}
                      inputMode="latin"
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowIV(!showIV)}
                      className="absolute right-16 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white z-10"
                      title={showIV ? 'Hide IV' : 'Show IV'}
                    >
                      {showIV ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </motion.button>
                    <div className={`absolute top-2 right-2 text-xs transition-colors z-10 ${
                      cleanedIV.length === 32 ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      {cleanedIV.length}/32
                    </div>
                    {cleanedIV.length === 32 && (
                      <div className="absolute bottom-2 right-2 z-10">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      </div>
                    )}
                  </div>
                </div>
              )}


              {/* Key Actions */}
              {cleanedKey.length === parseInt(keySize)/4 && (
                <div className="mb-6 flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => copyToClipboard(cleanedKey, 'Key')}
                    className="flex-1 p-3 glass rounded-lg text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-all border-clean flex items-center justify-center"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Key
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={saveKey}
                    className="flex-1 p-3 glass rounded-lg text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-all border-clean flex items-center justify-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Key
                  </motion.button>
                </div>
              )}


              {/* Decryption History */}
              {decryptionHistory.length > 0 && (
                <div className="mb-6">
                  <label className="block text-gray-900 dark:text-white font-medium mb-3 flex items-center">
                    <History className="h-4 w-4 mr-2" />
                    Recent Decryptions
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {decryptionHistory.slice(0, 5).map((entry) => (
                      <div key={entry.id} className="p-2 glass rounded-lg text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {entry.type === 'file' ? (
                              <File className="h-3 w-3 text-purple-400" />
                            ) : (
                              <FileText className="h-3 w-3 text-pink-400" />
                            )}
                            <span className="text-gray-900 dark:text-white truncate">
                              {entry.type === 'file' ? entry.filename : 'Text Decryption'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        <div className="mt-1 flex items-center space-x-3 text-gray-400">
                          <span>AES-{entry.keySize}</span>
                          <span>•</span>
                          <span>{entry.speed}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Decrypt Button */}
              {inputMode === 'text' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDecrypt}
                disabled={loading || cleanedCiphertext.length === 0 || cleanedKey.length !== parseInt(keySize)/4 || (mode === 'CBC' && cleanedIV.length !== 32)}
                className={`btn-primary w-full p-4 rounded-lg font-semibold text-lg flex items-center justify-center transition-all ${
                  loading || cleanedCiphertext.length === 0 || cleanedKey.length !== parseInt(keySize)/4 || (mode === 'CBC' && cleanedIV.length !== 32)
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
                style={{ background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)' }}
              >
                {loading ? (
                  <>
                    <div className="spinner mr-3" />
                    Decrypting...
                  </>
                ) : (
                  <>
                    <Unlock className="h-5 w-5 mr-2" />
                    Decrypt Message
                      <span className="ml-2 text-xs opacity-75">(Ctrl+Enter)</span>
                  </>
                )}
              </motion.button>
              )}
              
              {/* Validation Status */}
              {inputMode === 'text' && cleanedCiphertext.length > 0 && cleanedKey.length === parseInt(keySize)/4 && (mode === 'ECB' || cleanedIV.length === 32) && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center space-x-2"
                >
                  <Sparkles className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-300">
                    Ready to decrypt! ({cleanedCiphertext.length} hex chars = {Math.ceil(cleanedCiphertext.length / 2)} bytes)
                    {cleanedCiphertext.length % 32 !== 0 && (
                      <span className="ml-2 text-xs text-gray-400">(will auto-pad to {Math.ceil(cleanedCiphertext.length / 32) * 32} hex chars)</span>
                    )}
                  </span>
                </motion.div>
              )}
              {inputMode === 'file' && selectedFile && cleanedKey.length === parseInt(keySize)/4 && (mode === 'ECB' || cleanedIV.length === 32) && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center space-x-2"
                >
                  <Sparkles className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-300">File ready! Click "Decrypt File" above.</span>
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
                    <CheckCircle className="h-6 w-6 mr-3 text-green-400" />
                    Decryption Results
                  </h2>
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyToClipboard(results.final_plaintext, 'Plaintext')}
                      className="p-2 glass rounded-lg text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-all duration-300 border-clean"
                      title="Copy Plaintext"
                    >
                      <Copy className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={downloadResults}
                      className="p-2 glass rounded-lg text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-all duration-300 border-clean"
                      title="Download Results (JSON)"
                    >
                      <Download className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={exportToPDF}
                      className="p-2 glass rounded-lg text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-all duration-300 border-clean"
                      title="Export as PDF"
                    >
                      <FileText className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Decryption Info */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <div className="text-xs text-purple-300 mb-1">Key Size</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">AES-{keySize}</div>
                  </div>
                  <div className="p-3 bg-pink-500/20 rounded-lg">
                    <div className="text-xs text-pink-300 mb-1">Key Mode</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">{keyMode}</div>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <div className="text-xs text-green-300 mb-1">Status</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Success
                    </div>
                  </div>
                </div>

                {/* Final Plaintext */}
                <div className="mb-6 p-4 bg-gradient-to-r from-green-500/20 to-purple-500/20 rounded-lg border border-green-500/30">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Final Plaintext</h3>
                  <div className="font-mono text-green-300 text-lg break-all">
                    {results.final_plaintext}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => copyToClipboard(results.final_plaintext, 'Plaintext')}
                    className="mt-3 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all flex items-center"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Plaintext
                  </motion.button>
                </div>

                {/* Tabs */}
                <div className="flex space-x-2 mb-6 border-b border-gray-700">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-4 py-2 font-medium transition-all ${
                          activeTab === tab.id
                            ? 'text-purple-400 border-b-2 border-purple-400'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content */}
                {activeTab === 'rounds' && results.rounds && (
                  <RoundVisualization
                    rounds={results.rounds}
                    currentRound={currentRound}
                    setCurrentRound={setCurrentRound}
                    autoPlay={false}
                  />
                )}

                {activeTab === 'keys' && results.expanded_key && (
                  <KeyExpansion keys={results.expanded_key} />
                )}

                {activeTab === 'matrix' && results.rounds && results.initial_state && (
                  <MatrixVisualization
                    initialState={results.initial_state}
                    rounds={results.rounds}
                    currentRound={currentRound}
                    setCurrentRound={setCurrentRound}
                  />
                )}
              </div>
            ) : (
              <div className="glass rounded-2xl p-6 border-clean">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Unlock className="h-6 w-6 mr-3 text-purple-400" />
                  Step-by-Step Guide
                </h2>
                
                <div className="space-y-4">
                  {/* Step 1 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      (inputMode === 'text' && cleanedCiphertext.length > 0) || (inputMode === 'file' && selectedFile)
                        ? 'bg-green-500/10 border-green-500/50'
                        : 'bg-gray-500/10 border-gray-500/30'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        (inputMode === 'text' && cleanedCiphertext.length > 0) || (inputMode === 'file' && selectedFile)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}>
                        {(inputMode === 'text' && cleanedCiphertext.length > 0) || (inputMode === 'file' && selectedFile) ? <CheckCircle className="h-5 w-5" /> : '1'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {inputMode === 'text' ? 'Enter Your Ciphertext' : 'Upload Your Encrypted File'}
                        </h3>
                        {inputMode === 'text' ? (
                          <>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              Choose "Text Ciphertext" mode and enter hexadecimal characters (0-9, A-F). Any length is supported - ciphertext will be automatically padded to 16-byte blocks. You can click "Generate Random Ciphertext" to create one automatically.
                            </p>
                            {cleanedCiphertext.length > 0 ? (
                              <div className="flex items-center text-green-400 text-sm">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Ciphertext is ready! ({cleanedCiphertext.length} hex chars = {Math.ceil(cleanedCiphertext.length / 2)} bytes)
                                {cleanedCiphertext.length % 2 !== 0 && (
                                  <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">(odd length - will auto-pad with leading zero)</span>
                                )}
                                {cleanedCiphertext.length % 32 !== 0 && (
                                  <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">(will auto-pad to {Math.ceil(cleanedCiphertext.length / 32) * 32} hex chars for decryption)</span>
                                )}
                              </div>
                            ) : (
                              <div className="text-gray-600 dark:text-gray-500 text-sm">
                                💡 Tip: Use the "Generate Random Ciphertext" button above for a quick start. Any length is supported!
              </div>
            )}
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              Choose "File Upload" mode and drag & drop an encrypted file (.aes) or click to browse. Make sure you have the correct key and IV (for CBC mode).
                            </p>
                            {selectedFile ? (
                              <div className="flex items-center text-green-400 text-sm">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                File ready: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                              </div>
                            ) : (
                              <div className="text-gray-600 dark:text-gray-500 text-sm">
                                💡 Tip: Drag & drop an encrypted file or click the upload area to browse for a file.
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
          </motion.div>

                  {/* Step 2 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      cleanedKey.length === parseInt(keySize)/4
                        ? 'bg-green-500/10 border-green-500/50'
                        : 'bg-gray-500/10 border-gray-500/30'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        cleanedKey.length === parseInt(keySize)/4
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}>
                        {cleanedKey.length === parseInt(keySize)/4 ? <CheckCircle className="h-5 w-5" /> : '2'}
        </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          Enter Your Key
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {keyMode === 'hex' 
                            ? `Enter exactly ${parseInt(keySize)/4} hexadecimal characters for AES-${keySize}. This should be the same key used for encryption.`
                            : 'Enter the password used for encryption and click "Derive Key from Password" to generate the decryption key using PBKDF2.'}
                        </p>
                        {cleanedKey.length === parseInt(keySize)/4 ? (
                          <div className="flex items-center text-green-400 text-sm">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Key is ready!
                          </div>
                        ) : cleanedKey.length > 0 ? (
                          <div className="flex items-center text-yellow-400 text-sm">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {parseInt(keySize)/4 - cleanedKey.length} more characters needed
                          </div>
                        ) : (
                          <div className="text-gray-600 dark:text-gray-500 text-sm">
                            {keyMode === 'hex' 
                              ? `Enter the decryption key (must match the encryption key)`
                              : 'Enter the password used during encryption to derive the key'}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Step 3 - IV (only for CBC mode) */}
                  {mode === 'CBC' && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        cleanedIV.length === 32
                          ? 'bg-green-500/10 border-green-500/50'
                          : 'bg-gray-500/10 border-gray-500/30'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          cleanedIV.length === 32
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-500 text-white'
                        }`}>
                          {cleanedIV.length === 32 ? <CheckCircle className="h-5 w-5" /> : '3'}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Enter IV (Initialization Vector)
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            For CBC mode, enter exactly 32 hexadecimal characters (16 bytes) for the IV. This must match the IV used during encryption.
                          </p>
                          {cleanedIV.length === 32 ? (
                            <div className="flex items-center text-green-400 text-sm">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              IV is ready!
                            </div>
                          ) : cleanedIV.length > 0 ? (
                            <div className="flex items-center text-yellow-400 text-sm">
                              <AlertCircle className="h-4 w-4 mr-2" />
                              {32 - cleanedIV.length} more characters needed (must be exactly 32 hex characters)
                            </div>
                          ) : (
                            <div className="text-gray-600 dark:text-gray-500 text-sm">
                              💡 Tip: The IV must match the one used during encryption. If you encrypted with CBC mode, you need the same IV to decrypt.
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3/4 - Decrypt */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: mode === 'CBC' ? 0.4 : 0.3 }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      ((inputMode === 'text' && cleanedCiphertext.length === 32) || (inputMode === 'file' && selectedFile)) && 
                      cleanedKey.length === parseInt(keySize)/4 && 
                      (mode === 'ECB' || cleanedIV.length === 32)
                        ? 'bg-purple-500/10 border-purple-500/50'
                        : 'bg-gray-500/10 border-gray-500/30'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        ((inputMode === 'text' && cleanedCiphertext.length === 32) || (inputMode === 'file' && selectedFile)) && 
                        cleanedKey.length === parseInt(keySize)/4 && 
                        (mode === 'ECB' || cleanedIV.length === 32)
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}>
                        {mode === 'CBC' ? '4' : '3'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {inputMode === 'text' ? 'Click Decrypt' : 'Decrypt File'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {inputMode === 'text' 
                            ? 'Once ciphertext, key, and IV (if CBC mode) are entered, click the "Decrypt Message" button to start the decryption process. You can also press Enter.'
                            : 'Once your file is uploaded and key (and IV for CBC mode) are entered, click the "Decrypt File" button in the file upload area to start decryption.'}
                        </p>
                        {((inputMode === 'text' && cleanedCiphertext.length > 0) || (inputMode === 'file' && selectedFile)) && 
                         cleanedKey.length === parseInt(keySize)/4 && 
                         (mode === 'ECB' || cleanedIV.length === 32) ? (
                          <div className="flex items-center text-purple-400 text-sm">
                            <Sparkles className="h-4 w-4 mr-2" />
                            {inputMode === 'text' 
                              ? 'Ready to decrypt! Click the button above or press Ctrl+Enter.'
                              : 'Ready to decrypt! Click "Decrypt File" in the upload area above.'}
                          </div>
                        ) : (
                          <div className="text-gray-600 dark:text-gray-500 text-sm">
                            Complete the previous steps first
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Step 4/5 - View Results */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: mode === 'CBC' ? 0.5 : 0.4 }}
                    className="p-4 rounded-lg border-2 bg-blue-500/10 border-blue-500/30"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold bg-blue-500 text-white">
                        {mode === 'CBC' ? '5' : '4'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          View Results
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          After decryption, you'll see detailed results including the plaintext, decryption rounds visualization, key expansion, and matrix transformations.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Quick Tips */}
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-2 text-purple-400" />
                    Quick Tips
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Toggle between "Text Ciphertext" and "File Upload" modes using the buttons above</li>
                    <li>• Make sure you use the same key and IV (for CBC mode) that were used during encryption</li>
                    <li>• Press Enter to decrypt when ready (text mode only)</li>
                    <li>• You can enter ciphertext of any length - it will be automatically padded to 16-byte blocks</li>
                    <li>• Ciphertext will be processed in 16-byte blocks during decryption</li>
                    <li>• Switch between Hexadecimal and Password key modes as needed</li>
                    <li>• For CBC mode, the IV is required and must match the encryption IV</li>
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

export default Decrypt;

