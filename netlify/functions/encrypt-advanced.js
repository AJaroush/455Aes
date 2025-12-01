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
    const { message, key, key_size, mode, iv, nonce, additionalData } = JSON.parse(event.body);
    
    if (!message || !key || !key_size || !mode) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const cleanMessage = (message || '').replace(/\s+/g, '').toUpperCase();
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

    const aes = new AESAdvanced(parseInt(key_size));
    const messageBytes = aes.hexToBytes(cleanMessage);
    
    // For modes that need padding (XTS), pad the message
    let processedMessage = messageBytes;
    if (mode.toUpperCase() === 'XTS') {
      processedMessage = aes.padIfNeeded(messageBytes, 16);
    }
    
    let result;

    switch (mode.toUpperCase()) {
      case 'CTR':
        if (!nonce) {
          return {
            statusCode: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Nonce is required for CTR mode' })
          };
        }
        result = aes.encryptCTR(processedMessage, cleanKey, nonce);
        break;
      case 'CFB':
        if (!iv) {
          return {
            statusCode: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'IV is required for CFB mode' })
          };
        }
        result = aes.encryptCFB(processedMessage, cleanKey, iv);
        break;
      case 'OFB':
        if (!iv) {
          return {
            statusCode: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'IV is required for OFB mode' })
          };
        }
        result = aes.encryptOFB(processedMessage, cleanKey, iv);
        break;
      case 'XTS':
        if (!iv) {
          return {
            statusCode: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Tweak is required for XTS mode' })
          };
        }
        result = aes.encryptXTS(processedMessage, cleanKey, iv);
        break;
      case 'GCM':
        if (!iv) {
          return {
            statusCode: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'IV is required for GCM mode' })
          };
        }
        const gcmResult = await aes.encryptGCM(messageBytes, cleanKey, iv, 
          additionalData ? Buffer.from(additionalData, 'hex') : null);
        result = gcmResult.ciphertext;
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ciphertext: aes.bytesToHex(result),
            tag: aes.bytesToHex(gcmResult.tag),
            mode: 'GCM'
          })
        };
      case 'CBC':
        // Handle CBC mode with auto-generated IV if not provided
        let usedIV = iv;
        if (!usedIV) {
          usedIV = aes.generateRandomIV();
        } else {
          usedIV = (usedIV || '').replace(/\s+/g, '').toUpperCase();
        }
        result = aes.encryptCBC(processedMessage, cleanKey, usedIV);
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ciphertext: aes.bytesToHex(result),
            iv: usedIV,
            mode: 'CBC'
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

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ciphertext: aes.bytesToHex(result),
        mode: mode.toUpperCase()
      })
    };
  } catch (error) {
    console.error('Advanced encryption error:', error);
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

