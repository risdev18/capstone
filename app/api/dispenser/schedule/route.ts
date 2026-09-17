/**
 * GET /api/dispenser/schedule?deviceId=xxx
 *
 * Called by the ESP32 on boot and every hour via RTC alarm.
 * Returns today's upcoming medication doses sorted by time.
 * The ESP32 uses this to set its internal RTC alarms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import type { Medication, MedicationSchedule } from '@/types/medication';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get('deviceId');

    if (!deviceId) {
      return NextResponse.json(
        { success: false, error: 'Missing deviceId' },
        { status: 400 }
      );
    }

    // Validate device
    const deviceSnap = await adminDb.collection('devices').doc(deviceId).get();
    if (!deviceSnap.exists) {
      return NextResponse.json({ success: false, error: 'Device not found' }, { status: 404 });
    }

    // Get active medications for this device
    const medSnap = await adminDb
      .collection('medications')
      .where('deviceId', '==', deviceId)
      .where('isActive', '==', true)
      .get();

    if (medSnap.empty) {
      return NextResponse.json({ success: true, data: { schedule: [] } });
    }

    const medications = medSnap.docs.map((d) => d.data() as Medication);
    const medIds = medications.map((m) => m.id);

    // Get schedules for these medications
    const schedSnap = await adminDb
      .collection('medicationSchedules')
      .where('medicationId', 'in', medIds)
      .where('enabled', '==', true)
      .get();

    const schedules = schedSnap.docs.map((d) => d.data() as MedicationSchedule);

    // Today's day of week (0=Sunday … 6=Saturday)
    const now = new Date();
    const todayDow = now.getDay();
    const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // Build the schedule items
    const scheduleItems = [];

    for (const sched of schedules) {
      // Only include if today is a scheduled day
      if (!sched.daysOfWeek.includes(todayDow)) continue;

      const med = medications.find((m) => m.id === sched.medicationId);
      if (!med) continue;

      // Check date range
      if (med.startDate && todayStr < med.startDate) continue;
      if (med.endDate && todayStr > med.endDate) continue;

      scheduleItems.push({
        scheduleId: sched.id,
        medicationId: med.id,
        medicationName: med.name,
        dosage: med.dosage,
        form: med.form,
        compartmentId: med.compartmentId,  // e.g. "C1" → servo index
        quantity: sched.quantity,
        time: sched.time,                  // "HH:mm" format
        foodTiming: med.foodTiming,
        instructions: med.instructions,
        quantityRemaining: med.quantityRemaining,
        lowStock: med.quantityRemaining <= med.lowStockThreshold,
      });
    }

    // Sort by time ascending
    scheduleItems.sort((a, b) => a.time.localeCompare(b.time));

    // Update device lastSeen
    await adminDb.collection('devices').doc(deviceId).update({
      lastSeen: now.toISOString(),
      status: 'ONLINE',
    });

    return NextResponse.json({
      success: true,
      data: {
        deviceId,
        date: todayStr,
        dayOfWeek: todayDow,
        schedule: scheduleItems,
        serverTime: now.toISOString(),
      },
    });
  } catch (err) {
    console.error('Dispenser schedule error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
