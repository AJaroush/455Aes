# ChatGPT Prompt for LaTeX Report Generation

Copy and paste this entire prompt into ChatGPT:

---

**PROMPT:**

I need you to generate a complete, professional LaTeX report code for Overleaf about an AES Encryption Tool web application project. The report should be comprehensive, well-structured, and include placeholders for screenshots. Please create a complete LaTeX document with proper formatting, sections, subsections, code listings, tables, and figure placeholders.

## Project Overview

**Project Name:** AES Encryption Tool
**Type:** Educational Web Application
**Purpose:** A comprehensive, educational AES (Advanced Encryption Standard) encryption and decryption tool with interactive visualizations, file support, and multiple encryption modes.

**Team Members:**
- Ahmad Jaroush
- Carl Wakim
- Lea Nasrallah
- Yasmina El Jamal
- Tatiana Kaado

**Course:** EECE455 (Cryptography)
**Year:** 2025

## Project Features - Include ALL of these:

### Core Functionality
- **AES Encryption/Decryption**: Full support for AES-128, AES-192, and AES-256
- **Multiple Encryption Modes**: 
  - CBC (Cipher Block Chaining) - Recommended, with auto-generated IV
  - ECB (Electronic Codebook) - Basic mode
  - CTR (Counter Mode) - Streaming mode
  - CFB (Cipher Feedback) - Streaming mode
  - OFB (Output Feedback) - Streaming mode
  - XTS (XEX-based Tweaked CodeBook) - Disk encryption mode with Tweak
  - GCM (Galois/Counter Mode) - Authenticated encryption
- **File Encryption/Decryption**: 
  - Support for text files (.txt) - encrypted as binary data
  - Support for binary files - encrypted and saved as .aes files
  - Drag-and-drop file upload interface
  - Automatic IV generation for CBC mode
  - IV prepended to encrypted files (16 bytes for CBC mode)
- **Password-Based Keys**: PBKDF2 key derivation from passwords
- **Advanced Key Derivation**: Argon2 for enhanced security
- **HMAC Integrity**: Optional HMAC-SHA-256 for authenticated encryption
- **Unlimited Length Support**: Automatic padding for messages and ciphertext of any length

### Interactive Visualizations
- **Round-by-Round Visualization**: Step-through view of all AES operations (SubBytes, ShiftRows, MixColumns, AddRoundKey)
- **Matrix Visualization**: 4x4 state matrix transformations showing byte-level changes
- **Key Expansion Visualization**: Visual representation of key schedule generation showing how the original key expands into round keys
- **Real-time Updates**: Watch encryption/decryption happen step-by-step with animations

### User Experience Features
- **Step-by-Step Guides**: Interactive guides for encryption and decryption processes
- **Input Flexibility**: Support for text messages (hex input) or file uploads
- **History Tracking**: Save and view encryption/decryption history with timestamps, modes, key sizes
- **PDF Export**: Export results and history as PDF documents
- **Dark/Light Mode**: Full theme support with smooth transitions
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Show/Hide Functionality**: Toggle visibility for sensitive inputs (keys, messages, IVs)
- **Random Generation**: One-click generation for keys, IVs, and ciphertext
- **Input Validation**: Real-time validation with visual feedback
- **Toast Notifications**: User-friendly error and success messages

### Security Features
- **Secure Random Generation**: Cryptographically secure random keys and IVs using Node.js crypto module
- **Password Strength Meter**: Real-time password strength assessment
- **Best Practices Documentation**: Educational content on secure implementation
- **Attack Documentation**: Comprehensive guide on AES attacks including:
  - Theoretical attacks (Brute force, Side-channel, Implementation attacks)
  - Real-world attacks (Padding Oracle, BEAST, Lucky 13, CacheBleed, Meltdown & Spectre, Rowhammer, Power Analysis, ECB Pattern Leakage)
  - Mitigation strategies for each attack
- **PKCS7 Padding**: Proper padding implementation for block ciphers
- **Input Sanitization**: Hex input cleaning and validation

## Technical Architecture

### Frontend Technologies
- **React**: UI framework with hooks and context API
- **React Router**: Client-side routing for SPA navigation
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Framer Motion**: Animation library for smooth transitions and visualizations
- **Lucide React**: Modern icon library
- **React Hot Toast**: Toast notification system
- **jsPDF**: PDF generation for exporting results
- **Axios**: HTTP client for API communication

### Backend Technologies
- **Node.js**: Runtime environment (v18)
- **Express**: Web framework for RESTful API
- **Multer**: File upload handling middleware
- **Crypto**: Node.js built-in crypto module for secure operations
- **Argon2**: Advanced key derivation function
- **Node-Forge**: Cryptographic utilities and algorithms

