/**
 * SmartHealth Box — Complete ESP32 Firmware
 * ==========================================
 */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h> // NEW: Required for Vercel's HTTPS
#include <ArduinoJson.h>
#include <Wire.h>
#include <RTClib.h>
#include <LiquidCrystal_I2C.h>
#include <ESP32Servo.h>
#include <HX711.h>
#include <MAX30105.h>
#include "heartRate.h"

// ── Configuration ─────────────────────────────────────────────────────────────

const char* WIFI_SSID     = "Aftab";
const char* WIFI_PASSWORD = "WifiAftab@2122$";

// IMPORTANT: Use https:// and NO trailing slash at the end
const char* SERVER_URL    = "https://capstone-yadr.vercel.app"; 

const char* DEVICE_ID     = "SHB-0001";
const char* DEVICE_TOKEN  = "your-device-token";

// ── Pin Definitions ───────────────────────────────────────────────────────────

#define SDA_PIN         21
#define SCL_PIN         22
#define PIN_SERVO       18
#define PIN_IR          26
#define PIN_BUZZER      27
#define PIN_LED         2
#define PIN_BTN_CONFIRM 25
#define PIN_BTN_SKIP    34
#define PIN_BTN_SOS     35

#define PIN_HX_DOUT     32
#define PIN_HX_SCK      33

// ── Constants ─────────────────────────────────────────────────────────────────

#define LCD_I2C_ADDR    0x27
#define SERVO_CLOSED_ANGLE  0
#define COMPARTMENT_1_ANGLE 10
#define COMPARTMENT_2_ANGLE 40
#define COMPARTMENT_3_ANGLE 70
#define COMPARTMENT_4_ANGLE 100
#define SERVO_OPEN_MS       1500

#define TAKE_WINDOW_MS      30000
#define HEARTBEAT_INTERVAL  60000
#define SCHEDULE_REFRESH_MS 3600000
#define POLL_COMMANDS_MS    10000
#define SENSOR_PRINT_INTERVAL 2000 // Print sensors to serial every 2 seconds

#define MAX_SCHEDULES       20
#define PILL_WEIGHT_GRAMS   0.5  // Approx drop to consider as taken

// ── Global Objects ────────────────────────────────────────────────────────────

RTC_DS3231 rtc;
LiquidCrystal_I2C lcd(LCD_I2C_ADDR, 16, 2);
Servo dispenserServo;
HX711 scale;
MAX30105 particleSensor;

// ── Variables ─────────────────────────────────────────────────────────────────

struct ScheduleItem {
  char scheduleId[40];
  char medicationId[40];
  char medicationName[17];
  char compartmentId[4];
  char time[6];
  int  quantity;
  bool lowStock;
  bool firedToday;
};

ScheduleItem schedule[MAX_SCHEDULES];
int scheduleCount = 0;

enum State {
  STATE_IDLE,
  STATE_CONNECTING_WIFI,
  STATE_DISPENSING,
  STATE_WAITING_TAKE,
  STATE_ERROR
};

State currentState = STATE_IDLE;
int  activeScheduleIdx = -1;
unsigned long dispenseStartMs = 0;
unsigned long lastHeartbeatMs  = 0;
unsigned long lastScheduleRefreshMs = 0;
unsigned long lastCommandPollMs = 0;
unsigned long lastSensorPrintMs = 0;

float initialWeight = 0;

// Vitals globals
long lastBeat = 0;
float beatsPerMinute = 0;
int beatAvg = 0;

// ── Helper: LCD Display (Shifted 1 col) ───────────────────────────────────────

void displayMessage(const char* line1, const char* line2 = "") {
  char buf1[16]; char buf2[16];
  strncpy(buf1, line1, 15); buf1[15] = '\0';
  strncpy(buf2, line2, 15); buf2[15] = '\0';
  lcd.clear();
  lcd.setCursor(1, 0);
  lcd.print(buf1);
  if (strlen(buf2) > 0) {
    lcd.setCursor(1, 1);
    lcd.print(buf2);
  }
}

