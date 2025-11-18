// AES Implementation in JavaScript
class AES {
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

  hexToBytes(hexString) {
    // Remove spaces and 0x prefixes (but not standalone 0 or x characters)
    hexString = hexString.replace(/\s+/g, '').replace(/^0x/i, '');
    if (hexString.length % 2 !== 0) {
      throw new Error('Invalid hex string length');
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
    // Convert 16 bytes to 4x4 matrix (column-major order)
    const matrix = [];
    for (let i = 0; i < 4; i++) {
      const row = [];
      for (let j = 0; j < 4; j++) {
        row.push(data[4 * j + i]); // Column-major: state[r][c] = input[4c + r]
      }
      matrix.push(row);
    }
    return matrix;
  }

  matrixToBytes(matrix) {
    // Convert 4x4 matrix to 16 bytes (column-major order)
    const data = new Array(16).fill(0);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        data[4 * j + i] = matrix[i][j] || 0; // Column-major: output[4c + r] = state[r][c]
      }
    }
    return data;
  }

  matrixToHex(matrix) {
    // Convert 4x4 matrix to hex string representation
    return matrix.map(row => 
      row.map(byte => (byte || 0).toString(16).padStart(2, '0').toUpperCase())
    );
  }

  keyExpansion(key) {
    // Expand the key for all rounds
    const keyBytes = this.hexToBytes(key);
    const w = [];

    // Copy the key into the first nk words
    for (let i = 0; i < this.nk; i++) {
      w.push([
        keyBytes[4 * i],
        keyBytes[4 * i + 1],
        keyBytes[4 * i + 2],
        keyBytes[4 * i + 3]
      ]);
    }

    // Generate the remaining words
    for (let i = this.nk; i < 4 * (this.nr + 1); i++) {
      let temp = [...w[i - 1]];

      if (i % this.nk === 0) {
        // RotWord
        temp = [temp[1], temp[2], temp[3], temp[0]];
        // SubWord
        temp = temp.map(b => this.sbox[b]);
        // XOR with round constant
        temp[0] ^= this.rcon[Math.floor(i / this.nk) - 1];
      } else if (this.nk > 6 && i % this.nk === 4) {
        // SubWord for AES-256
        temp = temp.map(b => this.sbox[b]);
      }

      // XOR with word nk positions back
      w.push([
        w[i - this.nk][0] ^ temp[0],
        w[i - this.nk][1] ^ temp[1],
        w[i - this.nk][2] ^ temp[2],
        w[i - this.nk][3] ^ temp[3]
      ]);
    }

    return w;
  }

  addRoundKey(state, roundKey) {
    // Add round key to state
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        state[i][j] ^= roundKey[i][j];
      }
    }
    return state;
  }

  subBytes(state) {
    // Substitute bytes using S-box
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        state[i][j] = this.sbox[state[i][j]];
      }
    }
    return state;
  }

  shiftRows(state) {
    // Shift rows of the state matrix
    // Row 0: no shift
    // Row 1: shift left by 1
    const temp1 = state[1][0];
    state[1][0] = state[1][1];
    state[1][1] = state[1][2];
    state[1][2] = state[1][3];
    state[1][3] = temp1;

    // Row 2: shift left by 2
    const temp2a = state[2][0];
    const temp2b = state[2][1];
    state[2][0] = state[2][2];
    state[2][1] = state[2][3];
    state[2][2] = temp2a;
    state[2][3] = temp2b;

    // Row 3: shift left by 3
    const temp3 = state[3][3];
    state[3][3] = state[3][2];
    state[3][2] = state[3][1];
    state[3][1] = state[3][0];
    state[3][0] = temp3;

    return state;
  }

  galoisMult(a, b) {
    // Galois field multiplication
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
    // Mix columns of the state matrix
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

  encrypt(plaintext, key) {
    // Encrypt plaintext using AES
    // Convert inputs
    const ptBytes = this.hexToBytes(plaintext);
    const keyBytes = this.hexToBytes(key);

    // Initialize state
    let state = this.bytesToMatrix(ptBytes);

    // Expand key
    const expandedKey = this.keyExpansion(key);

    // Convert expanded key to round keys (column-major order)
    const roundKeys = [];
    for (let i = 0; i < this.nr + 1; i++) {
      const roundKey = [];
      for (let j = 0; j < 4; j++) {
        roundKey.push(expandedKey[4 * i + j]);
      }
      roundKeys.push(roundKey);
    }

    // Store results for each round
    const results = {
      initial_state: this.matrixToHex(state),
      rounds: [],
      expanded_key: []
    };

    // Store expanded key information
    for (let i = 0; i < this.nr + 1; i++) {
      // Convert round key to 4x4 matrix (column-major order)
      const roundKeyMatrix = [];
      for (let r = 0; r < 4; r++) {
        const row = [];
        for (let c = 0; c < 4; c++) {
          row.push(roundKeys[i][c][r]); // Transpose: [c][r] instead of [r][c]
        }
        roundKeyMatrix.push(row);
      }

      results.expanded_key.push({
        round: i,
        key: this.matrixToHex(roundKeyMatrix)
      });
    }

    // Initial round
    // Convert round key to 4x4 matrix (column-major order)
    let roundKeyMatrix = [];
    for (let i = 0; i < 4; i++) {
      const row = [];
      for (let j = 0; j < 4; j++) {
        row.push(roundKeys[0][j][i]); // Transpose: [j][i] instead of [i][j]
      }
      roundKeyMatrix.push(row);
    }
    state = this.addRoundKey(state, roundKeyMatrix);
    results.rounds.push({
      round: 0,
      operation: 'Initial AddRoundKey',
      state: this.matrixToHex(state)
    });

    // Main rounds
    for (let roundNum = 1; roundNum < this.nr; roundNum++) {
      // SubBytes
      state = this.subBytes(state);
      results.rounds.push({
        round: roundNum,
        operation: 'SubBytes',
        state: this.matrixToHex(state)
      });

      // ShiftRows
      state = this.shiftRows(state);
      results.rounds.push({
        round: roundNum,
        operation: 'ShiftRows',
        state: this.matrixToHex(state)
      });

      // MixColumns
      state = this.mixColumns(state);
      results.rounds.push({
        round: roundNum,
        operation: 'MixColumns',
        state: this.matrixToHex(state)
      });

      // AddRoundKey
      // Convert round key to 4x4 matrix (column-major order)
      roundKeyMatrix = [];
      for (let i = 0; i < 4; i++) {
        const row = [];
        for (let j = 0; j < 4; j++) {
          row.push(roundKeys[roundNum][j][i]); // Transpose: [j][i] instead of [i][j]
        }
        roundKeyMatrix.push(row);
      }
      state = this.addRoundKey(state, roundKeyMatrix);
      results.rounds.push({
        round: roundNum,
        operation: 'AddRoundKey',
        state: this.matrixToHex(state)
      });
    }

    // Final round
    // SubBytes
    state = this.subBytes(state);
    results.rounds.push({
      round: this.nr,
      operation: 'SubBytes',
      state: this.matrixToHex(state)
    });

    // ShiftRows
    state = this.shiftRows(state);
    results.rounds.push({
      round: this.nr,
      operation: 'ShiftRows',
      state: this.matrixToHex(state)
    });

    // AddRoundKey
    // Convert round key to 4x4 matrix (column-major order)
    roundKeyMatrix = [];
    for (let i = 0; i < 4; i++) {
      const row = [];
      for (let j = 0; j < 4; j++) {
        row.push(roundKeys[this.nr][j][i]); // Transpose: [j][i] instead of [i][j]
      }
      roundKeyMatrix.push(row);
    }
    state = this.addRoundKey(state, roundKeyMatrix);
    results.rounds.push({
      round: this.nr,
      operation: 'Final AddRoundKey',
      state: this.matrixToHex(state)
    });

    // Final ciphertext
    const ciphertext = this.matrixToBytes(state);
    results.final_ciphertext = this.bytesToHex(ciphertext);

    return results;
  }

  // Decryption inverse operations
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

  decrypt(ciphertext, key) {
    // Decrypt ciphertext using AES
    const ctBytes = this.hexToBytes(ciphertext);
    const keyBytes = this.hexToBytes(key);

    // Initialize state
    let state = this.bytesToMatrix(ctBytes);

    // Expand key
    const expandedKey = this.keyExpansion(key);
    const roundKeys = [];
    for (let i = 0; i < this.nr + 1; i++) {
      const roundKey = [];
      for (let j = 0; j < 4; j++) {
        roundKey.push(expandedKey[4 * i + j]);
      }
      roundKeys.push(roundKey);
    }

    const results = {
      rounds: [],
      expanded_key: [],
      final_plaintext: ''
    };

    // Store expanded key information
    for (let i = 0; i < this.nr + 1; i++) {
      const roundKeyMatrix = [];
      for (let r = 0; r < 4; r++) {
        const row = [];
        for (let c = 0; c < 4; c++) {
          row.push(roundKeys[i][c][r]);
        }
        roundKeyMatrix.push(row);
      }
      results.expanded_key.push({
        round: i,
        key: this.matrixToHex(roundKeyMatrix)
      });
    }

    // Initial round - AddRoundKey with last round key
    let roundKeyMatrix = [];
    for (let i = 0; i < 4; i++) {
      const row = [];
      for (let j = 0; j < 4; j++) {
        row.push(roundKeys[this.nr][j][i]);
      }
      roundKeyMatrix.push(row);
    }
    state = this.addRoundKey(state, roundKeyMatrix);
    results.rounds.push({
      round: 0,
      operation: 'Initial AddRoundKey',
      state: this.matrixToHex(state)
    });

    // Main rounds (in reverse)
    for (let roundNum = this.nr - 1; roundNum >= 1; roundNum--) {
      // InvShiftRows
      state = this.invShiftRows(state);
      results.rounds.push({
        round: this.nr - roundNum + 1,
        operation: 'InvShiftRows',
        state: this.matrixToHex(state)
      });

      // InvSubBytes
      state = this.invSubBytes(state);
      results.rounds.push({
        round: this.nr - roundNum + 1,
        operation: 'InvSubBytes',
        state: this.matrixToHex(state)
      });

      // AddRoundKey
      roundKeyMatrix = [];
      for (let i = 0; i < 4; i++) {
        const row = [];
        for (let j = 0; j < 4; j++) {
          row.push(roundKeys[roundNum][j][i]);
        }
        roundKeyMatrix.push(row);
      }
      state = this.addRoundKey(state, roundKeyMatrix);
      results.rounds.push({
        round: this.nr - roundNum + 1,
        operation: 'AddRoundKey',
        state: this.matrixToHex(state)
      });

      // InvMixColumns
      state = this.invMixColumns(state);
      results.rounds.push({
        round: this.nr - roundNum + 1,
        operation: 'InvMixColumns',
        state: this.matrixToHex(state)
      });
    }

    // Final round
    // InvShiftRows
    state = this.invShiftRows(state);
    results.rounds.push({
      round: this.nr,
      operation: 'InvShiftRows',
      state: this.matrixToHex(state)
    });

    // InvSubBytes
    state = this.invSubBytes(state);
    results.rounds.push({
      round: this.nr,
      operation: 'InvSubBytes',
      state: this.matrixToHex(state)
    });

    // AddRoundKey
    roundKeyMatrix = [];
    for (let i = 0; i < 4; i++) {
      const row = [];
      for (let j = 0; j < 4; j++) {
        row.push(roundKeys[0][j][i]);
      }
      roundKeyMatrix.push(row);
    }
    state = this.addRoundKey(state, roundKeyMatrix);
    results.rounds.push({
      round: this.nr,
      operation: 'Final AddRoundKey',
      state: this.matrixToHex(state)
    });

    // Final plaintext
    const plaintext = this.matrixToBytes(state);
    results.final_plaintext = this.bytesToHex(plaintext);

    return results;
  }
}

module.exports = { AES };

