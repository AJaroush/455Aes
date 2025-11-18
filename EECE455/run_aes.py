#!/usr/bin/env python3
"""
AES Encryption Tool Launcher
This script will automatically install dependencies and launch the AES encryption tool.
"""

import subprocess
import sys
import webbrowser
import time
import os

def install_requirements():
    """Install required packages"""
    print("🔧 Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to install dependencies. Please install Flask manually:")
        print("   pip install Flask")
        return False

def launch_app():
    """Launch the AES encryption tool"""
    print("🚀 Launching AES Encryption Tool...")
    print("📱 The tool will open in your web browser at: http://localhost:5000")
    print("🛑 Press Ctrl+C to stop the server")
    print("-" * 50)
    
    # Open browser after a short delay
    def open_browser():
        time.sleep(2)
        webbrowser.open('http://localhost:5000')
    
    import threading
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    # Launch Flask app
    try:
        from aes_implementation import app
        app.run(debug=False, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        print("\n👋 AES Encryption Tool stopped. Goodbye!")
    except Exception as e:
        print(f"❌ Error launching application: {e}")

def main():
    """Main launcher function"""
    print("=" * 60)
    print("🔐 AES Encryption Tool - Advanced Encryption Standard")
    print("   Supports AES-128, AES-192, and AES-256")
    print("   Round-by-round visualization and key expansion")
    print("=" * 60)
    
    # Check if we're in the right directory
    if not os.path.exists('aes_implementation.py'):
        print("❌ Error: aes_implementation.py not found!")
        print("   Please run this script from the same directory as aes_implementation.py")
        return
    
    # Install requirements
    if not install_requirements():
        return
    
    # Launch the application
    launch_app()

if __name__ == "__main__":
    main()
