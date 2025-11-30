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
  Copy
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';

const History = () => {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'encrypt', 'decrypt'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const encryptHistory = JSON.parse(localStorage.getItem('encryptionHistory') || '[]');
    const decryptHistory = JSON.parse(localStorage.getItem('decryptionHistory') || '[]');
    
    const combined = [
      ...encryptHistory.map(item => ({ ...item, type: 'encrypt' })),
      ...decryptHistory.map(item => ({ ...item, type: 'decrypt' }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    setHistory(combined);
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      localStorage.removeItem('encryptionHistory');
      localStorage.removeItem('decryptionHistory');
      setHistory([]);
      toast.success('History cleared!');
    }
  };

  const deleteItem = (id, type) => {
    const key = type === 'encrypt' ? 'encryptionHistory' : 'decryptionHistory';
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    const filtered = stored.filter(item => item.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
    loadHistory();
    toast.success('Item deleted!');
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

