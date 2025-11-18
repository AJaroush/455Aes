# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm run install-all
```

### Step 2: Build the Application
```bash
npm run build
```

### Step 3: Run Electron (Development)
```bash
npm run electron
```

### Step 4: Build Executable
```bash
# For your current platform
npm run build-electron

# Or specify platform
npm run build-electron-mac    # macOS
npm run build-electron-win     # Windows  
npm run build-electron-linux   # Linux
```

### Step 5: Find Your Executable
Check the `dist/` folder for your platform-specific executable:
- **macOS**: `AES-Encryption-Tool.dmg`
- **Windows**: `AES-Encryption-Tool-Setup.exe`
- **Linux**: `AES-Encryption-Tool.AppImage`

## 📱 Using the Desktop App

1. **Launch**: Double-click the executable
2. **Navigate**: Click "Desktop" in the navigation menu
3. **Encrypt a File**:
   - Select "Encrypt" mode
   - Choose AES-128/192/256
   - Click ⚡ to generate a key
   - Drag & drop your file
   - Click "Encrypt"
   - Download the encrypted file

4. **Decrypt a File**:
   - Select "Decrypt" mode
   - Enter the same key and IV used for encryption
   - Upload the `.aes` file
   - Click "Decrypt"
   - Download the decrypted file

## 🔑 Key Management Tips

- **Always save your keys** - Click 💾 to save key to file
- **Use CBC mode** - More secure than ECB
- **Generate random keys** - Click ⚡ for secure generation
- **Keep keys safe** - Losing the key means losing access to encrypted data

## ⚠️ Important Notes

- Keys are never stored or transmitted
- All encryption happens locally
- Works completely offline
- Maximum file size: 100MB

## 🆘 Troubleshooting

**App won't start?**
- Make sure Node.js 16+ is installed
- Run `npm run install-all` again
- Check that `client/build` exists

**Encryption fails?**
- Verify key length matches selected size
- Ensure IV is provided for CBC mode
- Check file size is under 100MB

**Can't decrypt?**
- Verify you're using the exact same key and IV
- Ensure encryption mode matches (CBC/ECB)
- Check file wasn't corrupted

## 📚 More Information

See `README.md` for complete documentation.

