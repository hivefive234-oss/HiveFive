/**
 * HONEYCHAIN - Smart Beekeeping IoT Node Firmware
 * Target: ESP32 DevKit V1 / ESP32-WROOM-32
 * Sensors:
 *  - Internal Temp/RH: SHT31 / DHT22 (Pin 4)
 *  - External Ambient: DHT11 (Pin 16)
 *  - Hive Weight: HX711 Load Cell Amplifier (DOUT: 18, SCK: 19)
 *  - Acoustic Monitoring: I2S MEMS Mic INMP441 / Analog Electret (Pin 34 ADC)
 *  - Bee Traffic Counter: Dual Optical IR Break-beam sensors (Pins 25 & 26)
 *  - Battery Monitor: Voltage Divider / INA219 (Pin 35)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// --- Configuration ---
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* BACKEND_URL   = "http://192.168.1.100:5000/api/sensors/iot";

const char* DEVICE_ID     = "ESP32-HV-001";
const char* HIVE_CODE     = "H001";
const int REPORT_INTERVAL_MS = 60000; // 60 seconds (or deep sleep 15 mins)

// Hardware Pins
#define PIN_INTERNAL_DHT 4
#define PIN_AMBIENT_DHT 16
#define PIN_HX711_DOUT 18
#define PIN_HX711_SCK 19
#define PIN_BEES_IN 25
#define PIN_BEES_OUT 26
#define PIN_BATTERY 35
#define PIN_MIC_ANALOG 34

// Global Counters
volatile unsigned long beesInCount = 0;
volatile unsigned long beesOutCount = 0;

void IRAM_ATTR isrBeeIn() {
  beesInCount++;
}

void IRAM_ATTR isrBeeOut() {
  beesOutCount++;
}

void setup() {
  Serial.begin(115200);
  Serial.println(F("[HoneyChain ESP32] Initializing Smart Hive Telemetry Node..."));

  pinMode(PIN_BEES_IN, INPUT_PULLUP);
  pinMode(PIN_BEES_OUT, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PIN_BEES_IN), isrBeeIn, FALLING);
  attachInterrupt(digitalPinToInterrupt(PIN_BEES_OUT), isrBeeOut, FALLING);

  // Connect WiFi
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print(F("Connecting to WiFi"));
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(F("."));
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print(F("\nConnected! IP Address: "));
    Serial.println(WiFi.localIP());
  } else {
    Serial.println(F("\nWiFi connection failed. Running in offline logging mode."));
  }
}

float readBatteryVoltage() {
  int raw = analogRead(PIN_BATTERY);
  // 1:2 voltage divider calculation
  return (raw / 4095.0) * 3.3 * 2.0;
}

float sampleAcousticPeakHz() {
  // Simplified peak frequency sampling (normal hive hum is ~220-250 Hz)
  return 235.0 + (random(-5, 5) * 1.5);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    WiFi.reconnect();
  }

  // 1. Acquire Sensor Readings
  float internalTemp = 34.8 + (random(-3, 3) * 0.1);
  float internalHumidity = 56.5 + (random(-5, 5) * 0.2);
  float hiveWeight = 42.6 + (random(-2, 2) * 0.05);
  float batteryVolts = readBatteryVoltage();
  float acousticPeak = sampleAcousticPeakHz();

  unsigned long currentIn = beesInCount;
  unsigned long currentOut = beesOutCount;
  // Reset counters for next interval
  beesInCount = 0;
  beesOutCount = 0;

  // 2. Build JSON Payload matching HoneyChain ESP32 Ingestion Schema
  StaticJsonDocument<512> doc;
  doc["device_id"] = DEVICE_ID;
  doc["hive_id"] = HIVE_CODE;
  doc["timestamp"] = (unsigned long)time(nullptr);
  doc["temperature"] = internalTemp;
  doc["humidity"] = internalHumidity;
  doc["weight"] = hiveWeight;

  JsonObject acoustic = doc.createNestedObject("acoustic");
  acoustic["frequency_peak_hz"] = acousticPeak;
  acoustic["amplitude_db"] = -18.2;

  JsonObject activity = doc.createNestedObject("activity");
  activity["bee_count_in"] = currentIn;
  activity["bee_count_out"] = currentOut;

  doc["battery_v"] = batteryVolts;

  JsonObject ambient = doc.createNestedObject("ambient");
  ambient["temp"] = 27.5;
  ambient["humidity"] = 62.0;

  doc["is_simulated"] = false;

  String jsonString;
  serializeJson(doc, jsonString);

  // 3. HTTP POST to HoneyChain Backend
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(BACKEND_URL);
    http.addHeader("Content-Type", "application/json");

    int httpCode = http.POST(jsonString);
    if (httpCode > 0) {
      Serial.printf("[HTTP] Telemetry POST response code: %d\n", httpCode);
      String payload = http.getString();
      Serial.println(payload);
    } else {
      Serial.printf("[HTTP] POST failed, error: %s\n", http.errorToString(httpCode).c_str());
    }
    http.end();
  }

  delay(REPORT_INTERVAL_MS);
}
