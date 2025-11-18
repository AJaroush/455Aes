const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

// Import our AES implementation
const { AES } = require('./aes_implementation');

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
    fileSize: 10 * 1024 * 1024, // 10MB limit
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
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const expectedKeyLength = parseInt(key_size) / 4;
    if (cleanKey.length !== expectedKeyLength) {
      return res.status(400).json({ 
        error: `Key must be exactly ${expectedKeyLength} hex characters for AES-${key_size}` 
      });
    }

    if (cleanMessage.length !== 32) {
      return res.status(400).json({ 
        error: 'Message must be exactly 32 hex characters (16 bytes)' 
      });
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
    const results = aes.encrypt(cleanMessage, cleanKey);
    
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
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
