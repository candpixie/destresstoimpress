# EmotiBit Python Service

This service integrates your existing EmotiBit Python code with the Destress2Impress dashboard.

## 🚀 Quick Start

1. **Copy your EmotiBit files to this directory:**
   ```
   python_backend/
   ├── stress_model.h5      # Your trained ML model
   ├── scaler.pkl           # Your trained scaler
   ├── emotibit_live.csv    # REAL live data from your EmotiBit hardware
   └── emotibit_service.py  # Service (already created)
   ```

2. **Start the service:**
   ```bash
   cd python_backend
   python start_service.py
   ```

3. **The service will:**
   - ✅ Auto-install required Python packages
   - ✅ Load YOUR actual ML model and scaler
   - ✅ Monitor `emotibit_live.csv` for REAL EmotiBit data
   - ✅ Use your trained model for stress prediction
   - ✅ Fall back to realistic simulation if files are missing

## 📊 API Endpoints

- `GET /api/emotibit` - Get current biometric data
- `GET /api/emotibit/status` - Get service status
- `POST /api/emotibit/simulate` - Add simulated data to CSV

## 🔧 Integration with Your Code

### Option 1: CSV File Integration (RECOMMENDED)
Your existing EmotiBit code should write REAL data to `emotibit_live.csv`:
```csv
EDA,HR,HRV,TEMP
0.25,72,48,34.2  # <- REAL data from your EmotiBit
0.30,75,45,34.5  # <- REAL data from your EmotiBit
```

### Option 2: Direct Integration
Replace the `read_latest_data()` method with your data reading logic:
```python
def read_latest_data(self):
    # Your EmotiBit reading code here
    eda, hr, hrv, temp = your_emotibit_function()
    
    # Rest of the method stays the same
    if self.ml_available and self.model is not None:
        stress_level = self.get_ml_stress_level(eda, hr, hrv, temp)
    else:
        stress_level = self.get_fallback_stress_level(eda, hr, hrv, temp)
    # ...
```

### Option 3: Real-time Serial/USB Integration
If your EmotiBit connects via serial, modify the monitoring function:
```python
def start_monitoring(self):
    # Replace CSV monitoring with serial reading
    import serial
    ser = serial.Serial('/dev/ttyUSB0', 115200)  # Your EmotiBit port
    # Read from serial and process data
```

## 🎯 Features

- **YOUR ML Model**: Uses your actual trained TensorFlow model
- **REAL Hardware Data**: Reads from your actual EmotiBit device
- **Fallback Calculation**: Works even without ML model
- **Real-time Monitoring**: Watches for REAL EmotiBit data changes
- **Error Handling**: Graceful fallbacks for missing files
- **CORS Enabled**: Works with the React dashboard
- **Demo Fallback**: Generates realistic test data when hardware unavailable

## 🔍 Troubleshooting

### "Module not found" errors:
```bash
pip install tensorflow pandas numpy scikit-learn joblib flask flask-cors
```

### CSV file not updating:
- **IMPORTANT**: Make sure your actual EmotiBit hardware is writing to `emotibit_live.csv`
- Check if your EmotiBit device is connected and sending data
- Verify the CSV format matches: `EDA,HR,HRV,TEMP`
- Use the simulate endpoint to test: `POST /api/emotibit/simulate`

### ML model not loading:
- Ensure `stress_model.h5` and `scaler.pkl` are in the python_backend directory
- Check file permissions and TensorFlow installation

## 🔴 REAL vs DEMO Data

- **🔴 REAL**: Python service active = Using YOUR ML model with YOUR EmotiBit hardware
- **🟡 DEMO**: Built-in service = Simulated realistic biometric data
- **🔵 FALLBACK**: No service = Basic simulated data