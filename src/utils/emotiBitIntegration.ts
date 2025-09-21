// EmotiBit Integration Utilities
// Helper functions to integrate your GitHub EmotiBit code

import emotiBitService, { BiometricReading, EmotiBitConfig } from '../api/emotibit';

/**
 * Integration helper for your existing EmotiBit GitHub code
 * Replace these functions with your actual EmotiBit implementations
 */

// Example integration patterns for common EmotiBit setups:

/**
 * Pattern 1: WebSocket Integration
 * If your EmotiBit code uses WebSocket connections
 */
export function integrateWebSocketEmotiBit(websocketUrl: string) {
  emotiBitService.setConnectionConfig({
    websocketUrl: websocketUrl
  });

  // Custom data processor for your WebSocket data format
  emotiBitService.setCustomDataProcessor((rawData: any) => {
    // Replace this with your actual data parsing logic
    return {
      hr: parseHeartRate(rawData),
      hrv: parseHRV(rawData),
      eda: parseEDA(rawData),
      temp: parseTemperature(rawData),
      score: 0, // Will be calculated automatically
      timestamp: Date.now()
    };
  });
}

/**
 * Pattern 2: Serial/USB Integration
 * If your EmotiBit code uses serial communication
 */
export async function integrateSerialEmotiBit() {
  if ('serial' in navigator) {
    try {
      // Request serial port access
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 });

      const reader = port.readable.getReader();
      
      // Read data continuously
      const readLoop = async () => {
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            
            // Process serial data
            const textData = new TextDecoder().decode(value);
            const parsedData = parseSerialData(textData);
            
            if (parsedData) {
              // Send to EmotiBit service
              emotiBitService.setCustomDataProcessor(() => parsedData);
            }
          }
        } catch (error) {
          console.error('Serial read error:', error);
        }
      };

      readLoop();
      return true;
    } catch (error) {
      console.error('Serial connection failed:', error);
      return false;
    }
  }
  return false;
}

/**
 * Pattern 3: HTTP API Integration
 * If your EmotiBit code exposes an HTTP API
 */
export function integrateHttpEmotiBit(apiEndpoint: string, apiKey?: string) {
  emotiBitService.setConnectionConfig({
    httpEndpoint: apiEndpoint
  });

  // Custom HTTP data fetcher
  const originalFetch = window.fetch;
  window.fetch = async (url, options = {}) => {
    if (url === apiEndpoint) {
      const headers = {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
        ...((options as any).headers || {})
      };

      return originalFetch(url, { ...options, headers });
    }
    return originalFetch(url, options);
  };
}

/**
 * Data parsing functions - replace with your actual implementations
 */

function parseHeartRate(rawData: any): number {
  // Example parsing - replace with your actual logic
  if (rawData.heartRate) return rawData.heartRate;
  if (rawData.hr) return rawData.hr;
  if (rawData.BPM) return rawData.BPM;
  
  // If you have raw ECG data, you might need to calculate HR
  if (rawData.ecg && Array.isArray(rawData.ecg)) {
    return calculateHeartRateFromECG(rawData.ecg);
  }
  
  return 75; // Default fallback
}

function parseHRV(rawData: any): number {
  // Example parsing - replace with your actual logic
  if (rawData.hrv) return rawData.hrv;
  if (rawData.HRV) return rawData.HRV;
  if (rawData.rmssd) return rawData.rmssd;
  
  // If you have R-R intervals, calculate HRV
  if (rawData.rrIntervals && Array.isArray(rawData.rrIntervals)) {
    return calculateHRVFromRRIntervals(rawData.rrIntervals);
  }
  
  return 45; // Default fallback
}

function parseEDA(rawData: any): number {
  // Example parsing - replace with your actual logic
  if (rawData.eda) return rawData.eda;
  if (rawData.EDA) return rawData.EDA;
  if (rawData.gsr) return rawData.gsr;
  if (rawData.skinConductance) return rawData.skinConductance;
  
  return 0.3; // Default fallback
}

function parseTemperature(rawData: any): number {
  // Example parsing - replace with your actual logic
  if (rawData.temperature) return rawData.temperature;
  if (rawData.temp) return rawData.temp;
  if (rawData.skinTemp) return rawData.skinTemp;
  
  return 34.5; // Default fallback
}

function parseSerialData(serialString: string): BiometricReading | null {
  try {
    // Example serial data parsing - replace with your format
    // Assuming format like: "HR:75,HRV:45,EDA:0.3,TEMP:34.5"
    const values: { [key: string]: number } = {};
    
    serialString.split(',').forEach(pair => {
      const [key, value] = pair.split(':');
      if (key && value) {
        values[key.trim()] = parseFloat(value.trim());
      }
    });

    if (Object.keys(values).length > 0) {
      return {
        hr: values.HR || values.hr || 75,
        hrv: values.HRV || values.hrv || 45,
        eda: values.EDA || values.eda || 0.3,
        temp: values.TEMP || values.temp || 34.5,
        score: 0, // Will be calculated
        timestamp: Date.now()
      };
    }
  } catch (error) {
    console.error('Error parsing serial data:', error);
  }
  
  return null;
}

// Advanced calculation functions (implement based on your needs)

function calculateHeartRateFromECG(ecgData: number[]): number {
  // Implement ECG-based heart rate calculation
  // This is a simplified example - you'll need proper peak detection
  
  if (ecgData.length < 100) return 75; // Need sufficient data
  
  // Simple peak detection (replace with proper algorithm)
  const peaks = [];
  const threshold = Math.max(...ecgData) * 0.6;
  
  for (let i = 1; i < ecgData.length - 1; i++) {
    if (ecgData[i] > threshold && 
        ecgData[i] > ecgData[i-1] && 
        ecgData[i] > ecgData[i+1]) {
      peaks.push(i);
    }
  }
  
  if (peaks.length < 2) return 75;
  
  // Calculate average interval between peaks
  const intervals = [];
  for (let i = 1; i < peaks.length; i++) {
    intervals.push(peaks[i] - peaks[i-1]);
  }
  
  const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
  const sampleRate = 250; // Assume 250 Hz sampling rate
  const heartRate = (60 * sampleRate) / avgInterval;
  
  return Math.round(Math.max(40, Math.min(200, heartRate)));
}

function calculateHRVFromRRIntervals(rrIntervals: number[]): number {
  // Calculate RMSSD (Root Mean Square of Successive Differences)
  if (rrIntervals.length < 2) return 45;
  
  const differences = [];
  for (let i = 1; i < rrIntervals.length; i++) {
    differences.push(Math.pow(rrIntervals[i] - rrIntervals[i-1], 2));
  }
  
  const meanSquaredDiff = differences.reduce((a, b) => a + b) / differences.length;
  const rmssd = Math.sqrt(meanSquaredDiff);
  
  return Math.round(Math.max(10, Math.min(100, rmssd)));
}

/**
 * Quick setup function for common EmotiBit configurations
 */
export function setupEmotiBitIntegration(config: {
  type: 'websocket' | 'serial' | 'http';
  url?: string;
  apiKey?: string;
  customParser?: (data: any) => BiometricReading;
}) {
  switch (config.type) {
    case 'websocket':
      if (config.url) {
        integrateWebSocketEmotiBit(config.url);
      }
      break;
      
    case 'serial':
      integrateSerialEmotiBit();
      break;
      
    case 'http':
      if (config.url) {
        integrateHttpEmotiBit(config.url, config.apiKey);
      }
      break;
  }

  if (config.customParser) {
    emotiBitService.setCustomDataProcessor(config.customParser);
  }
}

export { emotiBitService };