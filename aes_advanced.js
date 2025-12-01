// Advanced AES Implementation with Multiple Modes and Features
const crypto = require('crypto');
const { AESEnhanced } = require('./aes_enhanced');

class AESAdvanced extends AESEnhanced {
  constructor(keySize = 128) {
    super(keySize);
  }

  // ==================== CTR Mode (Counter Mode) ====================
  encryptCTR(plaintext, key, nonce) {
    // CTR mode: Encrypt counter, XOR with plaintext
    // CTR doesn't require padding - works with any length
    const nonceBytes = typeof nonce === 'string' ? this.hexToBytes(nonce) : nonce;
    const counter = nonceBytes.slice(0, 12); // 12-byte nonce
    const counterSuffix = new Array(4).fill(0); // 4-byte counter
    
    const encrypted = [];
    let blockIndex = 0;
    
    // Process in 16-byte blocks, but handle partial last block
    for (let i = 0; i < plaintext.length; i += 16) {
      const block = plaintext.slice(i, i + 16);
      
      // Increment counter
      this.incrementCounter(counterSuffix, blockIndex);
      const fullCounter = [...counter, ...counterSuffix];
      
      // Encrypt counter to get keystream
      const keystream = this.encryptBlock(fullCounter, key);
      
      // XOR with plaintext block (handle partial blocks)
      const encryptedBlock = block.map((byte, idx) => (byte || 0) ^ (keystream[idx] || 0));
      encrypted.push(...encryptedBlock);
      
      blockIndex++;
    }
    
    return encrypted;
  }

  decryptCTR(ciphertext, key, nonce) {
    // CTR decryption is same as encryption
    return this.encryptCTR(ciphertext, key, nonce);
  }

  // ==================== CFB Mode (Cipher Feedback) ====================
  encryptCFB(plaintext, key, iv) {
    // CFB mode: Works with any length, processes in blocks
    const encrypted = [];
    let feedback = typeof iv === 'string' ? this.hexToBytes(iv) : iv;
    
    // Process in 16-byte blocks
    for (let i = 0; i < plaintext.length; i += 16) {
      const block = plaintext.slice(i, i + 16);
      
      // Encrypt feedback register
      const keystream = this.encryptBlock(Array.from(feedback), key);
      
      // XOR with plaintext block
      const encryptedBlock = block.map((byte, idx) => (byte || 0) ^ (keystream[idx] || 0));
      encrypted.push(...encryptedBlock);
      
      // Update feedback register with encrypted block
      feedback = encryptedBlock;
    }
    
    return encrypted;
  }

  decryptCFB(ciphertext, key, iv) {
    const blocks = this.chunkArray(ciphertext, 16);
    const decrypted = [];
    let feedback = typeof iv === 'string' ? this.hexToBytes(iv) : iv;
    
    for (const block of blocks) {
      // Encrypt feedback register
      const keystream = this.encryptBlock(Array.from(feedback), key);
      
      // XOR with ciphertext
      const decryptedBlock = block.map((byte, idx) => (byte || 0) ^ (keystream[idx] || 0));
      decrypted.push(...decryptedBlock);
      
      // Update feedback register with ciphertext (not decrypted)
      feedback = block;
    }
    
    return decrypted;
  }

  // ==================== OFB Mode (Output Feedback) ====================
  encryptOFB(plaintext, key, iv) {
    // OFB mode: Works with any length, processes in blocks
    const encrypted = [];
    let feedback = typeof iv === 'string' ? this.hexToBytes(iv) : iv;
    
    // Process in 16-byte blocks
    for (let i = 0; i < plaintext.length; i += 16) {
      const block = plaintext.slice(i, i + 16);
      
      // Encrypt feedback register
      feedback = this.encryptBlock(Array.from(feedback), key);
      
      // XOR with plaintext block
      const encryptedBlock = block.map((byte, idx) => (byte || 0) ^ (feedback[idx] || 0));
      encrypted.push(...encryptedBlock);
    }
    
    return encrypted;
  }

