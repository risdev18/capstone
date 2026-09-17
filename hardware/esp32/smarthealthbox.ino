/**
 * SmartHealth Box — Complete ESP32 Firmware
 * ==========================================
 * Hardware:
 *   - ESP32 DevKit V1
 *   - DS3231 RTC Module         (I2C: SDA=21, SCL=22)
 *   - 0.96" OLED SSD1306        (I2C: SDA=21, SCL=22)
 *   - SG90 Servo Motor x1       (PWM: GPIO 13)
 *   - IR Sensor Module          (Digital: GPIO 34)
 *   - Buzzer                    (GPIO 25)
 *   - LED Status                (GPIO 2 = built-in)
 *   - Push Button CONFIRM       (GPIO 32, INPUT_PULLUP)
 *   - Push Button SKIP          (GPIO 33, INPUT_PULLUP)
 *
 * Libraries needed (install via Arduino Library Manager):
 *   - RTClib by Adafruit
 *   - Adafruit SSD1306
 *   - Adafruit GFX Library
 *   - ESP32Servo
 *   - ArduinoJson
 *   - WiFi (built-in ESP32)
 *   - HTTPClient (built-in ESP32)
 *
 * API Base URL: set SERVER_URL below to your Vercel deployment URL
 */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <RTClib.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ESP32Servo.h>

// ── Configuration ─────────────────────────────────────────────────────────────

const char* WIFI_SSID     = "YOUR_WIFI_SSID";       // ← Change this
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";    // ← Change this

// After deploying to Vercel, set this to your deployment URL:
const char* SERVER_URL    = "https://capstone-yadr.vercel.app";  // ← Change this
const char* DEVICE_ID     = "SHB-0001";                     // ← Must match Firestore
const char* DEVICE_TOKEN  = "your-device-token";            // ← Must match Firestore

// ── Pin Definitions ───────────────────────────────────────────────────────────

#define PIN_SERVO       13
#define PIN_IR          34
#define PIN_BUZZER      25
#define PIN_LED         2     // Built-in LED
#define PIN_BTN_CONFIRM 32
#define PIN_BTN_SKIP    33

// ── Constants ─────────────────────────────────────────────────────────────────

#define OLED_WIDTH        128
#define OLED_HEIGHT       64
#define OLED_RESET        -1
#define OLED_I2C_ADDR     0x3C

#define SERVO_CLOSED_ANGLE  0
#define SERVO_OPEN_ANGLE    90
#define SERVO_OPEN_MS       1500    // Time to hold open (ms)

#define TAKE_WINDOW_MS      30000   // 30 seconds to take medicine
#define HEARTBEAT_INTERVAL  60000   // Send heartbeat every 60s
#define SCHEDULE_REFRESH_MS 3600000 // Refresh schedule every hour
#define POLL_COMMANDS_MS    10000   // Poll for manual commands every 10s

#define MAX_SCHEDULES       20

// ── Global Objects ────────────────────────────────────────────────────────────

RTC_DS3231 rtc;
Adafruit_SSD1306 display(OLED_WIDTH, OLED_HEIGHT, &Wire, OLED_RESET);
Servo dispenserServo;

// ── Schedule Data ─────────────────────────────────────────────────────────────

struct ScheduleItem {
  char scheduleId[40];
  char medicationId[40];
  char medicationName[50];
  char compartmentId[4];  // "C1"–"C8"
  char time[6];           // "HH:MM"
  int  quantity;
  bool lowStock;
  bool firedToday;        // Prevents re-triggering same dose
};

ScheduleItem schedule[MAX_SCHEDULES];
int scheduleCount = 0;

// ── State Machine ─────────────────────────────────────────────────────────────

enum State {
  STATE_IDLE,
  STATE_CONNECTING_WIFI,
  STATE_DISPENSING,
  STATE_WAITING_TAKE,
  STATE_ERROR
};

State currentState = STATE_IDLE;
int   activeScheduleIdx = -1;
unsigned long dispenseStartMs = 0;
unsigned long lastHeartbeatMs  = 0;
unsigned long lastScheduleRefreshMs = 0;
unsigned long lastCommandPollMs = 0;

// ── Helper: OLED Display ──────────────────────────────────────────────────────

void displayMessage(const char* line1, const char* line2 = "", const char* line3 = "") {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);  display.println(line1);
  display.setCursor(0, 20); display.println(line2);
  display.setCursor(0, 40); display.println(line3);
  display.display();
}

// ── Helper: Buzzer ────────────────────────────────────────────────────────────

void beep(int times = 1, int durationMs = 200) {
  for (int i = 0; i < times; i++) {
    digitalWrite(PIN_BUZZER, HIGH);
    delay(durationMs);
    digitalWrite(PIN_BUZZER, LOW);
    if (i < times - 1) delay(100);
  }
}

