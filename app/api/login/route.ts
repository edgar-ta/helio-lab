import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

// POST /api/login
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "email and password are required" },
      { status: 400 }
    );
  }

  // Look up the user by email
  const snapshot = await db
    .collection("User")
    .where("email", "==", email)
    .get();

  if (snapshot.empty) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const userDoc = snapshot.docs[0];
  const userData = userDoc.data();

  // Verify the hashed password
  const passwordMatch = await bcrypt.compare(password, userData.hashed_password);
  if (!passwordMatch) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Set a secure, HttpOnly session cookie
  const cookieStore = await cookies();
  cookieStore.set("session_user_id", userDoc.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
  
  const { hashed_password, ...userLocal } = userData;

  return NextResponse.json(
    { id: userDoc.id, ...userLocal },
    {
      status: 200,
      headers: {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    }
  );
}