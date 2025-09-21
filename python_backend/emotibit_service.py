#!/usr/bin/env python3
import numpy as np
import pandas as pd
import time
import json
import sys
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import threading
import logging

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
logging.getLogger('tensorflow').setLevel(logging.ERROR)

try:
    from tensorflow.keras.models import load_model
    import joblib
    ML_AVAILABLE = True
except ImportError:
    print("Warning: TensorFlow/joblib not available. Using fallback stress calculation.")
    ML_AVAILABLE = False

app = Flask(__name__)
CORS(app)

class EmotiBitService:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.latest_data = None
        self.csv_file = "emotibit_live.csv"
        self.ml_available = ML_AVAILABLE
        
        # Load ML model if available
        if self.ml_available:
            try:
                if os.path.exists('stress_model.h5') and os.path.exists('scaler.pkl'):
                    self.model = load_model('stress_model.h5')
                    self.scaler = joblib.load('scaler.pkl')
                    print("✅ ML model and scaler loaded successfully")
                else:
                    print("⚠️ ML model files not found, using fallback calculation")
                    self.ml_available = False
            except Exception as e:
                print(f"❌ Error loading ML model: {e}")
                self.ml_available = False
        
        # Start monitoring CSV file
        self.start_monitoring()
    
    def start_monitoring(self):
        """Start monitoring the CSV file for changes"""
        def monitor():
            while True:
                try:
                    self.read_latest_data()
                    time.sleep(1)  # Check every second
                except Exception as e:
                    print(f"Monitoring error: {e}")
                    time.sleep(5)  # Wait longer on error
        
        monitor_thread = threading.Thread(target=monitor, daemon=True)
        monitor_thread.start()
        print("📊 Started monitoring EmotiBit CSV file")
    
    def read_latest_data(self):
        """Read the latest data from CSV file"""
        try:
            if not os.path.exists(self.csv_file):
                # Create sample CSV if it doesn't exist
                self.create_sample_csv()
                return
            
            data = pd.read_csv(self.csv_file)
            if len(data) > 0:
                latest = data.iloc[-1]
                
                # Extract biometric values
                eda = float(latest.get('EDA', 0.3))
                hr = float(latest.get('HR', 75))
                hrv = float(latest.get('HRV', 45))
                temp = float(latest.get('TEMP', 34.5))
                
                # Calculate stress level
                if self.ml_available and self.model is not None:
                    stress_level = self.get_ml_stress_level(eda, hr, hrv, temp)
                else:
                    stress_level = self.get_fallback_stress_level(eda, hr, hrv, temp)
                
                self.latest_data = {
                    'hr': int(hr),
                    'hrv': int(hrv),
                    'eda': round(eda, 2),
                    'temp': round(temp, 1),
                    'score': round(stress_level, 1),
                    'timestamp': int(time.time() * 1000),
                    'source': 'ml_model' if self.ml_available and self.model else 'fallback'
                }
                
        except Exception as e:
            print(f"Error reading CSV data: {e}")
            # Generate fallback data
            self.latest_data = self.generate_fallback_data()
    
    def get_ml_stress_level(self, eda, hr, hrv, temp):
        """Get stress level using trained ML model"""
        try:
            # Prepare input
            X = np.array([[eda, hr, hrv, temp]])
            X_scaled = self.scaler.transform(X)
            stress_level = self.model.predict(X_scaled)[0][0]
            
            # Clip to 0–10 range
            stress_level = np.clip(stress_level, 0, 10)
            return float(stress_level)
            
        except Exception as e:
            print(f"ML prediction error: {e}")
            return self.get_fallback_stress_level(eda, hr, hrv, temp)
    
    def get_fallback_stress_level(self, eda, hr, hrv, temp):
        """Calculate stress level using simple heuristics"""
        # Normalize values to 0-10 scale
        hr_stress = max(0, min(10, (hr - 60) / 60 * 10))
        hrv_stress = max(0, min(10, (60 - hrv) / 40 * 10))
        eda_stress = max(0, min(10, eda * 6.67))  # Scale 0-1.5 to 0-10
        
        # Weighted average
        stress_level = (hr_stress * 0.4 + hrv_stress * 0.4 + eda_stress * 0.2)
        return max(0, min(10, stress_level))
    
    def generate_fallback_data(self):
        """Generate realistic fallback data when CSV is unavailable"""
        import random
        
        base_time = time.time()
        variation = np.sin(base_time / 30) * 0.3
        noise = (random.random() - 0.5) * 0.2
        
        hr = int(75 + variation * 20 + noise * 15)
        hrv = int(45 + variation * 15 + noise * 10)
        eda = round(0.3 + abs(variation) * 0.4 + abs(noise) * 0.3, 2)
        temp = round(34.5 + variation * 1.5 + noise * 0.5, 1)
        
        stress_level = self.get_fallback_stress_level(eda, hr, hrv, temp)
        
        return {
            'hr': max(50, min(150, hr)),
            'hrv': max(10, min(100, hrv)),
            'eda': max(0.05, min(1.5, eda)),
            'temp': max(32, min(37, temp)),
            'score': round(stress_level, 1),
            'timestamp': int(time.time() * 1000),
            'source': 'simulated'
        }
    
    def create_sample_csv(self):
        """Create a sample CSV file for testing"""
        sample_data = {
            'EDA': [0.25, 0.30, 0.35, 0.28, 0.32],
            'HR': [72, 75, 78, 74, 76],
            'HRV': [48, 45, 42, 46, 44],
            'TEMP': [34.2, 34.5, 34.8, 34.4, 34.6]
        }
        
        df = pd.DataFrame(sample_data)
        df.to_csv(self.csv_file, index=False)
        print(f"📝 Created sample CSV file: {self.csv_file}")
    
    def get_current_data(self):
        """Get the current biometric data"""
        if self.latest_data is None:
            return self.generate_fallback_data()
        return self.latest_data

