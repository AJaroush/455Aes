import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  History as HistoryIcon,
  Zap,
  Unlock,
  File,
  FileText,
  Clock,
  Trash2,
  Search,
  Download,
  Copy,
  Lock,
  Eye,
  EyeOff,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import { decryptHistory, isHistoryEncrypted, encryptHistory, setHistoryPassword, setHistoryEncryptionStatus, saveHistory } from '../utils/historyEncryption';

const History = () => {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'encrypt', 'decrypt'
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPasswordSetupModal, setShowPasswordSetupModal] = useState(false);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);

  // Password validation function
  const validatePassword = (pwd) => {
    const requirements = {
      length: pwd.length >= 12,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
    };

    const strength = {
      score: Object.values(requirements).filter(Boolean).length,
      requirements
    };

    return strength;
  };

  // Update password strength when newPassword changes
  useEffect(() => {
    if (newPassword) {
      setPasswordStrength(validatePassword(newPassword));
    } else {
      setPasswordStrength(null);
    }
  }, [newPassword]);

  useEffect(() => {
    checkEncryptionStatus();
  }, []);

  const checkEncryptionStatus = () => {
    // Always clear session password when entering History page - force re-entry every time
    sessionStorage.removeItem('historyPassword');
    
    // Check if encryption flags are set (indicates password was set before)
    const hasEncryptFlag = localStorage.getItem('historyEncrypted') === 'true';
    const hasDecryptFlag = localStorage.getItem('decryptionHistoryEncrypted') === 'true';
    
    // Check if there's actual encrypted data (base64, not JSON)
    const encryptHistoryData = localStorage.getItem('encryptionHistory');
    const decryptHistoryData = localStorage.getItem('decryptionHistory');
    const hasEncryptedData = (encryptHistoryData && encryptHistoryData !== '[]' && !encryptHistoryData.startsWith('[')) ||
                            (decryptHistoryData && decryptHistoryData !== '[]' && !decryptHistoryData.startsWith('['));
    
    // Consider encrypted if flags are set (even if no data yet - password was set)
    // OR if there's actual encrypted data (flags might be missing but data is encrypted)
    const encrypted = (hasEncryptFlag || hasDecryptFlag) || hasEncryptedData;
    
    // If flags are set but no encrypted data, keep the flags (password was set, just no history yet)
    // Don't clear flags - they indicate password protection is enabled
    
    setIsEncrypted(encrypted);
    
    if (encrypted) {
      // Password was set before - require password entry
      setShowPasswordModal(true);
      setShowPasswordSetupModal(false);
    } else {
      // No password set yet - force password setup (first time)
      setShowPasswordSetupModal(true);
      setShowPasswordModal(false);
    }
  };

  const loadHistory = async (providedPassword = null) => {
    try {
      const encryptHistoryData = localStorage.getItem('encryptionHistory');
      const decryptHistoryData = localStorage.getItem('decryptionHistory');
      
      let encryptHistory = [];
      let decryptHistory = [];
      
      if (isEncrypted && providedPassword) {
        // Decrypt history
        setIsLoading(true);
        let decryptError = false;
        
        try {
          // Check if data is encrypted (base64 format) or plain JSON
          if (encryptHistoryData && encryptHistoryData !== '[]') {
            try {
              if (encryptHistoryData.startsWith('[')) {
                // Plain JSON
                encryptHistory = JSON.parse(encryptHistoryData);
              } else {
                // Encrypted (base64)
                encryptHistory = await decryptHistory(encryptHistoryData, providedPassword);
              }
            } catch (error) {
              console.error('Failed to decrypt encryption history:', error);
              decryptError = true;
              encryptHistory = []; // Set to empty array if decryption fails
            }
          }
          
          if (decryptHistoryData && decryptHistoryData !== '[]') {
            try {
              if (decryptHistoryData.startsWith('[')) {
                // Plain JSON
                decryptHistory = JSON.parse(decryptHistoryData);
              } else {
                // Encrypted (base64)
                decryptHistory = await decryptHistory(decryptHistoryData, providedPassword);
              }
            } catch (error) {
              console.error('Failed to decrypt decryption history:', error);
              decryptError = true;
              decryptHistory = []; // Set to empty array if decryption fails
            }
          }
          
          // If both failed, show error
          if (decryptError && encryptHistory.length === 0 && decryptHistory.length === 0) {
            toast.error('Failed to decrypt history. Wrong password?');
            setPassword('');
            setIsLoading(false);
            return;
          }
          
          // If at least one succeeded, continue
          if (decryptError) {
            toast.warning('Some history items could not be decrypted. Wrong password?');
          } else {
            toast.success('History loaded successfully!');
          }
          
          // Store password in sessionStorage temporarily for Encrypt/Decrypt pages to use
          // But user must enter it again next time they visit History page
          sessionStorage.setItem('historyPassword', providedPassword);
          setShowPasswordModal(false);
        } catch (error) {
          console.error('Unexpected error during decryption:', error);
          toast.error('Failed to load history: ' + error.message);
          setPassword('');
          setIsLoading(false);
          return;
        } finally {
          setIsLoading(false);
        }
      } else if (!isEncrypted) {
        // Plain history (not encrypted) - should not happen if password is required
        encryptHistory = JSON.parse(encryptHistoryData || '[]');
        decryptHistory = JSON.parse(decryptHistoryData || '[]');
      } else {
        // Encrypted but no password provided
        return;
      }
      
      const combined = [
        ...encryptHistory.map(item => ({ ...item, type: 'encrypt' })),
        ...decryptHistory.map(item => ({ ...item, type: 'decrypt' }))
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setHistory(combined);
    } catch (error) {
      console.error('Error loading history:', error);
      toast.error('Failed to load history');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      toast.error('Please enter a password');
      return;
    }
    await loadHistory(password);
  };

  const handleForgotPassword = () => {
    if (window.confirm('Are you sure you want to reset your history? This will:\n\n- Clear all encrypted history\n- Remove password protection\n- Allow you to set a new password\n\nThis action cannot be undone!')) {
      // Clear all encrypted history
      localStorage.removeItem('encryptionHistory');
      localStorage.removeItem('decryptionHistory');
      localStorage.removeItem('historyEncrypted');
      localStorage.removeItem('decryptionHistoryEncrypted');
      sessionStorage.removeItem('historyPassword');
      
      // Reset state
      setHistory([]);
      setIsEncrypted(false);
      setShowPasswordModal(false);
      setShowPasswordSetupModal(true);
      setPassword('');
      
      toast.success('History reset! Please set a new password.');
    }
  };

  const handlePasswordSetup = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error('Please enter and confirm password');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate password strength
    const strength = validatePassword(newPassword);
    if (strength.score < 5) {
      const missing = [];
      if (!strength.requirements.length) missing.push('at least 12 characters');
      if (!strength.requirements.uppercase) missing.push('one uppercase letter');
      if (!strength.requirements.lowercase) missing.push('one lowercase letter');
      if (!strength.requirements.number) missing.push('one number');
      if (!strength.requirements.special) missing.push('one special character');
      toast.error(`Password must contain: ${missing.join(', ')}`);
      return;
    }

    setIsLoading(true);
    try {
      // Get existing history (if any)
      const encryptHistoryData = localStorage.getItem('encryptionHistory');
      const decryptHistoryData = localStorage.getItem('decryptionHistory');
      
      let encryptHistoryList = [];
      let decryptHistoryList = [];

      // Handle existing history
      if (encryptHistoryData && encryptHistoryData !== '[]') {
        if (isEncrypted && password) {
          // Decrypt existing encrypted history with old password
          try {
            if (!encryptHistoryData.startsWith('[')) {
              // Encrypted format
              encryptHistoryList = await decryptHistory(encryptHistoryData, password);
            } else {
              // Plain JSON
              encryptHistoryList = JSON.parse(encryptHistoryData);
            }
          } catch (error) {
            console.error('Failed to decrypt encryption history:', error);
            toast.error('Failed to decrypt existing history with current password');
            setIsLoading(false);
            return;
          }
        } else {
          // Plain history (not encrypted yet)
          try {
            encryptHistoryList = JSON.parse(encryptHistoryData);
          } catch (error) {
            encryptHistoryList = [];
          }
        }
      }

      if (decryptHistoryData && decryptHistoryData !== '[]') {
        if (isEncrypted && password) {
          // Decrypt existing encrypted history with old password
          try {
            if (!decryptHistoryData.startsWith('[')) {
              // Encrypted format
              decryptHistoryList = await decryptHistory(decryptHistoryData, password);
            } else {
              // Plain JSON
              decryptHistoryList = JSON.parse(decryptHistoryData);
            }
          } catch (error) {
            console.error('Failed to decrypt decryption history:', error);
            toast.error('Failed to decrypt existing history with current password');
            setIsLoading(false);
            return;
          }
        } else {
          // Plain history (not encrypted yet)
          try {
            decryptHistoryList = JSON.parse(decryptHistoryData);
          } catch (error) {
            decryptHistoryList = [];
          }
        }
      }

      // Encrypt with new password
      await saveHistory('encryptionHistory', encryptHistoryList, newPassword);
      await saveHistory('decryptionHistory', decryptHistoryList, newPassword);
      
      // Update state
      setIsEncrypted(true);
      setShowPasswordSetupModal(false);
      setNewPassword('');
      setConfirmPassword('');
      setPassword('');
      
      // Reload history with new password
      await loadHistory(newPassword);
      toast.success('Password set! History is now encrypted.');
    } catch (error) {
      console.error('Password setup error:', error);
      toast.error('Failed to set password: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePassword = async () => {
    if (!window.confirm('Are you sure you want to remove password protection? This will decrypt your history.')) {
      return;
    }

    if (!password) {
      toast.error('Please enter current password to remove protection');
      setShowPasswordModal(true);
      return;
    }

    setIsLoading(true);
    try {
      // Decrypt history
      const encryptHistoryData = localStorage.getItem('encryptionHistory');
      const decryptHistoryData = localStorage.getItem('decryptionHistory');
      
      let encryptHistoryList = [];
      let decryptHistoryList = [];

      if (encryptHistoryData && encryptHistoryData !== '[]' && !encryptHistoryData.startsWith('[')) {
        encryptHistoryList = await decryptHistory(encryptHistoryData, password);
      } else {
        encryptHistoryList = JSON.parse(encryptHistoryData || '[]');
      }
      if (decryptHistoryData && decryptHistoryData !== '[]' && !decryptHistoryData.startsWith('[')) {
        decryptHistoryList = await decryptHistory(decryptHistoryData, password);
      } else {
        decryptHistoryList = JSON.parse(decryptHistoryData || '[]');
      }

      // Save as plain (no password)
      await saveHistory('encryptionHistory', encryptHistoryList, null);
      await saveHistory('decryptionHistory', decryptHistoryList, null);
      
      setHistoryPassword(null);
      setIsEncrypted(false);
      setPassword('');
      setShowPasswordModal(false);
      
      await loadHistory();
      toast.success('Password protection removed!');
    } catch (error) {
      console.error('Remove password error:', error);
      toast.error('Failed to remove password: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      localStorage.removeItem('encryptionHistory');
      localStorage.removeItem('decryptionHistory');
      setHistory([]);
      toast.success('History cleared!');
    }
  };

  const deleteItem = async (id, type) => {
    // For deletion, we need the password - prompt user
    if (isEncrypted && !password) {
      toast.error('Please enter password to delete items');
      setShowPasswordModal(true);
      return;
    }
    
    const key = type === 'encrypt' ? 'encryptionHistory' : 'decryptionHistory';
    
    let stored;
    if (isEncrypted && password) {
      try {
        const encryptedData = localStorage.getItem(key);
        if (encryptedData && encryptedData !== '[]') {
          if (encryptedData.startsWith('[')) {
            stored = JSON.parse(encryptedData);
          } else {
            stored = await decryptHistory(encryptedData, password);
          }
        } else {
          stored = [];
        }
      } catch (error) {
        toast.error('Failed to decrypt history for deletion');
        return;
      }
    } else {
      stored = JSON.parse(localStorage.getItem(key) || '[]');
    }
    
    const filtered = stored.filter(item => item.id !== id);
    
    // Re-encrypt if needed
    if (isEncrypted && password) {
      try {
        await saveHistory(key, filtered, password);
        await loadHistory(password);
        toast.success('Item deleted!');
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to save after deletion');
      }
    } else if (isEncrypted) {
      toast.error('Please enter password to delete items');
      setShowPasswordModal(true);
    } else {
      localStorage.setItem(key, JSON.stringify(filtered));
      loadHistory();
      toast.success('Item deleted!');
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const exportHistory = () => {
    const data = {
      exportDate: new Date().toISOString(),
      totalItems: history.length,
      items: history
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aes-history-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('History exported!');
  };

  const exportToPDF = () => {
    if (history.length === 0) {
      toast.error('No history to export');
      return;
    }

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
      addText('AES Encryption/Decryption History', 18, true, [0, 102, 204]);
      yPos += 5;

      // Summary Stats
      addText('Summary', 14, true, [0, 0, 0]);
      addText(`Total Operations: ${stats.total}`, 10);
      addText(`Encryptions: ${stats.encrypt}`, 10);
      addText(`Decryptions: ${stats.decrypt}`, 10);
      addText(`Files: ${stats.files}`, 10);
      addText(`Export Date: ${new Date().toLocaleString()}`, 10, false, [128, 128, 128]);
      yPos += 5;

      // History Items
      addText('History Details', 14, true, [0, 0, 0]);
      yPos += 5;

      filteredHistory.forEach((item, index) => {
        // Check if we need a new page
        if (yPos > doc.internal.pageSize.getHeight() - 60) {
          doc.addPage();
          yPos = margin;
        }

        // Item header
        const itemType = item.type === 'encrypt' ? 'Encryption' : 'Decryption';
        addText(`${index + 1}. ${itemType} Operation`, 12, true, item.type === 'encrypt' ? [0, 102, 204] : [147, 51, 234]);
        
        // Timestamp
        addText(`Date: ${new Date(item.timestamp).toLocaleString()}`, 10, false, [128, 128, 128]);
        
        // Details
        if (item.filename) {
          addText(`File: ${item.filename}`, 10);
        }
        addText(`Key Size: AES-${item.keySize}`, 10);
        if (item.mode) {
          addText(`Mode: ${item.mode}`, 10);
        }
        if (item.speed) {
          addText(`Speed: ${item.speed}`, 10);
        }
        if (item.message) {
          const messageText = item.message.length > 50 
            ? item.message.substring(0, 50) + '...' 
            : item.message;
          addText(`Message: ${messageText}`, 10);
        }
        if (item.ciphertext) {
          const ciphertextText = item.ciphertext.length > 50 
            ? item.ciphertext.substring(0, 50) + '...' 
            : item.ciphertext;
          addText(`Ciphertext: ${ciphertextText}`, 10);
        }
        if (item.hashBefore) {
          const hashText = item.hashBefore.length > 50 
            ? item.hashBefore.substring(0, 50) + '...' 
            : item.hashBefore;
          addText(`Hash: ${hashText}`, 10);
        }
        
        // Separator line
        yPos += 2;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 5;
      });

      // Footer
      yPos = doc.internal.pageSize.getHeight() - 20;
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`AES Encryption Tool v2.0.0 - ${filteredHistory.length} items shown`, margin, yPos);
      doc.text('Keep this document secure!', pageWidth - margin - 50, yPos, { align: 'right' });

      // Save PDF
      doc.save(`aes-history-${Date.now()}.pdf`);
      toast.success('History exported as PDF!');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF: ' + error.message);
    }
  };

  const filteredHistory = history.filter(item => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch = searchTerm === '' || 
      (item.filename && item.filename.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.message && item.message.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.ciphertext && item.ciphertext.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: history.length,
    encrypt: history.filter(h => h.type === 'encrypt').length,
    decrypt: history.filter(h => h.type === 'decrypt').length,
    files: history.filter(h => h.type === 'file').length
  };

  return (
    <div className="pt-16 min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Password Entry Modal - Only show if encrypted */}
      {showPasswordModal && isEncrypted && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-8 border-clean max-w-md w-full"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-cyan-500/20 rounded-lg">
                <Lock className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEncrypted ? 'History Protected' : 'Password Required'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isEncrypted 
                    ? 'Enter password to view history'
                    : 'Please set a password to protect your history'}
                </p>
              </div>
            </div>
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter history password"
                    className="input-clean w-full pr-10"
                    autoFocus
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {isEncrypted 
                    ? 'Your history is encrypted. Enter the password you set when enabling history encryption.'
                    : 'Please set a password to protect your history. This is required for security.'}
                </p>
                {isEncrypted && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="mt-2 text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 underline"
                  >
                    Forgot password? Reset history
                  </button>
                )}
              </div>
              
              <div className="flex gap-3">
                {isEncrypted ? (
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading || !password}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Decrypting...' : 'Unlock History'}
                  </motion.button>
                ) : (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowPasswordModal(false);
                      setShowPasswordSetupModal(true);
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all"
                  >
                    Go to Setup
                  </motion.button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Password Setup Modal */}
      {showPasswordSetupModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-8 border-clean max-w-md w-full"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-cyan-500/20 rounded-lg">
                <Lock className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEncrypted ? 'Change Password' : 'Set Password'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isEncrypted ? 'Enter current password and new password' : 'Protect your history with encryption'}
                </p>
              </div>
            </div>
            
            <form onSubmit={handlePasswordSetup}>
              {isEncrypted && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="input-clean w-full pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isEncrypted ? 'New Password' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={isEncrypted ? 'Enter new password' : 'Enter strong password'}
                    className="input-clean w-full pr-10"
                    autoFocus={!isEncrypted}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {newPassword && passwordStrength && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            passwordStrength.score === 5
                              ? 'bg-green-500'
                              : passwordStrength.score >= 3
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          passwordStrength.score === 5
                            ? 'text-green-600 dark:text-green-400'
                            : passwordStrength.score >= 3
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {passwordStrength.score === 5
                          ? 'Strong'
                          : passwordStrength.score >= 3
                          ? 'Medium'
                          : 'Weak'}
                      </span>
                    </div>
                    
                    {/* Requirements Checklist */}
                    <div className="text-xs space-y-1">
                      <div className={`flex items-center space-x-2 ${passwordStrength.requirements.length ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        <CheckCircle className={`h-3 w-3 ${passwordStrength.requirements.length ? '' : 'opacity-30'}`} />
                        <span>At least 12 characters</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${passwordStrength.requirements.uppercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        <CheckCircle className={`h-3 w-3 ${passwordStrength.requirements.uppercase ? '' : 'opacity-30'}`} />
                        <span>One uppercase letter (A-Z)</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${passwordStrength.requirements.lowercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        <CheckCircle className={`h-3 w-3 ${passwordStrength.requirements.lowercase ? '' : 'opacity-30'}`} />
                        <span>One lowercase letter (a-z)</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${passwordStrength.requirements.number ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        <CheckCircle className={`h-3 w-3 ${passwordStrength.requirements.number ? '' : 'opacity-30'}`} />
                        <span>One number (0-9)</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${passwordStrength.requirements.special ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        <CheckCircle className={`h-3 w-3 ${passwordStrength.requirements.special ? '' : 'opacity-30'}`} />
                        <span>One special character (!@#$%^&*...)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="input-clean w-full"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {isEncrypted 
                    ? 'Your history will be re-encrypted with the new password.'
                    : 'Your history will be encrypted. Remember this password to access it later. Password must meet all requirements above.'}
                </p>
              </div>
              
              <div className="flex gap-3">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading || !newPassword || !confirmPassword || (isEncrypted && !password) || (passwordStrength && passwordStrength.score < 5)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : (isEncrypted ? 'Change Password' : 'Set Password')}
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    // Don't allow canceling - force password setup
                    toast.error('Password setup is required to use history feature');
                  }}
                  className="px-4 py-3 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-white/20 transition-all opacity-50 cursor-not-allowed"
                  disabled
                >
                  Required
                </motion.button>
              </div>
            </form>
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
            <span className="gradient-text">Encryption History</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            View and manage your encryption and decryption history
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="glass rounded-xl p-4 border-clean">
            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{stats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Operations</div>
          </div>
          <div className="glass rounded-xl p-4 border-clean">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.encrypt}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Encryptions</div>
          </div>
          <div className="glass rounded-xl p-4 border-clean">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.decrypt}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Decryptions</div>
          </div>
          <div className="glass rounded-xl p-4 border-clean">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.files}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Files</div>
          </div>
        </motion.div>

        {/* Filters and Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass rounded-xl p-6 border-clean mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 md:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search history..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-clean w-full md:w-64 pl-10 pr-4 py-2 rounded-lg"
                />
              </div>

              {/* Filter */}
              <div className="flex gap-2">
                {['all', 'encrypt', 'decrypt'].map((f) => (
                  <motion.button
                    key={f}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filter === f
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportHistory}
                disabled={history.length === 0}
                className="px-4 py-2 bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                title="Export as JSON"
              >
                <Download className="h-4 w-4" />
                <span>Export JSON</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportToPDF}
                disabled={history.length === 0}
                className="px-4 py-2 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                title="Export as PDF"
              >
                <FileText className="h-4 w-4" />
                <span>Export PDF</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPasswordSetupModal(true)}
                className="px-4 py-2 bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all flex items-center space-x-2"
                title={isEncrypted ? "Change password" : "Set password protection"}
              >
                <Lock className="h-4 w-4" />
                <span>{isEncrypted ? 'Change Password' : 'Set Password'}</span>
              </motion.button>
              {isEncrypted && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRemovePassword}
                  disabled={isLoading}
                  className="px-4 py-2 bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  title="Remove password protection"
                >
                  <Unlock className="h-4 w-4" />
                  <span>Remove Password</span>
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearHistory}
                disabled={history.length === 0}
                className="px-4 py-2 bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear All</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* History List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {filteredHistory.length === 0 ? (
            <div className="glass rounded-xl p-12 border-clean text-center">
              <HistoryIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                {history.length === 0 ? 'No History Yet' : 'No Results Found'}
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                {history.length === 0 
                  ? 'Start encrypting or decrypting to see your history here'
                  : 'Try adjusting your filters or search term'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="glass rounded-xl p-6 border-clean hover:border-accent transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`p-3 rounded-lg ${
                        item.type === 'encrypt' 
                          ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                          : 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                      }`}>
                        {item.type === 'encrypt' ? (
                          <Zap className="h-5 w-5" />
                        ) : (
                          <Unlock className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {item.type === 'file' ? (
                            <File className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                          ) : (
                            <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          )}
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {item.filename || `${item.type === 'encrypt' ? 'Text Encryption' : 'Text Decryption'}`}
                          </h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.type === 'encrypt'
                              ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                              : 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                          }`}>
                            {item.type === 'encrypt' ? 'Encrypt' : 'Decrypt'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(item.timestamp).toLocaleString()}</span>
                          </div>
                          <span>AES-{item.keySize}</span>
                          {item.speed && <span>{item.speed}</span>}
                          {item.mode && <span>Mode: {item.mode}</span>}
                        </div>
                        {item.message && (
                          <div className="mt-2 text-xs font-mono text-gray-500 dark:text-gray-500 break-all">
                            Message: {item.message}
                          </div>
                        )}
                        {item.ciphertext && (
                          <div className="mt-2 text-xs font-mono text-gray-500 dark:text-gray-500 break-all">
                            Ciphertext: {item.ciphertext}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.hashBefore && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => copyToClipboard(item.hashBefore, 'Hash')}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all"
                          title="Copy Hash"
                        >
                          <Copy className="h-4 w-4" />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteItem(item.id, item.type)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default History;