// ── Helper: Buzzer ────────────────────────────────────────────────────────────

void beep(int times = 1, int durationMs = 200) {
  for (int i = 0; i < times; i++) {
    tone(PIN_BUZZER, 1000);
    delay(durationMs);
    noTone(PIN_BUZZER);
    if (i < times - 1) delay(100);
  }
}

// ── Helper: Servo ─────────────────────────────────────────────────────────────

void openCompartment(const char* compartmentId) {
  int angle = SERVO_CLOSED_ANGLE;
  if (strcmp(compartmentId, "C1") == 0) angle = COMPARTMENT_1_ANGLE;
  else if (strcmp(compartmentId, "C2") == 0) angle = COMPARTMENT_2_ANGLE;
  else if (strcmp(compartmentId, "C3") == 0) angle = COMPARTMENT_3_ANGLE;
  else if (strcmp(compartmentId, "C4") == 0) angle = COMPARTMENT_4_ANGLE;
  else {
    Serial.println("[SERVO] Invalid Compartment!");
    return;
  }
  dispenserServo.write(angle);
  Serial.print("[SERVO] Moved to ");
  Serial.println(compartmentId);
}

void closeCompartment() {
  dispenserServo.write(SERVO_CLOSED_ANGLE);
  Serial.println("[SERVO] CLOSED");
}

// ── Helpers: Sensors ──────────────────────────────────────────────────────────

bool isTabletDetectedIR() {
  return digitalRead(PIN_IR) == LOW; // Active low: LOW = OBJECT DETECTED
}

bool isTabletTakenWeight() {
  if (!scale.is_ready()) return false;
  float currentWeight = scale.get_units(5);
  if (initialWeight - currentWeight >= (PILL_WEIGHT_GRAMS * 0.8)) {
    return true;
  }
  return false;
}

void pollVitals() {
  long irValue = particleSensor.getIR();
  if (checkForBeat(irValue)) {
    long delta = millis() - lastBeat;
    lastBeat = millis();
    beatsPerMinute = 60 / (delta / 1000.0);
    if (beatsPerMinute < 255 && beatsPerMinute > 20) {
      beatAvg = (beatAvg + beatsPerMinute) / 2;
      if(beatAvg == 0) beatAvg = beatsPerMinute;
    }
  }
}

void printSensorDebug() {
  Serial.println("====== SENSOR DATA ======");
  
  bool irState = isTabletDetectedIR();
  Serial.print("[IR SENSOR] Pill Detected: ");
  Serial.println(irState ? "YES" : "NO");

  if (scale.is_ready()) {
    Serial.print("[LOAD CELL] Weight: ");
    Serial.print(scale.get_units(1)); 
    Serial.println(" g");
  } else {
    Serial.println("[LOAD CELL] Not ready or disconnected");
  }

  Serial.print("[MAX30102] Avg BPM: ");
  Serial.println(beatAvg);
  Serial.println("=========================");
}

// ── WiFi ──────────────────────────────────────────────────────────────────────

bool connectWiFi() {
  displayMessage("Connecting WiFi", WIFI_SSID);
  Serial.print("[DIAG] WIFI CONNECTING: ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[DIAG] WIFI CONNECTED");
    Serial.print("[DIAG] IP ADDRESS: ");
    Serial.println(WiFi.localIP());
    displayMessage("WiFi Connected!", WiFi.localIP().toString().c_str());
    delay(1000);
    return true;
  }

  Serial.println("\n[DIAG] WIFI FAILED");
  displayMessage("WiFi FAILED!", "Check creds");
  return false;
}

// ── APIs (Updated for Vercel HTTPS) ───────────────────────────────────────────

void sendHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) return;
  Serial.println("[DIAG] BACKEND CONNECTING (HEARTBEAT)");
  
  // Secure client for HTTPS
  WiFiClientSecure client;
  client.setInsecure(); // Bypass SSL certificate validation

  HTTPClient http;
  http.begin(client, String(SERVER_URL) + "/api/device/heartbeat");
  http.addHeader("Content-Type", "application/json");

  DateTime now = rtc.now();
  char ts[25];
  sprintf(ts, "%04d-%02d-%02dT%02d:%02d:%02d.000Z", now.year(), now.month(), now.day(), now.hour(), now.minute(), now.second());

  JsonDocument doc;
  doc["deviceId"]  = DEVICE_ID;
  doc["token"]     = DEVICE_TOKEN;
  doc["battery"]   = 85;
  doc["firmware"]  = "2.0.0-hw";
  doc["wifiSignal"] = WiFi.RSSI();
  doc["timestamp"] = ts;

  String body;
  serializeJson(doc, body);
  int httpCode = http.POST(body);
  
  if (httpCode > 0) {
    Serial.println("[DIAG] HEARTBEAT SUCCESS");
  } else {
    Serial.print("[DIAG] HEARTBEAT FAILED, ERROR: ");
    Serial.println(http.errorToString(httpCode).c_str());
  }
  http.end();

  // ----- SEND SENSOR DATA TO WEBSITE -----
  HTTPClient httpVitals;
  httpVitals.begin(client, String(SERVER_URL) + "/api/readings");
  httpVitals.addHeader("Content-Type", "application/json");
  
  JsonDocument vDoc;
  vDoc["deviceId"] = DEVICE_ID;
  vDoc["token"] = DEVICE_TOKEN;
  JsonArray readings = vDoc["readings"].to<JsonArray>();
  
  if (beatAvg > 40 && beatAvg < 150) {
    JsonObject hr = readings.add<JsonObject>();
    hr["metric"] = "heart_rate";
    hr["value"] = beatAvg;
    hr["unit"] = "BPM";
  }

  if (scale.is_ready()) {
    JsonObject weight = readings.add<JsonObject>();
    weight["metric"] = "weight";
    weight["value"] = scale.get_units(1);
    weight["unit"] = "g";
  }

  JsonObject irState = readings.add<JsonObject>();
  irState["metric"] = "ir_status";
  irState["value"] = isTabletDetectedIR() ? 1 : 0;
  irState["unit"] = "bool";

  String vBody;
  serializeJson(vDoc, vBody);
  httpVitals.POST(vBody);
  httpVitals.end();
}

bool fetchSchedule() {
  if (WiFi.status() != WL_CONNECTED) return false;
  
  WiFiClientSecure client;
  client.setInsecure();
  
  HTTPClient http;
  http.begin(client, String(SERVER_URL) + "/api/dispenser/schedule?deviceId=" + DEVICE_ID);
  http.setTimeout(10000);
  
  if (http.GET() != 200) { http.end(); return false; }
  
  String payload = http.getString();
  http.end();

  JsonDocument doc;
  if (deserializeJson(doc, payload)) return false;

  scheduleCount = 0;
  JsonArray items = doc["data"]["schedule"].as<JsonArray>();
  for (JsonObject item : items) {
    if (scheduleCount >= MAX_SCHEDULES) break;
    ScheduleItem& s = schedule[scheduleCount];
    strlcpy(s.scheduleId, item["scheduleId"] | "", sizeof(s.scheduleId));
    strlcpy(s.medicationId, item["medicationId"] | "", sizeof(s.medicationId));
    strlcpy(s.medicationName, item["medicationName"] | "Unknown", sizeof(s.medicationName));
    strlcpy(s.compartmentId, item["compartmentId"] | "C1", sizeof(s.compartmentId));
    strlcpy(s.time, item["time"] | "00:00", sizeof(s.time));
    s.quantity = item["quantity"] | 1;
    s.firedToday = false;
    scheduleCount++;
  }
  return true;
}

