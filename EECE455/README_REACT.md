# 🔐 AES Encryption Tool - React Version

A stunning, modern web application for learning and visualizing the Advanced Encryption Standard (AES) with interactive animations, educational content, and advanced features.

## ✨ Features

### 🎨 **Modern React Interface**
- **Beautiful UI**: Built with React, Framer Motion, and Tailwind CSS
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: Interactive transitions and hover effects
- **Dark Theme**: Professional dark theme with gradient accents

### 🔒 **Complete AES Implementation**
- **All Variants**: AES-128, AES-192, and AES-256 support
- **Round-by-Round Visualization**: Watch every step of encryption
- **Interactive Matrices**: Click and explore 4x4 state matrices
- **Key Expansion**: Detailed view of how keys are generated

### 🎓 **Educational Tools**
- **Interactive Tutorial**: Step-by-step AES learning guide
- **Technical Explanations**: Detailed descriptions of each operation
- **Examples**: Pre-loaded test vectors and examples
- **Progress Tracking**: Track your learning progress

### 🚀 **Advanced Features**
- **File Upload**: Encrypt files directly from your computer
- **Batch Processing**: Encrypt multiple messages at once
- **Performance Comparison**: Compare AES variants side-by-side
- **Export Results**: Download encryption results as JSON
- **Copy to Clipboard**: Easy copying of results

### 🎯 **Interactive Visualizations**
- **Matrix Animations**: Watch state transformations in real-time
- **Round Timeline**: Navigate through encryption rounds
- **Auto-play Mode**: Automatic progression through rounds
- **Speed Control**: Adjust animation speed
- **3D Effects**: Beautiful visual effects and transitions

## 🚀 Quick Start

### Option 1: Automatic Launcher (Recommended)
```bash
python3 LAUNCH_REACT_AES.py
```

### Option 2: Manual Setup
```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Build the React app
cd client && npm run build && cd ..

# Start the server
node server.js
```

### Option 3: Development Mode
```bash
# Terminal 1: Start the server
node server.js

# Terminal 2: Start React development server
cd client && npm start
```

## 📁 Project Structure

```
EECE455/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/             # Page components
│   │   └── App.js             # Main app component
│   ├── public/                # Static assets
│   └── package.json           # Frontend dependencies
├── server.js                  # Node.js server
├── aes_implementation.js      # JavaScript AES implementation
├── aes_implementation.py      # Python AES implementation
├── package.json               # Server dependencies
└── LAUNCH_REACT_AES.py        # React launcher script
```

## 🎮 How to Use

### 1. **Encryption Page**
- Enter your message in hexadecimal format
- Select AES variant (128/192/256)
- Enter the corresponding key
- Watch the encryption process step-by-step

### 2. **Comparison Tool**
- Compare all AES variants side-by-side
- View performance metrics
- Analyze differences between variants

### 3. **Tutorial Mode**
- Learn AES fundamentals
- Interactive step-by-step guide
- Technical explanations and examples

### 4. **Advanced Features**
- Upload files for encryption
- Batch process multiple messages
- Export results for analysis

## 🔧 Technical Details

### **Frontend Technologies**
- **React 18**: Modern React with hooks
- **Framer Motion**: Smooth animations and transitions
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls

### **Backend Technologies**
- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **Multer**: File upload handling
- **CORS**: Cross-origin resource sharing

### **AES Implementation**
- **Complete Implementation**: All AES operations
- **Correct S-box**: Official AES S-box values
- **Key Expansion**: Rijndael key schedule
- **Galois Field**: Proper GF(2^8) multiplication

## 📊 Performance Features

- **Real-time Encryption**: Fast encryption with visual feedback
- **Performance Metrics**: Timing analysis for each variant
- **Batch Processing**: Efficient handling of multiple operations
- **Memory Optimization**: Efficient matrix operations

## 🎨 Visual Features

- **Interactive Matrices**: Click to explore state values
- **Animated Transitions**: Smooth state changes
- **Color-coded Operations**: Different colors for each AES operation
- **Progress Indicators**: Visual progress through encryption rounds
- **Responsive Grid**: Adapts to any screen size

## 📚 Educational Value

### **For Students**
- Visual learning of cryptographic concepts
- Interactive exploration of AES internals
- Step-by-step operation explanations
- Real-world examples and test vectors

### **For Professionals**
- Performance analysis tools
- Batch processing capabilities
- Export functionality for analysis
- Modern web interface for presentations

### **For Educators**
- Ready-to-use teaching tool
- Interactive demonstrations
- Comprehensive tutorial system
- Professional presentation interface

## 🌟 Special Features

### **File Encryption**
- Upload any file for encryption
- Automatic hex conversion
- Support for various file types
- Secure file handling

### **Batch Processing**
- Encrypt multiple messages
- Performance comparison
- Bulk export capabilities
- Error handling for invalid inputs

### **Export & Import**
- JSON export of results
- Copy to clipboard functionality
- Download encrypted data
- Import previous results

## 🔒 Security Note

This is an educational implementation designed for learning purposes. For production use, always use well-tested cryptographic libraries and follow security best practices.

## 🎉 Getting Started

1. **Launch the Tool**: Run `python3 LAUNCH_REACT_AES.py`
2. **Open Browser**: Navigate to `http://localhost:5000`
3. **Start Learning**: Try the tutorial or jump into encryption
4. **Explore Features**: Discover all the advanced capabilities

## 🤝 Contributing

This project is open source and welcomes contributions:
- Bug reports and feature requests
- Code improvements and optimizations
- Documentation enhancements
- Educational content additions

## 📄 License

MIT License - Feel free to use for educational purposes.

---

**🎯 Ready to explore AES like never before? Launch the tool and start your cryptographic journey!**
