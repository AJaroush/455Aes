import os
import sys
from flask import Flask, render_template, request, jsonify
import json

# AES Implementation
class AES:
    # S-box (correct AES S-box)
    sbox = [
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
    ]

    # Round constants
    rcon = [
        0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36, 0x6c, 0xd8, 0xab, 0x4d, 0x9a, 0x2f
    ]

    def __init__(self, key_size=128):
        self.key_size = key_size
        self.nk = key_size // 32  # Number of 32-bit words in the key
        self.nr = self.nk + 6     # Number of rounds
        
    def hex_to_bytes(self, hex_string):
        """Convert hex string to bytes, removing spaces and 0x prefixes"""
        hex_string = hex_string.replace(' ', '').replace('0x', '').replace('\n', '')
        return bytes.fromhex(hex_string)
    
    def bytes_to_hex(self, data):
        """Convert bytes to hex string"""
        return data.hex().upper()
    
    def bytes_to_matrix(self, data):
        """Convert 16 bytes to 4x4 matrix (column-major order)"""
        matrix = []
        for i in range(4):
            row = []
            for j in range(4):
                row.append(data[4*j + i])  # Column-major: state[r][c] = input[4c + r]
            matrix.append(row)
        return matrix
    
    def matrix_to_bytes(self, matrix):
        """Convert 4x4 matrix to 16 bytes (column-major order)"""
        data = bytearray(16)
        for i in range(4):
            for j in range(4):
                data[4*j + i] = matrix[i][j]  # Column-major: output[4c + r] = state[r][c]
        return bytes(data)
    
    def matrix_to_hex(self, matrix):
        """Convert 4x4 matrix to hex string representation"""
        hex_matrix = []
        for row in matrix:
            hex_row = []
            for byte in row:
                hex_row.append(f"{byte:02X}")
            hex_matrix.append(hex_row)
        return hex_matrix
    
    def key_expansion(self, key):
        """Expand the key for all rounds"""
        key_bytes = self.hex_to_bytes(key)
        w = []
        
        # Copy the key into the first nk words (column-major order)
        for i in range(self.nk):
            w.append([key_bytes[4*i], key_bytes[4*i+1], key_bytes[4*i+2], key_bytes[4*i+3]])
        
        # Generate the remaining words
        for i in range(self.nk, 4 * (self.nr + 1)):
            temp = w[i-1][:]
            
            if i % self.nk == 0:
                # RotWord
                temp = [temp[1], temp[2], temp[3], temp[0]]
                # SubWord
                temp = [self.sbox[b] for b in temp]
                # XOR with round constant
                temp[0] ^= self.rcon[i // self.nk - 1]
            elif self.nk > 6 and i % self.nk == 4:
                # SubWord for AES-256
                temp = [self.sbox[b] for b in temp]
            
            # XOR with word nk positions back
            w.append([w[i-self.nk][j] ^ temp[j] for j in range(4)])
        
        return w
    
    def add_round_key(self, state, round_key):
        """Add round key to state"""
        for i in range(4):
            for j in range(4):
                state[i][j] ^= round_key[i][j]
        return state
    
    def sub_bytes(self, state):
        """Substitute bytes using S-box"""
        for i in range(4):
            for j in range(4):
                state[i][j] = self.sbox[state[i][j]]
        return state
    
    def shift_rows(self, state):
        """Shift rows of the state matrix"""
        # Row 0: no shift
        # Row 1: shift left by 1
        state[1] = [state[1][1], state[1][2], state[1][3], state[1][0]]
        # Row 2: shift left by 2
        state[2] = [state[2][2], state[2][3], state[2][0], state[2][1]]
        # Row 3: shift left by 3
        state[3] = [state[3][3], state[3][0], state[3][1], state[3][2]]
        return state
    
    def galois_mult(self, a, b):
        """Galois field multiplication"""
        p = 0
        for i in range(8):
            if b & 1:
                p ^= a
            hi_bit_set = a & 0x80
            a <<= 1
            if hi_bit_set:
                a ^= 0x1b
            b >>= 1
        return p & 0xff
    
    def mix_columns(self, state):
        """Mix columns of the state matrix"""
        for i in range(4):
            s0 = state[0][i]
            s1 = state[1][i]
            s2 = state[2][i]
            s3 = state[3][i]
            
            state[0][i] = self.galois_mult(0x02, s0) ^ self.galois_mult(0x03, s1) ^ s2 ^ s3
            state[1][i] = s0 ^ self.galois_mult(0x02, s1) ^ self.galois_mult(0x03, s2) ^ s3
            state[2][i] = s0 ^ s1 ^ self.galois_mult(0x02, s2) ^ self.galois_mult(0x03, s3)
            state[3][i] = self.galois_mult(0x03, s0) ^ s1 ^ s2 ^ self.galois_mult(0x02, s3)
        
        return state
    
    def encrypt(self, plaintext, key):
        """Encrypt plaintext using AES"""
        # Convert inputs
        pt_bytes = self.hex_to_bytes(plaintext)
        key_bytes = self.hex_to_bytes(key)
        
        # Initialize state
        state = self.bytes_to_matrix(pt_bytes)
        
        # Expand key
        expanded_key = self.key_expansion(key)
        
        # Convert expanded key to round keys (column-major order)
        round_keys = []
        for i in range(self.nr + 1):
            round_key = []
            for j in range(4):
                round_key.append(expanded_key[4*i + j])
            round_keys.append(round_key)
        
        # Store results for each round
        results = {
            'initial_state': self.matrix_to_hex(state),
            'rounds': [],
            'expanded_key': []
        }
        
        # Store expanded key information
        for i in range(self.nr + 1):
            results['expanded_key'].append({
                'round': i,
                'key': self.matrix_to_hex(round_keys[i])
            })
        
        # Initial round
        # Convert round key to 4x4 matrix (column-major order)
        round_key_matrix = []
        for i in range(4):
            row = []
            for j in range(4):
                row.append(round_keys[0][j][i])  # Transpose: [j][i] instead of [i][j]
            round_key_matrix.append(row)
        state = self.add_round_key(state, round_key_matrix)
        results['rounds'].append({
            'round': 0,
            'operation': 'Initial AddRoundKey',
            'state': self.matrix_to_hex(state)
        })
        
        # Main rounds
        for round_num in range(1, self.nr):
            # SubBytes
            state = self.sub_bytes(state)
            results['rounds'].append({
                'round': round_num,
                'operation': 'SubBytes',
                'state': self.matrix_to_hex(state)
            })
            
            # ShiftRows
            state = self.shift_rows(state)
            results['rounds'].append({
                'round': round_num,
                'operation': 'ShiftRows',
                'state': self.matrix_to_hex(state)
            })
            
            # MixColumns
            state = self.mix_columns(state)
            results['rounds'].append({
                'round': round_num,
                'operation': 'MixColumns',
                'state': self.matrix_to_hex(state)
            })
            
            # AddRoundKey
            # Convert round key to 4x4 matrix (column-major order)
            round_key_matrix = []
            for i in range(4):
                row = []
                for j in range(4):
                    row.append(round_keys[round_num][j][i])  # Transpose: [j][i] instead of [i][j]
                round_key_matrix.append(row)
            state = self.add_round_key(state, round_key_matrix)
            results['rounds'].append({
                'round': round_num,
                'operation': 'AddRoundKey',
                'state': self.matrix_to_hex(state)
            })
        
        # Final round
        # SubBytes
        state = self.sub_bytes(state)
        results['rounds'].append({
            'round': self.nr,
            'operation': 'SubBytes',
            'state': self.matrix_to_hex(state)
        })
        
        # ShiftRows
        state = self.shift_rows(state)
        results['rounds'].append({
            'round': self.nr,
            'operation': 'ShiftRows',
            'state': self.matrix_to_hex(state)
        })
        
        # AddRoundKey
        # Convert round key to 4x4 matrix (column-major order)
        round_key_matrix = []
        for i in range(4):
            row = []
            for j in range(4):
                row.append(round_keys[self.nr][j][i])  # Transpose: [j][i] instead of [i][j]
            round_key_matrix.append(row)
        state = self.add_round_key(state, round_key_matrix)
        results['rounds'].append({
            'round': self.nr,
            'operation': 'Final AddRoundKey',
            'state': self.matrix_to_hex(state)
        })
        
        # Final ciphertext
        ciphertext = self.matrix_to_bytes(state)
        results['final_ciphertext'] = self.bytes_to_hex(ciphertext)
        
        return results

# Export the AES class for use in other modules
__all__ = ['AES']

# Flask app (for backward compatibility)
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/encrypt', methods=['POST'])
def encrypt():
    try:
        data = request.get_json()
        message = data['message']
        key = data['key']
        key_size = int(data['key_size'])
        
        # Validate inputs
        if len(message.replace(' ', '').replace('0x', '')) != 32:
            return jsonify({'error': 'Message must be exactly 16 bytes (32 hex characters)'}), 400
        
        expected_key_length = key_size // 4
        if len(key.replace(' ', '').replace('0x', '')) != expected_key_length:
            return jsonify({'error': f'Key must be exactly {key_size//8} bytes ({expected_key_length} hex characters) for AES-{key_size}'}), 400
        
        # Create AES instance and encrypt
        aes = AES(key_size)
        results = aes.encrypt(message, key)
        
        return jsonify(results)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
