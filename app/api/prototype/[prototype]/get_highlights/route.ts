import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { db } from "@/lib/firebase-admin";

// POST /api/prototype/[prototype]/get_highlights
export async function POST(
  req: NextRequest,
  { params }: { params: { prototype: string } }
) {
  const { prototype } = await params;
  const { latest_date } = await req.json();

  const prototypeSnap = await db.collection("Prototype").doc(prototype).get();
  if (!prototypeSnap.exists) {
    return NextResponse.json({ error: "Prototype not found" }, { status: 404 });
  }

  // ── 1. Find all chats associated with this prototype ─────────────────────

  const prototypeRef = db.collection("Prototype").doc(prototype);

  let chatsQuery = db
    .collection("Chat")
    .where("prototype", "==", prototypeRef) as admin.firestore.Query;

  const chatsSnap = await chatsQuery.get();

  if (chatsSnap.empty) {
    return NextResponse.json({ highlights: [] }, { status: 200 });
  }

  const latestTs = latest_date
    ? admin.firestore.Timestamp.fromDate(new Date(latest_date))
    : null;

  // ── 2. For each chat, fetch its first_comment and check for a highlight ──

  const results = await Promise.all(
    chatsSnap.docs.map(async (chatDoc) => {
      const chat = chatDoc.data();
      const firstCommentRef = chat.first_comment as
        | admin.firestore.DocumentReference
        | undefined;

      if (!firstCommentRef) return null;

      const commentSnap = await firstCommentRef.get();
      if (!commentSnap.exists) return null;

      const comment = commentSnap.data()!;
      const highlightStart = comment.highlight_start as
        | admin.firestore.Timestamp
        | undefined;
      const highlightEnd = comment.highlight_end as
        | admin.firestore.Timestamp
        | undefined;

      // Skip comments that are not highlights
      if (!highlightStart || !highlightEnd) return null;

      // Skip highlights that end before or at latest_date
      if (latestTs && highlightEnd.toMillis() <= latestTs.toMillis()) return null;

      // Resolve creator profile picture
      const creatorRef = chat.creator as admin.firestore.DocumentReference;
      const creatorSnap = await creatorRef.get();
      const creatorProfilePicture =
        (creatorSnap.data()?.profile_picture as string) ?? "";

      // If highlight_start is before latest_date, clamp it to latest_date
      const effectiveStart =
        latestTs && highlightStart.toMillis() < latestTs.toMillis()
          ? latestTs
          : highlightStart;

      return {
        chat: chatDoc.id,
        creator_profile_picture: creatorProfilePicture,
        start_date: effectiveStart.toDate().toISOString(),
        end_date: highlightEnd.toDate().toISOString(),
      };
    })
  );

  const highlights = results.filter(Boolean);

  return NextResponse.json({ highlights }, { status: 200 });
}