#!/usr/bin/env python3
"""
🚀 AES Encryption Tool - Universal Launcher
This is the main launcher that works on any system with Python.
Just double-click this file or run: python LAUNCH_AES.py
"""

import sys
import os
import subprocess
import webbrowser
import time
import threading

def print_banner():
    """Print the application banner"""
    print("=" * 70)
    print("🔐 AES ENCRYPTION TOOL - ADVANCED ENCRYPTION STANDARD")
    print("   Supports AES-128, AES-192, and AES-256")
    print("   Round-by-round visualization and key expansion")
    print("   Beautiful web interface with real-time results")
    print("=" * 70)
    print()

def check_python():
    """Check if Python is available"""
    try:
        version = sys.version_info
        if version.major < 3 or (version.major == 3 and version.minor < 6):
            print("❌ Error: Python 3.6 or higher is required")
            print(f"   Current version: {version.major}.{version.minor}.{version.micro}")
            return False
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} detected")
        return True
    except Exception as e:
        print(f"❌ Error checking Python: {e}")
        return False

def install_flask():
    """Install Flask if not available"""
    try:
        import flask
        print("✅ Flask is already installed")
        return True
    except ImportError:
        print("📦 Installing Flask...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "Flask"], 
                                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print("✅ Flask installed successfully")
            return True
        except subprocess.CalledProcessError:
            print("❌ Failed to install Flask automatically")
            print("   Please install Flask manually: pip install Flask")
            return False

def open_browser_delayed():
    """Open browser after a delay"""
    time.sleep(3)
    try:
        webbrowser.open('http://localhost:8080')
        print("🌐 Opening web browser...")
    except Exception as e:
        print(f"⚠️  Could not open browser automatically: {e}")
        print("   Please manually open: http://localhost:8080")

def launch_application():
    """Launch the AES encryption tool"""
    print("🚀 Starting AES Encryption Tool...")
    print("📱 Web interface will be available at: http://localhost:8080")
    print("🛑 Press Ctrl+C to stop the server")
    print("-" * 50)
    
    # Start browser in background
    browser_thread = threading.Thread(target=open_browser_delayed)
    browser_thread.daemon = True
    browser_thread.start()
    
    try:
        # Import and run the Flask app
        from aes_implementation import app
        app.run(debug=False, host='0.0.0.0', port=8080, use_reloader=False)
    except KeyboardInterrupt:
        print("\n👋 AES Encryption Tool stopped. Thank you for using it!")
    except Exception as e:
        print(f"❌ Error launching application: {e}")
        print("   Please check that all files are present and try again")

def main():
    """Main launcher function"""
    print_banner()
    
    # Check Python version
    if not check_python():
        input("Press Enter to exit...")
        return
    
    # Check if we're in the right directory
    if not os.path.exists('aes_implementation.py'):
        print("❌ Error: aes_implementation.py not found!")
        print("   Please run this script from the same directory as the AES files")
        input("Press Enter to exit...")
        return
    
    # Install Flask
    if not install_flask():
        input("Press Enter to exit...")
        return
    
    print()
    print("🎯 Ready to launch! The tool will:")
    print("   1. Start a local web server")
    print("   2. Open your web browser automatically")
    print("   3. Display the AES encryption interface")
    print()
    
    try:
        input("Press Enter to continue (or Ctrl+C to cancel)...")
    except KeyboardInterrupt:
        print("\n👋 Launch cancelled. Goodbye!")
        return
    
    # Launch the application
    launch_application()

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        input("Press Enter to exit...")
