# EmotiBit Integration Guide

This guide helps you integrate your existing EmotiBit GitHub code with the Destress2Impress dashboard.

## 🔧 Integration Steps

### 1. Identify Your EmotiBit Code Structure

Look through your GitHub repository and identify:

- **Connection Method**: WebSocket, HTTP API, Serial/USB, or Bluetooth
- **Data Format**: How your EmotiBit sends data (JSON, CSV, binary, etc.)
- **Available Metrics**: Which biometric values you're collecting (HR, HRV, EDA, Temperature, etc.)

### 2. Common Integration Patterns

#### Pattern A: WebSocket Connection
If your EmotiBit code uses WebSocket:

```typescript
import { setupEmotiBitIntegration } from './src/utils/emotiBitIntegration';

setupEmotiBitIntegration({
  type: 'websocket',
  url: 'ws://localhost:8080/emotibit', // Your WebSocket URL
  customParser: (data) => ({
    hr: data.heartRate,
    hrv: data.hrv,
    eda: data.skinConductance,
    temp: data.temperature,
    score: 0, // Auto-calculated
    timestamp: Date.now()
  })
});
```

#### Pattern B: HTTP API
If your EmotiBit code exposes an HTTP endpoint:

```typescript
setupEmotiBitIntegration({
  type: 'http',
  url: 'http://localhost:3001/api/biometrics',
  apiKey: 'your-api-key', // If needed
  customParser: (data) => ({
    hr: data.bpm,
    hrv: data.variability,
    eda: data.galvanicResponse,
    temp: data.skinTemp,
    score: 0,
    timestamp: Date.now()
  })
});
```

#### Pattern C: Serial/USB Connection
If your EmotiBit connects via serial:

```typescript
setupEmotiBitIntegration({
  type: 'serial',
  customParser: (serialData) => {
    // Parse your serial data format
    const values = parseYourSerialFormat(serialData);
    return {
      hr: values.heartRate,
      hrv: values.hrv,
      eda: values.eda,
      temp: values.temperature,
      score: 0,
      timestamp: Date.now()
    };
  }
});
```

### 3. File Locations to Check

Look for these common files in your EmotiBit repository:

#### Connection Files:
- `websocket.js/ts` - WebSocket connection logic
- `serial.js/ts` - Serial communication
- `bluetooth.js/ts` - Bluetooth connection
- `api.js/ts` - HTTP API endpoints

#### Data Processing Files:
- `parser.js/ts` - Data parsing logic
- `processor.js/ts` - Signal processing
- `calculator.js/ts` - Metric calculations (HR, HRV, etc.)

#### Configuration Files:
- `config.json` - Device configuration
- `settings.js/ts` - Connection settings
- `.env` - Environment variables

### 4. Integration Checklist

- [ ] **Identify connection method** (WebSocket/HTTP/Serial)
- [ ] **Find data parsing logic** in your existing code
- [ ] **Copy relevant functions** to `src/utils/emotiBitIntegration.ts`
- [ ] **Update data parser** in the integration file
- [ ] **Test connection** with your EmotiBit device
- [ ] **Verify data flow** in the dashboard

### 5. Quick Integration Template

Replace the placeholder functions in `src/utils/emotiBitIntegration.ts`:

```typescript
// Replace these functions with your actual EmotiBit code:

function parseHeartRate(rawData: any): number {
  // YOUR CODE HERE - extract heart rate from your data format
  return rawData.hr || rawData.heartRate || 75;
}

function parseHRV(rawData: any): number {
  // YOUR CODE HERE - extract HRV from your data format
  return rawData.hrv || rawData.variability || 45;
}

function parseEDA(rawData: any): number {
  // YOUR CODE HERE - extract EDA from your data format
  return rawData.eda || rawData.skinConductance || 0.3;
}

function parseTemperature(rawData: any): number {
  // YOUR CODE HERE - extract temperature from your data format
  return rawData.temp || rawData.temperature || 34.5;
}
```

### 6. Testing Your Integration

1. **Start your EmotiBit device/server**
2. **Open the dashboard** at `/dashboard`
3. **Toggle "Use EmotiBit"** to enable real data
4. **Check browser console** for connection logs
5. **Verify data updates** every 5 seconds

### 7. Common Issues & Solutions

#### Issue: "EmotiBit not found"
- Check if your EmotiBit server/device is running
- Verify the connection URL in the integration config
- Check browser console for detailed error messages

#### Issue: "Data not updating"
- Verify your data parser functions return correct format
- Check if your EmotiBit is sending data continuously
- Ensure WebSocket/HTTP endpoints are accessible

#### Issue: "Invalid biometric values"
- Check data ranges (HR: 40-200, HRV: 10-100, EDA: 0.05-1.5)
- Verify unit conversions (μS for EDA, ms for HRV, bpm for HR)
- Add console.log to debug data parsing

### 8. Need Help?

If you're having trouble integrating your specific EmotiBit code:

1. **Share your connection method** (WebSocket/HTTP/Serial)
2. **Show your data format** (example JSON/CSV/binary)
3. **Provide relevant code snippets** from your GitHub repo
4. **Describe any error messages** you're seeing

The integration system is designed to be flexible and work with most EmotiBit implementations!