// ── Helper: Servo ─────────────────────────────────────────────────────────────

void openCompartment() {
  dispenserServo.write(SERVO_OPEN_ANGLE);
  Serial.println("[SERVO] Compartment OPEN");
}

void closeCompartment() {
  dispenserServo.write(SERVO_CLOSED_ANGLE);
  Serial.println("[SERVO] Compartment CLOSED");
}

// ── Helper: IR Sensor ─────────────────────────────────────────────────────────

bool isTabletDetected() {
  // IR sensor outputs LOW when object detected (active low)
  return digitalRead(PIN_IR) == LOW;
}

// ── WiFi Connection ───────────────────────────────────────────────────────────

bool connectWiFi() {
  displayMessage("Connecting WiFi...", WIFI_SSID);
  Serial.print("[WiFi] Connecting to ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Connected! IP: " + WiFi.localIP().toString());
    displayMessage("WiFi Connected!", WiFi.localIP().toString().c_str());
    delay(1000);
    return true;
  }

  Serial.println("\n[WiFi] FAILED to connect");
  displayMessage("WiFi FAILED!", "Check credentials");
  return false;
}

// ── API: Send Heartbeat ───────────────────────────────────────────────────────

void sendHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(SERVER_URL) + "/api/device/heartbeat";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  DateTime now = rtc.now();
  char timestamp[25];
  sprintf(timestamp, "%04d-%02d-%02dT%02d:%02d:%02d.000Z",
          now.year(), now.month(), now.day(),
          now.hour(), now.minute(), now.second());

  // Get battery level via ADC (if connected to VBAT divider, else mock)
  int battery = 85;

  JsonDocument doc;
  doc["deviceId"]  = DEVICE_ID;
  doc["token"]     = DEVICE_TOKEN;
  doc["battery"]   = battery;
  doc["firmware"]  = "1.0.0";
  doc["wifiSignal"] = WiFi.RSSI();
  doc["timestamp"] = timestamp;

  String body;
  serializeJson(doc, body);

  int code = http.POST(body);
  Serial.printf("[Heartbeat] Response: %d\n", code);
  http.end();
}

// ── API: Fetch Today's Schedule ───────────────────────────────────────────────

bool fetchSchedule() {
  if (WiFi.status() != WL_CONNECTED) return false;

  displayMessage("Fetching schedule...");
  HTTPClient http;
  String url = String(SERVER_URL) + "/api/dispenser/schedule?deviceId=" + DEVICE_ID;
  http.begin(url);
  http.setTimeout(10000);

  int code = http.GET();
  Serial.printf("[Schedule] HTTP %d\n", code);

  if (code != 200) {
    http.end();
    return false;
  }

  String payload = http.getString();
  http.end();

  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, payload);
  if (err) {
    Serial.println("[Schedule] JSON parse error");
    return false;
  }

  scheduleCount = 0;
  JsonArray items = doc["data"]["schedule"].as<JsonArray>();

  for (JsonObject item : items) {
    if (scheduleCount >= MAX_SCHEDULES) break;
    ScheduleItem& s = schedule[scheduleCount];
    strlcpy(s.scheduleId,    item["scheduleId"]    | "", sizeof(s.scheduleId));
    strlcpy(s.medicationId,  item["medicationId"]  | "", sizeof(s.medicationId));
    strlcpy(s.medicationName, item["medicationName"] | "Unknown", sizeof(s.medicationName));
    strlcpy(s.compartmentId, item["compartmentId"] | "C1", sizeof(s.compartmentId));
    strlcpy(s.time,          item["time"]          | "00:00", sizeof(s.time));
    s.quantity  = item["quantity"] | 1;
    s.lowStock  = item["lowStock"]  | false;
    s.firedToday = false;
    scheduleCount++;
  }

  Serial.printf("[Schedule] Loaded %d items\n", scheduleCount);
  return true;
}

// ── API: Report Medication Event ──────────────────────────────────────────────

void reportEvent(int idx, const char* status, int detected) {
  if (WiFi.status() != WL_CONNECTED) return;

  ScheduleItem& s = schedule[idx];
  DateTime now = rtc.now();
  char eventTime[25];
  sprintf(eventTime, "%04d-%02d-%02dT%02d:%02d:%02d.000Z",
          now.year(), now.month(), now.day(),
          now.hour(), now.minute(), now.second());

  // scheduledTime: today at s.time
  char scheduledTime[25];
  sprintf(scheduledTime, "%04d-%02d-%02dT%s:00.000Z",
          now.year(), now.month(), now.day(), s.time);

  JsonDocument doc;
  doc["deviceId"]        = DEVICE_ID;
  doc["scheduleId"]      = s.scheduleId;
  doc["medicationId"]    = s.medicationId;
  doc["compartmentId"]   = s.compartmentId;
  doc["status"]          = status;
  doc["detectedQuantity"] = detected;
  doc["scheduledTime"]   = scheduledTime;
  doc["eventTime"]       = eventTime;

  String body;
  serializeJson(doc, body);

  HTTPClient http;
  http.begin(String(SERVER_URL) + "/api/dispenser/event");
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(body);
  Serial.printf("[Event] %s → HTTP %d\n", status, code);
  http.end();
}

