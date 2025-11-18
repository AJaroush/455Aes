@echo off
echo ============================================================
echo AES Encryption Tool - Advanced Encryption Standard
echo Supports AES-128, AES-192, and AES-256
echo Round-by-round visualization and key expansion
echo ============================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

REM Install requirements
echo Installing required packages...
python -m pip install -r requirements.txt
if errorlevel 1 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

REM Launch the application
echo.
echo Launching AES Encryption Tool...
echo The tool will open in your web browser at: http://localhost:5000
echo Press Ctrl+C to stop the server
echo ------------------------------------------------------------
echo.

python run_aes.py

pause