void reportEvent(int idx, const char* status, int detected) {
  if (WiFi.status() != WL_CONNECTED) return;
  
  WiFiClientSecure client;
  client.setInsecure();

  ScheduleItem& s = schedule[idx];
  DateTime now = rtc.now();
  char eTime[25], sTime[25];
  sprintf(eTime, "%04d-%02d-%02dT%02d:%02d:%02d.000Z", now.year(), now.month(), now.day(), now.hour(), now.minute(), now.second());
  sprintf(sTime, "%04d-%02d-%02dT%s:00.000Z", now.year(), now.month(), now.day(), s.time);

  JsonDocument doc;
  doc["deviceId"] = DEVICE_ID;
  doc["scheduleId"] = s.scheduleId;
  doc["medicationId"] = s.medicationId;
  doc["compartmentId"] = s.compartmentId;
  doc["status"] = status;
  doc["detectedQuantity"] = detected;
  doc["scheduledTime"] = sTime;
  doc["eventTime"] = eTime;

  String body;
  serializeJson(doc, body);
  HTTPClient http;
  http.begin(client, String(SERVER_URL) + "/api/dispenser/event");
  http.addHeader("Content-Type", "application/json");
  http.POST(body);
  http.end();
}

void pollPendingCommands() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  WiFiClientSecure client;
  client.setInsecure();
  
  HTTPClient http;
  http.begin(client, String(SERVER_URL) + "/api/dispenser/dispense?deviceId=" + DEVICE_ID);
  
  int httpCode = http.GET();
  if (httpCode != 200) { 
    if (httpCode < 0) {
       Serial.print("[DIAG] COMMAND POLLING HTTP FAILED: ");
       Serial.println(http.errorToString(httpCode).c_str());
    }
    http.end(); 
    return; 
  }
  
  String payload = http.getString();
  http.end();

  JsonDocument doc;
  if (deserializeJson(doc, payload)) {
    return;
  }

  JsonArray cmds = doc["data"]["commands"].as<JsonArray>();
  for (JsonObject cmd : cmds) {
    const char* type = cmd["type"] | "";
    if (strcmp(type, "DISPENSE") == 0) {
      Serial.print("[DIAG] COMMAND RECEIVED: ");
      Serial.println(type);
      displayMessage("Manual Dispense", "Opening...");
      const char* compId = cmd["payload"]["compartmentId"] | "C1";
      openCompartment(compId); beep(2); delay(SERVO_OPEN_MS); closeCompartment(); beep(1);
      
      HTTPClient ackHttp;
      ackHttp.begin(client, String(SERVER_URL) + "/api/dispenser/dispense?commandId=" + String(cmd["id"] | ""));
      ackHttp.addHeader("Content-Type", "application/json");
      ackHttp.PATCH("{\"status\":\"ACKNOWLEDGED\"}");
      ackHttp.end();
    }
  }
}

// ── Dispense ──────────────────────────────────────────────────────────────────

void startDispensing(int idx) {
  activeScheduleIdx = idx;
  ScheduleItem& s = schedule[idx];
  
  displayMessage(s.medicationName, "Time to take!");
  beep(3, 300);
  
  openCompartment(s.compartmentId);
  delay(SERVO_OPEN_MS);
  closeCompartment();
  
  if (scale.is_ready()) {
    initialWeight = scale.get_units(10);
  }

  reportEvent(idx, "DISPENSE_CANDIDATE", 1);
  dispenseStartMs = millis();
  currentState = STATE_WAITING_TAKE;
  
  displayMessage(s.medicationName, "Conf/Skip/Take");
}

void handleWaitingTake() {
  ScheduleItem& s = schedule[activeScheduleIdx];
  
  bool takenViaIR = isTabletDetectedIR();
  bool takenViaWeight = isTabletTakenWeight();

  static unsigned long lastBtnPress = 0;
  bool btnPressed = (digitalRead(PIN_BTN_CONFIRM) == LOW);
  
  if (btnPressed && (millis() - lastBtnPress > 500)) {
    lastBtnPress = millis();
    reportEvent(activeScheduleIdx, "TAKEN", 1);
    s.firedToday = true;
    beep(1, 500);
    displayMessage("Medicine Taken!", "Well done!");
    delay(2000);
    currentState = STATE_IDLE;
    activeScheduleIdx = -1;
    return;
  }
  
  if (takenViaIR || takenViaWeight) {
    delay(100); 
    if (isTabletDetectedIR() || isTabletTakenWeight()) {
      reportEvent(activeScheduleIdx, "TAKEN", 1);
      s.firedToday = true;
      beep(1, 500);
      displayMessage("Medicine Taken!", "Well done!");
      delay(2000);
      currentState = STATE_IDLE;
      activeScheduleIdx = -1;
      return;
    }
  }

  if (millis() - dispenseStartMs > TAKE_WINDOW_MS) {
    reportEvent(activeScheduleIdx, "MISSED", 0);
    s.firedToday = true;
    beep(4, 100);
    displayMessage("MISSED!", "No action taken");
    delay(2000);
    currentState = STATE_IDLE;
    activeScheduleIdx = -1;
    return;
  }
}

