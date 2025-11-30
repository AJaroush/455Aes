const { AES } = require('./aes_implementation');

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
    const { message, key, key_size } = JSON.parse(event.body);
    
    // Normalize inputs (strip whitespace/newlines) and uppercase
    let cleanMessage = (message || '').replace(/\s+/g, '').toUpperCase();
    let cleanKey = (key || '').replace(/\s+/g, '').toUpperCase();
    
    // Validate inputs
    if (!cleanMessage || !cleanKey || !key_size) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Missing required fields', 
          details: { messageLen: (cleanMessage||'').length, keyLen: (cleanKey||'').length, keySize } 
        })
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
          error: `Key must be exactly ${expectedKeyLength} hex characters for AES-${key_size}`,
          details: { keyLen: cleanKey.length, expectedKeyLength }
        })
      };
    }

    // Auto-pad odd-length hex strings with leading zero
    if (cleanMessage.length % 2 !== 0) {
      cleanMessage = '0' + cleanMessage;
    }

    if (cleanMessage.length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Message cannot be empty' })
      };
    }
    
    // Auto-pad odd-length hex strings with leading zero
    if (cleanKey.length % 2 !== 0) {
      cleanKey = '0' + cleanKey;
    }

    // Ensure only valid hex characters
    const hexRegex = /^[0-9A-F]+$/;
    if (!hexRegex.test(cleanMessage)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Message contains non-hex characters' })
      };
    }
    if (!hexRegex.test(cleanKey)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Key contains non-hex characters' })
      };
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
    console.error('Encryption error:', error);
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