### Project Structure
```
EECE455P2/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   │   ├── MatrixVisualization.js
│   │   │   ├── RoundVisualization.js
│   │   │   ├── KeyExpansion.js
│   │   │   └── Navbar.js
│   │   ├── pages/         # Page components
│   │   │   ├── Home.js
│   │   │   ├── Encrypt.js
│   │   │   ├── Decrypt.js
│   │   │   ├── Compare.js
│   │   │   ├── Tutorial.js
│   │   │   ├── Attacks.js
│   │   │   ├── History.js
│   │   │   ├── AESHistory.js
│   │   │   └── About.js
│   │   ├── contexts/      # React contexts
│   │   └── App.js         # Main app component
│   └── package.json
├── server.js              # Express backend server
├── aes_implementation.js  # Core AES implementation
├── aes_enhanced.js        # Enhanced AES with padding and CBC
├── aes_advanced.js        # Advanced modes (CTR, CFB, OFB, XTS, GCM)
├── netlify/
│   └── functions/         # Netlify serverless functions
└── package.json
```

## API Endpoints

Document these endpoints:
- `POST /api/encrypt` - Encrypt a text message
- `POST /api/decrypt` - Decrypt ciphertext
- `POST /api/encrypt-file` - Encrypt a file (supports both multer upload and JSON base64)
- `POST /api/decrypt-file` - Decrypt a file
- `POST /api/encrypt-advanced` - Advanced encryption modes (CTR, CFB, OFB, XTS, GCM)
- `POST /api/derive-key` - Derive key from password (PBKDF2)
- `POST /api/derive-key-advanced` - Advanced key derivation (Argon2)
- `POST /api/calculate-hmac` - Calculate HMAC-SHA-256
- `POST /api/password-strength` - Check password strength
- `POST /api/avalanche-demo` - Demonstrate avalanche effect
- `POST /api/generate-key` - Generate random key and IV

## Application Pages

Document each page with its features:

1. **Home Page** (`/`): 
   - Landing page with feature overview
   - Feature cards with icons
   - Navigation to all sections
   - Statistics and highlights

2. **Encrypt Page** (`/encrypt`):
   - Text input mode: Hex message input with validation
   - File input mode: Drag-and-drop file upload
   - Key input: Hex key or password-based key derivation
   - Key size selection: AES-128, AES-192, AES-256
   - Mode selection: CBC, ECB, CTR, CFB, OFB, XTS, GCM
   - IV/Nonce/Tweak input (auto-generated for CBC)
   - Show/hide toggles for sensitive inputs
   - Random generation buttons for keys and IVs
   - Real-time visualizations (Matrix, Rounds, Key Expansion)
   - PDF export functionality
   - Step-by-step encryption guide

3. **Decrypt Page** (`/decrypt`):
   - Ciphertext input: Unlimited length hex input with auto-padding
   - File input mode: Upload encrypted files
   - Key input: Hex key or password-based
   - IV extraction: Auto-extract IV from encrypted files (CBC mode)
   - Mode selection: CBC or ECB
   - Real-time visualizations
   - PDF export functionality
   - Step-by-step decryption guide

4. **Compare Page** (`/compare`):
   - Side-by-side comparison of AES-128, AES-192, AES-256
   - Performance metrics
   - Security analysis
   - Use case recommendations

5. **Tutorial Page** (`/tutorial`):
   - Interactive AES tutorial
   - Step-by-step explanations
   - Visual learning aids
   - Educational content

6. **Attacks Page** (`/attacks`):
   - Comprehensive attack documentation
   - Theoretical attacks section
   - Real-world attacks section (with years, severity, descriptions)
   - Implementation attacks
   - Protocol-level attacks
   - Mitigation strategies
   - Best practices

7. **History Page** (`/history`):
   - View encryption/decryption history
   - Filter by type, mode, key size
   - Export history as PDF
   - Timestamp tracking

8. **AES History Page** (`/aes-history`):
   - Historical context of AES
   - Development timeline
   - Competition details
   - Adoption history

9. **About Page** (`/about`):
   - Project information
   - Team members
   - Changelog
   - Copyright information (2025)

## AES Implementation Details

Document the core AES algorithm implementation:

1. **Key Expansion**: 
   - How the original key expands into round keys
   - Rcon (Round Constants) usage
   - Key schedule generation algorithm

