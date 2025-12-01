const { AESAdvanced } = require('./aes_advanced');

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
    const { ciphertext, key, key_size, mode, iv, nonce, additionalData } = JSON.parse(event.body);
    
    if (!ciphertext || !key || !key_size || !mode) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const cleanCiphertext = (ciphertext || '').replace(/\s+/g, '').toUpperCase();
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

    // Auto-pad odd-length hex strings
    let processedCiphertext = cleanCiphertext.length % 2 !== 0 ? '0' + cleanCiphertext : cleanCiphertext;
    let processedKey = cleanKey.length % 2 !== 0 ? '0' + cleanKey : cleanKey;

    // Validate hex characters
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

    // Create AESAdvanced instance
    const aesAdvanced = new AESAdvanced(parseInt(key_size));
    
    // Convert hex ciphertext to bytes
    const ciphertextBytes = aesAdvanced.hexToBytes(processedCiphertext);
    
    // Prepare parameters based on mode
    let result;
    const cleanIV = iv ? (iv || '').replace(/\s+/g, '').toUpperCase() : null;
    const cleanNonce = nonce ? (nonce || '').replace(/\s+/g, '').toUpperCase() : null;
    const cleanAdditionalData = additionalData ? (typeof additionalData === 'string' ? additionalData : Buffer.from(additionalData).toString('hex')) : null;

    try {
      switch (mode) {
        case 'CTR':
          if (!cleanNonce) {
            return {
              statusCode: 400,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ error: 'Nonce is required for CTR mode' })
            };
          }
          result = aesAdvanced.decryptCTR(ciphertextBytes, processedKey, cleanNonce);
          break;
        
        case 'CFB':
          if (!cleanIV) {
            return {
              statusCode: 400,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ error: 'IV is required for CFB mode' })
            };
          }
          result = aesAdvanced.decryptCFB(ciphertextBytes, processedKey, cleanIV);
          break;
        
        case 'OFB':
          if (!cleanIV) {
            return {
              statusCode: 400,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ error: 'IV is required for OFB mode' })
            };
          }
          result = aesAdvanced.decryptOFB(ciphertextBytes, processedKey, cleanIV);
          break;
        
        case 'XTS':
          if (!cleanIV) {
            return {
              statusCode: 400,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ error: 'Tweak is required for XTS mode' })
            };
          }
          result = aesAdvanced.decryptXTS(ciphertextBytes, processedKey, cleanIV);
          break;
        
        case 'GCM':
          if (!cleanIV) {
            return {
              statusCode: 400,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ error: 'IV is required for GCM mode' })
            };
          }
          // GCM is async, need to await
          const gcmResult = await aesAdvanced.decryptGCM(ciphertextBytes, processedKey, cleanIV, cleanAdditionalData);
          result = gcmResult.plaintext;
          return {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              plaintext: aesAdvanced.bytesToHex(result),
              mode: mode,
              tag: gcmResult.tag ? aesAdvanced.bytesToHex(gcmResult.tag) : null
            })
          };
        
        default:
          return {
            statusCode: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: `Unsupported mode: ${mode}` })
          };
      }
    } catch (decryptError) {
      console.error('Decryption error:', decryptError);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: decryptError.message || 'Decryption failed',
          details: process.env.NETLIFY_DEV ? decryptError.stack : undefined
        })
      };
    }

    // Convert result from bytes to hex
    const plaintextHex = aesAdvanced.bytesToHex(result);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        plaintext: plaintextHex,
        mode: mode,
        tag: null
      })
    };
  } catch (error) {
    console.error('Decrypt-advanced error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: error.message,
        details: process.env.NETLIFY_DEV ? error.stack : undefined
      })
    };
  }
};

