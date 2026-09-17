export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'CARETAKER' | 'USER';

export type UserStatus = 'ACTIVE' | 'DISABLED';

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  dateOfBirth?: string; // ISO date string
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  emergencyContact?: EmergencyContact;
  height?: number; // cm
  weight?: number; // kg
  bloodGroup?: string;
  assignedDeviceId?: string | null;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface UserSummary {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  assignedDeviceId?: string | null;
  lastLogin?: string;
  createdAt: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  CARETAKER: 'Caretaker',
  USER: 'User',
};

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  USER: 1,
  CARETAKER: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
