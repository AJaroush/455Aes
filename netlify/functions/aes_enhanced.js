// Enhanced AES Implementation with CBC mode, padding, and decryption
const crypto = require('crypto');

class AESEnhanced {
  constructor(keySize = 128) {
    this.keySize = keySize;
    this.nk = keySize / 32; // Number of 32-bit words in the key
    this.nr = this.nk + 6;  // Number of rounds
    
    // S-box (correct AES S-box)
    this.sbox = [
      0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
      0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
      0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
      0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
      0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
      0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
      0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
      0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
      0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
      0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
      0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
      0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
      0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
      0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
      0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
      0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
    ];

    // Inverse S-box
    this.invSbox = [
      0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e, 0x81, 0xf3, 0xd7, 0xfb,
      0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87, 0x34, 0x8e, 0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb,
      0x54, 0x7b, 0x94, 0x32, 0xa6, 0xc2, 0x23, 0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e,
      0x08, 0x2e, 0xa1, 0x66, 0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49, 0x6d, 0x8b, 0xd1, 0x25,
      0x72, 0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16, 0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65, 0xb6, 0x92,
      0x6c, 0x70, 0x48, 0x50, 0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46, 0x57, 0xa7, 0x8d, 0x9d, 0x84,
      0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a, 0xf7, 0xe4, 0x58, 0x05, 0xb8, 0xb3, 0x45, 0x06,
      0xd0, 0x2c, 0x1e, 0x8f, 0xca, 0x3f, 0x0f, 0x02, 0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b,
      0x3a, 0x91, 0x11, 0x41, 0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6, 0x73,
      0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8, 0x1c, 0x75, 0xdf, 0x6e,
      0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89, 0x6f, 0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b,
      0xfc, 0x56, 0x3e, 0x4b, 0xc6, 0xd2, 0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4,
      0x1f, 0xdd, 0xa8, 0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xec, 0x5f,
      0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d, 0x2d, 0xe5, 0x7a, 0x9f, 0x93, 0xc9, 0x9c, 0xef,
      0xa0, 0xe0, 0x3b, 0x4d, 0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb, 0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61,
      0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6, 0x26, 0xe1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0c, 0x7d
    ];

    // Round constants
    this.rcon = [
      0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36, 0x6c, 0xd8, 0xab, 0x4d, 0x9a, 0x2f
    ];
  }

  // Utility functions
  hexToBytes(hexString) {
    hexString = hexString.replace(/[\s0x]/g, '').toUpperCase();
    // Auto-pad odd-length hex strings with leading zero
    if (hexString.length % 2 !== 0) {
      hexString = '0' + hexString;
    }
    const bytes = [];
    for (let i = 0; i < hexString.length; i += 2) {
      const byte = parseInt(hexString.substr(i, 2), 16);
      if (isNaN(byte)) {
        throw new Error('Invalid hex character');
      }
      bytes.push(byte);
    }
    return bytes;
  }

  bytesToHex(data) {
    return data.map(b => (b || 0).toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  bytesToMatrix(data) {
    const matrix = [];
    for (let i = 0; i < 4; i++) {
      const row = [];
      for (let j = 0; j < 4; j++) {
        row.push(data[4 * j + i]);
      }
      matrix.push(row);
    }
    return matrix;
  }

  matrixToBytes(matrix) {
    const data = new Array(16).fill(0);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        data[4 * j + i] = matrix[i][j] || 0;
      }
    }
    return data;
  }

  // PKCS7 Padding
  pkcs7Pad(data) {
    const blockSize = 16;
    const padding = blockSize - (data.length % blockSize);
    const padded = [...data];
    for (let i = 0; i < padding; i++) {
      padded.push(padding);
    }
    return padded;
  }

  pkcs7Unpad(data) {
    if (data.length === 0) {
      throw new Error('Invalid padding: empty data');
    }
    const padding = data[data.length - 1];
    if (padding < 1 || padding > 16) {
      throw new Error('Invalid padding value');
    }
    if (padding > data.length) {
      throw new Error('Invalid padding: padding larger than data');
    }
    // Verify padding bytes
    for (let i = data.length - padding; i < data.length; i++) {
      if (data[i] !== padding) {
        throw new Error('Invalid padding: padding bytes mismatch');
      }
    }
    return data.slice(0, data.length - padding);
  }

  // Key expansion (same as original)
  keyExpansion(key) {
    const keyBytes = this.hexToBytes(key);
    const w = [];

    for (let i = 0; i < this.nk; i++) {
      w.push([
        keyBytes[4 * i],
        keyBytes[4 * i + 1],
        keyBytes[4 * i + 2],
        keyBytes[4 * i + 3]
      ]);
    }

    for (let i = this.nk; i < 4 * (this.nr + 1); i++) {
      let temp = [...w[i - 1]];

      if (i % this.nk === 0) {
        temp = [temp[1], temp[2], temp[3], temp[0]];
        temp = temp.map(b => this.sbox[b]);
        temp[0] ^= this.rcon[Math.floor(i / this.nk) - 1];
      } else if (this.nk > 6 && i % this.nk === 4) {
        temp = temp.map(b => this.sbox[b]);
      }

      w.push([
        w[i - this.nk][0] ^ temp[0],
        w[i - this.nk][1] ^ temp[1],
        w[i - this.nk][2] ^ temp[2],
        w[i - this.nk][3] ^ temp[3]
      ]);
    }

    return w;
  }

