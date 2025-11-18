const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');

// Import our AES implementations
const { AES } = require('./aes_implementation');
const { AESEnhanced } = require('./aes_enhanced');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for desktop app
  },
});

// API Routes
app.post('/api/encrypt', async (req, res) => {
  try {
    const { message, key, key_size } = req.body;
    
    // Normalize inputs (strip whitespace/newlines) and uppercase
    const cleanMessage = (message || '').replace(/\s+/g, '').toUpperCase();
    const cleanKey = (key || '').replace(/\s+/g, '').toUpperCase();
    
    // Validate inputs
    if (!cleanMessage || !cleanKey || !key_size) {
      return res.status(400).json({ error: 'Missing required fields', details: { messageLen: (cleanMessage||'').length, keyLen: (cleanKey||'').length, keySize } });
    }

    const expectedKeyLength = parseInt(key_size) / 4;
    if (cleanKey.length !== expectedKeyLength) {
      return res.status(400).json({ 
        error: `Key must be exactly ${expectedKeyLength} hex characters for AES-${key_size}`,
        details: { keyLen: cleanKey.length, expectedKeyLength }
      });
    }

    if (cleanMessage.length !== 32) {
      return res.status(400).json({ 
        error: 'Message must be exactly 32 hex characters (16 bytes)',
        details: { messageLen: cleanMessage.length, expectedMessageLength: 32 }
      });
    }

    // Length must be even for valid hex pairs
    if (cleanMessage.length % 2 !== 0) {
      return res.status(400).json({ error: 'Invalid hex string length for message (must be even)' });
    }
    if (cleanKey.length % 2 !== 0) {
      return res.status(400).json({ error: 'Invalid hex string length for key (must be even)' });
    }

    // Ensure only valid hex characters
    const hexRegex = /^[0-9A-F]+$/;
    if (!hexRegex.test(cleanMessage)) {
      return res.status(400).json({ error: 'Message contains non-hex characters' });
    }
    if (!hexRegex.test(cleanKey)) {
      return res.status(400).json({ error: 'Key contains non-hex characters' });
    }

    // Create AES instance and encrypt
    const aes = new AES(parseInt(key_size));
    let results;
    try {
      results = aes.encrypt(cleanMessage, cleanKey);
    } catch (e) {
      // Convert low-level hex errors to 400s
      const msg = String(e.message || e);
      if (msg.includes('Invalid hex string length') || msg.includes('Invalid hex character')) {
        return res.status(400).json({ error: msg });
      }
      throw e;
    }
    
    res.json(results);
  } catch (error) {
    console.error('Encryption error:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: error.message,
      details: error.stack 
    });
  }
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Convert file to hex
    const hex = req.file.buffer.toString('hex').toUpperCase();
    
    // Pad to 16 bytes (32 hex chars) for AES
    const padded = hex.padEnd(32, '0').substring(0, 32);
    
    res.json({
      filename: req.file.originalname,
      size: req.file.size,
      hex: padded,
      message: 'File converted to hex successfully'
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Batch encryption endpoint
app.post('/api/batch-encrypt', async (req, res) => {
  try {
    const { messages, key, key_size } = req.body;
    
    if (!messages || !Array.isArray(messages) || !key || !key_size) {
      return res.status(400).json({ error: 'Invalid request format' });
    }

    const aes = new AES(parseInt(key_size));
    const results = [];

    for (const message of messages) {
      try {
        const result = aes.encrypt(message, key);
        results.push({
          message,
          success: true,
          result
        });
      } catch (error) {
        results.push({
          message,
          success: false,
          error: error.message
        });
      }
    }

    res.json({ results });
  } catch (error) {
    console.error('Batch encryption error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Performance test endpoint
app.post('/api/performance-test', async (req, res) => {
  try {
    const { message, key, key_size, iterations = 100 } = req.body;
    
    const aes = new AES(parseInt(key_size));
    const times = [];
    
    // Warm up
    aes.encrypt(message, key);
    
    // Performance test
    for (let i = 0; i < iterations; i++) {
      const start = process.hrtime.bigint();
      aes.encrypt(message, key);
      const end = process.hrtime.bigint();
      times.push(Number(end - start) / 1000000); // Convert to milliseconds
    }
    
    const stats = {
      min: Math.min(...times),
      max: Math.max(...times),
      avg: times.reduce((a, b) => a + b, 0) / times.length,
      median: times.sort((a, b) => a - b)[Math.floor(times.length / 2)],
      iterations
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Performance test error:', error);
    res.status(500).json({ error: error.message });
  }
});

// File encryption endpoint
app.post('/api/encrypt-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { key, key_size, iv, mode = 'CBC' } = req.body;
    
    if (!key || !key_size) {
      return res.status(400).json({ error: 'Key and key_size are required' });
    }

    const cleanKey = (key || '').replace(/\s+/g, '').toUpperCase();
    const expectedKeyLength = parseInt(key_size) / 4;
    
    if (cleanKey.length !== expectedKeyLength) {
      return res.status(400).json({ 
        error: `Key must be exactly ${expectedKeyLength} hex characters for AES-${key_size}`
      });
    }

    const aes = new AESEnhanced(parseInt(key_size));
    const fileBuffer = req.file.buffer;
    
    // Calculate SHA-256 hash before encryption
    const hashBefore = crypto.createHash('sha256').update(fileBuffer).digest('hex').toUpperCase();
    
    let encryptedBuffer;
    let usedIV = iv;
    
    if (mode === 'CBC') {
      if (!iv) {
        usedIV = aes.generateRandomIV();
      } else {
        usedIV = (iv || '').replace(/\s+/g, '').toUpperCase();
        if (usedIV.length !== 32) {
          return res.status(400).json({ error: 'IV must be exactly 32 hex characters (16 bytes)' });
        }
      }
      encryptedBuffer = aes.encryptCBC(Array.from(fileBuffer), cleanKey, usedIV);
    } else {
      // ECB mode (not recommended but supported)
      const padded = aes.pkcs7Pad(Array.from(fileBuffer));
      const encrypted = [];
      for (let i = 0; i < padded.length; i += 16) {
        const block = padded.slice(i, i + 16);
        const encryptedBlock = aes.encryptBlock(block, cleanKey);
        encrypted.push(...encryptedBlock);
      }
      encryptedBuffer = Buffer.from(encrypted);
    }
    
    // Calculate SHA-256 hash after encryption
    const hashAfter = crypto.createHash('sha256').update(encryptedBuffer).digest('hex').toUpperCase();
    
    res.json({
      success: true,
      filename: req.file.originalname,
      originalSize: fileBuffer.length,
      encryptedSize: encryptedBuffer.length,
      encryptedData: encryptedBuffer.toString('base64'),
      hashBefore,
      hashAfter,
      iv: usedIV,
      mode,
      keySize: key_size
    });
  } catch (error) {
    console.error('File encryption error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Text decryption endpoint
app.post('/api/decrypt', async (req, res) => {
  try {
    const { ciphertext, key, key_size } = req.body;
    
    // Normalize inputs (strip whitespace/newlines) and uppercase
    const cleanCiphertext = (ciphertext || '').replace(/\s+/g, '').toUpperCase();
    const cleanKey = (key || '').replace(/\s+/g, '').toUpperCase();
    
    // Validate inputs
    if (!cleanCiphertext || !cleanKey || !key_size) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const expectedKeyLength = parseInt(key_size) / 4;
    if (cleanKey.length !== expectedKeyLength) {
      return res.status(400).json({ 
        error: `Key must be exactly ${expectedKeyLength} hex characters for AES-${key_size}`
      });
    }

    if (cleanCiphertext.length !== 32) {
      return res.status(400).json({ 
        error: 'Ciphertext must be exactly 32 hex characters (16 bytes)'
      });
    }

    // Length must be even for valid hex pairs
    if (cleanCiphertext.length % 2 !== 0) {
      return res.status(400).json({ error: 'Invalid hex string length for ciphertext (must be even)' });
    }
    if (cleanKey.length % 2 !== 0) {
      return res.status(400).json({ error: 'Invalid hex string length for key (must be even)' });
    }

    // Ensure only valid hex characters
    const hexRegex = /^[0-9A-F]+$/;
    if (!hexRegex.test(cleanCiphertext)) {
      return res.status(400).json({ error: 'Ciphertext contains non-hex characters' });
    }
    if (!hexRegex.test(cleanKey)) {
      return res.status(400).json({ error: 'Key contains non-hex characters' });
    }

    // Create AES instance and decrypt
    const aes = new AES(parseInt(key_size));
    let results;
    try {
      results = aes.decrypt(cleanCiphertext, cleanKey);
    } catch (e) {
      // Convert low-level hex errors to 400s
      const msg = String(e.message || e);
      if (msg.includes('Invalid hex string length') || msg.includes('Invalid hex character')) {
        return res.status(400).json({ error: msg });
      }
      throw e;
    }
    
    res.json(results);
  } catch (error) {
    console.error('Decryption error:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: error.message,
      details: error.stack 
    });
  }
});

// File decryption endpoint
app.post('/api/decrypt-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { key, key_size, iv, mode = 'CBC' } = req.body;
    
    if (!key || !key_size) {
      return res.status(400).json({ error: 'Key and key_size are required' });
    }

    const cleanKey = (key || '').replace(/\s+/g, '').toUpperCase();
    const expectedKeyLength = parseInt(key_size) / 4;
    
    if (cleanKey.length !== expectedKeyLength) {
      return res.status(400).json({ 
        error: `Key must be exactly ${expectedKeyLength} hex characters for AES-${key_size}`
      });
    }

    const aes = new AESEnhanced(parseInt(key_size));
    const encryptedBuffer = req.file.buffer;
    
    // Calculate SHA-256 hash before decryption
    const hashBefore = crypto.createHash('sha256').update(encryptedBuffer).digest('hex').toUpperCase();
    
    let decryptedBuffer;
    
    if (mode === 'CBC') {
      if (!iv) {
        return res.status(400).json({ error: 'IV is required for CBC mode decryption' });
      }
      const cleanIV = (iv || '').replace(/\s+/g, '').toUpperCase();
      if (cleanIV.length !== 32) {
        return res.status(400).json({ error: 'IV must be exactly 32 hex characters (16 bytes)' });
      }
      decryptedBuffer = aes.decryptCBC(Array.from(encryptedBuffer), cleanKey, cleanIV);
    } else {
      // ECB mode
      const decrypted = [];
      for (let i = 0; i < encryptedBuffer.length; i += 16) {
        const block = Array.from(encryptedBuffer.slice(i, i + 16));
        const decryptedBlock = aes.decryptBlock(block, cleanKey);
        decrypted.push(...decryptedBlock);
      }
      const unpadded = aes.pkcs7Unpad(decrypted);
      decryptedBuffer = Buffer.from(unpadded);
    }
    
    // Calculate SHA-256 hash after decryption
    const hashAfter = crypto.createHash('sha256').update(decryptedBuffer).digest('hex').toUpperCase();
    
    res.json({
      success: true,
      filename: req.file.originalname,
      encryptedSize: encryptedBuffer.length,
      decryptedSize: decryptedBuffer.length,
      decryptedData: decryptedBuffer.toString('base64'),
      hashBefore,
      hashAfter,
      mode,
      keySize: key_size
    });
  } catch (error) {
    console.error('File decryption error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate random key endpoint
app.post('/api/generate-key', (req, res) => {
  try {
    const { key_size = '128' } = req.body;
    const aes = new AESEnhanced(parseInt(key_size));
    const key = aes.generateRandomKey();
    const iv = aes.generateRandomIV();
    
    res.json({
      key,
      iv,
      keySize: key_size
    });
  } catch (error) {
    console.error('Key generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Password-based key derivation (PBKDF2)
app.post('/api/derive-key', (req, res) => {
  try {
    const { password, key_size = '128', salt } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const keyBytes = parseInt(key_size) / 8;
    const saltBuffer = salt ? Buffer.from(salt, 'hex') : crypto.randomBytes(16);
    
    // Use PBKDF2 with 100,000 iterations (industry standard)
    const derivedKey = crypto.pbkdf2Sync(password, saltBuffer, 100000, keyBytes, 'sha256');
    const derivedKeyHex = derivedKey.toString('hex').toUpperCase();
    const saltHex = saltBuffer.toString('hex').toUpperCase();
    
    res.json({
      key: derivedKeyHex,
      salt: saltHex,
      keySize: key_size,
      iterations: 100000
    });
  } catch (error) {
    console.error('Key derivation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 AES Encryption Tool server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔧 API: http://localhost:${PORT}/api`);
});

