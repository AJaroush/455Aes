const crypto = require('crypto');

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
    const { password, key_size = '128', salt } = JSON.parse(event.body);
    
    if (!password) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Password is required' })
      };
    }

    const keyBytes = parseInt(key_size) / 8;
    const saltBuffer = salt ? Buffer.from(salt, 'hex') : crypto.randomBytes(16);
    
    // Use PBKDF2 with 100,000 iterations (industry standard)
    const derivedKey = crypto.pbkdf2Sync(password, saltBuffer, 100000, keyBytes, 'sha256');
    const derivedKeyHex = derivedKey.toString('hex').toUpperCase();
    const saltHex = saltBuffer.toString('hex').toUpperCase();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: derivedKeyHex,
        salt: saltHex,
        keySize: key_size,
        iterations: 100000
      })
    };
  } catch (error) {
    console.error('Key derivation error:', error);
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

