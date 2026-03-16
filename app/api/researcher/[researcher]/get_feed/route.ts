import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

const CHATS_PER_BATCH = parseInt(process.env.CHATS_PER_BATCH_OF_FEED ?? "20");

// POST /api/researcher/[researcher]/get_feed
export async function POST(
  req: NextRequest,
  { params }: { params: { researcher: string } }
) {
  const { researcher } = params;
  const { latest_chat_id } = await req.json();

  const researcherRef = db.collection("User").doc(researcher);
  const researcherSnap = await researcherRef.get();
  if (!researcherSnap.exists) {
    return NextResponse.json({ error: "Researcher not found" }, { status: 404 });
  }

  let query = db.collection("Chat").orderBy("creation_date", "desc");

  if (latest_chat_id) {
    // Get the creation_date of the reference chat for cursor-based pagination
    const latestChatSnap = await db.collection("Chat").doc(latest_chat_id).get();
    if (!latestChatSnap.exists) {
      return NextResponse.json(
        { error: "Reference chat not found" },
        { status: 404 }
      );
    }
    const latestChatDate = latestChatSnap.data()!.creation_date;

    // Fetch chats with creation_date <= latestChatDate, excluding the reference chat
    query = query.where("creation_date", "<=", latestChatDate);
  }

  const snapshot = await query.limit(CHATS_PER_BATCH + 1).get();

  const chats = snapshot.docs
    .filter((d) => d.id !== latest_chat_id)
    .slice(0, CHATS_PER_BATCH)
    .map((d) => ({ id: d.id, ...d.data() }));

  return NextResponse.json({ chats }, { status: 200 });
}