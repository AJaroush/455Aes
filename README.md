# AES Encryption Tool

A comprehensive, educational AES (Advanced Encryption Standard) encryption and decryption tool with interactive visualizations, file support, and multiple encryption modes.

## Features

### Core Functionality
- **AES Encryption/Decryption**: Support for AES-128, AES-192, and AES-256
- **Multiple Encryption Modes**: CBC, ECB, CTR, CFB, OFB, XTS, and GCM
- **File Encryption**: Encrypt and decrypt files with drag-and-drop support
- **Password-Based Keys**: PBKDF2 key derivation from passwords
- **HMAC Integrity**: Optional HMAC-SHA-256 for authenticated encryption

### Interactive Visualizations
- **Round-by-Round Visualization**: Step-through view of all AES operations
- **Matrix Visualization**: 4x4 state matrix transformations
- **Key Expansion**: Visual representation of key schedule generation
- **Real-time Updates**: Watch encryption/decryption happen step-by-step

### User Experience
- **Step-by-Step Guides**: Interactive guides for encryption and decryption
- **Input Flexibility**: Support for text messages or file uploads
- **Unlimited Length**: Automatic padding for messages and ciphertext of any length
- **History Tracking**: Save and view encryption/decryption history
- **PDF Export**: Export results and history as PDF documents
- **Dark/Light Mode**: Full theme support

### Security Features
- **Secure Random Generation**: Cryptographically secure random keys and IVs
- **Password Strength Meter**: Real-time password strength assessment
- **Best Practices**: Educational content on secure implementation
- **Attack Documentation**: Comprehensive guide on AES attacks and mitigations

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/AJaroush/455Aes.git
cd EECE455P2
```

2. Install all dependencies:
```bash
npm run install-all
```

This will install dependencies for both the server and client.

## Usage

### Development Mode

Start both the server and client in development mode:

```bash
npm run dev
```

This will:
- Start the backend server on `http://localhost:8080`
- Start the React frontend on `http://localhost:3000`

### Production Build

Build the client for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

The application will be available at `http://localhost:8080`

## Project Structure

```
EECE455P2/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts (Theme, etc.)
│   │   └── App.js         # Main app component
│   └── package.json
├── server.js              # Express backend server
├── aes_implementation.js  # Core AES implementation
├── aes_enhanced.js        # Enhanced AES with padding and CBC
├── aes_advanced.js        # Advanced modes (CTR, CFB, OFB, XTS, GCM)
└── package.json           # Root package.json
```

## Technologies Used

### Frontend
- **React**: UI framework
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Lucide React**: Icon library
- **React Hot Toast**: Toast notifications
- **jsPDF**: PDF generation
- **Axios**: HTTP client

### Backend
- **Node.js**: Runtime environment
- **Express**: Web framework
- **Multer**: File upload handling
- **Crypto**: Node.js crypto module
- **Argon2**: Advanced key derivation
- **Node-Forge**: Cryptographic utilities

## API Endpoints

- `POST /api/encrypt` - Encrypt a message
- `POST /api/decrypt` - Decrypt ciphertext
- `POST /api/encrypt-file` - Encrypt a file
- `POST /api/decrypt-file` - Decrypt a file
- `POST /api/encrypt-advanced` - Advanced encryption modes
- `POST /api/derive-key` - Derive key from password (PBKDF2)
- `POST /api/derive-key-advanced` - Advanced key derivation (Argon2)
- `POST /api/calculate-hmac` - Calculate HMAC
- `POST /api/password-strength` - Check password strength
- `POST /api/avalanche-demo` - Demonstrate avalanche effect
- `POST /api/generate-key` - Generate random key

## Pages

- **Home** (`/`): Landing page with feature overview
- **Encrypt** (`/encrypt`): Encrypt messages or files
- **Decrypt** (`/decrypt`): Decrypt ciphertext or files
- **Compare** (`/compare`): Compare AES variants side-by-side
- **Tutorial** (`/tutorial`): Interactive AES tutorial
- **Attacks** (`/attacks`): Documentation on AES attacks and security
- **History** (`/history`): View encryption/decryption history
- **AES History** (`/aes-history`): Historical context of AES
- **About** (`/about`): Project information and team

## Team

- Ahmad Jaroush - Developer
- Carl Wakim - Developer
- Lea Nasrallah - Developer
- Yasmina El Jamal - Developer
- Tatiana Kaado - Developer

## Educational Purpose

This project is designed for educational purposes to help students and developers understand:
- How AES encryption works internally
- The step-by-step process of encryption/decryption
- Different AES modes and their use cases
- Security best practices
- Common attack vectors and mitigations

## Security Note

While this tool implements AES correctly, it's important to note:
- This is an educational tool, not production-grade security software
- Always use established cryptographic libraries in production
- Follow security best practices for key management
- Keep cryptographic implementations updated

## License

MIT License

## Version

2.0.0

