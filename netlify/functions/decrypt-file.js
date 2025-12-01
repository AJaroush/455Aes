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
    const encryptedBuffer = Buffer.from(fileData, 'base64');
    
    // Calculate SHA-256 hash before decryption
    const hashBefore = crypto.createHash('sha256').update(encryptedBuffer).digest('hex').toUpperCase();
    
    let decryptedBuffer;
    
    if (mode === 'CBC') {
      if (!iv) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ error: 'IV is required for CBC mode decryption' })
        };
      }
      const cleanIV = (iv || '').replace(/\s+/g, '').toUpperCase();
      if (cleanIV.length !== 32) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ error: 'IV must be exactly 32 hex characters (16 bytes)' })
        };
      }
      decryptedBuffer = aes.decryptCBC(Array.from(encryptedBuffer), cleanKey, cleanIV);
    } else {
      // ECB mode
      // Ensure encrypted buffer is a multiple of 16 bytes
      if (encryptedBuffer.length % 16 !== 0) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ error: 'Encrypted file size must be a multiple of 16 bytes for ECB mode' })
        };
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
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        filename: filename || 'decrypted_file',
        encryptedSize: encryptedBuffer.length,
        decryptedSize: decryptedBuffer.length,
        decryptedData: decryptedBuffer.toString('base64'),
        hashBefore,
        hashAfter,
        mode,
        keySize: key_size
      })
    };
  } catch (error) {
    console.error('File decryption error:', error);
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

