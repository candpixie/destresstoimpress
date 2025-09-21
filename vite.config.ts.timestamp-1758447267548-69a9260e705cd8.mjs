var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/api/emotibit.ts
var emotibit_exports = {};
__export(emotibit_exports, {
  default: () => emotibit_default
});
var EmotiBitService, emotiBitService, emotibit_default;
var init_emotibit = __esm({
  "src/api/emotibit.ts"() {
    EmotiBitService = class {
      isConnected = false;
      isSimulating = true;
      websocket = null;
      simulationInterval = null;
      currentData = null;
      config;
      dataBuffer = [];
      maxBufferSize = 100;
      constructor(config = {}) {
        this.config = {
          sampleRate: 25,
          // Hz
          bufferSize: 1e3,
          websocketUrl: "ws://localhost:8080/emotibit",
          httpEndpoint: "http://localhost:8080/api/emotibit",
          ...config
        };
        this.initializeConnection();
      }
      async initializeConnection() {
        try {
          console.log("\u{1F50D} Searching for EmotiBit device...");
          const realDeviceConnected = await this.connectToRealDevice();
          if (realDeviceConnected) {
            console.log("\u2705 EmotiBit hardware connected successfully");
            this.isConnected = true;
            this.isSimulating = false;
            this.startRealDataStream();
          } else {
            console.log("\u26A0\uFE0F EmotiBit hardware not found, using simulation mode");
            this.isConnected = false;
            this.isSimulating = true;
            this.startSimulation();
          }
        } catch (error) {
          console.error("\u274C Failed to connect to EmotiBit:", error);
          this.fallbackToSimulation();
        }
      }
      async connectToRealDevice() {
        try {
          if (await this.tryWebSocketConnection()) {
            return true;
          }
          if (await this.tryHttpConnection()) {
            return true;
          }
          if (await this.trySerialConnection()) {
            return true;
          }
          return false;
        } catch (error) {
          console.error("Real device connection failed:", error);
          return false;
        }
      }
      async tryWebSocketConnection() {
        return new Promise((resolve) => {
          try {
            const ws = new WebSocket(this.config.websocketUrl);
            const timeout = setTimeout(() => {
              ws.close();
              resolve(false);
            }, 3e3);
            ws.onopen = () => {
              clearTimeout(timeout);
              this.websocket = ws;
              console.log("\u{1F4E1} WebSocket connection established");
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
                console.error("Error parsing WebSocket data:", error);
              }
            };
          } catch (error) {
            resolve(false);
          }
        });
      }
      async tryHttpConnection() {
        try {
          const response = await fetch(this.config.httpEndpoint, {
            method: "GET",
            timeout: 3e3
          });
          if (response.ok) {
            console.log("\u{1F310} HTTP connection established");
            this.startHttpPolling();
            return true;
          }
          return false;
        } catch (error) {
          return false;
        }
      }
      async trySerialConnection() {
        try {
          if ("serial" in navigator) {
            console.log("\u{1F50C} Serial API available (requires user interaction)");
            return false;
          }
          return false;
        } catch (error) {
          return false;
        }
      }
      startRealDataStream() {
        if (this.websocket) {
          return;
        }
        this.startHttpPolling();
      }
      startHttpPolling() {
        if (this.simulationInterval) {
          clearInterval(this.simulationInterval);
        }
        this.simulationInterval = setInterval(async () => {
          try {
            const response = await fetch(this.config.httpEndpoint);
            if (response.ok) {
              const data = await response.json();
              this.processRealData(data);
            }
          } catch (error) {
            console.error("HTTP polling error:", error);
            this.fallbackToSimulation();
          }
        }, 1e3 / this.config.sampleRate);
      }
      processRealData(rawData) {
        try {
          const processed = {
            hr: this.extractHeartRate(rawData),
            hrv: this.extractHRV(rawData),
            eda: this.extractEDA(rawData),
            temp: this.extractTemperature(rawData),
            score: 0,
            // Will be calculated
            timestamp: Date.now()
          };
          processed.score = this.calculateStressScore(processed);
          this.addToBuffer(processed);
          this.currentData = processed;
        } catch (error) {
          console.error("Error processing real data:", error);
        }
      }
      extractHeartRate(rawData) {
        return rawData.hr || rawData.heartRate || rawData.BPM || this.generateSimulatedHR();
      }
      extractHRV(rawData) {
        return rawData.hrv || rawData.HRV || rawData.rmssd || this.generateSimulatedHRV();
      }
      extractEDA(rawData) {
        return rawData.eda || rawData.EDA || rawData.gsr || rawData.skinConductance || this.generateSimulatedEDA();
      }
      extractTemperature(rawData) {
        return rawData.temp || rawData.temperature || rawData.skinTemp || this.generateSimulatedTemp();
      }
      fallbackToSimulation() {
        console.log("\u{1F504} Falling back to simulation mode");
        this.isConnected = false;
        this.isSimulating = true;
        this.startSimulation();
      }
      startSimulation() {
        if (this.simulationInterval) {
          clearInterval(this.simulationInterval);
        }
        this.simulationInterval = setInterval(() => {
          this.currentData = this.generateSimulatedReading();
          this.addToBuffer(this.currentData);
        }, 1e3);
      }
      generateSimulatedReading() {
        const time = Date.now();
        const baseVariation = Math.sin(time / 3e4) * 0.3;
        const noise = (Math.random() - 0.5) * 0.2;
        const hr = this.generateSimulatedHR(baseVariation, noise);
        const hrv = this.generateSimulatedHRV(baseVariation, noise);
        const eda = this.generateSimulatedEDA(baseVariation, noise);
        const temp = this.generateSimulatedTemp(baseVariation, noise);
        const reading = {
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
      generateSimulatedHR(baseVariation = 0, noise = 0) {
        const baseHR = 75;
        const variation = baseVariation * 20;
        const randomNoise = noise * 15;
        return Math.round(Math.max(50, Math.min(150, baseHR + variation + randomNoise)));
      }
      generateSimulatedHRV(baseVariation = 0, noise = 0) {
        const baseHRV = 45;
        const variation = baseVariation * 15;
        const randomNoise = noise * 10;
        return Math.round(Math.max(10, Math.min(100, baseHRV + variation + randomNoise)));
      }
      generateSimulatedEDA(baseVariation = 0, noise = 0) {
        const baseEDA = 0.3;
        const variation = Math.abs(baseVariation) * 0.4;
        const randomNoise = Math.abs(noise) * 0.3;
        return Math.round(Math.max(0.05, Math.min(1.5, baseEDA + variation + randomNoise)) * 100) / 100;
      }
      generateSimulatedTemp(baseVariation = 0, noise = 0) {
        const baseTemp = 34.5;
        const variation = baseVariation * 1.5;
        const randomNoise = noise * 0.5;
        return Math.round((baseTemp + variation + randomNoise) * 10) / 10;
      }
      calculateStressScore(reading) {
        const hrStress = Math.max(0, Math.min(10, (reading.hr - 60) / 60 * 10));
        const hrvStress = Math.max(0, Math.min(10, (60 - reading.hrv) / 40 * 10));
        const edaStress = Math.max(0, Math.min(10, reading.eda * 6.67));
        const score = (hrStress + hrvStress + edaStress) / 3;
        return Math.round(Math.max(0, Math.min(10, score)) * 10) / 10;
      }
      addToBuffer(reading) {
        this.dataBuffer.push(reading);
        if (this.dataBuffer.length > this.maxBufferSize) {
          this.dataBuffer.shift();
        }
      }
      // Public API methods
      async getReading(useRealData = true) {
        if (useRealData && this.isConnected && !this.isSimulating && this.currentData) {
          return this.currentData;
        }
        return this.currentData || this.generateSimulatedReading();
      }
      getBufferedData(count = 10) {
        return this.dataBuffer.slice(-count);
      }
      isDeviceConnected() {
        return this.isConnected && !this.isSimulating;
      }
      isUsingSimulation() {
        return this.isSimulating;
      }
      getConnectionStatus() {
        return {
          connected: this.isConnected,
          simulating: this.isSimulating,
          method: this.websocket ? "WebSocket" : "HTTP",
          lastUpdate: this.currentData?.timestamp || null
        };
      }
      async reconnect() {
        this.disconnect();
        await this.initializeConnection();
        return this.isConnected;
      }
      disconnect() {
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
      setCustomDataProcessor(processor) {
        this.processRealData = processor;
      }
      setConnectionConfig(config) {
        this.config = { ...this.config, ...config };
      }
    };
    emotiBitService = new EmotiBitService();
    emotibit_default = emotiBitService;
  }
});

// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5173",
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            if (req.url?.startsWith("/api/emotibit")) {
              let body = "";
              req.on("data", (chunk) => {
                body += chunk.toString();
              });
              req.on("end", async () => {
                try {
                  const { default: emotiBitService2 } = await Promise.resolve().then(() => (init_emotibit(), emotibit_exports));
                  const requestData = body ? JSON.parse(body) : {};
                  const useEmotiBit = requestData.useEmotiBit || false;
                  const reading = await emotiBitService2.getReading(useEmotiBit);
                  res.writeHead(200, { "Content-Type": "application/json" });
                  res.end(JSON.stringify(reading));
                } catch (error) {
                  res.writeHead(500, { "Content-Type": "application/json" });
                  res.end(JSON.stringify({ error: "Failed to get biometric data" }));
                }
              });
              proxyReq.destroy();
            }
          });
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ["lucide-react"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2FwaS9lbW90aWJpdC50cyIsICJ2aXRlLmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL2FwaVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvYXBpL2Vtb3RpYml0LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvc3JjL2FwaS9lbW90aWJpdC50c1wiOy8vIEVtb3RpQml0IEFQSSBpbnRlZ3JhdGlvbiBhbmQgc2ltdWxhdGlvblxuLy8gVGhpcyBzZXJ2aWNlIGhhbmRsZXMgYm90aCByZWFsIEVtb3RpQml0IGhhcmR3YXJlIGFuZCBzaW11bGF0ZWQgZGF0YVxuXG5pbnRlcmZhY2UgQmlvbWV0cmljUmVhZGluZyB7XG4gIGhyOiBudW1iZXI7ICAgICAgLy8gSGVhcnQgUmF0ZSAoYnBtKVxuICBocnY6IG51bWJlcjsgICAgIC8vIEhlYXJ0IFJhdGUgVmFyaWFiaWxpdHkgKG1zKVxuICBlZGE6IG51bWJlcjsgICAgIC8vIEVsZWN0cm9kZXJtYWwgQWN0aXZpdHkgKFx1MDNCQ1MpXG4gIHRlbXA6IG51bWJlcjsgICAgLy8gVGVtcGVyYXR1cmUgKFx1MDBCMEMpXG4gIHNjb3JlOiBudW1iZXI7ICAgLy8gQ2FsY3VsYXRlZCBzdHJlc3Mgc2NvcmUgKDAtMTApXG4gIHRpbWVzdGFtcDogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgRW1vdGlCaXRDb25maWcge1xuICBkZXZpY2VJZD86IHN0cmluZztcbiAgc2FtcGxlUmF0ZT86IG51bWJlcjtcbiAgYnVmZmVyU2l6ZT86IG51bWJlcjtcbiAgd2Vic29ja2V0VXJsPzogc3RyaW5nO1xuICBodHRwRW5kcG9pbnQ/OiBzdHJpbmc7XG59XG5cbmNsYXNzIEVtb3RpQml0U2VydmljZSB7XG4gIHByaXZhdGUgaXNDb25uZWN0ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBpc1NpbXVsYXRpbmc6IGJvb2xlYW4gPSB0cnVlO1xuICBwcml2YXRlIHdlYnNvY2tldDogV2ViU29ja2V0IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgc2ltdWxhdGlvbkludGVydmFsOiBOb2RlSlMuVGltZW91dCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGN1cnJlbnREYXRhOiBCaW9tZXRyaWNSZWFkaW5nIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgY29uZmlnOiBFbW90aUJpdENvbmZpZztcbiAgcHJpdmF0ZSBkYXRhQnVmZmVyOiBCaW9tZXRyaWNSZWFkaW5nW10gPSBbXTtcbiAgcHJpdmF0ZSBtYXhCdWZmZXJTaXplOiBudW1iZXIgPSAxMDA7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBFbW90aUJpdENvbmZpZyA9IHt9KSB7XG4gICAgdGhpcy5jb25maWcgPSB7XG4gICAgICBzYW1wbGVSYXRlOiAyNSwgLy8gSHpcbiAgICAgIGJ1ZmZlclNpemU6IDEwMDAsXG4gICAgICB3ZWJzb2NrZXRVcmw6ICd3czovL2xvY2FsaG9zdDo4MDgwL2Vtb3RpYml0JyxcbiAgICAgIGh0dHBFbmRwb2ludDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODA4MC9hcGkvZW1vdGliaXQnLFxuICAgICAgLi4uY29uZmlnXG4gICAgfTtcbiAgICBcbiAgICB0aGlzLmluaXRpYWxpemVDb25uZWN0aW9uKCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGluaXRpYWxpemVDb25uZWN0aW9uKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERDBEIFNlYXJjaGluZyBmb3IgRW1vdGlCaXQgZGV2aWNlLi4uJyk7XG4gICAgICBcbiAgICAgIC8vIFRyeSB0byBjb25uZWN0IHRvIHJlYWwgRW1vdGlCaXQgaGFyZHdhcmVcbiAgICAgIGNvbnN0IHJlYWxEZXZpY2VDb25uZWN0ZWQgPSBhd2FpdCB0aGlzLmNvbm5lY3RUb1JlYWxEZXZpY2UoKTtcbiAgICAgIFxuICAgICAgaWYgKHJlYWxEZXZpY2VDb25uZWN0ZWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1x1MjcwNSBFbW90aUJpdCBoYXJkd2FyZSBjb25uZWN0ZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgICAgIHRoaXMuaXNDb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmlzU2ltdWxhdGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnN0YXJ0UmVhbERhdGFTdHJlYW0oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdcdTI2QTBcdUZFMEYgRW1vdGlCaXQgaGFyZHdhcmUgbm90IGZvdW5kLCB1c2luZyBzaW11bGF0aW9uIG1vZGUnKTtcbiAgICAgICAgdGhpcy5pc0Nvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzU2ltdWxhdGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuc3RhcnRTaW11bGF0aW9uKCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBGYWlsZWQgdG8gY29ubmVjdCB0byBFbW90aUJpdDonLCBlcnJvcik7XG4gICAgICB0aGlzLmZhbGxiYWNrVG9TaW11bGF0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBjb25uZWN0VG9SZWFsRGV2aWNlKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHRyeSB7XG4gICAgICAvLyBNZXRob2QgMTogVHJ5IFdlYlNvY2tldCBjb25uZWN0aW9uXG4gICAgICBpZiAoYXdhaXQgdGhpcy50cnlXZWJTb2NrZXRDb25uZWN0aW9uKCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8vIE1ldGhvZCAyOiBUcnkgSFRUUCBwb2xsaW5nXG4gICAgICBpZiAoYXdhaXQgdGhpcy50cnlIdHRwQ29ubmVjdGlvbigpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBNZXRob2QgMzogVHJ5IFNlcmlhbC9VU0IgY29ubmVjdGlvbiAoaWYgYXZhaWxhYmxlIGluIGJyb3dzZXIpXG4gICAgICBpZiAoYXdhaXQgdGhpcy50cnlTZXJpYWxDb25uZWN0aW9uKCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignUmVhbCBkZXZpY2UgY29ubmVjdGlvbiBmYWlsZWQ6JywgZXJyb3IpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgdHJ5V2ViU29ja2V0Q29ubmVjdGlvbigpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHdzID0gbmV3IFdlYlNvY2tldCh0aGlzLmNvbmZpZy53ZWJzb2NrZXRVcmwhKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB3cy5jbG9zZSgpO1xuICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICB9LCAzMDAwKTsgLy8gMyBzZWNvbmQgdGltZW91dFxuXG4gICAgICAgIHdzLm9ub3BlbiA9ICgpID0+IHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgICAgdGhpcy53ZWJzb2NrZXQgPSB3cztcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0UxIFdlYlNvY2tldCBjb25uZWN0aW9uIGVzdGFibGlzaGVkJyk7XG4gICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgfTtcblxuICAgICAgICB3cy5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgfTtcblxuICAgICAgICB3cy5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NSZWFsRGF0YShkYXRhKTtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgcGFyc2luZyBXZWJTb2NrZXQgZGF0YTonLCBlcnJvcik7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgdHJ5SHR0cENvbm5lY3Rpb24oKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godGhpcy5jb25maWcuaHR0cEVuZHBvaW50ISwge1xuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICB0aW1lb3V0OiAzMDAwXG4gICAgICB9IGFzIGFueSk7XG5cbiAgICAgIGlmIChyZXNwb25zZS5vaykge1xuICAgICAgICBjb25zb2xlLmxvZygnXHVEODNDXHVERjEwIEhUVFAgY29ubmVjdGlvbiBlc3RhYmxpc2hlZCcpO1xuICAgICAgICB0aGlzLnN0YXJ0SHR0cFBvbGxpbmcoKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHRyeVNlcmlhbENvbm5lY3Rpb24oKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIENoZWNrIGlmIFdlYiBTZXJpYWwgQVBJIGlzIGF2YWlsYWJsZVxuICAgICAgaWYgKCdzZXJpYWwnIGluIG5hdmlnYXRvcikge1xuICAgICAgICAvLyBUaGlzIHdvdWxkIHJlcXVpcmUgdXNlciBwZXJtaXNzaW9uIGFuZCBkZXZpY2Ugc2VsZWN0aW9uXG4gICAgICAgIC8vIEZvciBub3csIHdlJ2xsIGp1c3QgY2hlY2sgaWYgdGhlIEFQSSBleGlzdHNcbiAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQwQyBTZXJpYWwgQVBJIGF2YWlsYWJsZSAocmVxdWlyZXMgdXNlciBpbnRlcmFjdGlvbiknKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBEb24ndCBhdXRvLWNvbm5lY3QgdG8gc2VyaWFsIGZvciBzZWN1cml0eVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzdGFydFJlYWxEYXRhU3RyZWFtKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLndlYnNvY2tldCkge1xuICAgICAgLy8gV2ViU29ja2V0IGlzIGFscmVhZHkgaGFuZGxpbmcgcmVhbC10aW1lIGRhdGFcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgXG4gICAgLy8gSWYgdXNpbmcgSFRUUCBwb2xsaW5nLCBzdGFydCB0aGUgcG9sbGluZyBpbnRlcnZhbFxuICAgIHRoaXMuc3RhcnRIdHRwUG9sbGluZygpO1xuICB9XG5cbiAgcHJpdmF0ZSBzdGFydEh0dHBQb2xsaW5nKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnNpbXVsYXRpb25JbnRlcnZhbCkge1xuICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnNpbXVsYXRpb25JbnRlcnZhbCk7XG4gICAgfVxuXG4gICAgdGhpcy5zaW11bGF0aW9uSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHRoaXMuY29uZmlnLmh0dHBFbmRwb2ludCEpO1xuICAgICAgICBpZiAocmVzcG9uc2Uub2spIHtcbiAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgIHRoaXMucHJvY2Vzc1JlYWxEYXRhKGRhdGEpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdIVFRQIHBvbGxpbmcgZXJyb3I6JywgZXJyb3IpO1xuICAgICAgICB0aGlzLmZhbGxiYWNrVG9TaW11bGF0aW9uKCk7XG4gICAgICB9XG4gICAgfSwgMTAwMCAvIHRoaXMuY29uZmlnLnNhbXBsZVJhdGUhKTsgLy8gQ29udmVydCBIeiB0byBtaWxsaXNlY29uZHNcbiAgfVxuXG4gIHByaXZhdGUgcHJvY2Vzc1JlYWxEYXRhKHJhd0RhdGE6IGFueSk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICAvLyBQcm9jZXNzIHJhdyBFbW90aUJpdCBkYXRhIGludG8gb3VyIHN0YW5kYXJkIGZvcm1hdFxuICAgICAgY29uc3QgcHJvY2Vzc2VkOiBCaW9tZXRyaWNSZWFkaW5nID0ge1xuICAgICAgICBocjogdGhpcy5leHRyYWN0SGVhcnRSYXRlKHJhd0RhdGEpLFxuICAgICAgICBocnY6IHRoaXMuZXh0cmFjdEhSVihyYXdEYXRhKSxcbiAgICAgICAgZWRhOiB0aGlzLmV4dHJhY3RFREEocmF3RGF0YSksXG4gICAgICAgIHRlbXA6IHRoaXMuZXh0cmFjdFRlbXBlcmF0dXJlKHJhd0RhdGEpLFxuICAgICAgICBzY29yZTogMCwgLy8gV2lsbCBiZSBjYWxjdWxhdGVkXG4gICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgICAgfTtcblxuICAgICAgLy8gQ2FsY3VsYXRlIHN0cmVzcyBzY29yZVxuICAgICAgcHJvY2Vzc2VkLnNjb3JlID0gdGhpcy5jYWxjdWxhdGVTdHJlc3NTY29yZShwcm9jZXNzZWQpO1xuXG4gICAgICAvLyBBZGQgdG8gYnVmZmVyXG4gICAgICB0aGlzLmFkZFRvQnVmZmVyKHByb2Nlc3NlZCk7XG4gICAgICB0aGlzLmN1cnJlbnREYXRhID0gcHJvY2Vzc2VkO1xuXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHByb2Nlc3NpbmcgcmVhbCBkYXRhOicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGV4dHJhY3RIZWFydFJhdGUocmF3RGF0YTogYW55KTogbnVtYmVyIHtcbiAgICAvLyBFeHRyYWN0IGhlYXJ0IHJhdGUgZnJvbSBFbW90aUJpdCBkYXRhIHN0cnVjdHVyZVxuICAgIC8vIFRoaXMgd2lsbCBkZXBlbmQgb24geW91ciBzcGVjaWZpYyBFbW90aUJpdCBkYXRhIGZvcm1hdFxuICAgIHJldHVybiByYXdEYXRhLmhyIHx8IHJhd0RhdGEuaGVhcnRSYXRlIHx8IHJhd0RhdGEuQlBNIHx8IHRoaXMuZ2VuZXJhdGVTaW11bGF0ZWRIUigpO1xuICB9XG5cbiAgcHJpdmF0ZSBleHRyYWN0SFJWKHJhd0RhdGE6IGFueSk6IG51bWJlciB7XG4gICAgLy8gRXh0cmFjdCBIUlYgZnJvbSBFbW90aUJpdCBkYXRhIHN0cnVjdHVyZVxuICAgIHJldHVybiByYXdEYXRhLmhydiB8fCByYXdEYXRhLkhSViB8fCByYXdEYXRhLnJtc3NkIHx8IHRoaXMuZ2VuZXJhdGVTaW11bGF0ZWRIUlYoKTtcbiAgfVxuXG4gIHByaXZhdGUgZXh0cmFjdEVEQShyYXdEYXRhOiBhbnkpOiBudW1iZXIge1xuICAgIC8vIEV4dHJhY3QgRURBIGZyb20gRW1vdGlCaXQgZGF0YSBzdHJ1Y3R1cmVcbiAgICByZXR1cm4gcmF3RGF0YS5lZGEgfHwgcmF3RGF0YS5FREEgfHwgcmF3RGF0YS5nc3IgfHwgcmF3RGF0YS5za2luQ29uZHVjdGFuY2UgfHwgdGhpcy5nZW5lcmF0ZVNpbXVsYXRlZEVEQSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBleHRyYWN0VGVtcGVyYXR1cmUocmF3RGF0YTogYW55KTogbnVtYmVyIHtcbiAgICAvLyBFeHRyYWN0IHRlbXBlcmF0dXJlIGZyb20gRW1vdGlCaXQgZGF0YSBzdHJ1Y3R1cmVcbiAgICByZXR1cm4gcmF3RGF0YS50ZW1wIHx8IHJhd0RhdGEudGVtcGVyYXR1cmUgfHwgcmF3RGF0YS5za2luVGVtcCB8fCB0aGlzLmdlbmVyYXRlU2ltdWxhdGVkVGVtcCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBmYWxsYmFja1RvU2ltdWxhdGlvbigpOiB2b2lkIHtcbiAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERDA0IEZhbGxpbmcgYmFjayB0byBzaW11bGF0aW9uIG1vZGUnKTtcbiAgICB0aGlzLmlzQ29ubmVjdGVkID0gZmFsc2U7XG4gICAgdGhpcy5pc1NpbXVsYXRpbmcgPSB0cnVlO1xuICAgIHRoaXMuc3RhcnRTaW11bGF0aW9uKCk7XG4gIH1cblxuICBwcml2YXRlIHN0YXJ0U2ltdWxhdGlvbigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zaW11bGF0aW9uSW50ZXJ2YWwpIHtcbiAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5zaW11bGF0aW9uSW50ZXJ2YWwpO1xuICAgIH1cblxuICAgIHRoaXMuc2ltdWxhdGlvbkludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgdGhpcy5jdXJyZW50RGF0YSA9IHRoaXMuZ2VuZXJhdGVTaW11bGF0ZWRSZWFkaW5nKCk7XG4gICAgICB0aGlzLmFkZFRvQnVmZmVyKHRoaXMuY3VycmVudERhdGEpO1xuICAgIH0sIDEwMDApOyAvLyBVcGRhdGUgZXZlcnkgc2Vjb25kIGZvciBkZW1vXG4gIH1cblxuICBwcml2YXRlIGdlbmVyYXRlU2ltdWxhdGVkUmVhZGluZygpOiBCaW9tZXRyaWNSZWFkaW5nIHtcbiAgICBjb25zdCB0aW1lID0gRGF0ZS5ub3coKTtcbiAgICBjb25zdCBiYXNlVmFyaWF0aW9uID0gTWF0aC5zaW4odGltZSAvIDMwMDAwKSAqIDAuMzsgLy8gU2xvdyAzMC1zZWNvbmQgY3ljbGVcbiAgICBjb25zdCBub2lzZSA9IChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIDAuMjsgLy8gUmFuZG9tIG5vaXNlXG4gICAgXG4gICAgY29uc3QgaHIgPSB0aGlzLmdlbmVyYXRlU2ltdWxhdGVkSFIoYmFzZVZhcmlhdGlvbiwgbm9pc2UpO1xuICAgIGNvbnN0IGhydiA9IHRoaXMuZ2VuZXJhdGVTaW11bGF0ZWRIUlYoYmFzZVZhcmlhdGlvbiwgbm9pc2UpO1xuICAgIGNvbnN0IGVkYSA9IHRoaXMuZ2VuZXJhdGVTaW11bGF0ZWRFREEoYmFzZVZhcmlhdGlvbiwgbm9pc2UpO1xuICAgIGNvbnN0IHRlbXAgPSB0aGlzLmdlbmVyYXRlU2ltdWxhdGVkVGVtcChiYXNlVmFyaWF0aW9uLCBub2lzZSk7XG4gICAgXG4gICAgY29uc3QgcmVhZGluZzogQmlvbWV0cmljUmVhZGluZyA9IHtcbiAgICAgIGhyLFxuICAgICAgaHJ2LFxuICAgICAgZWRhLFxuICAgICAgdGVtcCxcbiAgICAgIHNjb3JlOiAwLFxuICAgICAgdGltZXN0YW1wOiB0aW1lXG4gICAgfTtcblxuICAgIHJlYWRpbmcuc2NvcmUgPSB0aGlzLmNhbGN1bGF0ZVN0cmVzc1Njb3JlKHJlYWRpbmcpO1xuICAgIHJldHVybiByZWFkaW5nO1xuICB9XG5cbiAgcHJpdmF0ZSBnZW5lcmF0ZVNpbXVsYXRlZEhSKGJhc2VWYXJpYXRpb246IG51bWJlciA9IDAsIG5vaXNlOiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICAvLyBSZWFsaXN0aWMgaGVhcnQgcmF0ZTogNjAtMTIwIGJwbVxuICAgIGNvbnN0IGJhc2VIUiA9IDc1O1xuICAgIGNvbnN0IHZhcmlhdGlvbiA9IGJhc2VWYXJpYXRpb24gKiAyMDtcbiAgICBjb25zdCByYW5kb21Ob2lzZSA9IG5vaXNlICogMTU7XG4gICAgcmV0dXJuIE1hdGgucm91bmQoTWF0aC5tYXgoNTAsIE1hdGgubWluKDE1MCwgYmFzZUhSICsgdmFyaWF0aW9uICsgcmFuZG9tTm9pc2UpKSk7XG4gIH1cblxuICBwcml2YXRlIGdlbmVyYXRlU2ltdWxhdGVkSFJWKGJhc2VWYXJpYXRpb246IG51bWJlciA9IDAsIG5vaXNlOiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICAvLyBSZWFsaXN0aWMgSFJWOiAyMC04MCBtcyAoaGlnaGVyIGlzIGdlbmVyYWxseSBiZXR0ZXIpXG4gICAgY29uc3QgYmFzZUhSViA9IDQ1O1xuICAgIGNvbnN0IHZhcmlhdGlvbiA9IGJhc2VWYXJpYXRpb24gKiAxNTtcbiAgICBjb25zdCByYW5kb21Ob2lzZSA9IG5vaXNlICogMTA7XG4gICAgcmV0dXJuIE1hdGgucm91bmQoTWF0aC5tYXgoMTAsIE1hdGgubWluKDEwMCwgYmFzZUhSViArIHZhcmlhdGlvbiArIHJhbmRvbU5vaXNlKSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZW5lcmF0ZVNpbXVsYXRlZEVEQShiYXNlVmFyaWF0aW9uOiBudW1iZXIgPSAwLCBub2lzZTogbnVtYmVyID0gMCk6IG51bWJlciB7XG4gICAgLy8gUmVhbGlzdGljIEVEQTogMC4wNS0xLjUgXHUwM0JDUyAoaGlnaGVyIGluZGljYXRlcyBtb3JlIGFyb3VzYWwvc3RyZXNzKVxuICAgIGNvbnN0IGJhc2VFREEgPSAwLjM7XG4gICAgY29uc3QgdmFyaWF0aW9uID0gTWF0aC5hYnMoYmFzZVZhcmlhdGlvbikgKiAwLjQ7XG4gICAgY29uc3QgcmFuZG9tTm9pc2UgPSBNYXRoLmFicyhub2lzZSkgKiAwLjM7XG4gICAgcmV0dXJuIE1hdGgucm91bmQoTWF0aC5tYXgoMC4wNSwgTWF0aC5taW4oMS41LCBiYXNlRURBICsgdmFyaWF0aW9uICsgcmFuZG9tTm9pc2UpKSAqIDEwMCkgLyAxMDA7XG4gIH1cblxuICBwcml2YXRlIGdlbmVyYXRlU2ltdWxhdGVkVGVtcChiYXNlVmFyaWF0aW9uOiBudW1iZXIgPSAwLCBub2lzZTogbnVtYmVyID0gMCk6IG51bWJlciB7XG4gICAgLy8gUmVhbGlzdGljIHNraW4gdGVtcGVyYXR1cmU6IDMyLTM3XHUwMEIwQ1xuICAgIGNvbnN0IGJhc2VUZW1wID0gMzQuNTtcbiAgICBjb25zdCB2YXJpYXRpb24gPSBiYXNlVmFyaWF0aW9uICogMS41O1xuICAgIGNvbnN0IHJhbmRvbU5vaXNlID0gbm9pc2UgKiAwLjU7XG4gICAgcmV0dXJuIE1hdGgucm91bmQoKGJhc2VUZW1wICsgdmFyaWF0aW9uICsgcmFuZG9tTm9pc2UpICogMTApIC8gMTA7XG4gIH1cblxuICBwcml2YXRlIGNhbGN1bGF0ZVN0cmVzc1Njb3JlKHJlYWRpbmc6IEJpb21ldHJpY1JlYWRpbmcpOiBudW1iZXIge1xuICAgIC8vIENhbGN1bGF0ZSBzdHJlc3Mgc2NvcmUgKDAtMTApIGJhc2VkIG9uIGJpb21ldHJpYyB2YWx1ZXNcbiAgICBjb25zdCBoclN0cmVzcyA9IE1hdGgubWF4KDAsIE1hdGgubWluKDEwLCAocmVhZGluZy5ociAtIDYwKSAvIDYwICogMTApKTtcbiAgICBjb25zdCBocnZTdHJlc3MgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxMCwgKDYwIC0gcmVhZGluZy5ocnYpIC8gNDAgKiAxMCkpO1xuICAgIGNvbnN0IGVkYVN0cmVzcyA9IE1hdGgubWF4KDAsIE1hdGgubWluKDEwLCByZWFkaW5nLmVkYSAqIDYuNjcpKTsgLy8gU2NhbGUgMC0xLjUgdG8gMC0xMFxuICAgIFxuICAgIGNvbnN0IHNjb3JlID0gKGhyU3RyZXNzICsgaHJ2U3RyZXNzICsgZWRhU3RyZXNzKSAvIDM7XG4gICAgcmV0dXJuIE1hdGgucm91bmQoTWF0aC5tYXgoMCwgTWF0aC5taW4oMTAsIHNjb3JlKSkgKiAxMCkgLyAxMDtcbiAgfVxuXG4gIHByaXZhdGUgYWRkVG9CdWZmZXIocmVhZGluZzogQmlvbWV0cmljUmVhZGluZyk6IHZvaWQge1xuICAgIHRoaXMuZGF0YUJ1ZmZlci5wdXNoKHJlYWRpbmcpO1xuICAgIGlmICh0aGlzLmRhdGFCdWZmZXIubGVuZ3RoID4gdGhpcy5tYXhCdWZmZXJTaXplKSB7XG4gICAgICB0aGlzLmRhdGFCdWZmZXIuc2hpZnQoKTsgLy8gUmVtb3ZlIG9sZGVzdCByZWFkaW5nXG4gICAgfVxuICB9XG5cbiAgLy8gUHVibGljIEFQSSBtZXRob2RzXG4gIHB1YmxpYyBhc3luYyBnZXRSZWFkaW5nKHVzZVJlYWxEYXRhOiBib29sZWFuID0gdHJ1ZSk6IFByb21pc2U8QmlvbWV0cmljUmVhZGluZz4ge1xuICAgIGlmICh1c2VSZWFsRGF0YSAmJiB0aGlzLmlzQ29ubmVjdGVkICYmICF0aGlzLmlzU2ltdWxhdGluZyAmJiB0aGlzLmN1cnJlbnREYXRhKSB7XG4gICAgICByZXR1cm4gdGhpcy5jdXJyZW50RGF0YTtcbiAgICB9XG4gICAgXG4gICAgLy8gUmV0dXJuIHNpbXVsYXRlZCBkYXRhIG9yIGxhdGVzdCBhdmFpbGFibGUgZGF0YVxuICAgIHJldHVybiB0aGlzLmN1cnJlbnREYXRhIHx8IHRoaXMuZ2VuZXJhdGVTaW11bGF0ZWRSZWFkaW5nKCk7XG4gIH1cblxuICBwdWJsaWMgZ2V0QnVmZmVyZWREYXRhKGNvdW50OiBudW1iZXIgPSAxMCk6IEJpb21ldHJpY1JlYWRpbmdbXSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YUJ1ZmZlci5zbGljZSgtY291bnQpO1xuICB9XG5cbiAgcHVibGljIGlzRGV2aWNlQ29ubmVjdGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmlzQ29ubmVjdGVkICYmICF0aGlzLmlzU2ltdWxhdGluZztcbiAgfVxuXG4gIHB1YmxpYyBpc1VzaW5nU2ltdWxhdGlvbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc1NpbXVsYXRpbmc7XG4gIH1cblxuICBwdWJsaWMgZ2V0Q29ubmVjdGlvblN0YXR1cygpOiB7XG4gICAgY29ubmVjdGVkOiBib29sZWFuO1xuICAgIHNpbXVsYXRpbmc6IGJvb2xlYW47XG4gICAgbWV0aG9kOiBzdHJpbmc7XG4gICAgbGFzdFVwZGF0ZTogbnVtYmVyIHwgbnVsbDtcbiAgfSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbm5lY3RlZDogdGhpcy5pc0Nvbm5lY3RlZCxcbiAgICAgIHNpbXVsYXRpbmc6IHRoaXMuaXNTaW11bGF0aW5nLFxuICAgICAgbWV0aG9kOiB0aGlzLndlYnNvY2tldCA/ICdXZWJTb2NrZXQnIDogJ0hUVFAnLFxuICAgICAgbGFzdFVwZGF0ZTogdGhpcy5jdXJyZW50RGF0YT8udGltZXN0YW1wIHx8IG51bGxcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIGFzeW5jIHJlY29ubmVjdCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0aGlzLmRpc2Nvbm5lY3QoKTtcbiAgICBhd2FpdCB0aGlzLmluaXRpYWxpemVDb25uZWN0aW9uKCk7XG4gICAgcmV0dXJuIHRoaXMuaXNDb25uZWN0ZWQ7XG4gIH1cblxuICBwdWJsaWMgZGlzY29ubmVjdCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy53ZWJzb2NrZXQpIHtcbiAgICAgIHRoaXMud2Vic29ja2V0LmNsb3NlKCk7XG4gICAgICB0aGlzLndlYnNvY2tldCA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2ltdWxhdGlvbkludGVydmFsKSB7XG4gICAgICBjbGVhckludGVydmFsKHRoaXMuc2ltdWxhdGlvbkludGVydmFsKTtcbiAgICAgIHRoaXMuc2ltdWxhdGlvbkludGVydmFsID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLmlzQ29ubmVjdGVkID0gZmFsc2U7XG4gICAgdGhpcy5jdXJyZW50RGF0YSA9IG51bGw7XG4gICAgdGhpcy5kYXRhQnVmZmVyID0gW107XG4gIH1cblxuICAvLyBVdGlsaXR5IG1ldGhvZHMgZm9yIGludGVncmF0aW9uIHdpdGggeW91ciBHaXRIdWIgRW1vdGlCaXQgY29kZVxuICBwdWJsaWMgc2V0Q3VzdG9tRGF0YVByb2Nlc3Nvcihwcm9jZXNzb3I6IChyYXdEYXRhOiBhbnkpID0+IEJpb21ldHJpY1JlYWRpbmcpOiB2b2lkIHtcbiAgICAvLyBBbGxvdyBjdXN0b20gZGF0YSBwcm9jZXNzaW5nIGZvciB5b3VyIHNwZWNpZmljIEVtb3RpQml0IGltcGxlbWVudGF0aW9uXG4gICAgdGhpcy5wcm9jZXNzUmVhbERhdGEgPSBwcm9jZXNzb3I7XG4gIH1cblxuICBwdWJsaWMgc2V0Q29ubmVjdGlvbkNvbmZpZyhjb25maWc6IFBhcnRpYWw8RW1vdGlCaXRDb25maWc+KTogdm9pZCB7XG4gICAgdGhpcy5jb25maWcgPSB7IC4uLnRoaXMuY29uZmlnLCAuLi5jb25maWcgfTtcbiAgfVxufVxuXG4vLyBTaW5nbGV0b24gaW5zdGFuY2VcbmNvbnN0IGVtb3RpQml0U2VydmljZSA9IG5ldyBFbW90aUJpdFNlcnZpY2UoKTtcblxuZXhwb3J0IGRlZmF1bHQgZW1vdGlCaXRTZXJ2aWNlO1xuZXhwb3J0IHR5cGUgeyBCaW9tZXRyaWNSZWFkaW5nLCBFbW90aUJpdENvbmZpZyB9OyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3JlYWN0KCldLFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiA1MTczLFxuICAgIHByb3h5OiB7XG4gICAgICAnL2FwaSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo1MTczJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICBjb25maWd1cmU6IChwcm94eSwgb3B0aW9ucykgPT4ge1xuICAgICAgICAgIHByb3h5Lm9uKCdwcm94eVJlcScsIChwcm94eVJlcSwgcmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIGlmIChyZXEudXJsPy5zdGFydHNXaXRoKCcvYXBpL2Vtb3RpYml0JykpIHtcbiAgICAgICAgICAgICAgbGV0IGJvZHkgPSAnJztcbiAgICAgICAgICAgICAgcmVxLm9uKCdkYXRhJywgY2h1bmsgPT4ge1xuICAgICAgICAgICAgICAgIGJvZHkgKz0gY2h1bmsudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICByZXEub24oJ2VuZCcsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgLy8gSGFuZGxlIEVtb3RpQml0IEFQSSByZXF1ZXN0cyB1c2luZyBkeW5hbWljIGltcG9ydFxuICAgICAgICAgICAgICAgICAgY29uc3QgeyBkZWZhdWx0OiBlbW90aUJpdFNlcnZpY2UgfSA9IGF3YWl0IGltcG9ydCgnLi9zcmMvYXBpL2Vtb3RpYml0LnRzJyk7XG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHJlcXVlc3REYXRhID0gYm9keSA/IEpTT04ucGFyc2UoYm9keSkgOiB7fTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZUVtb3RpQml0ID0gcmVxdWVzdERhdGEudXNlRW1vdGlCaXQgfHwgZmFsc2U7XG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHJlYWRpbmcgPSBhd2FpdCBlbW90aUJpdFNlcnZpY2UuZ2V0UmVhZGluZyh1c2VFbW90aUJpdCk7XG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoMjAwLCB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSk7XG4gICAgICAgICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHJlYWRpbmcpKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZCg1MDAsIHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9KTtcbiAgICAgICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ0ZhaWxlZCB0byBnZXQgYmlvbWV0cmljIGRhdGEnIH0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gUHJldmVudCB0aGUgcHJveHkgZnJvbSBmb3J3YXJkaW5nIHRoZSByZXF1ZXN0XG4gICAgICAgICAgICAgIHByb3h5UmVxLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnXSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBb0JNLGlCQXNYQSxpQkFFQztBQTVZUDtBQUFBO0FBb0JBLElBQU0sa0JBQU4sTUFBc0I7QUFBQSxNQUNaLGNBQXVCO0FBQUEsTUFDdkIsZUFBd0I7QUFBQSxNQUN4QixZQUE4QjtBQUFBLE1BQzlCLHFCQUE0QztBQUFBLE1BQzVDLGNBQXVDO0FBQUEsTUFDdkM7QUFBQSxNQUNBLGFBQWlDLENBQUM7QUFBQSxNQUNsQyxnQkFBd0I7QUFBQSxNQUVoQyxZQUFZLFNBQXlCLENBQUMsR0FBRztBQUN2QyxhQUFLLFNBQVM7QUFBQSxVQUNaLFlBQVk7QUFBQTtBQUFBLFVBQ1osWUFBWTtBQUFBLFVBQ1osY0FBYztBQUFBLFVBQ2QsY0FBYztBQUFBLFVBQ2Qs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