// ── API: Poll Pending Commands (Manual Dispense) ──────────────────────────────

void pollPendingCommands() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(SERVER_URL) + "/api/dispenser/dispense?deviceId=" + DEVICE_ID;
  http.begin(url);
  int code = http.GET();

  if (code != 200) { http.end(); return; }

  String payload = http.getString();
  http.end();

  JsonDocument doc;
  if (deserializeJson(doc, payload)) return;

  JsonArray cmds = doc["data"]["commands"].as<JsonArray>();
  for (JsonObject cmd : cmds) {
    const char* type = cmd["type"] | "";
    const char* commandId = cmd["id"] | "";
    const char* compartment = cmd["payload"]["compartmentId"] | "C1";

    if (strcmp(type, "DISPENSE") == 0) {
      Serial.printf("[Command] Manual dispense: %s\n", compartment);
      displayMessage("Manual Dispense", compartment, "Opening...");
      openCompartment();
      beep(2);
      delay(SERVO_OPEN_MS);
      closeCompartment();
      beep(1);

      // Acknowledge the command
      HTTPClient ackHttp;
      String ackUrl = String(SERVER_URL) + "/api/dispenser/dispense?commandId=" + commandId;
      ackHttp.begin(ackUrl);
      ackHttp.addHeader("Content-Type", "application/json");
      ackHttp.PATCH("{\"status\":\"ACKNOWLEDGED\"}");
      ackHttp.end();
    }
  }
}

// ── Dispense Logic ────────────────────────────────────────────────────────────

void startDispensing(int idx) {
  activeScheduleIdx = idx;
  ScheduleItem& s = schedule[idx];

  Serial.printf("[DISPENSE] %s from %s\n", s.medicationName, s.compartmentId);

  displayMessage(s.medicationName, s.compartmentId, "Time to take!");
  beep(3, 300);

  openCompartment();
  delay(SERVO_OPEN_MS);
  closeCompartment();

  // Report DISPENSE_CANDIDATE — tablet dropped
  reportEvent(idx, "DISPENSE_CANDIDATE", 1);

  dispenseStartMs = millis();
  currentState = STATE_WAITING_TAKE;

  displayMessage(s.medicationName, "Take medicine!", "CONFIRM or SKIP");
}

void handleWaitingTake() {
  ScheduleItem& s = schedule[activeScheduleIdx];

  // Check if IR sensor still sees tablet (not taken yet)
  bool tabletPresent = isTabletDetected();

  // Check CONFIRM button
  if (digitalRead(PIN_BTN_CONFIRM) == LOW) {
    delay(50); // debounce
    if (digitalRead(PIN_BTN_CONFIRM) == LOW) {
      Serial.println("[BTN] CONFIRM pressed → TAKEN");
      reportEvent(activeScheduleIdx, "TAKEN", 1);
      s.firedToday = true;
      beep(1, 500);
      displayMessage("✓ Medicine Taken!", s.medicationName, "Well done!");
      delay(2000);
      currentState = STATE_IDLE;
      activeScheduleIdx = -1;
      return;
    }
  }

  // Check SKIP button
  if (digitalRead(PIN_BTN_SKIP) == LOW) {
    delay(50); // debounce
    if (digitalRead(PIN_BTN_SKIP) == LOW) {
      Serial.println("[BTN] SKIP pressed → MISSED");
      reportEvent(activeScheduleIdx, "MISSED", 0);
      s.firedToday = true;
      beep(2, 200);
      displayMessage("⚠ Dose Skipped", s.medicationName, "Recorded.");
      delay(2000);
      currentState = STATE_IDLE;
      activeScheduleIdx = -1;
      return;
    }
  }

  // IR sensor: if tablet cleared (taken without pressing button)
  if (!tabletPresent) {
    Serial.println("[IR] Tablet cleared → TAKEN");
    reportEvent(activeScheduleIdx, "TAKEN", 1);
    s.firedToday = true;
    beep(1, 500);
    displayMessage("✓ Medicine Taken!", s.medicationName, "Detected by sensor");
    delay(2000);
    currentState = STATE_IDLE;
    activeScheduleIdx = -1;
    return;
  }

  // Timeout: 30 seconds
  if (millis() - dispenseStartMs > TAKE_WINDOW_MS) {
    Serial.println("[TIMEOUT] 30s elapsed → MISSED");
    reportEvent(activeScheduleIdx, "MISSED", 0);
    s.firedToday = true;
    beep(4, 100);
    displayMessage("✗ MISSED!", s.medicationName, "No action taken");
    delay(2000);
    currentState = STATE_IDLE;
    activeScheduleIdx = -1;
    return;
  }

  // Countdown display
  unsigned long remaining = (TAKE_WINDOW_MS - (millis() - dispenseStartMs)) / 1000;
  char countdown[20];
  sprintf(countdown, "Timeout in: %lus", remaining);
  displayMessage(s.medicationName, "Take medicine!", countdown);
}

