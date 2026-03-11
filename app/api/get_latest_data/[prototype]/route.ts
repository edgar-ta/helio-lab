// app/api/get_latest_data/[prototype]/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ prototype: string }> }
) {
  try {
    const { prototype: prototypeId } = await params;
    const body = await request.json();

    const { time_of_last_reading } = body;

    let fromDate: Date;

    if (time_of_last_reading === null || time_of_last_reading === undefined) {
      // Default to the last 3 hours if no time is provided
      fromDate = new Date();
      fromDate.setHours(fromDate.getHours() - 3);
    } else {
      const parsedDate = new Date(time_of_last_reading);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { error: 'time_of_last_reading must be a valid ISO 8601 date string' },
          { status: 400 }
        );
      }
      fromDate = parsedDate;
    }

    const prototypeRef = db.collection('Prototype').doc(prototypeId);
    const prototypeSnap = await prototypeRef.get();

    if (!prototypeSnap.exists) {
      return NextResponse.json(
        { error: 'Prototype not found' },
        { status: 404 }
      );
    }

    const readingsSnap = await prototypeRef
      .collection('readings')
      .where('date', '>', Timestamp.fromDate(fromDate))
      .get();

    const readings = readingsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ readings }, { status: 200 });

  } catch (error) {
    console.error('Error fetching readings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}