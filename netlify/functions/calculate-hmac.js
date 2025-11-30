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
    const { data, key, algorithm = 'sha256' } = JSON.parse(event.body);
    
    if (!data || !key) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Data and key are required' })
      };
    }

    const aes = new AESAdvanced();
    const dataBytes = aes.hexToBytes(data.replace(/\s+/g, '').toUpperCase());
    const keyBytes = aes.hexToBytes(key.replace(/\s+/g, '').toUpperCase());
    
    const hmac = aes.calculateHMAC(dataBytes, keyBytes, algorithm);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        hmac: Buffer.from(hmac).toString('hex').toUpperCase(),
        algorithm: algorithm.toUpperCase()
      })
    };
  } catch (error) {
    console.error('HMAC calculation error:', error);
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