2. **Encryption Process**:
   - Initial round: AddRoundKey
   - Main rounds (9/11/13 rounds for AES-128/192/256):
     - SubBytes (S-box substitution)
     - ShiftRows (row shifting)
     - MixColumns (column mixing)
     - AddRoundKey (XOR with round key)
   - Final round (no MixColumns):
     - SubBytes
     - ShiftRows
     - AddRoundKey

3. **Decryption Process**:
   - Inverse operations in reverse order
   - Inverse SubBytes, Inverse ShiftRows, Inverse MixColumns

4. **Block Cipher Modes**:
   - **ECB**: Each block encrypted independently (not recommended)
   - **CBC**: Each block XORed with previous ciphertext block
   - **CTR**: Counter-based mode for streaming
   - **CFB**: Cipher feedback mode
   - **OFB**: Output feedback mode
   - **XTS**: XEX-based tweaked codebook for disk encryption
   - **GCM**: Authenticated encryption with additional data

5. **Padding**: PKCS7 padding implementation

## Deployment

- **Netlify Deployment**: 
  - Serverless functions for API endpoints
  - Static site hosting for React frontend
  - Automatic deployments from GitHub
  - Environment configuration

## Screenshots Section

Include placeholders for the following screenshots (use `\includegraphics` with placeholder paths):

1. **Home Page Screenshot**: Landing page with feature overview
2. **Encrypt Page - Text Mode**: Encryption interface with text input
3. **Encrypt Page - File Mode**: File upload interface
4. **Decryption Page**: Decryption interface with ciphertext input
5. **Matrix Visualization**: 4x4 state matrix showing byte transformations
6. **Round Visualization**: Step-by-step round operations
7. **Key Expansion Visualization**: Key schedule generation visualization
8. **Compare Page**: Side-by-side AES variant comparison
9. **Tutorial Page**: Interactive tutorial interface
10. **Attacks Page**: Security attacks documentation
11. **History Page**: Encryption/decryption history view
12. **Dark/Light Mode**: Theme switching demonstration
13. **File Encryption Result**: Encrypted file download (showing binary data)
14. **File Decryption Result**: Decrypted file showing original plaintext

## Report Structure Requirements

Please create a LaTeX document with the following structure:

1. **Title Page**: Project title, team members, course, year, institution
2. **Abstract**: Brief overview of the project
3. **Table of Contents**: Auto-generated
4. **List of Figures**: Auto-generated
5. **List of Tables**: Auto-generated (if any)
6. **Introduction**: 
   - Project motivation
   - Objectives
   - Scope
7. **Background & Literature Review**:
   - AES history and development
   - Cryptographic principles
   - Block cipher modes of operation
8. **System Architecture**:
   - Overall architecture diagram (text description)
   - Frontend architecture
   - Backend architecture
   - API design
9. **Implementation**:
   - AES Algorithm Implementation
   - Encryption Modes Implementation
   - Frontend Implementation
   - Backend Implementation
   - File Handling
   - Visualization System
10. **Features & Functionality**:
    - Core Features
    - User Interface
    - Visualizations
    - Security Features
11. **Security Analysis**:
    - Attack Vectors
    - Mitigation Strategies
    - Best Practices
12. **Testing & Validation**:
    - Functionality Testing
    - Security Testing
    - User Experience Testing
13. **Deployment**:
    - Netlify Deployment
    - Configuration
    - Challenges and Solutions
14. **Results & Discussion**:
    - Feature Demonstration
    - Performance Analysis
    - User Feedback
15. **Conclusion**:
    - Summary
    - Achievements
    - Future Work
16. **References**: Academic and technical references
17. **Appendices**:
    - Code snippets (if needed)
    - Additional diagrams

## LaTeX Requirements

- Use a professional document class (e.g., `article`, `report`, or `IEEEtran` for technical papers)
- Include proper packages: `graphicx`, `listings`, `hyperref`, `amsmath`, `algorithm2e` or `algorithmicx` for algorithms
- Use proper code formatting with `listings` package for code snippets
- Include proper figure captions and references
- Use proper table formatting
- Include proper bibliography/references section
- Make it visually appealing with proper spacing, fonts, and formatting
- Use proper sectioning commands
- Include proper cross-references
- Add proper page numbering
- Include proper headers/footers if needed

## Additional Notes

- The report should be comprehensive (aim for 20-30 pages)
- Include proper technical terminology
- Use proper mathematical notation for cryptographic operations
- Include algorithm pseudocode where appropriate
- Make it suitable for an academic/technical report
- Ensure all sections are well-developed with sufficient detail
- Include proper citations and references
- Use professional language throughout

Please generate the complete LaTeX code that I can directly copy into Overleaf. Include all necessary packages, proper document structure, and placeholder comments for where screenshots should be inserted.

---

