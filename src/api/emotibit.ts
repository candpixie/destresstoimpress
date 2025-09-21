// EmotiBit API simulation and integration
// This would normally connect to actual EmotiBit hardware via WebSocket or HTTP

interface BiometricReading {
  hr: number;      // Heart Rate (bpm)
  hrv: number;     // Heart Rate Variability (ms)
  eda: number;     // Electrodermal Activity (μS)
  score: number;   // Calculated stress score (0-10)
  timestamp: number;
}

class EmotiBitService {
  private isConnected: boolean = false;
  private simulationInterval: NodeJS.Timeout | null = null;
  private currentData: BiometricReading | null = null;

  constructor() {
    this.initializeConnection();
  }

  private async initializeConnection(): Promise<void> {
    try {
      // In a real implementation, this would attempt to connect to EmotiBit hardware
      // For now, we'll simulate the connection attempt
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, randomly determine if "connected"
      this.isConnected = Math.random() > 0.7; // 30% chance of connection
      
      if (this.isConnected) {
        console.log('EmotiBit connected successfully');
        this.startDataStream();
      } else {
        console.log('EmotiBit not found, using simulation mode');
      }
    } catch (error) {
      console.error('Failed to connect to EmotiBit:', error);
      this.isConnected = false;
    }
  }

  private startDataStream(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }

    this.simulationInterval = setInterval(() => {
      this.currentData = this.generateReading();
    }, 1000); // Update every second
  }

  private generateReading(): BiometricReading {
    // Generate realistic biometric data
    const time = Date.now();
    const baseVariation = Math.sin(time / 10000) * 0.3; // Slow variation
    const noise = (Math.random() - 0.5) * 0.2; // Random noise
    
    // Heart Rate: 60-120 bpm with natural variation
    const hr = 75 + baseVariation * 20 + noise * 15;
    
    // HRV: 20-80 ms (higher is generally better)
    const hrv = 45 + baseVariation * 15 + noise * 10;
    
    // EDA: 0.1-1.0 μS (higher indicates more arousal/stress)
    const eda = 0.3 + Math.abs(baseVariation) * 0.4 + Math.abs(noise) * 0.3;
    
    // Calculate stress score (0-10) based on biometric values
    const hrStress = Math.max(0, Math.min(10, (hr - 60) / 60 * 10));
    const hrvStress = Math.max(0, Math.min(10, (60 - hrv) / 40 * 10));
    const edaStress = Math.max(0, Math.min(10, eda * 10));
    
    const score = (hrStress + hrvStress + edaStress) / 3;
    
    return {
      hr: Math.round(Math.max(50, Math.min(150, hr))),
      hrv: Math.round(Math.max(10, Math.min(100, hrv))),
      eda: Math.round(Math.max(0.05, Math.min(1.5, eda)) * 100) / 100,
      score: Math.round(Math.max(0, Math.min(10, score)) * 10) / 10,
      timestamp: time
    };
  }

  public async getReading(useRealData: boolean = false): Promise<BiometricReading> {
    if (useRealData && this.isConnected && this.currentData) {
      return this.currentData;
    }
    
    // Return simulated data
    return this.generateReading();
  }

  public isDeviceConnected(): boolean {
    return this.isConnected;
  }

  public disconnect(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    this.isConnected = false;
    this.currentData = null;
  }
}

// Singleton instance
const emotiBitService = new EmotiBitService();

export default emotiBitService;