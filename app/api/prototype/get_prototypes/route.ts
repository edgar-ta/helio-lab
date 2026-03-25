import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";

// POST /api/prototype/get_prototypes
export async function POST(req: NextRequest) {
  const prototypesSnap = await db.collection("Prototype").get();

  const prototypes = prototypesSnap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      name: d.name as string,
      code: d.code as string,
      location: d.location as admin.firestore.GeoPoint,
      owner: (d.owner as admin.firestore.DocumentReference).id,
    };
  });

  return NextResponse.json({ prototypes }, { status: 200 });
}