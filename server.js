/**
 * Express Server for AES Encryption Tool
 * 
 * This server provides REST API endpoints for:
 * - Text encryption/decryption with visualization support
 * - File encryption/decryption (text and binary files)
 * - Advanced encryption modes (CTR, CFB, OFB, XTS, GCM)
 * - Key generation (random keys and PBKDF2 key derivation)
 * - HMAC calculation for integrity verification
 * 
 * Key Features:
 * - Supports AES-128, AES-192, AES-256
 * - Multiple encryption modes: ECB, CBC, CTR, CFB, OFB, XTS, GCM
 * - File upload handling with multer
 * - CORS enabled for cross-origin requests
 * - Serves React frontend build files
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');

// Import AES implementations
const { AES } = require('./aes_implementation'); // Original AES with visualization support
const { AESEnhanced } = require('./aes_enhanced'); // Enhanced AES with CBC mode and padding
const { AESAdvanced } = require('./aes_advanced'); // Advanced AES with multiple modes

const app = express();
const PORT = process.env.PORT || 8080; // Use environment port or default to 8080

// ========== Middleware Configuration ==========

app.use(cors()); // Enable CORS for all routes (allows frontend to call API)
app.use(express.json()); // Parse JSON request bodies
app.use(express.static(path.join(__dirname, 'client/build'))); // Serve React frontend build files

// ========== File Upload Configuration ==========

/**
 * Configure multer for handling file uploads
 * Uses memory storage (files stored in RAM, not disk)
 * 100MB file size limit
 */
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory as Buffer objects
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for desktop app
  },
});

// ========== API Routes ==========

/**
 * Text Encryption Endpoint
 * 
 * Encrypts plaintext message using AES with full visualization support
 * Supports ECB mode with step-by-step round visualization
 * 
 * Request body:
 * - message: hex string (plaintext)
 * - key: hex string (must match key_size)
 * - key_size: '128', '192', or '256'
 * 
 * Response:
 * - final_ciphertext: encrypted hex string
 * - rounds: array of round data for visualization
 * - expanded_key: key expansion data
 * - initial_state: initial state matrix
 */
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
    // Ensures valid hex byte pairs (each byte = 2 hex characters)
    if (cleanMessage.length % 2 !== 0) {
      cleanMessage = '0' + cleanMessage;
    }

    if (cleanMessage.length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }
    
    // Auto-pad odd-length key with leading zero
    if (cleanKey.length % 2 !== 0) {
      cleanKey = '0' + cleanKey;
    }

    // Validate hex format - only allow hexadecimal characters (0-9, A-F)
    const hexRegex = /^[0-9A-F]+$/;
    if (!hexRegex.test(cleanMessage)) {
      return res.status(400).json({ error: 'Message contains non-hex characters' });
    }
    if (!hexRegex.test(cleanKey)) {
      return res.status(400).json({ error: 'Key contains non-hex characters' });
    }

    // Create AES instance with specified key size and encrypt
    // Uses original AES class which provides full visualization data
    const aes = new AES(parseInt(key_size));
    let results;
    try {
      // Encrypt message - returns full result with visualization data
      results = aes.encrypt(cleanMessage, cleanKey);
    } catch (e) {
      // Convert low-level hex errors to user-friendly 400 responses
      const msg = String(e.message || e);
      if (msg.includes('Invalid hex string length') || msg.includes('Invalid hex character')) {
        return res.status(400).json({ error: msg });
      }
      throw e; // Re-throw unexpected errors
    }
    
    // Return encryption results with visualization data
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

/**
 * File Upload Endpoint
 * 
 * Converts uploaded file to hex format for encryption
 * Used for file-to-hex conversion before encryption
 * 
 * Request: multipart/form-data with 'file' field
 * Response: hex representation of file (padded to 16 bytes)
 */
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Convert file buffer to hexadecimal string
    const hex = req.file.buffer.toString('hex').toUpperCase();
    
    // Pad to 16 bytes (32 hex chars) for AES block size
    // This ensures the hex string is a valid AES block
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

