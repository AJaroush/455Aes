# AES Encryption Tool - Desktop Application

A professional, market-ready desktop application for AES encryption and decryption with a clean, modern interface. Supports AES-128, AES-192, and AES-256 encryption with CBC and ECB modes.

## 🚀 Features

### Core Functionality
- **AES Encryption/Decryption**: Full support for AES-128, AES-192, and AES-256
- **Multiple Modes**: CBC (recommended) and ECB modes
- **File & Text Support**: Encrypt/decrypt both files and text input
- **Drag & Drop**: Intuitive file input with drag-and-drop support
- **PKCS7 Padding**: Proper padding implementation for secure encryption

### Security Features
- **Secure Key Generation**: Cryptographically secure random key and IV generation
- **SHA-256 Hashing**: Integrity verification with SHA-256 checksums
- **Key Management**: Copy, save, and show/hide keys with secure storage options
- **ECB Warning**: Visual warnings when using less secure ECB mode

### User Experience
- **Modern UI**: Clean, professional interface with light/dark theme support
- **Real-time Feedback**: Encryption speed indicators and status updates
- **Export Functionality**: Export encrypted files and metadata
- **Help System**: Built-in help section explaining AES and usage
- **Tooltips**: Contextual help throughout the interface

### Desktop Features
- **Standalone Executable**: No installation required - just double-click to run
- **Offline Operation**: Works completely offline - no internet required
- **Cross-Platform**: Supports Windows, macOS, and Linux
- **File System Integration**: Native file dialogs for save/open operations

## 📦 Installation

### Option 1: Download Pre-built Executable

1. Download the executable for your platform:
   - **Windows**: `AES-Encryption-Tool-Setup.exe`
   - **macOS**: `AES-Encryption-Tool.dmg`
   - **Linux**: `AES-Encryption-Tool.AppImage`

2. Run the installer (Windows/macOS) or make executable and run (Linux):
   ```bash
   chmod +x AES-Encryption-Tool.AppImage
   ./AES-Encryption-Tool.AppImage
   ```

### Option 2: Build from Source

#### Prerequisites
- Node.js 16+ and npm
- Git (optional)

#### Build Steps

1. **Clone or download the repository**
   ```bash
   git clone <repository-url>
   cd EECE455P2
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Build the React frontend**
   ```bash
   npm run build
   ```

4. **Build the desktop executable**

   For macOS:
   ```bash
   npm run build-electron-mac
   ```

   For Windows:
   ```bash
   npm run build-electron-win
   ```

   For Linux:
   ```bash
   npm run build-electron-linux
   ```

   For all platforms:
   ```bash
   npm run build-electron
   ```

5. **Find your executable**
   - The built executables will be in the `dist/` directory
   - Windows: `.exe` installer
   - macOS: `.dmg` file
   - Linux: `.AppImage` file

## 🎯 Usage Guide

### Quick Start

1. **Launch the Application**
   - Double-click the executable to start
   - The application will open in a new window

2. **Choose Operation Mode**
   - Click **Encrypt** to encrypt files/text
   - Click **Decrypt** to decrypt encrypted files

3. **Configure AES Settings**
   - Select key size: 128, 192, or 256 bits
   - Choose encryption mode: CBC (recommended) or ECB
   - Generate a secure key or enter your own

4. **Input Your Data**
   - **For Files**: Drag and drop a file or click "Browse Files"
   - **For Text**: Type or paste text in the text area

5. **Process**
   - Click the **Encrypt** or **Decrypt** button
   - Wait for processing to complete

6. **Save Results**
   - Click **Download** to save the encrypted/decrypted file
   - Click **Export** to save metadata and results as JSON

### Detailed Features

#### Key Management

**Generate Random Key**
- Click the ⚡ (Zap) icon to generate a cryptographically secure random key
- The IV (Initialization Vector) will be auto-generated for CBC mode

**Copy Key**
- Click the 📋 (Copy) icon to copy the key to clipboard
- Use this to share keys securely (use secure channels!)

**Save Key**
- Click the 💾 (Save) icon to save the key to a text file
- **IMPORTANT**: Store this file securely - losing the key means losing access to encrypted data

**Show/Hide Key**
- Click the 👁️ (Eye) icon to toggle key visibility
- Useful for verifying keys without exposing them on screen

#### Encryption Modes

**CBC Mode (Recommended)**
- Cipher Block Chaining mode
- More secure - same plaintext produces different ciphertext
- Requires an IV (Initialization Vector)
- IV is auto-generated if not provided

**ECB Mode (Not Recommended)**
- Electronic Codebook mode
- Less secure - reveals patterns in plaintext
- Warning displayed when selected
- Use only for educational purposes

#### File Operations

**Drag & Drop**
- Drag files directly onto the drop zone
- Supports any file type and size (up to 100MB)

**File Encryption**
- Original file is encrypted with AES
- Output file has `.aes` extension
- SHA-256 hash calculated before and after encryption

**File Decryption**
- Upload encrypted `.aes` file
- Provide the same key and IV used for encryption
- Original file is restored

#### Security Best Practices

1. **Always Use CBC Mode** for production encryption
2. **Keep Keys Secure** - Never share keys over insecure channels
3. **Backup Keys** - Save keys in multiple secure locations
4. **Use Strong Keys** - Always use randomly generated keys
5. **Verify Hashes** - Check SHA-256 hashes to verify file integrity
6. **Never Reuse IVs** - Generate a new IV for each encryption

## 🔧 Development

### Running in Development Mode

1. **Start the development server**
   ```bash
   npm run dev
   ```
   This starts both the backend server and React frontend

2. **Run Electron in development**
   ```bash
   npm run electron-dev
   ```
   This starts the server and launches Electron

3. **Access the web version**
   - Open `http://localhost:8080` in your browser

