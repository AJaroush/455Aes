/**
 * Encrypt Page Component
 * 
 * This component provides the AES encryption interface with the following features:
 * - Text and file encryption support
 * - Multiple encryption modes (ECB, CBC, CTR, CFB, OFB, XTS, GCM)
 * - Hex key input or password-based key derivation (PBKDF2)
 * - Step-by-step visualization (rounds, key expansion, matrix view) for ECB/CBC modes
 * - History tracking with optional password protection
 * - Drag-and-drop file upload
 * - Export results as PDF
 * - HMAC calculation for integrity verification
 * 
 * Key Functionality:
 * - Validates hex input and key sizes
 * - Handles different encryption modes with appropriate IV/nonce requirements
 * - Displays encryption results with visualization components
 * - Saves encryption history to localStorage (encrypted if password is set)
 */

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
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import jsPDF from 'jspdf';
import MatrixVisualization from '../components/MatrixVisualization';
import RoundVisualization from '../components/RoundVisualization';
import KeyExpansion from '../components/KeyExpansion';
import { saveHistory, getHistoryPassword, loadHistorySafely, isHistoryEncrypted, decryptHistory } from '../utils/historyEncryption';

const Encrypt = () => {
  // ========== State Management ==========
  
  // Input fields
  const [message, setMessage] = useState(''); // Plaintext message to encrypt (hex)
  const [key, setKey] = useState(''); // Encryption key (hex or password)
  const [keySize, setKeySize] = useState('128'); // AES key size: 128, 192, or 256 bits
  const [iv, setIv] = useState(''); // Initialization Vector for CBC/CFB/OFB/GCM/XTS modes
  const [nonce, setNonce] = useState(''); // Nonce for CTR mode
  
  // Results and UI state
  const [results, setResults] = useState(null); // Encryption results from API
  const [loading, setLoading] = useState(false); // Loading state for async operations
  const [activeTab, setActiveTab] = useState('rounds'); // Active visualization tab: 'rounds', 'keys', 'matrix'
  const [currentRound, setCurrentRound] = useState(0); // Current round being viewed in visualization
  
  // File handling
  const [selectedFile, setSelectedFile] = useState(null); // Selected file for encryption
  const [isDragging, setIsDragging] = useState(false); // Drag-and-drop state
  const [inputMode, setInputMode] = useState('text'); // Input mode: 'text' or 'file'
  
  // Key derivation
  const [usePassword, setUsePassword] = useState(false); // Toggle for password-based key derivation
  const [password, setPassword] = useState(''); // Password for PBKDF2 key derivation
  const [keyMode, setKeyMode] = useState('hex'); // Key input mode: 'hex' or 'password'
  const [passwordStrength, setPasswordStrength] = useState(null); // Password strength indicator
  
  // UI visibility toggles
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
  const [showMessage, setShowMessage] = useState(true); // Toggle message visibility
  const [showKey, setShowKey] = useState(true); // Toggle key visibility
  const [showAdvancedModes, setShowAdvancedModes] = useState(false); // Toggle advanced modes section
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false); // Show password setup prompt
  
  // Encryption mode and history
  const [encryptionMode, setEncryptionMode] = useState('CBC'); // Encryption mode: 'CBC', 'ECB', 'CTR', 'CFB', 'OFB', 'XTS', 'GCM'
  const [encryptionHistory, setEncryptionHistory] = useState([]); // Local encryption history for sidebar
  
  // HMAC (currently disabled but infrastructure exists)
  const [useHMAC] = useState(false); // HMAC toggle (disabled)
  const [hmacValue, setHmacValue] = useState(''); // Calculated HMAC value

  // ========== Effects ==========
  
  /**
   * Check if history password is set and show prompt on first visit
   * Prompts user to set a password for history encryption if not already set
   */
  useEffect(() => {
    const hasPassword = isHistoryEncrypted(); // Check if password protection is enabled
    const hasSeenPrompt = localStorage.getItem('encryptPasswordPromptSeen') === 'true'; // Check if user has seen prompt
    
    // Show prompt if no password is set and user hasn't seen it before
    if (!hasPassword && !hasSeenPrompt) {
      setShowPasswordPrompt(true);
    }
  }, []);

  /**
   * Load encryption history from localStorage on component mount
   * Displays last 10 entries in the sidebar
   */
  useEffect(() => {
    const stored = loadHistorySafely('encryptionHistory'); // Safely load history (handles encrypted/plain)
    setEncryptionHistory(stored.slice(0, 10)); // Show last 10 entries in sidebar
  }, []);

  // ========== Utility Functions ==========
  
  /**
   * Sanitize hex input: remove whitespace, filter non-hex characters, convert to uppercase
   * Allows odd-length input during typing (padding happens during encryption)
   * @param {string} value - Raw hex input
   * @returns {string} - Cleaned hex string
   */
  const cleanHex = (value) => (value || '')
    .replace(/\s+/g, '') // Remove all whitespace
    .replace(/[^0-9a-fA-F]/g, '') // Remove non-hex characters
    .toUpperCase(); // Convert to uppercase
  
  // Computed cleaned values for display and processing
  const cleanedMessage = cleanHex(message); // Cleaned message input
  const cleanedKey = cleanHex(key); // Cleaned key input

  // ========== Example Data ==========
  
  /**
   * Pre-defined example inputs for different AES key sizes
   * Includes NIST test vectors and classic examples for educational purposes
   */
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

  const generateRandomMessage = async () => {
    try {
      // Generate random hex string of any length (1-64 hex characters)
      // This allows both even and odd lengths
      const hexLength = Math.floor(Math.random() * 64) + 1; // 1-64 hex characters
      const hexChars = '0123456789ABCDEF';
      let hexMessage = '';
      
      // Generate random hex characters directly
      const randomBytes = new Uint8Array(hexLength);
      crypto.getRandomValues(randomBytes);
      for (let i = 0; i < hexLength; i++) {
        hexMessage += hexChars[randomBytes[i] % 16];
      }
      
      setMessage(hexMessage);
      const byteCount = Math.ceil(hexMessage.length / 2);
      toast.success(`Random message generated! (${hexMessage.length} hex chars = ${byteCount} bytes)`);
    } catch (error) {
      toast.error('Failed to generate message: ' + error.message);
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
        // Store IV if needed for future file encryption
        localStorage.setItem('lastIV', response.data.iv);
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
    const byteLength = encryptionMode === 'XTS' ? 16 : 16;
    const randomBytes = new Uint8Array(byteLength);
    crypto.getRandomValues(randomBytes);
    const hexIV = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0').toUpperCase())
      .join('');
    setIv(hexIV);
    toast.success(encryptionMode === 'XTS' ? 'Random Tweak generated!' : 'Random IV generated!');
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

  const checkPasswordStrength = async (pwd) => {
    if (!pwd || pwd.length === 0) {
      setPasswordStrength(null);
      return;
    }
    try {
      const response = await axios.post('/api/password-strength', { password: pwd });
      setPasswordStrength(response.data);
    } catch (error) {
      console.error('Password strength check failed:', error);
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
      const isTextFile = selectedFile.name.toLowerCase().endsWith('.txt');
      let response;

      if (isTextFile) {
        // Read text file as UTF-8 text
        const fileContent = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsText(selectedFile, 'UTF-8');
        });
        
        // Convert text to bytes, then to base64
        const textBytes = new TextEncoder().encode(fileContent);
        const binaryString = String.fromCharCode(...textBytes);
        const fileBase64 = btoa(binaryString);
        
        // Use the selected encryption mode (ECB or CBC)
        const fileMode = encryptionMode === 'ECB' ? 'ECB' : 'CBC';
        
        // Generate IV if CBC mode and not provided
        if (fileMode === 'CBC' && !finalIV) {
          const ivResponse = await axios.post('/api/generate-key', 
            { key_size: keySize },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          finalIV = ivResponse.data.iv;
        }
        
        response = await axios.post('/api/encrypt-file', {
          fileData: fileBase64,
          filename: 'temp.txt',
          key: finalKey,
          key_size: keySize,
          mode: fileMode,
          iv: finalIV
        });
        
        // Convert encrypted base64 to binary bytes
        const encryptedBytes = Uint8Array.from(atob(response.data.encryptedData), c => c.charCodeAt(0));
        
        // For CBC mode, prepend IV as binary (16 bytes) before encrypted data
        let fileBytes;
        if (fileMode === 'CBC' && response.data.iv) {
          // Convert IV hex to bytes
          const ivHex = response.data.iv.replace(/\s+/g, '').toUpperCase();
          const ivBytes = new Uint8Array(ivHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
          
          // Combine IV (16 bytes) + encrypted data
          fileBytes = new Uint8Array(ivBytes.length + encryptedBytes.length);
          fileBytes.set(ivBytes, 0);
          fileBytes.set(encryptedBytes, ivBytes.length);
        } else {
          // ECB mode: just encrypted data
          fileBytes = encryptedBytes;
        }
        
        // Download as binary file (will show as weird characters when opened as text)
        const blob = new Blob([fileBytes], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedFile.name.replace('.txt', '')}_encrypted.txt`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Binary file - use file encryption API
        const fileBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result.split(',')[1] || reader.result;
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });

        // Use the selected encryption mode (ECB or CBC)
        const fileMode = encryptionMode === 'ECB' ? 'ECB' : 'CBC';
        
        // Generate IV if CBC mode and not provided
        if (fileMode === 'CBC' && !finalIV) {
          const ivResponse = await axios.post('/api/generate-key', 
            { key_size: keySize },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          finalIV = ivResponse.data.iv;
        }
        
        response = await axios.post('/api/encrypt-file', {
          fileData: fileBase64,
          filename: selectedFile.name,
          key: finalKey,
          key_size: keySize,
          mode: fileMode,
          iv: finalIV
        });

        // Download encrypted binary file
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
      }

      const endTime = performance.now();
      const speed = ((selectedFile.size / 1024) / ((endTime - startTime) / 1000)).toFixed(2);

      // Add to history (without sensitive data)
      const fileMode = isTextFile ? (encryptionMode === 'ECB' ? 'ECB' : 'CBC') : (encryptionMode === 'ECB' ? 'ECB' : 'CBC');
      const historyEntry = {
        id: Date.now(),
        type: 'file',
        filename: selectedFile.name,
        keySize,
        timestamp: new Date().toISOString(),
        speed: speed + ' KB/s',
        mode: fileMode,
        fileSize: selectedFile.size
        // Removed: iv (sensitive data)
      };
      setEncryptionHistory([historyEntry, ...encryptionHistory.slice(0, 9)]);
      
      // Save to localStorage - ALWAYS save, even without password
      const password = getHistoryPassword() || sessionStorage.getItem('historyPassword');
      const existingData = localStorage.getItem('encryptionHistory');
      const isEncrypted = existingData && existingData !== '[]' && !existingData.startsWith('[');
      
      let stored = [];
      
      // Load existing history
      if (isEncrypted && password) {
        // Try to decrypt existing encrypted history
        try {
          stored = await decryptHistory(existingData, password);
        } catch (error) {
          // If decryption fails, start with empty array (password might be wrong, but don't block saving)
          stored = [];
        }
      } else {
        // Load plain history
        stored = loadHistorySafely('encryptionHistory');
      }
      
      // Add new entry and save
      stored.unshift(historyEntry);
      await saveHistory('encryptionHistory', stored.slice(0, 100), password);

      toast.success(`File encrypted successfully! (${speed} KB/s)`);
      setSelectedFile(null);
    } catch (error) {
      toast.error('File encryption failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEncrypt = async () => {
    // Pad odd-length hex strings before encrypting (not during input)
    let cleanMessage = cleanedMessage;
    let cleanKey = cleanedKey;
    
    // Auto-pad odd-length messages with leading zero
    if (cleanMessage.length % 2 !== 0) {
      cleanMessage = '0' + cleanMessage;
    }
    
    // Auto-pad odd-length keys with leading zero
    if (cleanKey.length % 2 !== 0) {
      cleanKey = '0' + cleanKey;
    }

    if (!cleanMessage || !cleanKey) {
      toast.error('Please enter both message and key');
      return;
    }

    const expectedLength = parseInt(keySize) / 4;
    if (cleanKey.length !== expectedLength) {
      toast.error(`Key must be exactly ${expectedLength} hex characters for AES-${keySize}`);
      return;
    }

    if (cleanMessage.length === 0) {
      toast.error('Please enter a message to encrypt');
      return;
    }

    const hexRegex = /^[0-9A-F]+$/;
    if (!hexRegex.test(cleanMessage)) {
      toast.error('Message contains non-hex characters. Please use only 0-9 and A-F');
      return;
    }
    if (!hexRegex.test(cleanKey)) {
      toast.error('Key contains non-hex characters. Please use only 0-9 and A-F');
      return;
    }

    setLoading(true);
    const startTime = performance.now();
    
    try {
      // Use advanced encryption API if advanced mode is selected
      let response;
      if (['CTR', 'CFB', 'OFB', 'XTS', 'GCM'].includes(encryptionMode)) {
        const payload = {
          message: cleanMessage,
          key: cleanKey,
          key_size: keySize,
          mode: encryptionMode
        };
        
        if (encryptionMode === 'CTR') {
          if (!nonce) {
            toast.error('Nonce is required for CTR mode');
            setLoading(false);
            return;
          }
          payload.nonce = nonce.replace(/\s+/g, '').toUpperCase();
        } else if (['CFB', 'OFB', 'GCM', 'XTS'].includes(encryptionMode)) {
          if (!iv) {
            toast.error(`IV is required for ${encryptionMode} mode`);
            setLoading(false);
            return;
          }
          payload.iv = iv.replace(/\s+/g, '').toUpperCase();
        }
        
        response = await axios.post('/api/encrypt-advanced', payload);
        
        // Advanced modes don't have round-by-round visualization
        // Create a simplified result structure
        const advancedResult = {
          final_ciphertext: response.data.ciphertext,
          ciphertext: response.data.ciphertext,
          mode: response.data.mode || encryptionMode,
          tag: response.data.tag,
          // Add empty visualization data to prevent errors
          rounds: [],
          initial_state: null,
          expanded_key: []
        };
        response.data = advancedResult;
        
        // Calculate HMAC if requested
        if (useHMAC) {
          const hmacResponse = await axios.post('/api/calculate-hmac', {
            data: response.data.ciphertext,
            key: cleanKey,
            algorithm: 'sha256'
          });
          setHmacValue(hmacResponse.data.hmac);
        }
      } else {
        // Use standard encryption API for CBC/ECB
        response = await axios.post('/api/encrypt', {
        message: cleanMessage,
        key: cleanKey,
        key_size: keySize
      });
        
        // Calculate HMAC if requested
        if (useHMAC) {
          const hmacResponse = await axios.post('/api/calculate-hmac', {
            data: response.data.final_ciphertext,
            key: cleanKey,
            algorithm: 'sha256'
          });
          setHmacValue(hmacResponse.data.hmac);
        }
      }
      
      const endTime = performance.now();
      const speed = ((cleanMessage.length / 2 / 1024) / ((endTime - startTime) / 1000)).toFixed(2);
      
      // Add to history
      const historyEntry = {
        id: Date.now(),
        type: 'text',
        message: cleanMessage.substring(0, 16) + '...', // Truncated for UI display
        keySize,
        timestamp: new Date().toISOString(),
        speed: speed + ' KB/s',
        ciphertext: (response.data.final_ciphertext || response.data.ciphertext || '').substring(0, 16) + '...', // Truncated for UI display
        fullCiphertext: response.data.final_ciphertext || response.data.ciphertext, // Full value for PDF export
        mode: encryptionMode,
        hmac: hmacValue,
        fullMessage: cleanMessage // Full value for PDF export
      };
      setEncryptionHistory([historyEntry, ...encryptionHistory.slice(0, 9)]);
      
      // Save to localStorage - ALWAYS save, even without password
      const password = getHistoryPassword() || sessionStorage.getItem('historyPassword');
      const existingData = localStorage.getItem('encryptionHistory');
      const isEncrypted = existingData && existingData !== '[]' && !existingData.startsWith('[');
      
      let stored = [];
      
      // Load existing history
      if (isEncrypted && password) {
        // Try to decrypt existing encrypted history
        try {
          stored = await decryptHistory(existingData, password);
        } catch (error) {
          // If decryption fails, start with empty array (password might be wrong, but don't block saving)
          stored = [];
        }
      } else {
        // Load plain history
        stored = loadHistorySafely('encryptionHistory');
      }
      
      // Add new entry and save
      stored.unshift(historyEntry);
      await saveHistory('encryptionHistory', stored.slice(0, 100), password);
      
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
      addText('AES Encryption Results', 18, true, [0, 102, 204]);
      yPos += 5;

      // Timestamp
      addText(`Generated: ${new Date().toLocaleString()}`, 10, false, [128, 128, 128]);
      yPos += 5;

      // Encryption Details
      addText('Encryption Details', 14, true, [0, 0, 0]);
      addText(`Key Size: AES-${keySize}`, 10);
      addText(`Key Mode: ${keyMode === 'hex' ? 'Hexadecimal' : 'Password'}`, 10);
      addText(`Encryption Mode: ${encryptionMode}`, 10);
      if ((encryptionMode === 'CBC' || encryptionMode === 'CFB' || encryptionMode === 'OFB' || encryptionMode === 'GCM' || encryptionMode === 'XTS') && iv) {
        addText(`${encryptionMode === 'XTS' ? 'Tweak' : 'IV'}: ${iv}`, 10);
      }
      if (encryptionMode === 'CTR' && nonce) {
        addText(`Nonce: ${nonce}`, 10);
      }
      if (useHMAC && hmacValue) {
        addText(`HMAC: ${hmacValue}`, 10);
      }
      yPos += 5;

      // Input
      addText('Input', 14, true, [0, 0, 0]);
      if (inputMode === 'text') {
        addText(`Message: ${message || 'N/A'}`, 10);
      } else {
        addText(`File: ${selectedFile ? selectedFile.name : 'N/A'}`, 10);
      }
      addText(`Key: ${key.substring(0, 32)}${key.length > 32 ? '...' : ''}`, 10);
      yPos += 5;

      // Output
      addText('Output', 14, true, [0, 0, 0]);
      const ciphertext = results.final_ciphertext || results.ciphertext || 'N/A';
      addText(`Ciphertext: ${ciphertext}`, 10);
      
      if (results.mode) {
        addText(`Mode: ${results.mode}`, 10);
      }
      
      if (results.tag) {
        addText(`Authentication Tag: ${results.tag}`, 10);
      }
      yPos += 5;

      // Round Information
      if (results.rounds && results.rounds.length > 0) {
        addText('Encryption Rounds', 14, true, [0, 0, 0]);
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
      doc.text('AES Encryption Tool v2.0.0', margin, yPos);
      doc.text('Keep this document secure!', pageWidth - margin - 50, yPos, { align: 'right' });

      // Save PDF
      doc.save(`aes-encryption-${Date.now()}.pdf`);
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF: ' + error.message);
    }
  };

  const tabs = [
    { id: 'rounds', label: 'Encryption Rounds', icon: Eye },
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
                <div className="p-3 bg-cyan-500/20 rounded-lg">
                  <Lock className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Set History Password
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Protect your encryption history
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPasswordPrompt(false);
                  localStorage.setItem('encryptPasswordPromptSeen', 'true');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                To protect your encryption history, please go to the <strong>History page</strong> and set a password first. This will encrypt and secure all your encryption/decryption records.
              </p>
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <Info className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
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
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mt-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Next step:</strong> Navigate to the <strong>History</strong> page from the menu to set your password.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowPasswordPrompt(false);
                  localStorage.setItem('encryptPasswordPromptSeen', 'true');
                }}
                className="flex-1 px-4 py-3 glass text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
              >
                Got It
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

              {/* Encryption Mode Selection */}
              <div className="mb-6">
                <label className="block text-gray-900 dark:text-white font-medium mb-3 flex items-center">
                  Encryption Mode
                  <div className="group relative ml-2">
                    <Info className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-help" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-80 p-2 bg-gray-800 dark:bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none border border-gray-700 whitespace-normal shadow-lg">
                      <strong>Basic:</strong> CBC (recommended), ECB<br/>
                      <strong>Advanced:</strong> CTR (streaming), CFB, OFB, XTS (disk), GCM (authenticated)
                    </div>
                  </div>
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {['CBC', 'ECB'].map((mode) => (
                    <motion.button
                      key={mode}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setEncryptionMode(mode)}
                      className={`p-2 rounded-lg font-semibold text-sm transition-all ${
                        encryptionMode === mode
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                          : 'glass text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                      }`}
                    >
                      {mode}
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
                    {['CTR', 'CFB', 'OFB', 'XTS', 'GCM'].map((mode) => (
                      <motion.button
                        key={mode}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setEncryptionMode(mode)}
                        className={`p-2 rounded-lg font-semibold text-xs transition-all ${
                          encryptionMode === mode
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : 'glass text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                        }`}
                      >
                        {mode}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* IV/Nonce Input (for modes that need it) */}
              {(encryptionMode === 'CBC' || encryptionMode === 'CFB' || encryptionMode === 'OFB' || encryptionMode === 'GCM' || encryptionMode === 'XTS') && (
                <div className="mb-6">
                  <label className="block text-gray-900 dark:text-white font-medium mb-3 flex items-center">
                    {encryptionMode === 'XTS' ? 'Tweak (for XTS mode)' : 'IV (Initialization Vector)'}
                  <div className="group relative ml-2">
                    <Info className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 dark:bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-gray-700 shadow-lg">
                        {encryptionMode === 'XTS' 
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
                    placeholder={encryptionMode === 'XTS' ? 'Enter 32 hex characters (16 bytes) for tweak' : 'Enter any length hex characters (will be padded automatically)'}
                    className="input-clean w-full p-3 rounded-lg font-mono text-sm"
                    maxLength={encryptionMode === 'XTS' ? 32 : undefined}
                  />
                </div>
              )}

              {/* Nonce Input (for CTR mode) */}
              {encryptionMode === 'CTR' && (
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

              {/* Message Input / File Upload */}
              <div className="mb-6">
                <label className="block text-gray-900 dark:text-white font-medium mb-3 flex items-center">
                  Input Method
                  <div className="group relative ml-2">
                    <Info className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-help" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-800 dark:bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none border border-gray-700 whitespace-normal shadow-lg">
                      Choose to encrypt a text message or upload a file.
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
                        : 'glass text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                    }`}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Text Message
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setInputMode('file');
                      setMessage('');
                    }}
                    className={`p-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center ${
                      inputMode === 'file'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'glass text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
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
                      onClick={generateRandomMessage}
                      className="w-full mb-3 p-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all flex items-center justify-center"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Generate Random Message
                    </motion.button>
                    <div className="relative">
                      {showMessage ? (
                        <textarea
                    type="text"
                    value={cleanedMessage}
                    onChange={(e) => {
                      const cleaned = cleanHex(e.target.value);
                        setMessage(cleaned);
                    }}
                    onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.ctrlKey && !loading && cleanedMessage.length > 0 && cleanedKey.length === parseInt(keySize)/4) {
                        handleEncrypt();
                      }
                    }}
                          placeholder="Enter your message in hexadecimal format (e.g., 54776F204F6E65204E696E652054776F) or use the button above to generate one"
                          className={`input-clean w-full p-4 rounded-lg font-mono transition-all min-h-[100px] ${
                            cleanedMessage.length > 0 
                        ? 'border-green-500/50 bg-green-500/5' 
                        : ''
                    }`}
                    inputMode="latin"
                    autoComplete="off"
                    spellCheck={false}
                          rows={4}
                  />
                      ) : (
                        <div className={`input-clean w-full p-4 rounded-lg font-mono transition-all min-h-[100px] flex items-start ${
                          cleanedMessage.length > 0 
                            ? 'border-green-500/50 bg-green-500/5' 
                            : ''
                        }`}>
                          <div className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-all">
                            {cleanedMessage.length > 0 ? '•'.repeat(cleanedMessage.length) : 'Enter your message in hexadecimal format...'}
                  </div>
                        </div>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowMessage(!showMessage)}
                        className="absolute right-16 top-2 p-2 text-gray-400 hover:text-white z-20"
                        title={showMessage ? 'Hide message' : 'Show message'}
                      >
                        {showMessage ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </motion.button>
                      <div className={`absolute top-2 right-2 text-xs transition-colors z-20 ${
                        cleanedMessage.length > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {cleanedMessage.length} characters
                      </div>
                      {cleanedMessage.length > 0 && (
                        <div className="absolute bottom-2 right-2 z-20">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                  )}
                </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      💡 Tip: Enter any hexadecimal characters (0-9, A-F). The message will be padded automatically if needed.
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
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : selectedFile
                        ? 'border-green-500/50 bg-green-500/5'
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
                        <div className="space-y-3">
                          <FileText className="h-12 w-12 mx-auto text-green-400" />
                          <div className="font-semibold text-gray-900 dark:text-white">{selectedFile.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              e.preventDefault();
                              encryptFile(); 
                            }}
                            disabled={loading || (keyMode === 'hex' && cleanedKey.length !== parseInt(keySize)/4) || (keyMode === 'password' && !password)}
                            className="mt-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? 'Encrypting...' : 'Encrypt File'}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              e.preventDefault();
                              setSelectedFile(null);
                            }}
                            className="mt-1 px-4 py-2 glass text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-white/10"
                          >
                            Remove File
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
                )}
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
                      if (e.key === 'Enter' && e.ctrlKey && !loading && cleanedMessage.length > 0 && cleanedKey.length === parseInt(keySize)/4) {
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
                      cleanedKey.length === parseInt(keySize)/4 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {cleanedKey.length}/{parseInt(keySize)/4}
                    </div>
                    {cleanedKey.length === parseInt(keySize)/4 && (
                      <div className="absolute bottom-2 right-2 z-10">
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
                      onChange={(e) => {
                        setPassword(e.target.value);
                        checkPasswordStrength(e.target.value);
                      }}
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
                  {/* Password Strength Meter */}
                  {passwordStrength && (
                    <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          Password Strength:
                        </span>
                        <span className={`text-xs font-bold ${
                          passwordStrength.level === 'strong' ? 'text-green-600 dark:text-green-400' :
                          passwordStrength.level === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {passwordStrength.level.toUpperCase()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            passwordStrength.level === 'strong' ? 'bg-green-500' :
                            passwordStrength.level === 'medium' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${(passwordStrength.strength / 10) * 100}%` }}
                        />
                      </div>
                      {passwordStrength.feedback.length > 0 && (
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          {passwordStrength.feedback.map((fb, idx) => (
                            <li key={idx}>• {fb}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
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
                disabled={loading || cleanedMessage.length === 0 || cleanedKey.length !== parseInt(keySize)/4}
                className={`btn-primary w-full p-4 rounded-lg font-semibold text-lg flex items-center justify-center transition-all ${
                  loading || cleanedMessage.length === 0 || cleanedKey.length !== parseInt(keySize)/4
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
                    <span className="ml-2 text-xs opacity-75">(Ctrl+Enter)</span>
                  </>
                )}
              </motion.button>
              
              {/* Validation Status */}
              {cleanedMessage.length > 0 && cleanedKey.length === parseInt(keySize)/4 && !loading && (
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
                      onClick={() => copyToClipboard(results.final_ciphertext || results.ciphertext, 'Ciphertext')}
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
                      title="Download Results (JSON)"
                    >
                      <Download className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={exportToPDF}
                      className="p-2 glass rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/20 transition-all duration-300 border-clean"
                      title="Export as PDF"
                    >
                      <FileText className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Encryption Info */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="p-3 bg-cyan-500/20 rounded-lg">
                    <div className="text-xs text-cyan-700 dark:text-cyan-300 mb-1">Key Size</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">AES-{keySize}</div>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <div className="text-xs text-purple-700 dark:text-purple-300 mb-1">Encryption Mode</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{encryptionMode}</div>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <div className="text-xs text-blue-700 dark:text-blue-300 mb-1">Key Mode</div>
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
                    {results.final_ciphertext || results.ciphertext}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => copyToClipboard(results.final_ciphertext || results.ciphertext, 'Ciphertext')}
                    className="mt-3 px-4 py-2 bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-500/30 transition-all flex items-center"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Ciphertext
                  </motion.button>
                </div>

                {/* HMAC Display */}
                {hmacValue && (
                  <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 flex items-center">
                        <Shield className="h-5 w-5 mr-2" />
                        HMAC-SHA-256 Integrity Check
                      </h3>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => copyToClipboard(hmacValue, 'HMAC')}
                        className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded transition-colors"
                        title="Copy HMAC"
                      >
                        <Copy className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </motion.button>
                    </div>
                    <div className="font-mono text-sm text-gray-700 dark:text-gray-300 break-all mb-2">
                      {hmacValue}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      This HMAC verifies the integrity of your encrypted data. Store it securely and use it to verify data hasn't been tampered with!
                    </p>
                  </div>
                )}

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
                    results && results.rounds && results.rounds.length > 0 && (encryptionMode === 'ECB' || encryptionMode === 'CBC') ? (
                    <RoundVisualization 
                      rounds={results.rounds}
                        autoPlay={false}
                      currentRound={currentRound}
                      setCurrentRound={setCurrentRound}
                    />
                    ) : (
                      <div className="p-8 text-center">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Round-by-Round Visualization Not Available
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {encryptionMode && encryptionMode !== 'ECB' && encryptionMode !== 'CBC' 
                            ? `Advanced encryption modes (${encryptionMode}) don't support round-by-round visualization. Use CBC or ECB mode to see the full encryption process step-by-step.`
                            : 'Round-by-round visualization is only available for ECB and CBC modes.'}
                        </p>
                      </div>
                    )
                  )}

                  {activeTab === 'keys' && (
                    results && results.expanded_key && results.expanded_key.length > 0 && (encryptionMode === 'ECB' || encryptionMode === 'CBC') ? (
                    <KeyExpansion keys={results.expanded_key} />
                    ) : (
                      <div className="p-8 text-center">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Key Expansion Visualization Not Available
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {encryptionMode && encryptionMode !== 'ECB' && encryptionMode !== 'CBC'
                            ? `Advanced encryption modes (${encryptionMode}) don't support key expansion visualization. Use CBC or ECB mode to see key expansion.`
                            : 'Key expansion visualization is only available for ECB and CBC modes.'}
                        </p>
                      </div>
                    )
                  )}

                  {activeTab === 'matrix' && (
                    results && results.initial_state && results.rounds && results.rounds.length > 0 && (encryptionMode === 'ECB' || encryptionMode === 'CBC') ? (
                    <MatrixVisualization 
                      initialState={results.initial_state}
                      rounds={results.rounds}
                      currentRound={currentRound}
                        setCurrentRound={setCurrentRound}
                      />
                    ) : (
                      <div className="p-8 text-center">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Matrix Visualization Not Available
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {encryptionMode && encryptionMode !== 'ECB' && encryptionMode !== 'CBC'
                            ? `Advanced encryption modes (${encryptionMode}) don't support matrix visualization. Use CBC or ECB mode to see the 4x4 state matrix transformations.`
                            : 'Matrix visualization is only available for ECB and CBC modes.'}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            ) : (
              <div className="glass rounded-2xl p-6 border-clean">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Zap className="h-6 w-6 mr-3 text-cyan-600 dark:text-cyan-400" />
                  Step-by-Step Guide
                </h2>
                
                <div className="space-y-4">
                  {/* Step 1 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      (inputMode === 'text' && cleanedMessage.length > 0) || (inputMode === 'file' && selectedFile)
                        ? 'bg-green-500/10 border-green-500/50'
                        : 'bg-gray-500/10 border-gray-500/30'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        (inputMode === 'text' && cleanedMessage.length > 0) || (inputMode === 'file' && selectedFile)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}>
                        {(inputMode === 'text' && cleanedMessage.length > 0) || (inputMode === 'file' && selectedFile) ? <CheckCircle className="h-5 w-5" /> : '1'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {inputMode === 'text' ? 'Enter Your Message' : 'Upload Your File'}
                </h3>
                        {inputMode === 'text' ? (
                          <>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              Choose "Text Message" mode and enter your message in hexadecimal format (0-9, A-F). Any length is supported - messages will be automatically padded to 16-byte blocks. You can click "Generate Random Message" to create one automatically.
                            </p>
                            {cleanedMessage.length > 0 ? (
                              <div className="flex items-center text-sm">
                                {cleanedMessage.length % 2 === 0 ? (
                                  <div className="flex items-center text-green-600 dark:text-green-400">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Message is ready! ({cleanedMessage.length} hex chars = {cleanedMessage.length / 2} bytes)
                                  </div>
                                ) : (
                                  <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    {cleanedMessage.length} hex chars (odd length - will auto-pad with leading zero when encrypting)
              </div>
            )}
                              </div>
                            ) : (
                              <div className="text-gray-500 dark:text-gray-500 text-sm">
                                💡 Tip: Use the "Generate Random Message" button above for a quick start. Messages of any length are supported!
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              Choose "File Upload" mode and drag & drop a file or click to browse. Files of any type can be encrypted.
                            </p>
                            {selectedFile ? (
                              <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                File ready: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                              </div>
                            ) : (
                              <div className="text-gray-500 dark:text-gray-500 text-sm">
                                💡 Tip: Drag & drop a file or click the upload area to browse for a file.
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
                            ? `Enter exactly ${parseInt(keySize)/4} hexadecimal characters for AES-${keySize}, or use the refresh button to generate a random key.`
                            : 'Enter a password and click "Derive Key from Password" to generate a secure key using PBKDF2.'}
                        </p>
                        {cleanedKey.length === parseInt(keySize)/4 ? (
                          <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Key is ready!
                          </div>
                        ) : cleanedKey.length > 0 ? (
                          <div className="flex items-center text-yellow-600 dark:text-yellow-400 text-sm">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {parseInt(keySize)/4 - cleanedKey.length} more characters needed
                          </div>
                        ) : (
                          <div className="text-gray-500 dark:text-gray-500 text-sm">
                            {keyMode === 'hex' 
                              ? `Use "Quick Examples" below or generate a random key`
                              : 'Enter a strong password to derive your key'}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Step 3 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      ((inputMode === 'text' && cleanedMessage.length > 0) || (inputMode === 'file' && selectedFile)) && cleanedKey.length === parseInt(keySize)/4
                        ? 'bg-cyan-500/10 border-cyan-500/50'
                        : 'bg-gray-500/10 border-gray-500/30'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        ((inputMode === 'text' && cleanedMessage.length > 0) || (inputMode === 'file' && selectedFile)) && cleanedKey.length === parseInt(keySize)/4
                          ? 'bg-cyan-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}>
                        3
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {inputMode === 'text' ? 'Click Encrypt' : 'Encrypt File'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {inputMode === 'text' 
                            ? 'Once both message and key are entered, click the "Encrypt Message" button to start the encryption process. You can also press Ctrl+Enter.'
                            : 'Once your file is uploaded and key is entered, click the "Encrypt File" button in the file upload area to start encryption.'}
                        </p>
                        {((inputMode === 'text' && cleanedMessage.length > 0) || (inputMode === 'file' && selectedFile)) && cleanedKey.length === parseInt(keySize)/4 ? (
                          <div className="flex items-center text-cyan-600 dark:text-cyan-400 text-sm">
                            <Sparkles className="h-4 w-4 mr-2" />
                            {inputMode === 'text' 
                              ? 'Ready to encrypt! Click the button above or press Ctrl+Enter.'
                              : 'Ready to encrypt! Click "Encrypt File" in the upload area above.'}
                          </div>
                        ) : (
                          <div className="text-gray-500 dark:text-gray-500 text-sm">
                            Complete steps 1 and 2 first
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Step 4 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-4 rounded-lg border-2 bg-blue-500/10 border-blue-500/30"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold bg-blue-500 text-white">
                        4
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          View Results
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          After encryption, you'll see detailed results including the ciphertext, encryption rounds visualization, key expansion, and matrix transformations.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Quick Tips */}
                <div className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/20">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-2 text-cyan-600 dark:text-cyan-400" />
                    Quick Tips
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Toggle between "Text Message" and "File Upload" modes using the buttons above</li>
                    <li>• Use "Generate Random Message" and "Generate Random Key" buttons for quick setup</li>
                    <li>• Press Ctrl+Enter to encrypt when ready (text mode only)</li>
                    <li>• You can enter messages of any length - they'll be padded automatically</li>
                    <li>• Switch between Hexadecimal and Password key modes as needed</li>
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
