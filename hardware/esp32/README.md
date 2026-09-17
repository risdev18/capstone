# SmartHealth Box - ESP32 Firmware

This directory contains the C++ firmware for the SmartHealth Box physical medication dispensing module.

## Architecture

The system uses an ESP32 microcontroller to manage:
1. **Load Cells (HX711)**: To measure the weight of each compartment and detect weight deltas (pill removal).
2. **Optical/IR Sensors**: To detect physical dispensing mechanisms passing a tablet.
3. **Servos/Steppers**: To physically dispense scheduled medicine.
4. **Wi-Fi & API**: To communicate securely with the Next.js/Firebase backend via `/api/medication-events`.

## Setup Instructions

1. Install Arduino IDE.
2. Install ESP32 board support.
3. Install required libraries: `HX711`, `ArduinoJson`, etc.
4. Do NOT commit sensitive Wi-Fi credentials or device tokens. Use `config.h` (git-ignored) or a captive portal.
5. Compile and flash `smarthealthbox.ino` to your ESP32.

## State Machine
The firmware follows this core event loop:
`IDLE -> SCHEDULED -> DISPENSING -> TABLET_DETECTED -> WEIGHT_VERIFIED -> DISPENSE_CANDIDATE -> BACKEND_CONFIRMATION`
