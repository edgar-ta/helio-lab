import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { db } from "@/lib/firebase-admin";

// POST /api/researcher/[researcher]/comment_outside_chat
export async function POST(
  req: NextRequest,
  { params }: { params: { researcher: string } }
) {
  const { researcher } = params;
  const { prototype, start_date, end_date, comment } = await req.json();

  if (!comment || !comment.trim()) {
    return NextResponse.json(
      { error: "comment must be a non-empty string" },
      { status: 400 }
    );
  }

  // Fetch researcher data to embed full_name and degree in the comment
  const researcherRef = db.collection("User").doc(researcher);
  const researcherSnap = await researcherRef.get();
  if (!researcherSnap.exists) {
    return NextResponse.json({ error: "Researcher not found" }, { status: 404 });
  }
  const researcherData = researcherSnap.data()!;

  // --- Step 1: Create the Chat ---
  const now = admin.firestore.Timestamp.now();

  const newChatData: Record<string, unknown> = {
    creation_date: now,
    last_message_time: now,
    creator: researcherRef,
    commenters: [researcherRef],
    followers: [],
  };

  // Optionally attach prototype readings snapshot to the chat
  let readingsToClone: Record<string, unknown>[] = [];
  if (prototype && start_date && end_date) {
    const prototypeRef = db.collection("Prototype").doc(prototype);
    const protoSnap = await prototypeRef.get();
    if (!protoSnap.exists) {
      return NextResponse.json({ error: "Prototype not found" }, { status: 404 });
    }

    const startTs = admin.firestore.Timestamp.fromDate(new Date(start_date));
    const endTs = admin.firestore.Timestamp.fromDate(new Date(end_date));

    // Query readings from the prototype's Reading subcollection within the date range
    const readingsSnap = await prototypeRef
      .collection("Reading")
      .where("date", ">=", startTs)
      .where("date", "<=", endTs)
      .orderBy("date", "asc")
      .get();

    readingsToClone = readingsSnap.docs.map((d) => d.data());
    newChatData.prototype = prototypeRef;
  }

  const chatDocRef = await db.collection("Chat").add(newChatData);

  // Clone readings into the new chat's Reading subcollection
  for (const reading of readingsToClone) {
    await chatDocRef.collection("Reading").add(reading);
  }

  // --- Step 2: Create the Comment ---
  const highlightStart = start_date
    ? admin.firestore.Timestamp.fromDate(new Date(start_date))
    : null;
  const highlightEnd = end_date
    ? admin.firestore.Timestamp.fromDate(new Date(end_date))
    : null;

  const commentData: Record<string, unknown> = {
    chat: chatDocRef,
    full_name: researcherData.full_name,
    degree: researcherData.degree,
    creation_date: now,
    author: researcherRef,
    text: comment,
  };
  if (highlightStart) commentData.highlight_start = highlightStart;
  if (highlightEnd) commentData.highlight_end = highlightEnd;

  await db.collection("Comment").add(commentData);

  // --- Step 3: Create a FollowedChat for the commenter ---
  await db.collection("FollowedChat").add({
    creation_date: now,
    owner: researcherRef,
    chat: chatDocRef,
    name: "",
    last_message_seen_time: now,
    silenced: false,
  });

  return NextResponse.json({ chat_id: chatDocRef.id }, { status: 201 });
}