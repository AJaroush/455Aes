// Utility functions for encrypting/decrypting history using Web Crypto API

/**
 * Derive a key from a password using PBKDF2
 */
async function deriveKeyFromPassword(password, salt) {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  return key;
}

/**
 * Generate a random salt
 */
function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Encrypt history data with password
 */
export async function encryptHistory(data, password) {
  try {
    const salt = generateSalt();
    const key = await deriveKeyFromPassword(password, salt);
    
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(JSON.stringify(data));
    
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for GCM
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      dataBytes
    );
    
    // Combine salt + iv + encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);
    
    // Convert to base64 for storage
    const base64 = btoa(String.fromCharCode(...combined));
    return base64;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt history');
  }
}

/**
 * Decrypt history data with password
 */
export async function decryptHistory(encryptedData, password) {
  try {
    // Convert from base64
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Extract salt, iv, and encrypted data
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);
    
    const key = await deriveKeyFromPassword(password, salt);
    
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encrypted
    );
    
    const decoder = new TextDecoder();
    const decryptedText = decoder.decode(decrypted);
    return JSON.parse(decryptedText);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt history. Wrong password?');
  }
}

/**
 * Check if history is encrypted (has password protection)
 */
export function isHistoryEncrypted() {
  const encryptHistory = localStorage.getItem('encryptionHistory');
  const decryptHistory = localStorage.getItem('decryptionHistory');
  
  // Check if either has the encrypted flag or if they're base64 strings (encrypted)
  const hasEncryptFlag = localStorage.getItem('historyEncrypted') === 'true';
  const hasDecryptFlag = localStorage.getItem('decryptionHistoryEncrypted') === 'true';
  
  return hasEncryptFlag || hasDecryptFlag;
}

/**
 * Set encryption status flags
 */
export function setHistoryEncryptionStatus(encrypted) {
  localStorage.setItem('historyEncrypted', encrypted ? 'true' : 'false');
  localStorage.setItem('decryptionHistoryEncrypted', encrypted ? 'true' : 'false');
}

/**
 * Save history with optional encryption
 */
export async function saveHistory(key, data, password = null) {
  try {
    // Remove sensitive data
    const sanitizedData = data.map(item => {
      const { fullCiphertext, fullPlaintext, iv, ...safeItem } = item;
      return safeItem;
    });
    
    if (password) {
      // Encrypt before saving
      const encrypted = await encryptHistory(sanitizedData, password);
      localStorage.setItem(key, encrypted);
      setHistoryEncryptionStatus(true);
    } else {
      // Save as plain JSON
      localStorage.setItem(key, JSON.stringify(sanitizedData));
      setHistoryEncryptionStatus(false);
    }
  } catch (error) {
    console.error('Error saving history:', error);
    throw error;
  }
}

/**
 * Get history password from settings
 */
export function getHistoryPassword() {
  return sessionStorage.getItem('historyPassword') || null;
}

/**
 * Set history password (for encryption)
 */
export function setHistoryPassword(password) {
  if (password) {
    sessionStorage.setItem('historyPassword', password);
  } else {
    sessionStorage.removeItem('historyPassword');
  }
}

