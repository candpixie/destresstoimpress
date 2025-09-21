// EmotiBit API integration and simulation
// This service handles both real EmotiBit hardware and simulated data

interface BiometricReading {
  hr: number;      // Heart Rate (bpm)
  hrv: number;     // Heart Rate Variability (ms)
  eda: number;     // Electrodermal Activity (μS)
  temp: number;    // Temperature (°C)
  score: number;   // Calculated stress score (0-10)
  timestamp: number;
}

interface EmotiBitConfig {
  deviceId?: string;
  sampleRate?: number;
  bufferSize?: number;
  websocketUrl?: string;
  httpEndpoint?: string;
}

class EmotiBitService {
  private isConnected: boolean = false;
  private isSimulating: boolean = true;
  private websocket: WebSocket | null = null;
  private simulationInterval: NodeJS.Timeout | null = null;
  private currentData: BiometricReading | null = null;
  private config: EmotiBitConfig;
  private dataBuffer: BiometricReading[] = [];
  private maxBufferSize: number = 100;

  constructor(config: EmotiBitConfig = {}) {
    this.config = {
      sampleRate: 25, // Hz
      bufferSize: 1000,
      websocketUrl: 'ws://localhost:8080/emotibit',
      httpEndpoint: 'http://localhost:8080/api/emotibit',
      ...config
    };
    
    this.initializeConnection();
  }

  private async initializeConnection(): Promise<void> {
    try {
      console.log('🔍 Searching for EmotiBit device...');
      
      // Try to connect to real EmotiBit hardware
      const realDeviceConnected = await this.connectToRealDevice();
      
      if (realDeviceConnected) {
        console.log('✅ EmotiBit hardware connected successfully');
        this.isConnected = true;
        this.isSimulating = false;
        this.startRealDataStream();
      } else {
        console.log('⚠️ EmotiBit hardware not found, using simulation mode');
        this.isConnected = false;
        this.isSimulating = true;
        this.startSimulation();
      }
    } catch (error) {
      console.error('❌ Failed to connect to EmotiBit:', error);
      this.fallbackToSimulation();
    }
  }

  private async connectToRealDevice(): Promise<boolean> {
    try {
      // Method 1: Try WebSocket connection
      if (await this.tryWebSocketConnection()) {
        return true;
      }

      // Method 2: Try HTTP polling
      if (await this.tryHttpConnection()) {
        return true;
      }

      // Method 3: Try Serial/USB connection (if available in browser)
      if (await this.trySerialConnection()) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Real device connection failed:', error);
      return false;
    }
  }

  private async tryWebSocketConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const ws = new WebSocket(this.config.websocketUrl!);
        
        const timeout = setTimeout(() => {
          ws.close();
          resolve(false);
        }, 3000); // 3 second timeout

        ws.onopen = () => {
          clearTimeout(timeout);
          this.websocket = ws;
          console.log('📡 WebSocket connection established');
          resolve(true);
        };

