#!/usr/bin/env python3
"""
EmotiBit Service Starter
Handles installation of dependencies and starts the service
"""
import subprocess
import sys
import os
import time

def install_requirements():
    """Install required packages"""
    print("📦 Installing Python dependencies...")
    try:
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        print("⚠️ Continuing with available packages...")
        return False

def start_service():
    """Start the EmotiBit service"""
    print("🚀 Starting EmotiBit Service...")
    try:
        # Change to the python_backend directory
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
        
        # Try to install requirements first
        install_requirements()
        
        # Start the service
        subprocess.run([sys.executable, 'emotibit_service.py'])
    except KeyboardInterrupt:
        print("\n🛑 Service stopped by user")
    except Exception as e:
        print(f"❌ Error starting service: {e}")

if __name__ == '__main__':
    start_service()