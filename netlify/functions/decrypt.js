const { AES } = require('./aes_implementation');
const { AESEnhanced } = require('./aes_enhanced');

exports.handler = async (event, context) => {
  // Handle CORS preflight
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
    const { ciphertext, key, key_size, iv, mode = 'ECB' } = JSON.parse(event.body);
    
    // Normalize inputs (strip whitespace/newlines) and uppercase
    const cleanCiphertext = (ciphertext || '').replace(/\s+/g, '').toUpperCase();
    const cleanKey = (key || '').replace(/\s+/g, '').toUpperCase();
    const cleanIV = iv ? (iv || '').replace(/\s+/g, '').toUpperCase() : null;
    
    // Validate inputs
    if (!cleanCiphertext || !cleanKey || !key_size) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

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

    // Validate IV for CBC mode
    if (mode === 'CBC' && !cleanIV) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'IV is required for CBC mode decryption' })
      };
    }
    if (mode === 'CBC' && cleanIV && cleanIV.length !== 32) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'IV must be exactly 32 hex characters (16 bytes)' })
      };
    }

    // Auto-pad odd-length hex strings with a leading zero for both ciphertext and key
    let processedCiphertext = cleanCiphertext.length % 2 !== 0 ? '0' + cleanCiphertext : cleanCiphertext;
    let processedKey = cleanKey.length % 2 !== 0 ? '0' + cleanKey : cleanKey;
    
    if (processedCiphertext.length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Ciphertext cannot be empty' })
      };
    }
    
    // Track original length before padding
    const originalLength = processedCiphertext.length;
    const originalByteLength = Math.ceil(originalLength / 2);
    
    // Auto-pad ciphertext to nearest multiple of 32 hex characters (16 bytes) for block cipher
    const remainder = processedCiphertext.length % 32;
    let wasAutoPadded = false;
    if (remainder !== 0) {
      const paddingNeeded = 32 - remainder;
      processedCiphertext = processedCiphertext + '0'.repeat(paddingNeeded);
      wasAutoPadded = true;
    }

    // Ensure only valid hex characters
    const hexRegex = /^[0-9A-F]+$/;
    if (!hexRegex.test(processedCiphertext)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Ciphertext contains non-hex characters' })
      };
    }
    if (!hexRegex.test(processedKey)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Key contains non-hex characters' })
      };
    }
    if (cleanIV && !hexRegex.test(cleanIV)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'IV contains non-hex characters' })
      };
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
          const basicAes = new AES(parseInt(key_size));
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
          
          // Add first block decrypted bytes
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
            if (wasAutoPadded) {
              const completeBlocks = Math.floor(originalByteLength / 16) * 16;
              if (completeBlocks > 0) {
                const trimmedBlocks = decryptedBlocks.slice(0, completeBlocks);
                try {
                  unpadded = aes.pkcs7Unpad(trimmedBlocks);
                } catch (e) {
                  unpadded = trimmedBlocks;
                }
              } else {
                unpadded = decryptedBlocks.slice(0, Math.min(originalByteLength, decryptedBlocks.length));
              }
            } else {
              unpadded = decryptedBlocks;
            }
          }
          results = {
            final_plaintext: aes.bytesToHex(unpadded),
            plaintext: aes.bytesToHex(unpadded),
            mode: 'ECB',
            rounds: visualizationRounds,
            initial_state: visualizationInitialState,
            expanded_key: visualizationExpandedKey
          };
        }
      }
    } catch (e) {
      const msg = String(e.message || e);
      if (msg.includes('Invalid hex string length') || msg.includes('Invalid hex character')) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ error: msg })
        };
      }
      throw e;
    }
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(results)
    };
  } catch (error) {
    console.error('Decryption error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: error.message,
        details: error.stack 
      })
    };
  }
};