/**
 * Batch Encryption Endpoint
 * 
 * Encrypts multiple messages with the same key
 * Useful for performance testing or bulk operations
 * 
 * Request body:
 * - messages: array of hex strings
 * - key: hex string
 * - key_size: '128', '192', or '256'
 * 
 * Response: array of encryption results (success/error per message)
 */
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

/**
 * Performance Test Endpoint
 * 
 * Measures encryption performance by running multiple iterations
 * Returns statistical data (min, max, avg, median execution times)
 * 
 * Request body:
 * - message: hex string to encrypt
 * - key: hex string
 * - key_size: '128', '192', or '256'
 * - iterations: number of test iterations (default: 100)
 * 
 * Response: performance statistics in milliseconds
 */
app.post('/api/performance-test', async (req, res) => {
  try {
    const { message, key, key_size, iterations = 100 } = req.body;
    
    const aes = new AES(parseInt(key_size));
    const times = [];
    
    // Warm up JIT compiler and cache
    aes.encrypt(message, key);
    
    // Performance test - run encryption multiple times and measure
    for (let i = 0; i < iterations; i++) {
      const start = process.hrtime.bigint(); // High-resolution timer
      aes.encrypt(message, key);
      const end = process.hrtime.bigint();
      times.push(Number(end - start) / 1000000); // Convert nanoseconds to milliseconds
    }
    
    // Calculate performance statistics
    const stats = {
      min: Math.min(...times), // Fastest encryption
      max: Math.max(...times), // Slowest encryption
      avg: times.reduce((a, b) => a + b, 0) / times.length, // Average time
      median: times.sort((a, b) => a - b)[Math.floor(times.length / 2)], // Median time
      iterations
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Performance test error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * File Encryption Endpoint
 * 
 * Encrypts files of any type (text, binary, images, etc.)
 * Supports both multer file uploads and JSON with base64 fileData
 * 
 * Request: multipart/form-data with 'file' OR JSON with 'fileData' (base64)
 * Body parameters:
 * - key: hex string
 * - key_size: '128', '192', or '256'
 * - mode: 'CBC' or 'ECB' (default: 'CBC')
 * - iv: hex string (required for CBC, auto-generated if not provided)
 * 
 * Response:
 * - encryptedData: base64 encoded encrypted file
 * - hashBefore: SHA-256 hash of original file
 * - hashAfter: SHA-256 hash of encrypted file
 * - iv: IV used for encryption
 * - mode: encryption mode used
 */
app.post('/api/encrypt-file', upload.single('file'), async (req, res) => {
  try {
    // Support both file upload (multer) and JSON with base64 fileData
    // This allows compatibility with both traditional uploads and serverless functions
    let fileBuffer;
    let filename;
    
    if (req.file) {
      // Traditional file upload via multer (binary file)
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

    // Create AES instance with enhanced features (CBC mode, padding support)
    const aes = new AESEnhanced(parseInt(key_size));
    
    // Calculate SHA-256 hash of original file for integrity verification
    // This allows users to verify file integrity after decryption
    const hashBefore = crypto.createHash('sha256').update(fileBuffer).digest('hex').toUpperCase();
    
    let encryptedBuffer;
    let usedIV = iv;
    
    // Encrypt based on selected mode
    if (mode === 'CBC') {
      // CBC mode: requires IV, generates random IV if not provided
      if (!iv) {
        usedIV = aes.generateRandomIV(); // Generate cryptographically secure random IV
      } else {
        // Validate and clean provided IV
        usedIV = (iv || '').replace(/\s+/g, '').toUpperCase();
        if (usedIV.length !== 32) {
          return res.status(400).json({ error: 'IV must be exactly 32 hex characters (16 bytes)' });
        }
      }
      // Encrypt using CBC mode (chaining blocks with IV)
      encryptedBuffer = aes.encryptCBC(Array.from(fileBuffer), cleanKey, usedIV);
    } else {
      // ECB mode (not recommended for security but supported)
      // ECB encrypts each block independently (no chaining)
      const padded = aes.pkcs7Pad(Array.from(fileBuffer)); // Add PKCS7 padding
      const encrypted = [];
      // Encrypt each 16-byte block
      for (let i = 0; i < padded.length; i += 16) {
        const block = padded.slice(i, i + 16);
        // Ensure block is exactly 16 bytes (should always be with proper padding)
        if (block.length < 16) {
          // Safety check: pad to 16 bytes if somehow incomplete
          while (block.length < 16) {
            block.push(0);
          }
        }
        const encryptedBlock = aes.encryptBlock(block, cleanKey);
        encrypted.push(...encryptedBlock);
      }
      encryptedBuffer = Buffer.from(encrypted);
    }
    
    // Calculate SHA-256 hash of encrypted file for integrity verification
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

/**
 * Text Decryption Endpoint
 * 
 * Decrypts ciphertext with full visualization support for ECB/CBC modes
 * Supports both single-block and multi-block ciphertext
 * 
 * Request body:
 * - ciphertext: hex string
 * - key: hex string (must match key_size)
 * - key_size: '128', '192', or '256'
 * - mode: 'ECB' or 'CBC' (default: 'ECB')
 * - iv: hex string (required for CBC mode)
 * 
 * Response:
 * - final_plaintext: decrypted hex string
 * - rounds: array of round data for visualization (ECB/CBC only)
 * - expanded_key: key expansion data (ECB/CBC only)
 * - initial_state: initial state matrix (ECB/CBC only)
 */
app.post('/api/decrypt', async (req, res) => {
  try {
    const { ciphertext, key, key_size, iv, mode = 'ECB' } = req.body;
    
    // Normalize inputs: remove whitespace/newlines and convert to uppercase
    const cleanCiphertext = (ciphertext || '').replace(/\s+/g, '').toUpperCase();
    const cleanKey = (key || '').replace(/\s+/g, '').toUpperCase();
    const cleanIV = iv ? (iv || '').replace(/\s+/g, '').toUpperCase() : null;
    
    // Validate required inputs
    if (!cleanCiphertext || !cleanKey || !key_size) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate key length matches selected key size
    const expectedKeyLength = parseInt(key_size) / 4; // Key size in bits / 4 = hex characters
    if (cleanKey.length !== expectedKeyLength) {
      return res.status(400).json({ 
        error: `Key must be exactly ${expectedKeyLength} hex characters for AES-${key_size}`
      });
    }

    // Validate IV for CBC mode (required for proper decryption)
    if (mode === 'CBC' && !cleanIV) {
      return res.status(400).json({ error: 'IV is required for CBC mode decryption' });
    }
    if (mode === 'CBC' && cleanIV && cleanIV.length !== 32) {
      return res.status(400).json({ error: 'IV must be exactly 32 hex characters (16 bytes)' });
    }

    // Auto-pad odd-length hex strings with leading zero
    // Ensures valid hex byte pairs (each byte = 2 hex characters)
    let processedCiphertext = cleanCiphertext.length % 2 !== 0 ? '0' + cleanCiphertext : cleanCiphertext;
    let processedKey = cleanKey.length % 2 !== 0 ? '0' + cleanKey : cleanKey;
    
    if (processedCiphertext.length === 0) {
      return res.status(400).json({ error: 'Ciphertext cannot be empty' });
    }
    
    // Track original length before auto-padding
    // Used later to trim decrypted data back to original size
    const originalLength = processedCiphertext.length;
    const originalByteLength = Math.ceil(originalLength / 2);
    
    // Auto-pad ciphertext to nearest multiple of 32 hex characters (16 bytes)
    // Block ciphers require data in 16-byte blocks
    // This allows decryption of any length ciphertext
    const remainder = processedCiphertext.length % 32;
    let wasAutoPadded = false;
    if (remainder !== 0) {
      // Pad with zeros to reach the next 16-byte boundary
      const paddingNeeded = 32 - remainder;
      processedCiphertext = processedCiphertext + '0'.repeat(paddingNeeded);
      wasAutoPadded = true; // Flag to handle padding removal later
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
        
        // CBC Mode Decryption Strategy:
        // 1. Decrypt first block with original AES class to get visualization data
        // 2. Decrypt full ciphertext with AESEnhanced using CBC mode
        // 3. Extract visualization from first block, use CBC result for plaintext
        
        // Decrypt first block using original AES for visualization (before CBC XOR)
        // This provides full round-by-round visualization data
        const firstBlockHex = aes.bytesToHex(ciphertextBytes.slice(0, 16));
        const basicAes = new AES(parseInt(key_size)); // Original AES class with visualization
        const firstBlockResult = basicAes.decrypt(firstBlockHex, processedKey);
        
        // Extract visualization data from first block decryption
        const visualizationRounds = firstBlockResult.rounds || [];
        const visualizationExpandedKey = firstBlockResult.expanded_key || [];
        const visualizationInitialState = firstBlockResult.initial_state || null;
        
        // Now decrypt full ciphertext using CBC mode (proper chaining with IV)
        const decryptedBytes = aes.decryptCBC(ciphertextBytes, processedKey, cleanIV);
        
        // Try to remove PKCS7 padding (standard padding scheme)
        let unpadded;
        try {
          unpadded = aes.pkcs7Unpad(decryptedBytes);
        } catch (paddingError) {
          // Handle invalid padding gracefully (may occur with auto-padded ciphertext)
          if (wasAutoPadded) {
            // Only use complete blocks from original ciphertext
            const completeBlocks = Math.floor(originalByteLength / 16) * 16;
            if (completeBlocks > 0) {
              const trimmedBlocks = decryptedBytes.slice(0, completeBlocks);
              try {
                unpadded = aes.pkcs7Unpad(trimmedBlocks);
              } catch (e) {
                unpadded = trimmedBlocks; // Return without padding if validation fails
              }
            } else {
              // Original was less than one block, return trimmed data
              unpadded = decryptedBytes.slice(0, Math.min(originalByteLength, decryptedBytes.length));
            }
          } else {
            unpadded = decryptedBytes; // Return as-is if padding validation fails
          }
        }
        
        // Combine visualization data with decrypted plaintext
        results = {
          final_plaintext: aes.bytesToHex(unpadded),
          plaintext: aes.bytesToHex(unpadded),
          mode: 'CBC',
          rounds: visualizationRounds, // Visualization from first block
          initial_state: visualizationInitialState, // Visualization from first block
          expanded_key: visualizationExpandedKey // Visualization from first block
        };
      } else {
        // ECB Mode Decryption (default)
        // ECB mode: each block is decrypted independently (no chaining)
        
        // If ciphertext is exactly 16 bytes (32 hex chars), use original AES for full visualization
        if (processedCiphertext.length === 32) {
          const basicAes = new AES(parseInt(key_size)); // Original AES for visualization
          results = basicAes.decrypt(processedCiphertext, processedKey);
        } else {
          // Multi-block ciphertext: decrypt first block with visualization, then process remaining blocks
          const ciphertextBytes = aes.hexToBytes(processedCiphertext);
          const decryptedBlocks = [];
          
          // Decrypt first block using original AES for visualization
          const firstBlockHex = aes.bytesToHex(ciphertextBytes.slice(0, 16));
          const basicAes = new AES(parseInt(key_size));
          const firstBlockResult = basicAes.decrypt(firstBlockHex, processedKey);
          
          // Extract visualization data from first block
          const visualizationRounds = firstBlockResult.rounds || [];
          const visualizationExpandedKey = firstBlockResult.expanded_key || [];
          const visualizationInitialState = firstBlockResult.initial_state || null;
          
          // Add first block decrypted bytes to result
          const firstBlockPlaintextHex = firstBlockResult.final_plaintext || firstBlockResult.plaintext || '';
          const firstBlockPlaintextBytes = aes.hexToBytes(firstBlockPlaintextHex);
          decryptedBlocks.push(...firstBlockPlaintextBytes);
          
          // Decrypt remaining blocks using AESEnhanced (more efficient for large data)
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
            // Handle invalid padding (may occur with auto-padded ciphertext)
            if (wasAutoPadded) {
              // Only use complete blocks from original ciphertext to avoid garbage bytes
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
          
          // Combine visualization data with decrypted plaintext
          results = {
            final_plaintext: aes.bytesToHex(unpadded),
            plaintext: aes.bytesToHex(unpadded),
            mode: 'ECB',
            rounds: visualizationRounds, // Visualization from first block
            initial_state: visualizationInitialState, // Visualization from first block
            expanded_key: visualizationExpandedKey // Visualization from first block
          };
        }
      }
    } catch (e) {
      // Convert low-level hex errors to user-friendly 400 responses
      const msg = String(e.message || e);
      if (msg.includes('Invalid hex string length') || msg.includes('Invalid hex character')) {
        return res.status(400).json({ error: msg });
      }
      throw e; // Re-throw unexpected errors
    }
    
    // Return decryption results with visualization data
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

/**
 * File Decryption Endpoint
 * 
 * Decrypts encrypted files of any type
 * Supports both multer file uploads and JSON with base64 fileData
 * 
 * Request: multipart/form-data with 'file' OR JSON with 'fileData' (base64)
 * Body parameters:
 * - key: hex string
 * - key_size: '128', '192', or '256'
 * - mode: 'CBC' or 'ECB' (default: 'CBC')
 * - iv: hex string (required for CBC mode)
 * 
 * Response:
 * - decryptedData: base64 encoded decrypted file
 * - hashBefore: SHA-256 hash of encrypted file
 * - hashAfter: SHA-256 hash of decrypted file
 * - mode: decryption mode used
 */
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

/**
 * Generate Random Key Endpoint
 * 
 * Generates cryptographically secure random keys and IVs
 * 
 * Request body:
 * - key_size: '128', '192', or '256' (default: '128')
 * 
 * Response:
 * - key: random hex key
 * - iv: random hex IV
 * - keySize: key size used
 */
app.options('/api/generate-key', (req, res) => {
  // CORS preflight handler
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});

app.post('/api/generate-key', (req, res) => {
  try {
    const { key_size = '128' } = req.body || {};
    const aes = new AESEnhanced(parseInt(key_size));
    const key = aes.generateRandomKey(); // Generate cryptographically secure random key
    const iv = aes.generateRandomIV(); // Generate cryptographically secure random IV
    
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

/**
 * Password-Based Key Derivation Endpoint (PBKDF2)
 * 
 * Derives encryption keys from passwords using PBKDF2
 * Industry-standard key derivation function for password-based encryption
 * 
 * Request body:
 * - password: plaintext password
 * - key_size: '128', '192', or '256' (default: '128')
 * - salt: hex string (optional, auto-generated if not provided)
 * 
 * Response:
 * - key: derived hex key
 * - salt: salt used (hex string)
 * - keySize: key size used
 * - iterations: number of PBKDF2 iterations (100,000)
 */
app.post('/api/derive-key', (req, res) => {
  try {
    const { password, key_size = '128', salt } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const keyBytes = parseInt(key_size) / 8; // Convert bits to bytes
    const saltBuffer = salt ? Buffer.from(salt, 'hex') : crypto.randomBytes(16); // Use provided salt or generate random
    
    // Use PBKDF2 with 100,000 iterations (industry standard for security)
    // PBKDF2 makes brute-force attacks computationally expensive
    const derivedKey = crypto.pbkdf2Sync(password, saltBuffer, 100000, keyBytes, 'sha256');
    const derivedKeyHex = derivedKey.toString('hex').toUpperCase();
    const saltHex = saltBuffer.toString('hex').toUpperCase();
    
    res.json({
      key: derivedKeyHex,
      salt: saltHex, // Return salt so client can store it for later key derivation
      keySize: key_size,
      iterations: 100000
    });
  } catch (error) {
    console.error('Key derivation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Advanced Encryption Modes Endpoint
 * 
 * Encrypts data using advanced AES modes (CTR, CFB, OFB, XTS, GCM)
 * These modes don't support step-by-step visualization
 * 
 * Request body:
 * - message: hex string (plaintext)
 * - key: hex string
 * - key_size: '128', '192', or '256'
 * - mode: 'CTR', 'CFB', 'OFB', 'XTS', or 'GCM'
 * - iv: hex string (required for CFB, OFB, XTS, GCM)
 * - nonce: hex string (required for CTR)
 * - additionalData: hex string (optional, for GCM authenticated encryption)
 * 
 * Response:
 * - ciphertext: encrypted hex string
 * - tag: authentication tag (GCM mode only)
 * - mode: encryption mode used
 */
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

