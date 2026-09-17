import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { heartbeatSchema } from '@/lib/validation/schemas';
import type { DeviceLog } from '@/types/device';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = heartbeatSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload', details: result.error.format() },
        { status: 400 }
      );
    }

    const data = result.data;

    // Validate Device exists
    const deviceRef = adminDb.collection('devices').doc(data.deviceId);
    const deviceSnap = await deviceRef.get();

    if (!deviceSnap.exists) {
      return NextResponse.json(
        { success: false, error: 'Device not found' },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();
    
    // Update Device Document
    const updates: any = {
      lastSeen: now,
      status: 'ONLINE'
    };
    if (data.battery !== undefined) updates.batteryLevel = data.battery;
    if (data.firmware !== undefined) updates.firmwareVersion = data.firmware;
    if (data.wifiSignal !== undefined) updates.wifiSignal = data.wifiSignal;

    await deviceRef.update(updates);

    // Create a device log for the heartbeat (optional, could be noisy in prod, but good for demo)
    const logId = `log-${Date.now()}`;
    const logEntry: Omit<DeviceLog, 'id'> = {
        deviceId: data.deviceId,
        event: 'HEARTBEAT',
        details: `Battery: ${data.battery}%, Signal: ${data.wifiSignal}dBm`,
        timestamp: now
    };
    await adminDb.collection('deviceLogs').doc(logId).set(logEntry);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Heartbeat API Error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
