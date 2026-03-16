import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { db } from "@/lib/firebase-admin";

// POST /api/prototype/[prototype]/get_latest_data
export async function POST(
  req: NextRequest,
  { params }: { params: { prototype: string } }
) {
  
  const { prototype } = await params;
  const { latest_date } = await req.json();
  console.log(prototype);

  const prototypeRef = db.collection("Prototype").doc(prototype);
  const protoSnap = await prototypeRef.get();
  if (!protoSnap.exists) {
    return NextResponse.json({ error: "Prototype not found" }, { status: 404 });
  }

  let startTs: admin.firestore.Timestamp;
  if (latest_date) {
    // Return readings newer than the client's last known date
    startTs = admin.firestore.Timestamp.fromDate(new Date(latest_date));
  } else {
    // Default: last 24 hours
    startTs = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
  }

  const snapshot = await prototypeRef
    .collection("Reading")
    .where("date", ">=", startTs)
    .orderBy("date", "asc")
    .get();

  const readings = snapshot.docs.map((d) => ({ 
    id: d.id, 
    ...d.data(), 
    date: d.data().date.toDate() 
  }));

  return NextResponse.json({ readings }, { status: 200 });
}