void checkSchedule() {
  if (scheduleCount == 0 || currentState != STATE_IDLE) return;
  DateTime now = rtc.now();
  char currentTime[6];
  sprintf(currentTime, "%02d:%02d", now.hour(), now.minute());

  for (int i = 0; i < scheduleCount; i++) {
    if (!schedule[i].firedToday && strcmp(schedule[i].time, currentTime) == 0) {
      startDispensing(i);
      return;
    }
  }
}

void checkSOSButton() {
  // Ignored since you don't have this button connected anymore
}

void updateIdleDisplay() {
  DateTime now = rtc.now();
  char timeBuf[16];
  sprintf(timeBuf, "Time: %02d:%02d:%02d", now.hour(), now.minute(), now.second());

  displayMessage(timeBuf, WiFi.status() == WL_CONNECTED ? "WiFi: Connected" : "WiFi: Offline");
}

// ── Main ──────────────────────────────────────────────────────────────────────

void setup() {
  Serial.begin(115200);
  
  pinMode(PIN_IR, INPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_LED, OUTPUT);
  pinMode(PIN_BTN_CONFIRM, INPUT_PULLUP);
  digitalWrite(PIN_BUZZER, LOW);
  
  dispenserServo.attach(PIN_SERVO);
  closeCompartment();
  
  Wire.begin(21, 22);
  
  lcd.init();
  lcd.backlight();
  displayMessage("SmartHealth Box", "Booting v2.0-hw");
  delay(1000);
  
  if (!rtc.begin()) {
    displayMessage("RTC ERROR", "Check Wiring");
    delay(3000);
  } else if (rtc.lostPower()) {
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  }

  scale.begin(PIN_HX_DOUT, PIN_HX_SCK);
  scale.set_scale(2280.f); 
  scale.tare();

  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("[ERROR] MAX30102 NOT found. Check wiring to Pins 21/22.");
  } else {
    particleSensor.setup(); 
    particleSensor.setPulseAmplitudeRed(0x0A); 
    particleSensor.setPulseAmplitudeGreen(0); 
  }
  
  if (!connectWiFi()) delay(2000);
  
  fetchSchedule();
  sendHeartbeat();
  
  beep(2, 200);
}

void loop() {
  unsigned long now = millis();
  
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  pollVitals(); 
  
  if (now - lastSensorPrintMs >= SENSOR_PRINT_INTERVAL) {
    printSensorDebug();
    lastSensorPrintMs = now;
  }
  
  if (now - lastHeartbeatMs >= HEARTBEAT_INTERVAL) {
    sendHeartbeat();
    lastHeartbeatMs = now;
  }
  
  if (now - lastScheduleRefreshMs >= SCHEDULE_REFRESH_MS) {
    fetchSchedule();
    lastScheduleRefreshMs = now;
  }
  
  if (now - lastCommandPollMs >= POLL_COMMANDS_MS && currentState == STATE_IDLE) {
    pollPendingCommands();
    lastCommandPollMs = now;
  }
  
  switch (currentState) {
    case STATE_IDLE:
      checkSchedule();
      checkSOSButton();
      if (now % 1000 < 50) {
        updateIdleDisplay();
      }
      break;
    case STATE_WAITING_TAKE:
      handleWaitingTake();
      break;
    case STATE_ERROR:
      displayMessage("ERROR", "Check Serial");
      break;
  }
  
  delay(50);
}