# Initialize service
emotibit_service = EmotiBitService()

@app.route('/api/emotibit', methods=['GET', 'POST'])
def get_biometric_data():
    """API endpoint to get current biometric data"""
    try:
        data = emotibit_service.get_current_data()
        return jsonify(data)
    except Exception as e:
        return jsonify({
            'error': str(e),
            'hr': 75,
            'hrv': 45,
            'eda': 0.3,
            'temp': 34.5,
            'score': 5.0,
            'timestamp': int(time.time() * 1000),
            'source': 'error_fallback'
        }), 500

@app.route('/api/emotibit/status', methods=['GET'])
def get_status():
    """Get service status"""
    return jsonify({
        'ml_available': emotibit_service.ml_available,
        'model_loaded': emotibit_service.model is not None,
        'csv_exists': os.path.exists(emotibit_service.csv_file),
        'last_update': emotibit_service.latest_data['timestamp'] if emotibit_service.latest_data else None
    })

@app.route('/api/emotibit/simulate', methods=['POST'])
def simulate_data():
    """Manually trigger data simulation"""
    try:
        # Add a new row to CSV with simulated data
        new_data = emotibit_service.generate_fallback_data()
        
        # Append to CSV
        df_new = pd.DataFrame([{
            'EDA': new_data['eda'],
            'HR': new_data['hr'],
            'HRV': new_data['hrv'],
            'TEMP': new_data['temp']
        }])
        
        if os.path.exists(emotibit_service.csv_file):
            df_new.to_csv(emotibit_service.csv_file, mode='a', header=False, index=False)
        else:
            df_new.to_csv(emotibit_service.csv_file, index=False)
        
        return jsonify({'success': True, 'data': new_data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting EmotiBit Service...")
    print(f"📊 ML Model Available: {emotibit_service.ml_available}")
    print(f"📁 CSV File: {emotibit_service.csv_file}")
    print("🌐 Server running on http://localhost:5000")
    
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)