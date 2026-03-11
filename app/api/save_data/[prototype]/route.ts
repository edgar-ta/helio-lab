// app/api/save_data/[prototype]/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ prototype: string }> }
) {
  try {
    const { prototype: prototypeId } = await params;
    const body = await request.json();

    const { current, voltage, irradiance, code } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Missing required field: code' },
        { status: 400 }
      );
    }
    if (current === undefined) {
      return NextResponse.json(
        { error: 'Missing required field: current' },
        { status: 400 }
      );
    }
    if (voltage === undefined) {
      return NextResponse.json(
        { error: 'Missing required field: voltage' },
        { status: 400 }
      );
    }
    if (irradiance === undefined) {
      return NextResponse.json(
        { error: 'Missing required field: irradiance' },
        { status: 400 }
      );
    }
    if (isNaN(Number(current))) {
      return NextResponse.json(
        { error: 'current must be a valid number' },
        { status: 400 }
      );
    }
    if (isNaN(Number(voltage))) {
      return NextResponse.json(
        { error: 'voltage must be a valid number' },
        { status: 400 }
      );
    }
    if (isNaN(Number(irradiance))) {
      return NextResponse.json(
        { error: 'irradiance must be a valid number' },
        { status: 400 }
      );
    }

    const prototypeRef = db.collection('Prototype').doc(prototypeId);
    const prototypeSnap = await prototypeRef.get();

    if (!prototypeSnap.exists) {
      return NextResponse.json(
        { error: 'Prototype not found' },
        { status: 404 }
      );
    }

    const prototypeData = prototypeSnap.data()!;
    if (prototypeData.code !== code) {
      return NextResponse.json(
        { error: 'Invalid code' },
        { status: 401 }
      );
    }

    const newReading = {
      date: FieldValue.serverTimestamp(),
      current: Number(current),
      voltage: Number(voltage),
      irradiance: Number(irradiance),
    };

    const readingRef = await prototypeRef.collection('readings').add(newReading);

    return NextResponse.json(
      {
        message: 'Reading saved successfully',
        reading: { id: readingRef.id, ...newReading },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error saving reading:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}