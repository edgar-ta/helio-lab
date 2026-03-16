import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

const VALID_TIMEZONES = [
  "America/Mexico_City",  // México Centro
  "America/Cancun",       // México Sureste
  "America/Chihuahua",    // México Pacífico
  "America/Tijuana",      // México Noroeste
  "Europe/Madrid",        // España
];

// POST /api/researcher/[researcher]/update_profile_data
export async function POST(
  req: NextRequest,
  { params }: { params: { researcher: string } }
) {
  const { researcher } = params;
  const { name, last_name, degree, timezone } = await req.json();

  // --- Validate each provided field ---

  if (name !== undefined && name !== null) {
    if (typeof name !== "string" || name.length < 5 || name.length > 16) {
      return NextResponse.json(
        { error: "name must be between 5 and 16 characters" },
        { status: 400 }
      );
    }
  }

  if (last_name !== undefined && last_name !== null) {
    if (typeof last_name !== "string") {
      return NextResponse.json(
        { error: "last_name must be a string" },
        { status: 400 }
      );
    }
    const words = last_name.trim().split(/\s+/);
    if (words.length < 2) {
      return NextResponse.json(
        {
          error:
            "last_name must contain at least two words (paternal and maternal surnames)",
        },
        { status: 400 }
      );
    }
    if (last_name.length < 5 || last_name.length > 32) {
      return NextResponse.json(
        { error: "last_name must be between 5 and 32 characters" },
        { status: 400 }
      );
    }
  }

  if (degree !== undefined && degree !== null) {
    if (typeof degree !== "string" || degree.length < 5 || degree.length > 128) {
      return NextResponse.json(
        { error: "degree must be between 5 and 128 characters" },
        { status: 400 }
      );
    }
  }

  if (timezone !== undefined && timezone !== null) {
    if (!VALID_TIMEZONES.includes(timezone)) {
      return NextResponse.json(
        { error: `timezone must be one of: ${VALID_TIMEZONES.join(", ")}` },
        { status: 400 }
      );
    }
  }

  // Verify the researcher exists
  const researcherRef = db.collection("User").doc(researcher);
  const researcherSnap = await researcherRef.get();
  if (!researcherSnap.exists) {
    return NextResponse.json({ error: "Researcher not found" }, { status: 404 });
  }

  // Build the update object with only the non-null provided fields
  const updates: Record<string, string> = {};
  if (name !== undefined && name !== null) updates.name = name;
  if (last_name !== undefined && last_name !== null) updates.last_name = last_name;
  if (degree !== undefined && degree !== null) updates.degree = degree;
  if (timezone !== undefined && timezone !== null) updates.timezone = timezone;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "At least one field must be provided" },
      { status: 400 }
    );
  }

  await researcherRef.update(updates);

  return new NextResponse(null, { status: 200 });
}