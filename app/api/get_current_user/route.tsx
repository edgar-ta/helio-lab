// app/api/current_user/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function POST() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user_id")?.value;

  if (!userId) {
    return NextResponse.json(null, { status: 401 });
  }

  const userDoc = await db.collection("User").doc(userId).get();

  if (!userDoc.exists) {
    return NextResponse.json(null, { status: 401 });
  }

  const { hashed_password, ...userLocal } = userDoc.data()!;
  return NextResponse.json({ id: userDoc.id, ...userLocal });
}