import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { db } from "@/lib/firebase-admin";

// POST /api/researcher/[researcher]/get_followed_chats
export async function POST(
  req: NextRequest,
  { params }: { params: { researcher: string } }
) {
  const { researcher } = await params;

  const researcherRef = db.collection("User").doc(researcher);
  const researcherSnap = await researcherRef.get();
  if (!researcherSnap.exists) {
    return NextResponse.json({ error: "Researcher not found" }, { status: 404 });
  }

  const threeDaysAgo = admin.firestore.Timestamp.fromDate(
    new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  );

  // Get all chats that have had activity in the last 3 days
  const activeChatsSnap = await db
    .collection("Chat")
    .where("last_message_time", ">=", threeDaysAgo)
    .get();

  if (activeChatsSnap.empty) {
    return NextResponse.json({ followed_chats: [] }, { status: 200 });
  }

  const activeChatRefs = activeChatsSnap.docs.map((d) =>
    db.collection("Chat").doc(d.id)
  );

  // Fetch the researcher's FollowedChats that match those active chats.
  // Firestore "in" queries support up to 30 items; batch for larger sets.
  const BATCH_SIZE = 30;
  const results: Record<string, unknown>[] = [];

  for (let i = 0; i < activeChatRefs.length; i += BATCH_SIZE) {
    const batch = activeChatRefs.slice(i, i + BATCH_SIZE);
    const followedSnap = await db
      .collection("FollowedChat")
      .where("owner", "==", researcherRef)
      .where("chat", "in", batch)
      .get();

    followedSnap.docs.forEach((d) => results.push({ id: d.id, ...d.data() }));
  }

  return NextResponse.json({ followed_chats: results }, { status: 200 });
}