        ws.onerror = () => {
          clearTimeout(timeout);
          resolve(false);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.processRealData(data);
          } catch (error) {
            console.error('Error parsing WebSocket data:', error);
          }
        };

      } catch (error) {
        resolve(false);
      }
    });
  }

  private async tryHttpConnection(): Promise<boolean> {
    try {
      const response = await fetch(this.config.httpEndpoint!, {
        method: 'GET',
        timeout: 3000
      } as any);

      if (response.ok) {
        console.log('🌐 HTTP connection established');
        this.startHttpPolling();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  private async trySerialConnection(): Promise<boolean> {
    try {
      // Check if Web Serial API is available
      if ('serial' in navigator) {
        // This would require user permission and device selection
        // For now, we'll just check if the API exists
        console.log('🔌 Serial API available (requires user interaction)');
        return false; // Don't auto-connect to serial for security
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  private startRealDataStream(): void {
    if (this.websocket) {
      // WebSocket is already handling real-time data
      return;
    }
    
    // If using HTTP polling, start the polling interval
    this.startHttpPolling();
  }

  private startHttpPolling(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }

    this.simulationInterval = setInterval(async () => {
      try {
        const response = await fetch(this.config.httpEndpoint!);
        if (response.ok) {
          const data = await response.json();
          this.processRealData(data);
        }
      } catch (error) {
        console.error('HTTP polling error:', error);
        this.fallbackToSimulation();
      }
    }, 1000 / this.config.sampleRate!); // Convert Hz to milliseconds
  }

  private processRealData(rawData: any): void {
    try {
      // Process raw EmotiBit data into our standard format
      const processed: BiometricReading = {
        hr: this.extractHeartRate(rawData),
        hrv: this.extractHRV(rawData),
        eda: this.extractEDA(rawData),
        temp: this.extractTemperature(rawData),
        score: 0, // Will be calculated
        timestamp: Date.now()
      };

      // Calculate stress score
      processed.score = this.calculateStressScore(processed);

      // Add to buffer
      this.addToBuffer(processed);
      this.currentData = processed;

    } catch (error) {
      console.error('Error processing real data:', error);
    }
  }

  private extractHeartRate(rawData: any): number {
    // Extract heart rate from EmotiBit data structure
    // This will depend on your specific EmotiBit data format
    return rawData.hr || rawData.heartRate || rawData.BPM || this.generateSimulatedHR();
  }

  private extractHRV(rawData: any): number {
    // Extract HRV from EmotiBit data structure
    return rawData.hrv || rawData.HRV || rawData.rmssd || this.generateSimulatedHRV();
  }

  private extractEDA(rawData: any): number {
    // Extract EDA from EmotiBit data structure
    return rawData.eda || rawData.EDA || rawData.gsr || rawData.skinConductance || this.generateSimulatedEDA();
  }

  private extractTemperature(rawData: any): number {
    // Extract temperature from EmotiBit data structure
    return rawData.temp || rawData.temperature || rawData.skinTemp || this.generateSimulatedTemp();
  }

  private fallbackToSimulation(): void {
    console.log('🔄 Falling back to simulation mode');
    this.isConnected = false;
    this.isSimulating = true;
    this.startSimulation();
  }

  private startSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }

    this.simulationInterval = setInterval(() => {
      this.currentData = this.generateSimulatedReading();
      this.addToBuffer(this.currentData);
    }, 1000); // Update every second for demo
  }

  private generateSimulatedReading(): BiometricReading {
    const time = Date.now();
    const baseVariation = Math.sin(time / 30000) * 0.3; // Slow 30-second cycle
    const noise = (Math.random() - 0.5) * 0.2; // Random noise
    
    const hr = this.generateSimulatedHR(baseVariation, noise);
    const hrv = this.generateSimulatedHRV(baseVariation, noise);
    const eda = this.generateSimulatedEDA(baseVariation, noise);
    const temp = this.generateSimulatedTemp(baseVariation, noise);
    
    const reading: BiometricReading = {
      hr,
      hrv,
      eda,
      temp,
      score: 0,
      timestamp: time
    };

    reading.score = this.calculateStressScore(reading);
    return reading;
  }

  private generateSimulatedHR(baseVariation: number = 0, noise: number = 0): number {
    // Realistic heart rate: 60-120 bpm
    const baseHR = 75;
    const variation = baseVariation * 20;
    const randomNoise = noise * 15;
    return Math.round(Math.max(50, Math.min(150, baseHR + variation + randomNoise)));
  }

  private generateSimulatedHRV(baseVariation: number = 0, noise: number = 0): number {
    // Realistic HRV: 20-80 ms (higher is generally better)
    const baseHRV = 45;
    const variation = baseVariation * 15;
    const randomNoise = noise * 10;
    return Math.round(Math.max(10, Math.min(100, baseHRV + variation + randomNoise)));
  }

  private generateSimulatedEDA(baseVariation: number = 0, noise: number = 0): number {
    // Realistic EDA: 0.05-1.5 μS (higher indicates more arousal/stress)
    const baseEDA = 0.3;
    const variation = Math.abs(baseVariation) * 0.4;
    const randomNoise = Math.abs(noise) * 0.3;
    return Math.round(Math.max(0.05, Math.min(1.5, baseEDA + variation + randomNoise)) * 100) / 100;
  }

  private generateSimulatedTemp(baseVariation: number = 0, noise: number = 0): number {
    // Realistic skin temperature: 32-37°C
    const baseTemp = 34.5;
    const variation = baseVariation * 1.5;
    const randomNoise = noise * 0.5;
    return Math.round((baseTemp + variation + randomNoise) * 10) / 10;
  }

  private calculateStressScore(reading: BiometricReading): number {
    // Calculate stress score (0-10) based on biometric values
    const hrStress = Math.max(0, Math.min(10, (reading.hr - 60) / 60 * 10));
    const hrvStress = Math.max(0, Math.min(10, (60 - reading.hrv) / 40 * 10));
    const edaStress = Math.max(0, Math.min(10, reading.eda * 6.67)); // Scale 0-1.5 to 0-10
    
    const score = (hrStress + hrvStress + edaStress) / 3;
    return Math.round(Math.max(0, Math.min(10, score)) * 10) / 10;
  }

  private addToBuffer(reading: BiometricReading): void {
    this.dataBuffer.push(reading);
    if (this.dataBuffer.length > this.maxBufferSize) {
      this.dataBuffer.shift(); // Remove oldest reading
    }
  }

  // Public API methods
  public async getReading(useRealData: boolean = true): Promise<BiometricReading> {
    if (useRealData && this.isConnected && !this.isSimulating && this.currentData) {
      return this.currentData;
    }
    
    // Return simulated data or latest available data
    return this.currentData || this.generateSimulatedReading();
  }

  public getBufferedData(count: number = 10): BiometricReading[] {
    return this.dataBuffer.slice(-count);
  }

  public isDeviceConnected(): boolean {
    return this.isConnected && !this.isSimulating;
  }

  public isUsingSimulation(): boolean {
    return this.isSimulating;
  }

  public getConnectionStatus(): {
    connected: boolean;
    simulating: boolean;
    method: string;
    lastUpdate: number | null;
  } {
    return {
      connected: this.isConnected,
      simulating: this.isSimulating,
      method: this.websocket ? 'WebSocket' : 'HTTP',
      lastUpdate: this.currentData?.timestamp || null
    };
  }

  public async reconnect(): Promise<boolean> {
    this.disconnect();
    await this.initializeConnection();
    return this.isConnected;
  }

  public disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }

    this.isConnected = false;
    this.currentData = null;
    this.dataBuffer = [];
  }

  // Utility methods for integration with your GitHub EmotiBit code
  public setCustomDataProcessor(processor: (rawData: any) => BiometricReading): void {
    // Allow custom data processing for your specific EmotiBit implementation
    this.processRealData = processor;
  }

  public setConnectionConfig(config: Partial<EmotiBitConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Singleton instance
const emotiBitService = new EmotiBitService();

export default emotiBitService;
export type { BiometricReading, EmotiBitConfig };