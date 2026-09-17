import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import type { Medication, MedicationSchedule } from '@/types/medication';
import { z } from 'zod';

// ── Validation Schema ──────────────────────────────────────────────────────────

const medicationSchema = z.object({
  userId: z.string().min(1),
  deviceId: z.string().min(1),
  name: z.string().min(1).max(100),
  genericName: z.string().optional(),
  dosage: z.string().min(1),
  unit: z.string().min(1),
  form: z.enum(['TABLET', 'CAPSULE', 'LIQUID', 'INJECTION', 'OTHER']),
  compartmentId: z.string().min(1),       // e.g. "C1" through "C8"
  quantityRemaining: z.number().int().min(0),
  initialQuantity: z.number().int().min(1),
  lowStockThreshold: z.number().int().min(1).default(5),
  instructions: z.string().default(''),
  foodTiming: z.enum(['BEFORE_FOOD', 'WITH_FOOD', 'AFTER_FOOD', 'ANYTIME']).default('ANYTIME'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  schedules: z
    .array(
      z.object({
        time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:mm'),
        quantity: z.number().int().min(1).default(1),
        daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1),
        enabled: z.boolean().default(true),
      })
    )
    .optional(),
});

// ── POST /api/medications ──────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = medicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const now = new Date().toISOString();

    // Check device exists
    const deviceSnap = await adminDb.collection('devices').doc(data.deviceId).get();
    if (!deviceSnap.exists) {
      return NextResponse.json(
        { success: false, error: 'Device not found' },
        { status: 404 }
      );
    }

    // Check compartment not already in use by an active medication
    const existingSnap = await adminDb
      .collection('medications')
      .where('deviceId', '==', data.deviceId)
      .where('compartmentId', '==', data.compartmentId)
      .where('isActive', '==', true)
      .get();

    if (!existingSnap.empty) {
      return NextResponse.json(
        { success: false, error: `Compartment ${data.compartmentId} is already in use` },
        { status: 409 }
      );
    }

    const batch = adminDb.batch();

    // Create medication document
    const medRef = adminDb.collection('medications').doc();
    const medicationData: Medication = {
      id: medRef.id,
      userId: data.userId,
      deviceId: data.deviceId,
      name: data.name,
      genericName: data.genericName,
      dosage: data.dosage,
      unit: data.unit,
      form: data.form,
      compartmentId: data.compartmentId,
      quantityRemaining: data.quantityRemaining,
      initialQuantity: data.initialQuantity,
      lowStockThreshold: data.lowStockThreshold,
      instructions: data.instructions,
      foodTiming: data.foodTiming,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    batch.set(medRef, medicationData);

    // Create schedule documents
    const createdSchedules: MedicationSchedule[] = [];
    for (const sched of data.schedules ?? []) {
      const schedRef = adminDb.collection('medicationSchedules').doc();
      const schedDoc: MedicationSchedule = {
        id: schedRef.id,
        medicationId: medRef.id,
        userId: data.userId,
        time: sched.time,
        quantity: sched.quantity,
        daysOfWeek: sched.daysOfWeek,
        enabled: sched.enabled,
        createdAt: now,
        updatedAt: now,
      };
      batch.set(schedRef, schedDoc);
      createdSchedules.push(schedDoc);
    }

    await batch.commit();

    return NextResponse.json(
      { success: true, data: { medication: medicationData, schedules: createdSchedules } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating medication:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// ── GET /api/medications?userId=xxx ───────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const deviceId = searchParams.get('deviceId');
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId query parameter' },
        { status: 400 }
      );
    }

    let query = adminDb.collection('medications').where('userId', '==', userId);
    if (deviceId) query = query.where('deviceId', '==', deviceId) as any;
    if (activeOnly) query = query.where('isActive', '==', true) as any;

    const snapshot = await query.get();
    const medications = snapshot.docs.map((doc) => doc.data() as Medication);

    // Fetch schedules for each medication
    const schedSnap = await adminDb
      .collection('medicationSchedules')
      .where('userId', '==', userId)
      .get();

    const schedules = schedSnap.docs.map((d) => d.data() as MedicationSchedule);

    return NextResponse.json({ success: true, data: { medications, schedules } });
  } catch (error) {
    console.error('Error fetching medications:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// ── PATCH /api/medications?id=xxx ─────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    }

    const body = await req.json();
    const now = new Date().toISOString();

    await adminDb.collection('medications').doc(id).update({ ...body, updatedAt: now });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating medication:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// ── DELETE /api/medications?id=xxx ────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    }

    const now = new Date().toISOString();
    // Soft delete — keep history
    await adminDb.collection('medications').doc(id).update({ isActive: false, updatedAt: now });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting medication:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
