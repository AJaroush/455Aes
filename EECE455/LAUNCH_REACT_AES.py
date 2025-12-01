#!/usr/bin/env python3
"""
🚀 AES Encryption Tool - React Version Launcher
This script will automatically install dependencies and launch the modern React-based AES encryption tool.
"""

import subprocess
import sys
import webbrowser
import time
import os
import threading

def print_banner():
    """Print the application banner"""
    print("=" * 70)
    print("🔐 AES ENCRYPTION TOOL - REACT VERSION")
    print("   Modern React-based interface with advanced features")
    print("   Interactive visualizations, comparisons, and tutorials")
    print("   Built with React, Framer Motion, and Tailwind CSS")
    print("=" * 70)
    print()

def check_node():
    """Check if Node.js is available"""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            version = result.stdout.strip()
            print(f"✅ Node.js {version} detected")
            return True
        else:
            print("❌ Node.js not found")
            return False
    except FileNotFoundError:
        print("❌ Node.js not found")
        return False

def check_npm():
    """Check if npm is available"""
    try:
        result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            version = result.stdout.strip()
            print(f"✅ npm {version} detected")
            return True
        else:
            print("❌ npm not found")
            return False
    except FileNotFoundError:
        print("❌ npm not found")
        return False

def install_dependencies():
    """Install required packages"""
    print("🔧 Installing server dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "express", "cors", "multer"], 
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print("✅ Server dependencies installed")
    except subprocess.CalledProcessError:
        print("⚠️  Some server dependencies may not be installed")
    
    print("🔧 Installing Node.js dependencies...")
    try:
        # Install server dependencies
        subprocess.check_call(['npm', 'install'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print("✅ Server dependencies installed")
        
        # Install client dependencies
        os.chdir('client')
        subprocess.check_call(['npm', 'install'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print("✅ Client dependencies installed")
        os.chdir('..')
        
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to install dependencies")
        return False

def build_client():
    """Build the React client"""
    print("🏗️  Building React client...")
    try:
        os.chdir('client')
        subprocess.check_call(['npm', 'run', 'build'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print("✅ React client built successfully")
        os.chdir('..')
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to build React client")
        os.chdir('..')
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

def launch_app():
    """Launch the AES encryption tool"""
    print("🚀 Launching AES Encryption Tool...")
    print("📱 The tool will open in your web browser at: http://localhost:8080")
    print("🛑 Press Ctrl+C to stop the server")
    print("-" * 50)
    
    # Open browser in background
    browser_thread = threading.Thread(target=open_browser_delayed)
    browser_thread.daemon = True
    browser_thread.start()
    
    # Launch Node.js server
    try:
        subprocess.run(['node', 'server.js'])
    except KeyboardInterrupt:
        print("\n👋 AES Encryption Tool stopped. Goodbye!")
    except Exception as e:
        print(f"❌ Error launching application: {e}")

def main():
    """Main launcher function"""
    print_banner()
    
    # Check if we're in the right directory
    if not os.path.exists('server.js'):
        print("❌ Error: server.js not found!")
        print("   Please run this script from the same directory as server.js")
        return
    
    # Check Node.js and npm
    if not check_node():
        print("❌ Error: Node.js is required but not installed")
        print("   Please install Node.js from https://nodejs.org")
        return
    
    if not check_npm():
        print("❌ Error: npm is required but not installed")
        print("   Please install npm (usually comes with Node.js)")
        return
    
    # Install dependencies
    if not install_dependencies():
        print("❌ Failed to install dependencies")
        return
    
    # Build client
    if not build_client():
        print("❌ Failed to build client")
        return
    
    print()
    print("🎯 Ready to launch! The tool will:")
    print("   1. Start a Node.js server")
    print("   2. Open your web browser automatically")
    print("   3. Display the modern React-based AES interface")
    print()
    
    try:
        input("Press Enter to continue (or Ctrl+C to cancel)...")
    except KeyboardInterrupt:
        print("\n👋 Launch cancelled. Goodbye!")
        return
    
    # Launch the application
    launch_app()

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        input("Press Enter to exit...")
