const crypto = require('crypto');
const { AESEnhanced } = require('./aes_enhanced');

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { fileData, filename, key, key_size, iv, mode = 'CBC' } = JSON.parse(event.body);
    
    if (!fileData) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'No file uploaded' })
      };
    }

    if (!key || !key_size) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Key and key_size are required' })
      };
    }

    const cleanKey = (key || '').replace(/\s+/g, '').toUpperCase();
    const expectedKeyLength = parseInt(key_size) / 4;
    
    if (cleanKey.length !== expectedKeyLength) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: `Key must be exactly ${expectedKeyLength} hex characters for AES-${key_size}`
        })
      };
    }

    const aes = new AESEnhanced(parseInt(key_size));
    // fileData should be base64 encoded
    const fileBuffer = Buffer.from(fileData, 'base64');
    
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
          return {
            statusCode: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'IV must be exactly 32 hex characters (16 bytes)' })
          };
        }
      }
      encryptedBuffer = aes.encryptCBC(Array.from(fileBuffer), cleanKey, usedIV);
    } else {
      // ECB mode
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
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        filename: filename || 'encrypted_file',
        originalSize: fileBuffer.length,
        encryptedSize: encryptedBuffer.length,
        encryptedData: encryptedBuffer.toString('base64'),
        hashBefore,
        hashAfter,
        iv: usedIV,
        mode,
        keySize: key_size
      })
    };
  } catch (error) {
    console.error('File encryption error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};