  decryptOFB(ciphertext, key, iv) {
    // OFB decryption is same as encryption
    return this.encryptOFB(ciphertext, key, iv);
  }

  // ==================== GCM Mode (Galois/Counter Mode) ====================
  // Note: Full GCM implementation requires Galois field multiplication
  // This is a simplified version - full implementation would use WebCrypto API
  async encryptGCM(plaintext, key, iv, additionalData = null) {
    // For full GCM, use WebCrypto API in browser or Node.js crypto
    // This is a placeholder that uses CTR + GHASH
    const ctrEncrypted = this.encryptCTR(plaintext, key, iv);
    
    // Calculate authentication tag (simplified - full GCM requires GHASH)
    const tag = crypto.createHmac('sha256', Buffer.from(key))
      .update(Buffer.from(plaintext))
      .update(additionalData || Buffer.alloc(0))
      .digest().slice(0, 16); // 16-byte tag
    
    return {
      ciphertext: ctrEncrypted,
      tag: Array.from(tag)
    };
  }

  async decryptGCM(ciphertext, key, iv, additionalData = null, tag = null) {
    // GCM decryption: Same as CTR (symmetric)
    const decrypted = this.decryptCTR(ciphertext, key, iv);
    
    // Verify authentication tag if provided (simplified - full GCM requires GHASH)
    if (tag) {
      const keyBytes = typeof key === 'string' ? this.hexToBytes(key) : key;
      const calculatedTag = crypto.createHmac('sha256', Buffer.from(keyBytes))
        .update(Buffer.from(decrypted))
        .update(additionalData || Buffer.alloc(0))
        .digest().slice(0, 16);
      
      const tagBytes = typeof tag === 'string' ? this.hexToBytes(tag) : tag;
      const tagMatch = Buffer.from(tagBytes).equals(Buffer.from(calculatedTag));
      
      if (!tagMatch) {
        throw new Error('GCM authentication tag verification failed');
      }
    }
    
    return {
      plaintext: decrypted,
      tag: tag
    };
  }

  // ==================== XTS Mode (XEX-based Tweaked Codebook) ====================
  // Used for disk encryption
  encryptXTS(plaintext, key, tweak) {
    // XTS mode: Used for disk encryption, requires padding to full blocks
    // XTS requires two keys: data key and tweak key
    const paddedPlaintext = this.padIfNeeded(plaintext, 16);
    const key1 = key.slice(0, key.length / 2);
    const key2 = key.slice(key.length / 2);
    
    const encrypted = [];
    
    // Process in 16-byte blocks
    for (let i = 0; i < paddedPlaintext.length; i += 16) {
      const block = paddedPlaintext.slice(i, i + 16);
      
      // Generate tweak value
      const tweakValue = this.generateTweak(tweak, Math.floor(i / 16));
      
      // XEX: Encrypt tweak, XOR with plaintext, encrypt, XOR with encrypted tweak
      const encryptedTweak = this.encryptBlock(Array.from(tweakValue), key2);
      const xored = block.map((byte, idx) => (byte || 0) ^ (encryptedTweak[idx] || 0));
      const encryptedBlock = this.encryptBlock(xored, key1);
      const finalBlock = encryptedBlock.map((byte, idx) => (byte || 0) ^ (encryptedTweak[idx] || 0));
      encrypted.push(...finalBlock);
    }
    
    return encrypted;
  }

  decryptXTS(ciphertext, key, tweak) {
    // XTS decryption: Reverse of encryption
    // XTS requires two keys: data key and tweak key
    const key1 = key.slice(0, key.length / 2);
    const key2 = key.slice(key.length / 2);
    
    const decrypted = [];
    
    // Process in 16-byte blocks
    for (let i = 0; i < ciphertext.length; i += 16) {
      const block = ciphertext.slice(i, i + 16);
      
      // Generate tweak value
      const tweakValue = this.generateTweak(tweak, Math.floor(i / 16));
      
      // XEX decryption: Encrypt tweak, XOR with ciphertext, decrypt, XOR with encrypted tweak
      const encryptedTweak = this.encryptBlock(Array.from(tweakValue), key2);
      const xored = block.map((byte, idx) => (byte || 0) ^ (encryptedTweak[idx] || 0));
      const decryptedBlock = this.decryptBlock(xored, key1);
      const finalBlock = decryptedBlock.map((byte, idx) => (byte || 0) ^ (encryptedTweak[idx] || 0));
      decrypted.push(...finalBlock);
    }
    
    // Try to remove padding
    try {
      return this.pkcs7Unpad(decrypted);
    } catch (e) {
      return decrypted;
    }
  }

