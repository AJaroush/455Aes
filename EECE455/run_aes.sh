#!/bin/bash

echo "============================================================"
echo "AES Encryption Tool - Advanced Encryption Standard"
echo "Supports AES-128, AES-192, and AES-256"
echo "Round-by-round visualization and key expansion"
echo "============================================================"
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "Error: Python is not installed"
        echo "Please install Python from https://python.org"
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

# Check if we're in the right directory
if [ ! -f "aes_implementation.py" ]; then
    echo "Error: aes_implementation.py not found!"
    echo "Please run this script from the same directory as aes_implementation.py"
    exit 1
fi

# Install requirements
echo "Installing required packages..."
$PYTHON_CMD -m pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies"
    exit 1
fi

# Launch the application
echo
echo "Launching AES Encryption Tool..."
echo "The tool will open in your web browser at: http://localhost:5000"
echo "Press Ctrl+C to stop the server"
echo "------------------------------------------------------------"
echo

$PYTHON_CMD run_aes.py
