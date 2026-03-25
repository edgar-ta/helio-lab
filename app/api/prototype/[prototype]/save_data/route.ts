import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { db } from "@/lib/firebase-admin";

const BACKDATING_CODE = "abc123";

// POST /api/prototype/[prototype]/save_data
export async function POST(
  req: NextRequest,
  { params }: { params: { prototype: string } }
) {
  const { prototype } = await params;
  const { current, voltage, irradiance, code, save_time, save_time_code } = await req.json();

  if (current === undefined || voltage === undefined || irradiance === undefined) {
    return NextResponse.json(
      { error: "current, voltage, and irradiance are required" },
      { status: 400 }
    );
  }
  if (!code) {
    return NextResponse.json(
      { error: "authorization code is required" },
      { status: 400 }
    );
  }

  // Fetch the prototype and verify the authorization code
  const prototypeRef = db.collection("Prototype").doc(prototype);
  const protoSnap = await prototypeRef.get();
  if (!protoSnap.exists) {
    return NextResponse.json({ error: "Prototype not found" }, { status: 404 });
  }

  const protoData = protoSnap.data()!;
  if (protoData.code !== code) {
    return NextResponse.json(
      { error: "Invalid authorization code" },
      { status: 403 }
    );
  }

  // Resolve the timestamp to store
  let date: admin.firestore.Timestamp;

  if (save_time && save_time_code === BACKDATING_CODE) {
    const parsed = new Date(save_time);
    if (isNaN(parsed.getTime())) {
      return NextResponse.json(
        { error: "save_time is not a valid ISO 8601 date string" },
        { status: 400 }
      );
    }
    date = admin.firestore.Timestamp.fromDate(parsed);
  } else {
    date = admin.firestore.Timestamp.now();
  }

  // Save the new reading to the prototype's Reading subcollection
  const newReading = await prototypeRef.collection("Reading").add({
    date,
    current: Number(current),
    voltage: Number(voltage),
    irradiance: Number(irradiance),
  });

  return NextResponse.json({ reading_id: newReading.id }, { status: 201 });
}