  // ==================== Helper Methods ====================
  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    // Pad last chunk if needed (for modes that require full blocks)
    if (chunks.length > 0 && chunks[chunks.length - 1].length < chunkSize) {
      const lastChunk = chunks[chunks.length - 1];
      const padding = chunkSize - lastChunk.length;
      chunks[chunks.length - 1] = [...lastChunk, ...Array(padding).fill(padding)];
    }
    return chunks;
  }
  
  // Pad message to multiple of block size if needed
  padIfNeeded(data, blockSize = 16) {
    if (data.length % blockSize === 0) {
      return data; // Already multiple of block size
    }
    return this.pkcs7Pad(data);
  }

  hexToBytes(hex) {
    if (typeof hex !== 'string') return hex; // Already bytes
    let cleanHex = hex.replace(/\s+/g, '').toUpperCase();
    // Auto-pad odd-length hex strings with leading zero
    if (cleanHex.length % 2 !== 0) {
      cleanHex = '0' + cleanHex;
    }
    const bytes = [];
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes.push(parseInt(cleanHex.substr(i, 2), 16));
    }
    return bytes;
  }

  incrementCounter(counter, value) {
    let carry = value;
    for (let i = counter.length - 1; i >= 0 && carry > 0; i--) {
      const sum = (counter[i] || 0) + carry;
      counter[i] = sum & 0xff;
      carry = sum >> 8;
    }
  }

  generateTweak(tweak, sectorIndex) {
    // Generate tweak for XTS mode
    const tweakBytes = typeof tweak === 'string' ? this.hexToBytes(tweak) : tweak;
    const sectorBytes = new Array(16).fill(0);
    // Write sector index to last 4 bytes (big-endian)
    sectorBytes[12] = (sectorIndex >> 24) & 0xff;
    sectorBytes[13] = (sectorIndex >> 16) & 0xff;
    sectorBytes[14] = (sectorIndex >> 8) & 0xff;
    sectorBytes[15] = sectorIndex & 0xff;
    return [...tweakBytes.slice(0, 12), ...sectorBytes.slice(12)];
  }

  // ==================== HMAC Calculation ====================
  calculateHMAC(data, key, algorithm = 'sha256') {
    return crypto.createHmac(algorithm, Buffer.from(key))
      .update(Buffer.from(data))
      .digest();
  }

  // ==================== Avalanche Effect Demo ====================
  demonstrateAvalanche(plaintext, key, bitToFlip = 0) {
    // Encrypt original
    const original = this.encryptBlock(plaintext, key);
    
    // Flip a bit
    const modified = [...plaintext];
    const byteIndex = Math.floor(bitToFlip / 8);
    const bitIndex = bitToFlip % 8;
    modified[byteIndex] ^= (1 << bitIndex);
    
    // Encrypt modified
    const modifiedEncrypted = this.encryptBlock(modified, key);
    
    // Count different bits
    let differences = 0;
    for (let i = 0; i < original.length; i++) {
      const xor = original[i] ^ modifiedEncrypted[i];
      differences += this.countBits(xor);
    }
    
    return {
      original: original,
      modified: modifiedEncrypted,
      differences: differences,
      percentage: (differences / (original.length * 8)) * 100
    };
  }

  countBits(n) {
    let count = 0;
    while (n) {
      count += n & 1;
      n >>= 1;
    }
    return count;
  }
}

module.exports = { AESAdvanced };

