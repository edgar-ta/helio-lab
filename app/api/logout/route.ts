// app/api/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user_id")?.value;

  if (!userId) {
    return NextResponse.json(null, { status: 401 });
  }

  const userDoc = await db.collection("User").doc(userId).get();

  if (!userDoc.exists) {
    return NextResponse.json(null, { status: 401 });
  }

  cookieStore.delete("session_user_id");

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Clear-Site-Data": '"cookies"',
    },
  });
}