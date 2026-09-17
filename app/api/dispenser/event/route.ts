/**
 * POST /api/dispenser/event
 *
 * Called by the ESP32 to report medication events:
 *  - DISPENSE_CANDIDATE : IR sensor detected tablet dropped
 *  - TAKEN              : User confirmed / tablet taken (button press or IR cleared)
 *  - MISSED             : Timeout elapsed, tablet not taken
 *  - DISCARDED          : Extra tablet detected (IR still triggered after take-window)
 *
 * Body:
 * {
 *   "deviceId":    "SHB-0001",
 *   "scheduleId":  "sched-abc123",
 *   "medicationId":"med-xyz",
 *   "compartmentId":"C1",
 *   "status":      "TAKEN",          // DISPENSE_CANDIDATE | TAKEN | MISSED | DISCARDED
 *   "detectedQuantity": 1,           // from IR sensor
 *   "scheduledTime": "2026-09-15T08:00:00.000Z",
 *   "eventTime":   "2026-09-15T08:01:34.000Z"
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import type { MedicationEvent, MedicationEventStatus } from '@/types/medication';
import { z } from 'zod';

const eventSchema = z.object({
  deviceId: z.string().min(1),
  scheduleId: z.string().min(1),
  medicationId: z.string().min(1),
  compartmentId: z.string().min(1),
  status: z.enum([
    'DISPENSE_CANDIDATE',
    'TAKEN',
    'MISSED',
    'DISCARDED',
    'INVALID',
    'REPLACEMENT',
  ]),
  detectedQuantity: z.number().int().min(0).optional(),
  scheduledTime: z.string(),
  eventTime: z.string().optional(),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = eventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const now = new Date().toISOString();

    // Validate device
    const deviceRef = adminDb.collection('devices').doc(data.deviceId);
    const deviceSnap = await deviceRef.get();
    if (!deviceSnap.exists) {
      return NextResponse.json({ success: false, error: 'Device not found' }, { status: 404 });
    }

    const ownerId = deviceSnap.data()?.ownerId;
    if (!ownerId) {
      return NextResponse.json(
        { success: false, error: 'Device not assigned to any user' },
        { status: 403 }
      );
    }

    // Validate medication
    const medRef = adminDb.collection('medications').doc(data.medicationId);
    const medSnap = await medRef.get();
    if (!medSnap.exists) {
      return NextResponse.json({ success: false, error: 'Medication not found' }, { status: 404 });
    }

    const med = medSnap.data();
    const batch = adminDb.batch();

    // Create the event record
    const eventRef = adminDb.collection('medicationEvents').doc();
    const eventDoc: MedicationEvent = {
      id: eventRef.id,
      userId: ownerId,
      deviceId: data.deviceId,
      medicationId: data.medicationId,
      compartmentId: data.compartmentId,
      scheduledTime: data.scheduledTime,
      eventTime: data.eventTime ?? now,
      expectedQuantity: 1,
      detectedQuantity: data.detectedQuantity,
      status: data.status as MedicationEventStatus,
      source: 'DEVICE',
      reason: data.reason,
      createdAt: now,
    };
    batch.set(eventRef, eventDoc);

    // Decrement stock when a tablet is actually dispensed
    if (
      (data.status === 'TAKEN' || data.status === 'DISPENSE_CANDIDATE' || data.status === 'REPLACEMENT') &&
      med &&
      typeof med.quantityRemaining === 'number'
    ) {
      const newQty = Math.max(0, med.quantityRemaining - (data.detectedQuantity ?? 1));
      batch.update(medRef, {
        quantityRemaining: newQty,
        updatedAt: now,
      });

      // Create low-stock alert if needed
      if (newQty <= (med.lowStockThreshold ?? 5)) {
        const alertRef = adminDb.collection('alerts').doc();
        batch.set(alertRef, {
          id: alertRef.id,
          userId: ownerId,
          deviceId: data.deviceId,
          type: 'LOW_STOCK',
          severity: newQty === 0 ? 'CRITICAL' : 'WARNING',
          metric: 'medication_stock',
          message: `${med.name} in compartment ${data.compartmentId} is ${newQty === 0 ? 'empty' : 'running low'} (${newQty} remaining).`,
          status: 'UNACKNOWLEDGED',
          createdAt: now,
        });
      }
    }

    // Update device lastSeen
    batch.update(deviceRef, { lastSeen: now, status: 'ONLINE' });

    await batch.commit();

    return NextResponse.json({ success: true, data: { eventId: eventRef.id } }, { status: 201 });
  } catch (err) {
    console.error('Dispenser event error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// ── GET /api/dispenser/event?userId=xxx&limit=50 ─────────────────────────────
// Dashboard uses this to fetch medication history

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const deviceId = searchParams.get('deviceId');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200);

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
    }

    let query = adminDb
      .collection('medicationEvents')
      .where('userId', '==', userId)
      .orderBy('scheduledTime', 'desc')
      .limit(limit);

    if (deviceId) {
      query = adminDb
        .collection('medicationEvents')
        .where('userId', '==', userId)
        .where('deviceId', '==', deviceId)
        .orderBy('scheduledTime', 'desc')
        .limit(limit) as any;
    }

    const snap = await query.get();
    const events = snap.docs.map((d) => d.data() as MedicationEvent);

    return NextResponse.json({ success: true, data: events });
  } catch (err) {
    console.error('Dispenser event GET error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
