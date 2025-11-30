const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');

// Import our AES implementations
const { AES } = require('./aes_implementation');
const { AESEnhanced } = require('./aes_enhanced');
const { AESAdvanced } = require('./aes_advanced');

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

    // Auto-pad odd-length hex strings with leading zero
    if (cleanMessage.length % 2 !== 0) {
      cleanMessage = '0' + cleanMessage;
    }

    if (cleanMessage.length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }
    // Auto-pad odd-length hex strings with leading zero
    if (cleanKey.length % 2 !== 0) {
      cleanKey = '0' + cleanKey;
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
    // Support both file upload (multer) and JSON with base64 fileData
    let fileBuffer;
    let filename;
    
    if (req.file) {
      // Traditional file upload via multer
      fileBuffer = req.file.buffer;
      filename = req.file.originalname;
    } else if (req.body.fileData) {
      // JSON request with base64 fileData (for text files and Netlify compatibility)
      fileBuffer = Buffer.from(req.body.fileData, 'base64');
      filename = req.body.filename || 'encrypted_file';
    } else {
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
        // Ensure block is exactly 16 bytes (should always be with proper padding)
        if (block.length < 16) {
          // Pad to 16 bytes if somehow incomplete
          while (block.length < 16) {
            block.push(0);
          }
        }
        const encryptedBlock = aes.encryptBlock(block, cleanKey);
        encrypted.push(...encryptedBlock);
      }
      encryptedBuffer = Buffer.from(encrypted);
    }
    
    // Calculate SHA-256 hash after encryption
    const hashAfter = crypto.createHash('sha256').update(encryptedBuffer).digest('hex').toUpperCase();
    
    res.json({
      success: true,
      filename: filename,
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
    const { ciphertext, key, key_size, iv, mode = 'ECB' } = req.body;
    
    // Normalize inputs (strip whitespace/newlines) and uppercase
    const cleanCiphertext = (ciphertext || '').replace(/\s+/g, '').toUpperCase();
    const cleanKey = (key || '').replace(/\s+/g, '').toUpperCase();
    const cleanIV = iv ? (iv || '').replace(/\s+/g, '').toUpperCase() : null;
    
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

    // Validate IV for CBC mode
    if (mode === 'CBC' && !cleanIV) {
      return res.status(400).json({ error: 'IV is required for CBC mode decryption' });
    }
    if (mode === 'CBC' && cleanIV && cleanIV.length !== 32) {
      return res.status(400).json({ error: 'IV must be exactly 32 hex characters (16 bytes)' });
    }

    // Auto-pad odd-length hex strings with a leading zero for both ciphertext and key
    let processedCiphertext = cleanCiphertext.length % 2 !== 0 ? '0' + cleanCiphertext : cleanCiphertext;
    let processedKey = cleanKey.length % 2 !== 0 ? '0' + cleanKey : cleanKey;
    
    if (processedCiphertext.length === 0) {
      return res.status(400).json({ error: 'Ciphertext cannot be empty' });
    }
    
    // Track original length before padding
    const originalLength = processedCiphertext.length;
    const originalByteLength = Math.ceil(originalLength / 2);
    
    // Auto-pad ciphertext to nearest multiple of 32 hex characters (16 bytes) for block cipher
    // This allows decryption of any length ciphertext
    const remainder = processedCiphertext.length % 32;
    let wasAutoPadded = false;
    if (remainder !== 0) {
      // Pad with zeros to reach the next 16-byte boundary
      const paddingNeeded = 32 - remainder;
      processedCiphertext = processedCiphertext + '0'.repeat(paddingNeeded);
      wasAutoPadded = true;
    }

    // Ensure only valid hex characters
    const hexRegex = /^[0-9A-F]+$/;
    if (!hexRegex.test(processedCiphertext)) {
      return res.status(400).json({ error: 'Ciphertext contains non-hex characters' });
    }
    if (!hexRegex.test(processedKey)) {
      return res.status(400).json({ error: 'Key contains non-hex characters' });
    }
    if (cleanIV && !hexRegex.test(cleanIV)) {
      return res.status(400).json({ error: 'IV contains non-hex characters' });
    }

    // Create AES instance and decrypt
    const aes = new AESEnhanced(parseInt(key_size));
    let results;
    
    try {
      if (mode === 'CBC' && cleanIV) {
        // CBC mode decryption with visualization
        const ciphertextBytes = aes.hexToBytes(processedCiphertext);
        
        // Decrypt first block using original AES for visualization (before CBC XOR)
        const firstBlockHex = aes.bytesToHex(ciphertextBytes.slice(0, 16));
        const basicAes = new AES(parseInt(key_size));
        const firstBlockResult = basicAes.decrypt(firstBlockHex, processedKey);
        
        // Get visualization data from first block
        const visualizationRounds = firstBlockResult.rounds || [];
        const visualizationExpandedKey = firstBlockResult.expanded_key || [];
        const visualizationInitialState = firstBlockResult.initial_state || null;
        
        // Now decrypt using CBC mode
        const decryptedBytes = aes.decryptCBC(ciphertextBytes, processedKey, cleanIV);
        
        // Try to remove PKCS7 padding
        let unpadded;
        try {
          unpadded = aes.pkcs7Unpad(decryptedBytes);
        } catch (paddingError) {
          if (wasAutoPadded) {
            const completeBlocks = Math.floor(originalByteLength / 16) * 16;
            if (completeBlocks > 0) {
              const trimmedBlocks = decryptedBytes.slice(0, completeBlocks);
              try {
                unpadded = aes.pkcs7Unpad(trimmedBlocks);
              } catch (e) {
                unpadded = trimmedBlocks;
              }
            } else {
              unpadded = decryptedBytes.slice(0, Math.min(originalByteLength, decryptedBytes.length));
            }
          } else {
            unpadded = decryptedBytes;
          }
        }
        
        results = {
          final_plaintext: aes.bytesToHex(unpadded),
          plaintext: aes.bytesToHex(unpadded),
          mode: 'CBC',
          rounds: visualizationRounds,
          initial_state: visualizationInitialState,
          expanded_key: visualizationExpandedKey
        };
      } else {
        // ECB mode (default)
        // If ciphertext is exactly 16 bytes (32 hex chars), use original AES for visualization
        if (processedCiphertext.length === 32) {
          const basicAes = new AES(parseInt(key_size)); // Original AES for visualization
          results = basicAes.decrypt(processedCiphertext, processedKey);
        } else {
          // For other lengths, decrypt first block with full visualization, then process remaining blocks
          const ciphertextBytes = aes.hexToBytes(processedCiphertext);
          const decryptedBlocks = [];
          
          // Decrypt first block using original AES for visualization
          const firstBlockHex = aes.bytesToHex(ciphertextBytes.slice(0, 16));
          const basicAes = new AES(parseInt(key_size));
          const firstBlockResult = basicAes.decrypt(firstBlockHex, processedKey);
          
          // Get visualization data from first block
          const visualizationRounds = firstBlockResult.rounds || [];
          const visualizationExpandedKey = firstBlockResult.expanded_key || [];
          const visualizationInitialState = firstBlockResult.initial_state || null;
          
          // Add first block decrypted bytes (use final_plaintext or plaintext)
          const firstBlockPlaintextHex = firstBlockResult.final_plaintext || firstBlockResult.plaintext || '';
          const firstBlockPlaintextBytes = aes.hexToBytes(firstBlockPlaintextHex);
          decryptedBlocks.push(...firstBlockPlaintextBytes);
          
          // Decrypt remaining blocks using AESEnhanced
          for (let i = 16; i < ciphertextBytes.length; i += 16) {
            const block = ciphertextBytes.slice(i, i + 16);
            if (block.length === 16) {
              const decryptedBlock = aes.decryptBlock(block, processedKey);
              decryptedBlocks.push(...decryptedBlock);
            }
          }
          
          // Try to remove PKCS7 padding, but handle invalid padding gracefully
          let unpadded;
          try {
            unpadded = aes.pkcs7Unpad(decryptedBlocks);
          } catch (paddingError) {
            // If padding is invalid (e.g., due to auto-padding), handle gracefully
            if (wasAutoPadded) {
              // If we auto-padded, only return bytes from complete blocks in original ciphertext
              // This avoids including garbage bytes from the auto-padded portion
              const completeBlocks = Math.floor(originalByteLength / 16) * 16;
              if (completeBlocks > 0) {
                const trimmedBlocks = decryptedBlocks.slice(0, completeBlocks);
                try {
                  unpadded = aes.pkcs7Unpad(trimmedBlocks);
                } catch (e) {
                  // If still invalid, return trimmed data (might include some padding bytes)
                  unpadded = trimmedBlocks;
                }
              } else {
                // Original was less than one complete block, return what we have
                unpadded = decryptedBlocks.slice(0, Math.min(originalByteLength, decryptedBlocks.length));
              }
            } else {
              // If not auto-padded but padding is still invalid, return as-is
              unpadded = decryptedBlocks;
            }
          }
          results = {
            final_plaintext: aes.bytesToHex(unpadded),
            plaintext: aes.bytesToHex(unpadded),
            mode: 'ECB',
            rounds: visualizationRounds, // Use visualization from first block
            initial_state: visualizationInitialState, // Use visualization from first block
            expanded_key: visualizationExpandedKey // Use visualization from first block
          };
        }
      }
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
    // Support both file upload (multer) and JSON with base64 fileData
    let encryptedBuffer;
    let filename;
    
    if (req.file) {
      // Traditional file upload via multer
      encryptedBuffer = req.file.buffer;
      filename = req.file.originalname;
    } else if (req.body.fileData) {
      // JSON request with base64 fileData (for text files and Netlify compatibility)
      encryptedBuffer = Buffer.from(req.body.fileData, 'base64');
      filename = req.body.filename || 'decrypted_file';
    } else {
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
      // Ensure encrypted buffer is a multiple of 16 bytes
      if (encryptedBuffer.length % 16 !== 0) {
        return res.status(400).json({ error: 'Encrypted file size must be a multiple of 16 bytes for ECB mode' });
      }
      
      const decrypted = [];
      for (let i = 0; i < encryptedBuffer.length; i += 16) {
        const block = Array.from(encryptedBuffer.slice(i, i + 16));
        // Ensure block is exactly 16 bytes
        if (block.length < 16) {
          // Pad incomplete block (shouldn't happen if encrypted correctly)
          while (block.length < 16) {
            block.push(0);
          }
        }
        const decryptedBlock = aes.decryptBlock(block, cleanKey);
        decrypted.push(...decryptedBlock);
      }
      
      // Try to remove padding, but handle errors gracefully
      let unpadded;
      try {
        unpadded = aes.pkcs7Unpad(decrypted);
      } catch (paddingError) {
        // If padding is invalid, return the decrypted data as-is
        // This might happen if the file wasn't encrypted with PKCS7 padding
        console.warn('Padding validation failed, returning decrypted data without unpadding:', paddingError.message);
        unpadded = decrypted;
      }
      decryptedBuffer = Buffer.from(unpadded);
    }
    
    // Calculate SHA-256 hash after decryption
    const hashAfter = crypto.createHash('sha256').update(decryptedBuffer).digest('hex').toUpperCase();
    
    res.json({
      success: true,
      filename: filename,
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
app.options('/api/generate-key', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});

app.post('/api/generate-key', (req, res) => {
  try {
    const { key_size = '128' } = req.body || {};
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

// Advanced encryption modes endpoint
app.post('/api/encrypt-advanced', async (req, res) => {
  try {
    const { message, key, key_size, mode, iv, nonce, additionalData } = req.body;
    
    if (!message || !key || !key_size || !mode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const cleanMessage = (message || '').replace(/\s+/g, '').toUpperCase();
    const cleanKey = (key || '').replace(/\s+/g, '').toUpperCase();
    const expectedKeyLength = parseInt(key_size) / 4;
    
    if (cleanKey.length !== expectedKeyLength) {
      return res.status(400).json({ 
        error: `Key must be exactly ${expectedKeyLength} hex characters for AES-${key_size}`
      });
    }

    const aes = new AESAdvanced(parseInt(key_size));
    const messageBytes = aes.hexToBytes(cleanMessage);
    
    // For modes that need padding (XTS), pad the message
    // For streaming modes (CTR, CFB, OFB), use as-is
    let processedMessage = messageBytes;
    if (mode.toUpperCase() === 'XTS') {
      // XTS requires full blocks
      processedMessage = aes.padIfNeeded(messageBytes, 16);
    }
    
    let result;

    switch (mode.toUpperCase()) {
      case 'CTR':
        if (!nonce) {
          return res.status(400).json({ error: 'Nonce is required for CTR mode' });
        }
        result = aes.encryptCTR(processedMessage, cleanKey, nonce);
        break;
      case 'CFB':
        if (!iv) {
          return res.status(400).json({ error: 'IV is required for CFB mode' });
        }
        result = aes.encryptCFB(processedMessage, cleanKey, iv);
        break;
      case 'OFB':
        if (!iv) {
          return res.status(400).json({ error: 'IV is required for OFB mode' });
        }
        result = aes.encryptOFB(processedMessage, cleanKey, iv);
        break;
      case 'XTS':
        if (!iv) {
          return res.status(400).json({ error: 'Tweak is required for XTS mode' });
        }
        result = aes.encryptXTS(processedMessage, cleanKey, iv);
        break;
      case 'GCM':
        if (!iv) {
          return res.status(400).json({ error: 'IV is required for GCM mode' });
        }
        const gcmResult = await aes.encryptGCM(messageBytes, cleanKey, iv, 
          additionalData ? Buffer.from(additionalData, 'hex') : null);
        result = gcmResult.ciphertext;
        return res.json({
          ciphertext: aes.bytesToHex(result),
          tag: aes.bytesToHex(gcmResult.tag),
          mode: 'GCM'
        });
      default:
        return res.status(400).json({ error: `Unsupported mode: ${mode}` });
    }

    res.json({
      ciphertext: aes.bytesToHex(result),
      mode: mode.toUpperCase()
    });
  } catch (error) {
    console.error('Advanced encryption error:', error);
    res.status(500).json({ error: error.message });
  }
});

// HMAC calculation endpoint
app.post('/api/calculate-hmac', (req, res) => {
  try {
    const { data, key, algorithm = 'sha256' } = req.body;
    
    if (!data || !key) {
      return res.status(400).json({ error: 'Data and key are required' });
    }

    const aes = new AESAdvanced();
    const dataBytes = aes.hexToBytes(data.replace(/\s+/g, '').toUpperCase());
    const keyBytes = aes.hexToBytes(key.replace(/\s+/g, '').toUpperCase());
    
    const hmac = aes.calculateHMAC(dataBytes, keyBytes, algorithm);
    
    res.json({
      hmac: Buffer.from(hmac).toString('hex').toUpperCase(),
      algorithm: algorithm.toUpperCase()
    });
  } catch (error) {
    console.error('HMAC calculation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Avalanche effect demonstration endpoint
app.post('/api/avalanche-demo', (req, res) => {
  try {
    const { plaintext, key, bitToFlip = 0 } = req.body;
    
    if (!plaintext || !key) {
      return res.status(400).json({ error: 'Plaintext and key are required' });
    }

    const aes = new AESAdvanced();
    const plaintextBytes = aes.hexToBytes(plaintext.replace(/\s+/g, '').toUpperCase());
    const keyBytes = aes.hexToBytes(key.replace(/\s+/g, '').toUpperCase());
    
    const result = aes.demonstrateAvalanche(plaintextBytes, keyBytes, bitToFlip);
    
    res.json({
      original: aes.bytesToHex(result.original),
      modified: aes.bytesToHex(result.modified),
      differences: result.differences,
      percentage: result.percentage.toFixed(2)
    });
  } catch (error) {
    console.error('Avalanche demo error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Enhanced key derivation with configurable parameters
app.post('/api/derive-key-advanced', (req, res) => {
  try {
    const { password, key_size = '128', salt, iterations = 100000, algorithm = 'pbkdf2' } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const keyBytes = parseInt(key_size) / 8;
    const saltBuffer = salt ? Buffer.from(salt, 'hex') : crypto.randomBytes(16);
    
    let derivedKey;
    if (algorithm.toLowerCase() === 'pbkdf2') {
      derivedKey = crypto.pbkdf2Sync(password, saltBuffer, iterations, keyBytes, 'sha256');
    } else {
      // Argon2id would go here (requires argon2 library)
      return res.status(400).json({ error: 'Argon2id requires additional library. Use PBKDF2 for now.' });
    }
    
    const derivedKeyHex = derivedKey.toString('hex').toUpperCase();
    const saltHex = saltBuffer.toString('hex').toUpperCase();
    
    res.json({
      key: derivedKeyHex,
      salt: saltHex,
      keySize: key_size,
      iterations: iterations,
      algorithm: algorithm.toUpperCase()
    });
  } catch (error) {
    console.error('Key derivation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Password strength calculation
app.post('/api/password-strength', (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    let strength = 0;
    let feedback = [];

    // Length check
    if (password.length >= 12) strength += 2;
    else if (password.length >= 8) strength += 1;
    else feedback.push('Use at least 8 characters (12+ recommended)');

    // Character variety
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    const variety = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    strength += variety;

    if (!hasLower) feedback.push('Add lowercase letters');
    if (!hasUpper) feedback.push('Add uppercase letters');
    if (!hasNumber) feedback.push('Add numbers');
    if (!hasSpecial) feedback.push('Add special characters');

    // Common patterns
    const commonPatterns = ['123', 'abc', 'password', 'qwerty'];
    if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
      strength -= 1;
      feedback.push('Avoid common patterns');
    }

    // Entropy estimation
    const entropy = password.length * Math.log2(variety * 26 + (hasNumber ? 10 : 0) + (hasSpecial ? 32 : 0));
    
    let strengthLevel = 'weak';
    if (strength >= 6 && entropy > 50) strengthLevel = 'strong';
    else if (strength >= 4 && entropy > 30) strengthLevel = 'medium';
    
    res.json({
      strength: Math.min(Math.max(strength, 0), 10),
      level: strengthLevel,
      entropy: entropy.toFixed(2),
      feedback: feedback,
      length: password.length
    });
  } catch (error) {
    console.error('Password strength error:', error);
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

