const { SerialPort, ReadlineParser } = require('serialport');
const http = require('http');

// ==========================================
// CONFIGURATION
// ==========================================
// CHANGE THIS TO YOUR EXACT COM PORT (e.g., 'COM3', 'COM4')
const COM_PORT = 'COM10';
const API_URL = 'http://localhost:3000/api/readings';
const DEVICE_ID = 'SHB-0001';
const DEVICE_TOKEN = 'your-device-token';
const OWNER_ID = 'sELBwbtHKANpyjGR1S1nhsJIpdY2'; // from your logs
// ==========================================

console.log(`🔌 Starting USB Bridge on ${COM_PORT}...`);

const port = new SerialPort({ path: COM_PORT, baudRate: 115200 }, function (err) {
  if (err) {
    return console.log('❌ Error: ', err.message);
  }
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

let currentReadings = [];

parser.on('data', (line) => {
  console.log(`[ESP32] ${line}`);

  if (line.includes('====== SENSOR DATA ======')) {
    // Start of new payload
    currentReadings = [];
  }
  else if (line.includes('[LOAD CELL] Weight:')) {
    // Parse weight: "[LOAD CELL] Weight: 0.01 g"
    const match = line.match(/Weight:\s*([-\d.]+)\s*g/);
    if (match) {
      currentReadings.push({
        metric: 'weight',
        value: parseFloat(match[1]),
        unit: 'g'
      });
    }
  }
  else if (line.includes('[IR SENSOR] Pill Detected:')) {
    // Parse IR: "[IR SENSOR] Pill Detected: YES"
    const isDetected = line.includes('YES');
    currentReadings.push({
      metric: 'ir_status',
      value: isDetected ? 1 : 0,
      unit: 'bool'
    });
  }
  else if (line.includes('=========================')) {
    // End of payload, send to server
    if (currentReadings.length > 0) {
      sendToServer(currentReadings);
    }
  }
});

function sendToServer(readings) {
  const payload = JSON.stringify({
    deviceId: DEVICE_ID,
    token: DEVICE_TOKEN,
    readings: readings
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/readings',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log(`✅ Sent Readings! Status: ${res.statusCode}`);
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Failed to send readings: ${e.message}`);
  });

  req.write(payload);
  req.end();
}

// Keep the device "ONLINE" in the dashboard by sending a heartbeat every 30 seconds
function sendHeartbeat() {
  const payload = JSON.stringify({
    deviceId: DEVICE_ID,
    token: DEVICE_TOKEN,
    battery: 100,
    firmware: "USB-Bridge-1.0",
    wifiSignal: -50,
    timestamp: new Date().toISOString()
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/device/heartbeat',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const req = http.request(options, (res) => {
    res.on('data', () => {});
    res.on('end', () => console.log(`💓 Sent Heartbeat! Device is now ONLINE.`));
  });

  req.on('error', () => {});
  req.write(payload);
  req.end();
}

sendHeartbeat();
setInterval(sendHeartbeat, 30000);

console.log('⏳ Waiting for data from ESP32...');