// ── Check Schedule ────────────────────────────────────────────────────────────

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

// ── Idle Display ──────────────────────────────────────────────────────────────

void updateIdleDisplay() {
  DateTime now = rtc.now();
  char timeBuf[20], dateBuf[20];
  sprintf(timeBuf, "%02d:%02d:%02d", now.hour(), now.minute(), now.second());
  sprintf(dateBuf, "%02d/%02d/%04d", now.day(), now.month(), now.year());

  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(10, 5);
  display.println(timeBuf);
  display.setTextSize(1);
  display.setCursor(25, 28);
  display.println(dateBuf);
  display.setCursor(0, 42);
  display.printf("Doses today: %d", scheduleCount);
  display.setCursor(0, 52);
  display.println(WiFi.status() == WL_CONNECTED ? "WiFi: OK" : "WiFi: OFFLINE");
  display.display();
}

// ── setup() ───────────────────────────────────────────────────────────────────

void setup() {
  Serial.begin(115200);
  Serial.println("\n=== SmartHealth Box Booting ===");

  // GPIO setup
  pinMode(PIN_IR,          INPUT);
  pinMode(PIN_BUZZER,      OUTPUT);
  pinMode(PIN_LED,         OUTPUT);
  pinMode(PIN_BTN_CONFIRM, INPUT_PULLUP);
  pinMode(PIN_BTN_SKIP,    INPUT_PULLUP);
  digitalWrite(PIN_BUZZER, LOW);
  digitalWrite(PIN_LED,    LOW);

  // Servo
  dispenserServo.attach(PIN_SERVO);
  closeCompartment();

  // I2C (RTC + OLED share same bus)
  Wire.begin(21, 22);

  // OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_I2C_ADDR)) {
    Serial.println("[OLED] Init FAILED — continuing without display");
  } else {
    display.clearDisplay();
    display.display();
    displayMessage("SmartHealth Box", "Booting...", "v1.0");
    Serial.println("[OLED] OK");
  }

  // RTC
  if (!rtc.begin()) {
    Serial.println("[RTC] NOT FOUND — time-based scheduling disabled");
    displayMessage("RTC ERROR", "Check DS3231", "wiring (SDA/SCL)");
    delay(3000);
  } else {
    if (rtc.lostPower()) {
      Serial.println("[RTC] Lost power — setting time to compile time");
      rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
    }
    Serial.println("[RTC] OK");
  }

  // WiFi
  if (!connectWiFi()) {
    displayMessage("No WiFi!", "Retrying...", "Using RTC only");
    delay(5000);
  }

  // Fetch first schedule
  fetchSchedule();
  sendHeartbeat();

  lastHeartbeatMs       = millis();
  lastScheduleRefreshMs = millis();
  lastCommandPollMs     = millis();

  beep(2, 200);
  displayMessage("SmartHealth Box", "Ready!", DEVICE_ID);
  delay(1500);
  Serial.println("=== Boot complete ===");
}

// ── loop() ────────────────────────────────────────────────────────────────────

void loop() {
  unsigned long now = millis();

  // Reconnect WiFi if dropped
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Reconnecting...");
    connectWiFi();
  }

  // Heartbeat
  if (now - lastHeartbeatMs >= HEARTBEAT_INTERVAL) {
    sendHeartbeat();
    lastHeartbeatMs = now;
  }

  // Refresh schedule every hour
  if (now - lastScheduleRefreshMs >= SCHEDULE_REFRESH_MS) {
    fetchSchedule();
    lastScheduleRefreshMs = now;
  }

  // Poll for manual dispense commands
  if (now - lastCommandPollMs >= POLL_COMMANDS_MS && currentState == STATE_IDLE) {
    pollPendingCommands();
    lastCommandPollMs = now;
  }

  // State machine
  switch (currentState) {
    case STATE_IDLE:
      checkSchedule();
      updateIdleDisplay();
      // Blink LED every second
      digitalWrite(PIN_LED, (now / 1000) % 2 == 0 ? HIGH : LOW);
      break;

    case STATE_WAITING_TAKE:
      handleWaitingTake();
      break;

    case STATE_ERROR:
      displayMessage("ERROR!", "Check serial", "logs for details");
      beep(1, 100);
      delay(2000);
      currentState = STATE_IDLE;
      break;
  }

  delay(100); // 10Hz loop
}
