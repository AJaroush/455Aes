# 🔐 AES Encryption Tool

A comprehensive implementation of the Advanced Encryption Standard (AES) with support for AES-128, AES-192, and AES-256. This tool provides detailed round-by-round visualization of the encryption process and key expansion.

## ✨ Features

- **Multiple AES Variants**: Support for AES-128, AES-192, and AES-256
- **Round-by-Round Visualization**: See each step of the encryption process
- **Key Expansion Display**: View how the key is expanded for each round
- **Beautiful Web Interface**: Modern, responsive UI with real-time results
- **Hexadecimal I/O**: Input and output in hexadecimal format
- **4x4 State Matrix Display**: Visual representation of the AES state matrix
- **Cross-Platform**: Works on Windows, macOS, and Linux

## 🚀 Quick Start

### Option 1: Automatic Launcher (Recommended)

**For Windows:**
```bash
run_aes.bat
```

**For macOS/Linux:**
```bash
./run_aes.sh
```

**For any system with Python:**
```bash
python run_aes.py
```

### Option 2: Manual Setup

1. **Install Python** (if not already installed)
   - Download from [python.org](https://python.org)

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Application**
   ```bash
   python aes_implementation.py
   ```

4. **Open in Browser**
   - Navigate to `http://localhost:5000`

## 📖 How to Use

1. **Enter Message**: Input a 16-byte message in hexadecimal format (32 hex characters)
   - Example: `00112233445566778899aabbccddeeff`

2. **Select AES Variant**: Choose from AES-128, AES-192, or AES-256

3. **Enter Key**: Input the key in hexadecimal format
   - AES-128: 16 bytes (32 hex characters)
   - AES-192: 24 bytes (48 hex characters)  
   - AES-256: 32 bytes (64 hex characters)

4. **Click Encrypt**: The tool will process your input and display:
   - Initial state matrix
   - Each round's operations (SubBytes, ShiftRows, MixColumns, AddRoundKey)
   - Key expansion for each round
   - Final ciphertext

## 🔧 Technical Details

### AES Implementation
- **SubBytes**: S-box substitution
- **ShiftRows**: Row shifting operation
- **MixColumns**: Column mixing using Galois field multiplication
- **AddRoundKey**: XOR with round key
- **Key Expansion**: Rijndael key schedule

### Supported Operations
- **AES-128**: 10 rounds, 16-byte key
- **AES-192**: 12 rounds, 24-byte key
- **AES-256**: 14 rounds, 32-byte key

## 📁 File Structure

```
EECE455/
├── aes_implementation.py    # Main AES implementation and Flask app
├── templates/
│   └── index.html          # Web interface
├── requirements.txt        # Python dependencies
├── run_aes.py             # Python launcher script
├── run_aes.bat            # Windows batch launcher
├── run_aes.sh             # Unix shell launcher
└── README.md              # This file
```

## 🌐 Web Interface Features

- **Responsive Design**: Works on desktop and mobile devices
- **Tabbed Interface**: Switch between encryption rounds and key expansion
- **Interactive Matrices**: Hover effects on state matrices
- **Real-time Processing**: Instant results with loading indicators
- **Error Handling**: Clear error messages for invalid inputs
- **Modern UI**: Beautiful gradient design with smooth animations

## 🔍 Example Usage

### Input Example:
- **Message**: `00112233445566778899aabbccddeeff`
- **Key (AES-128)**: `000102030405060708090a0b0c0d0e0f`
- **AES Variant**: AES-128

### Output:
The tool will display:
1. Initial state matrix
2. Round 0: Initial AddRoundKey
3. Rounds 1-9: SubBytes → ShiftRows → MixColumns → AddRoundKey
4. Round 10: SubBytes → ShiftRows → Final AddRoundKey
5. Key expansion for all rounds
6. Final ciphertext

## 🛠️ Requirements

- **Python 3.6+**
- **Flask 2.3.3**
- **Werkzeug 2.3.7**
- **Web Browser** (Chrome, Firefox, Safari, Edge)

## 🎯 Educational Value

This tool is perfect for:
- **Cryptography Students**: Understanding AES internals
- **Security Researchers**: Analyzing encryption processes
- **Developers**: Learning about block cipher implementation
- **Educators**: Teaching cryptographic concepts visually

## 🔒 Security Note

This is an educational implementation for learning purposes. For production use, always use well-tested cryptographic libraries.

## 📞 Support

If you encounter any issues:
1. Ensure Python is installed and in your PATH
2. Check that all dependencies are installed
3. Verify your input format (hexadecimal only)
4. Make sure no other application is using port 5000

## 🎉 Enjoy Learning AES!

This tool provides a comprehensive way to understand the Advanced Encryption Standard through visual, step-by-step encryption processes. Perfect for academic study and cryptographic analysis!
