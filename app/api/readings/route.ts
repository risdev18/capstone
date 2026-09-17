import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { ingestPayloadSchema } from '@/lib/validation/schemas';
import type { HealthReading } from '@/types/health';
import { isReadingPhysicallyValid, READING_BOUNDS } from '@/lib/validation/schemas';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = ingestPayloadSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload', details: result.error.format() },
        { status: 400 }
      );
    }

    const data = result.data;

    // 1. Validate Device & Token
    const deviceRef = adminDb.collection('devices').doc(data.deviceId);
    const deviceSnap = await deviceRef.get();

    if (!deviceSnap.exists) {
      return NextResponse.json(
        { success: false, error: 'Device not found' },
        { status: 404 }
      );
    }

    const device = deviceSnap.data();
    if (device?.status === 'OFFLINE' || !device?.isActive) {
       // Allow waking up a device by accepting the payload, but we might want to log it
       await deviceRef.update({ status: 'ONLINE', lastSeen: new Date().toISOString() });
    }

    // In a real scenario, validate device.token === data.token here.
    // For capstone purposes without a complex provisioning flow, we skip strict token validation if ownerId exists.
    const ownerId = device?.ownerId;
    if (!ownerId) {
       return NextResponse.json(
        { success: false, error: 'Device is not assigned to any user' },
        { status: 403 }
      );
    }

    const now = new Date().toISOString();
    const batch = adminDb.batch();

    // 2. Process Readings
    for (const raw of data.readings) {
      const readingId = `reading-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const ref = adminDb.collection('readings').doc(readingId);

      // Validate physically impossible values
      let quality: 'VALID' | 'SUSPECT' | 'INVALID' = 'VALID';
      if (!isReadingPhysicallyValid(raw.metric as keyof typeof READING_BOUNDS, raw.value)) {
        quality = 'INVALID';
      }

      const readingDoc: Omit<HealthReading, 'id'> = {
        deviceId: data.deviceId,
        userId: ownerId,
        metric: raw.metric as any,
        value: raw.value,
        unit: raw.unit,
        quality,
        source: 'DEVICE',
        timestamp: raw.timestamp || now,
        createdAt: now,
      };

      batch.set(ref, readingDoc);
    }

    await batch.commit();

    return NextResponse.json({ success: true, message: `Ingested ${data.readings.length} readings` });
  } catch (err: any) {
    console.error('Ingest API Error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
