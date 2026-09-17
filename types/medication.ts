export interface Medication {
  id: string; // Document ID
  userId: string;
  deviceId: string;
  name: string;
  genericName?: string;
  dosage: string;
  unit: string;
  form: string;
  compartmentId: string;
  quantityRemaining: number;
  initialQuantity: number;
  lowStockThreshold: number;
  instructions: string;
  foodTiming: "BEFORE_FOOD" | "WITH_FOOD" | "AFTER_FOOD" | "ANYTIME";
  startDate?: string; // ISO String
  endDate?: string; // ISO String
  isActive: boolean;
  createdAt: string; // ISO String or Timestamp
  updatedAt: string; // ISO String or Timestamp
}

export interface MedicationSchedule {
  id: string; // Document ID
  medicationId: string;
  userId: string;
  time: string; // HH:mm format
  quantity: number;
  daysOfWeek: number[]; // 0-6, where 0 is Sunday
  startDate?: string;
  endDate?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MedicationEventStatus = 
  | "SCHEDULED" 
  | "DISPENSE_CANDIDATE" 
  | "TAKEN" 
  | "MISSED" 
  | "DISCARDED" 
  | "INVALID" 
  | "REPLACEMENT"
  | "MANUAL_CONFIRMED";

export type MedicationEventSource = "DEVICE" | "DEMO" | "MANUAL";

export interface MedicationEvent {
  id: string; // Document ID
  userId: string;
  deviceId: string;
  medicationId: string;
  compartmentId: string;
  scheduledTime: string; // ISO String
  eventTime?: string; // ISO String
  expectedQuantity: number;
  detectedQuantity?: number;
  status: MedicationEventStatus;
  source?: MedicationEventSource;
  reason?: string; // For INVALID, DISCARDED, REPLACEMENT, etc.
  createdAt: string;
}