### Project Structure

```
EECE455P2/
├── electron.js              # Electron main process
├── preload.js               # Electron preload script
├── server.js                # Express backend server
├── aes_implementation.js    # Original AES implementation
├── aes_enhanced.js          # Enhanced AES with CBC/decryption
├── package.json             # Root package configuration
├── client/                  # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Desktop.js   # Main desktop interface
│   │   │   ├── Encrypt.js   # Educational encryption page
│   │   │   └── ...
│   │   └── components/
│   └── build/               # Production build
└── dist/                    # Built executables
```

## 📋 API Endpoints

The application includes a REST API for encryption operations:

- `POST /api/encrypt` - Encrypt text (16-byte blocks)
- `POST /api/encrypt-file` - Encrypt files
- `POST /api/decrypt-file` - Decrypt files
- `POST /api/generate-key` - Generate random key/IV
- `GET /api/health` - Health check

## 🛠️ Technical Details

### AES Implementation
- Pure JavaScript implementation
- Supports AES-128, AES-192, AES-256
- PKCS7 padding for variable-length data
- CBC mode with proper IV handling
- Full decryption support

### Technologies Used
- **Frontend**: React, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express
- **Desktop**: Electron
- **Cryptography**: Custom AES implementation + Node.js crypto

### Security Considerations
- Keys never leave the local machine
- All encryption happens client-side
- No data sent to external servers
- Cryptographically secure random number generation
- SHA-256 integrity verification

## 📝 Version History

### Version 2.0.0 (Current)
- ✅ Desktop application with Electron
- ✅ File encryption/decryption support
- ✅ Drag-and-drop file input
- ✅ Secure key generation
- ✅ SHA-256 hashing
- ✅ Light/dark theme
- ✅ Export functionality
- ✅ Help system
- ✅ CBC and ECB modes
- ✅ PKCS7 padding

### Version 1.0.0
- Initial web-based version
- Text encryption only
- Educational visualization

## 🐛 Troubleshooting

### Application Won't Start
- Ensure Node.js 16+ is installed
- Check that all dependencies are installed: `npm run install-all`
- Try rebuilding: `npm run build` then `npm run electron`

### Encryption Fails
- Verify key length matches selected key size
- Ensure IV is provided for CBC mode decryption
- Check that file size is under 100MB limit

### File Won't Decrypt
- Verify you're using the same key and IV used for encryption
- Ensure the file wasn't corrupted
- Check that encryption mode matches (CBC vs ECB)

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues, questions, or feature requests, please open an issue on the repository.

## 🙏 Acknowledgments

- AES algorithm specification (NIST FIPS 197)
- Electron team for the desktop framework
- React and Tailwind CSS communities

---

**⚠️ Security Notice**: This tool is provided for educational and legitimate use only. Always follow local laws and regulations regarding encryption software.

# 455Aes
