# EmotiBit Python Service

This service integrates your existing EmotiBit Python code with the Destress2Impress dashboard.

## 🚀 Quick Start

1. **Place your files in this directory:**
   ```
   python_backend/
   ├── stress_model.h5      # Your trained ML model
   ├── scaler.pkl           # Your trained scaler
   ├── emotibit_live.csv    # Live data from EmotiBit (auto-created if missing)
   └── emotibit_service.py  # Service (already created)
   ```

2. **Start the service:**
   ```bash
   cd python_backend
   python start_service.py
   ```

3. **The service will:**
   - ✅ Auto-install required Python packages
   - ✅ Load your ML model and scaler
   - ✅ Monitor `emotibit_live.csv` for new data
   - ✅ Provide API endpoints for the dashboard
   - ✅ Fall back to realistic simulation if files are missing

## 📊 API Endpoints

- `GET /api/emotibit` - Get current biometric data
- `GET /api/emotibit/status` - Get service status
- `POST /api/emotibit/simulate` - Add simulated data to CSV

## 🔧 Integration with Your Code

### Option 1: CSV File Integration
Your existing code should write data to `emotibit_live.csv`:
```csv
EDA,HR,HRV,TEMP
0.25,72,48,34.2
0.30,75,45,34.5
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

## 🎯 Features

- **ML Model Integration**: Uses your trained TensorFlow model
- **Fallback Calculation**: Works even without ML model
- **Real-time Monitoring**: Watches CSV file for changes
- **Error Handling**: Graceful fallbacks for missing files
- **CORS Enabled**: Works with the React dashboard
- **Simulation Mode**: Generates realistic test data

## 🔍 Troubleshooting

### "Module not found" errors:
```bash
pip install tensorflow pandas numpy scikit-learn joblib flask flask-cors
```

### CSV file not updating:
- Check if your EmotiBit code is writing to `emotibit_live.csv`
- Use the simulate endpoint to test: `POST /api/emotibit/simulate`

### ML model not loading:
- Ensure `stress_model.h5` and `scaler.pkl` are in the python_backend directory
- Check file permissions and TensorFlow installation