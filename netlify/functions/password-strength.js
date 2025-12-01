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
    const { password } = JSON.parse(event.body);
    
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
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        strength: Math.min(Math.max(strength, 0), 10),
        level: strengthLevel,
        entropy: entropy.toFixed(2),
        feedback: feedback,
        length: password.length
      })
    };
  } catch (error) {
    console.error('Password strength error:', error);
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

