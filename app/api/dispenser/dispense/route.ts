/**
 * POST /api/dispenser/dispense
 *
 * Called by the DASHBOARD to manually trigger dispensing from the web UI.
 * The ESP32 polls GET /api/dispenser/schedule and acts on time — 
 * but this endpoint creates a "PENDING_DISPENSE" command in Firestore
 * that the ESP32 picks up on its next heartbeat cycle.
 *
 * Body: { "deviceId": "SHB-0001", "compartmentId": "C1", "requestedBy": "userId" }
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { z } from 'zod';

const dispenseSchema = z.object({
  deviceId: z.string().min(1),
  compartmentId: z.string().regex(/^C[1-8]$/, 'compartmentId must be C1–C8'),
  requestedBy: z.string().min(1),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = dispenseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { deviceId, compartmentId, requestedBy, reason } = parsed.data;
    const now = new Date().toISOString();

    // Validate device
    const deviceSnap = await adminDb.collection('devices').doc(deviceId).get();
    if (!deviceSnap.exists) {
      return NextResponse.json({ success: false, error: 'Device not found' }, { status: 404 });
    }

    if (deviceSnap.data()?.status === 'OFFLINE') {
      return NextResponse.json(
        { success: false, error: 'Device is offline — cannot send command' },
        { status: 503 }
      );
    }

    // Write a pending command that the ESP32 reads on next heartbeat
    const cmdRef = adminDb.collection('pendingCommands').doc();
    await cmdRef.set({
      id: cmdRef.id,
      deviceId,
      type: 'DISPENSE',
      payload: { compartmentId },
      requestedBy,
      reason: reason ?? 'Manual dispense from dashboard',
      status: 'PENDING',   // ESP32 changes to ACKNOWLEDGED when done
      createdAt: now,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min TTL
    });

    return NextResponse.json({
      success: true,
      data: { commandId: cmdRef.id, message: `Dispense command sent to ${deviceId}` },
    });
  } catch (err) {
    console.error('Dispense command error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// ── GET /api/dispenser/dispense?deviceId=xxx ──────────────────────────────────
// ESP32 polls this on each heartbeat to check for pending commands

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get('deviceId');

    if (!deviceId) {
      return NextResponse.json({ success: false, error: 'Missing deviceId' }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Get pending, non-expired commands for this device
    const snap = await adminDb
      .collection('pendingCommands')
      .where('deviceId', '==', deviceId)
      .where('status', '==', 'PENDING')
      .get();

    const commands = snap.docs
      .map((d) => d.data())
      .filter((cmd) => cmd.expiresAt > now); // Filter expired in memory

    return NextResponse.json({ success: true, data: { commands } });
  } catch (err) {
    console.error('Dispense poll error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// ── PATCH /api/dispenser/dispense?commandId=xxx ───────────────────────────────
// ESP32 calls this to acknowledge a command it has executed

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commandId = searchParams.get('commandId');

    if (!commandId) {
      return NextResponse.json({ success: false, error: 'Missing commandId' }, { status: 400 });
    }

    const { status } = await req.json(); // 'ACKNOWLEDGED' | 'FAILED'

    await adminDb.collection('pendingCommands').doc(commandId).update({
      status: status ?? 'ACKNOWLEDGED',
      acknowledgedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Dispense ack error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
