import { z } from 'zod';

// ─── User Schemas ────────────────────────────────────────────────────────────

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number')
      .optional()
      .or(z.literal('')),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    height: z.number().min(50).max(300).optional(),
    weight: z.number().min(1).max(500).optional(),
    bloodGroup: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ─── Reading Schemas ──────────────────────────────────────────────────────────

export const singleReadingSchema = z.object({
  metric: z.enum([
    'heart_rate',
    'spo2',
    'temperature',
    'blood_pressure_systolic',
    'blood_pressure_diastolic',
  ]),
  value: z.number().finite(),
  unit: z.string().min(1),
  timestamp: z.string().optional(),
});

export const ingestPayloadSchema = z.object({
  deviceId: z.string().min(1, 'deviceId is required'),
  token: z.string().min(1, 'token is required'),
  readings: z
    .array(singleReadingSchema)
    .min(1, 'At least one reading required')
    .max(20, 'Maximum 20 readings per request'),
});

// ─── Device Schemas ───────────────────────────────────────────────────────────

export const createDeviceSchema = z.object({
  deviceCode: z
    .string()
    .regex(/^SHB-\d{4}$/, 'Device code must be in format SHB-XXXX'),
  name: z.string().min(2).max(100),
  ownerId: z.string().optional(),
  firmwareVersion: z.string().default('1.0.0'),
});

export const heartbeatSchema = z.object({
  deviceId: z.string().min(1),
  token: z.string().min(1),
  battery: z.number().min(0).max(100).optional(),
  firmware: z.string().optional(),
  wifiSignal: z.number().optional(),
  timestamp: z.string(),
});

// ─── Threshold Schemas ────────────────────────────────────────────────────────

export const thresholdSchema = z.object({
  metric: z.enum([
    'heart_rate',
    'spo2',
    'temperature',
    'blood_pressure_systolic',
    'blood_pressure_diastolic',
  ]),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  warnMinValue: z.number().optional(),
  warnMaxValue: z.number().optional(),
  isEnabled: z.boolean().default(true),
});

// ─── Report Schemas ───────────────────────────────────────────────────────────

export const generateReportSchema = z.object({
  userId: z.string().min(1),
  deviceId: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  metrics: z
    .array(
      z.enum([
        'heart_rate',
        'spo2',
        'temperature',
        'blood_pressure_systolic',
        'blood_pressure_diastolic',
      ])
    )
    .min(1),
});

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

export function successResponse<T>(data: T, message?: string): ApiSuccess<T> {
  return { success: true, data, message };
}

export function errorResponse(error: string, details?: unknown): ApiError {
  return { success: false, error, details };
}

// ─── Reading Validation Helpers ───────────────────────────────────────────────

export const READING_BOUNDS = {
  heart_rate: { min: 20, max: 300 },
  spo2: { min: 50, max: 100 },
  temperature: { min: 30, max: 45 },
  blood_pressure_systolic: { min: 50, max: 250 },
  blood_pressure_diastolic: { min: 30, max: 150 },
} as const;

export function isReadingPhysicallyValid(
  metric: keyof typeof READING_BOUNDS,
  value: number
): boolean {
  const bounds = READING_BOUNDS[metric];
  return value >= bounds.min && value <= bounds.max;
}