  // Encryption operations
  addRoundKey(state, roundKey) {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        state[i][j] ^= roundKey[i][j];
      }
    }
    return state;
  }

  subBytes(state) {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        state[i][j] = this.sbox[state[i][j]];
      }
    }
    return state;
  }

  shiftRows(state) {
    const temp1 = state[1][0];
    state[1][0] = state[1][1];
    state[1][1] = state[1][2];
    state[1][2] = state[1][3];
    state[1][3] = temp1;

    const temp2a = state[2][0];
    const temp2b = state[2][1];
    state[2][0] = state[2][2];
    state[2][1] = state[2][3];
    state[2][2] = temp2a;
    state[2][3] = temp2b;

    const temp3 = state[3][3];
    state[3][3] = state[3][2];
    state[3][2] = state[3][1];
    state[3][1] = state[3][0];
    state[3][0] = temp3;

    return state;
  }

  galoisMult(a, b) {
    let p = 0;
    for (let i = 0; i < 8; i++) {
      if (b & 1) {
        p ^= a;
      }
      const hiBitSet = a & 0x80;
      a <<= 1;
      if (hiBitSet) {
        a ^= 0x1b;
      }
      b >>= 1;
    }
    return p & 0xff;
  }

  mixColumns(state) {
    for (let i = 0; i < 4; i++) {
      const s0 = state[0][i];
      const s1 = state[1][i];
      const s2 = state[2][i];
      const s3 = state[3][i];

      state[0][i] = this.galoisMult(0x02, s0) ^ this.galoisMult(0x03, s1) ^ s2 ^ s3;
      state[1][i] = s0 ^ this.galoisMult(0x02, s1) ^ this.galoisMult(0x03, s2) ^ s3;
      state[2][i] = s0 ^ s1 ^ this.galoisMult(0x02, s2) ^ this.galoisMult(0x03, s3);
      state[3][i] = this.galoisMult(0x03, s0) ^ s1 ^ s2 ^ this.galoisMult(0x02, s3);
    }
    return state;
  }

  // Decryption operations
  invSubBytes(state) {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        state[i][j] = this.invSbox[state[i][j]];
      }
    }
    return state;
  }

  invShiftRows(state) {
    const temp1 = state[1][3];
    state[1][3] = state[1][2];
    state[1][2] = state[1][1];
    state[1][1] = state[1][0];
    state[1][0] = temp1;

    const temp2a = state[2][0];
    const temp2b = state[2][1];
    state[2][0] = state[2][2];
    state[2][1] = state[2][3];
    state[2][2] = temp2a;
    state[2][3] = temp2b;

    const temp3 = state[3][0];
    state[3][0] = state[3][1];
    state[3][1] = state[3][2];
    state[3][2] = state[3][3];
    state[3][3] = temp3;

    return state;
  }

  invMixColumns(state) {
    for (let i = 0; i < 4; i++) {
      const s0 = state[0][i];
      const s1 = state[1][i];
      const s2 = state[2][i];
      const s3 = state[3][i];

      state[0][i] = this.galoisMult(0x0e, s0) ^ this.galoisMult(0x0b, s1) ^ this.galoisMult(0x0d, s2) ^ this.galoisMult(0x09, s3);
      state[1][i] = this.galoisMult(0x09, s0) ^ this.galoisMult(0x0e, s1) ^ this.galoisMult(0x0b, s2) ^ this.galoisMult(0x0d, s3);
      state[2][i] = this.galoisMult(0x0d, s0) ^ this.galoisMult(0x09, s1) ^ this.galoisMult(0x0e, s2) ^ this.galoisMult(0x0b, s3);
      state[3][i] = this.galoisMult(0x0b, s0) ^ this.galoisMult(0x0d, s1) ^ this.galoisMult(0x09, s2) ^ this.galoisMult(0x0e, s3);
    }
    return state;
  }

  // Encrypt single block (ECB mode)
  encryptBlock(plaintextBytes, key) {
    const expandedKey = this.keyExpansion(key);
    const roundKeys = [];
    for (let i = 0; i < this.nr + 1; i++) {
      const roundKey = [];
      for (let j = 0; j < 4; j++) {
        roundKey.push(expandedKey[4 * i + j]);
      }
      roundKeys.push(roundKey);
    }

    let state = this.bytesToMatrix(plaintextBytes);

    // Initial round
    let roundKeyMatrix = [];
    for (let i = 0; i < 4; i++) {
      const row = [];
      for (let j = 0; j < 4; j++) {
        row.push(roundKeys[0][j][i]);
      }
      roundKeyMatrix.push(row);
    }
    state = this.addRoundKey(state, roundKeyMatrix);

    // Main rounds
    for (let roundNum = 1; roundNum < this.nr; roundNum++) {
      state = this.subBytes(state);
      state = this.shiftRows(state);
      state = this.mixColumns(state);
      
      roundKeyMatrix = [];
      for (let i = 0; i < 4; i++) {
        const row = [];
        for (let j = 0; j < 4; j++) {
          row.push(roundKeys[roundNum][j][i]);
        }
        roundKeyMatrix.push(row);
      }
      state = this.addRoundKey(state, roundKeyMatrix);
    }

    // Final round
    state = this.subBytes(state);
    state = this.shiftRows(state);
    
    roundKeyMatrix = [];
    for (let i = 0; i < 4; i++) {
      const row = [];
      for (let j = 0; j < 4; j++) {
        row.push(roundKeys[this.nr][j][i]);
      }
      roundKeyMatrix.push(row);
    }
    state = this.addRoundKey(state, roundKeyMatrix);

    return this.matrixToBytes(state);
  }

  // Decrypt single block (ECB mode)
  decryptBlock(ciphertextBytes, key) {
    const expandedKey = this.keyExpansion(key);
    const roundKeys = [];
    for (let i = 0; i < this.nr + 1; i++) {
      const roundKey = [];
      for (let j = 0; j < 4; j++) {
        roundKey.push(expandedKey[4 * i + j]);
      }
      roundKeys.push(roundKey);
    }

    let state = this.bytesToMatrix(ciphertextBytes);

    // Initial round
    let roundKeyMatrix = [];
    for (let i = 0; i < 4; i++) {
      const row = [];
      for (let j = 0; j < 4; j++) {
        row.push(roundKeys[this.nr][j][i]);
      }
      roundKeyMatrix.push(row);
    }
    state = this.addRoundKey(state, roundKeyMatrix);

    // Main rounds
    for (let roundNum = this.nr - 1; roundNum > 0; roundNum--) {
      state = this.invShiftRows(state);
      state = this.invSubBytes(state);
      
      roundKeyMatrix = [];
      for (let i = 0; i < 4; i++) {
        const row = [];
        for (let j = 0; j < 4; j++) {
          row.push(roundKeys[roundNum][j][i]);
        }
        roundKeyMatrix.push(row);
      }
      state = this.addRoundKey(state, roundKeyMatrix);
      state = this.invMixColumns(state);
    }

    // Final round
    state = this.invShiftRows(state);
    state = this.invSubBytes(state);
    
    roundKeyMatrix = [];
    for (let i = 0; i < 4; i++) {
      const row = [];
      for (let j = 0; j < 4; j++) {
        row.push(roundKeys[0][j][i]);
      }
      roundKeyMatrix.push(row);
    }
    state = this.addRoundKey(state, roundKeyMatrix);

    return this.matrixToBytes(state);
  }

  // XOR two byte arrays
  xorBytes(a, b) {
    if (a.length !== b.length) {
      throw new Error('Byte arrays must have same length for XOR');
    }
    return a.map((byte, i) => byte ^ b[i]);
  }

  // Encrypt with CBC mode
  encryptCBC(plaintextBytes, keyHex, ivHex) {
    const keyBytes = this.hexToBytes(keyHex);
    const ivBytes = this.hexToBytes(ivHex);
    
    // Pad plaintext
    const padded = this.pkcs7Pad(plaintextBytes);
    
    // Encrypt in CBC mode
    const ciphertext = [];
    let previousBlock = ivBytes;
    
    for (let i = 0; i < padded.length; i += 16) {
      const block = padded.slice(i, i + 16);
      const xored = this.xorBytes(block, previousBlock);
      const encrypted = this.encryptBlock(xored, keyHex);
      ciphertext.push(...encrypted);
      previousBlock = encrypted;
    }
    
    return Buffer.from(ciphertext);
  }

  // Decrypt with CBC mode
  decryptCBC(ciphertextBytes, keyHex, ivHex) {
    const keyBytes = this.hexToBytes(keyHex);
    const ivBytes = this.hexToBytes(ivHex);
    
    if (ciphertextBytes.length % 16 !== 0) {
      throw new Error('Ciphertext length must be multiple of 16 bytes');
    }
    
    // Decrypt in CBC mode
    const plaintext = [];
    let previousBlock = ivBytes;
    
    for (let i = 0; i < ciphertextBytes.length; i += 16) {
      const block = ciphertextBytes.slice(i, i + 16);
      const decrypted = this.decryptBlock(Array.from(block), keyHex);
      const xored = this.xorBytes(decrypted, previousBlock);
      plaintext.push(...xored);
      previousBlock = block;
    }
    
    // Remove padding
    return Buffer.from(this.pkcs7Unpad(plaintext));
  }

  // Generate random key
  generateRandomKey() {
    const keyBytes = this.keySize / 8;
    const randomBytes = crypto.randomBytes(keyBytes);
    return this.bytesToHex(Array.from(randomBytes));
  }

  // Generate random IV
  generateRandomIV() {
    const randomBytes = crypto.randomBytes(16);
    return this.bytesToHex(Array.from(randomBytes));
  }
}

module.exports = { AESEnhanced };

