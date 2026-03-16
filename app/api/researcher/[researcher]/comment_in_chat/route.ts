import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { db } from "@/lib/firebase-admin";

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

// POST /api/researcher/[researcher]/comment_in_chat
export async function POST(
  req: NextRequest,
  { params }: { params: { researcher: string } }
) {
  const { researcher } = params;
  const { chat, comment } = await req.json();

  if (!chat) {
    return NextResponse.json({ error: "chat is required" }, { status: 400 });
  }
  if (!comment || !comment.trim()) {
    return NextResponse.json(
      { error: "comment must be a non-empty, non-whitespace string" },
      { status: 400 }
    );
  }

  // Fetch researcher
  const researcherRef = db.collection("User").doc(researcher);
  const researcherSnap = await researcherRef.get();
  if (!researcherSnap.exists) {
    return NextResponse.json({ error: "Researcher not found" }, { status: 404 });
  }
  const researcherData = researcherSnap.data()!;

  // Fetch the chat
  const chatRef = db.collection("Chat").doc(chat);
  const chatSnap = await chatRef.get();
  if (!chatSnap.exists) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }
  const chatData = chatSnap.data()!;
  const previousLastMessageTime: admin.firestore.Timestamp | null =
    chatData.last_message_time ?? null;

  const now = admin.firestore.Timestamp.now();

  // --- Step 1: Create the Comment ---
  const commentRef = await db.collection("Comment").add({
    chat: chatRef,
    full_name: researcherData.full_name,
    degree: researcherData.degree,
    creation_date: now,
    author: researcherRef,
    text: comment,
  });

  // --- Step 2: Add researcher to the chat's commenters list ---
  await chatRef.update({
    commenters: admin.firestore.FieldValue.arrayUnion(researcherRef),
  });

  // --- Step 3: Upsert FollowedChat for the commenter ---
  const existingFollowSnap = await db
    .collection("FollowedChat")
    .where("owner", "==", researcherRef)
    .where("chat", "==", chatRef)
    .get();

  if (existingFollowSnap.empty) {
    await db.collection("FollowedChat").add({
      creation_date: now,
      owner: researcherRef,
      chat: chatRef,
      name: "",
      last_message_seen_time: now,
      silenced: false,
    });
  } else {
    await existingFollowSnap.docs[0].ref.update({
      last_message_seen_time: now,
    });
  }

  // --- Step 4: Check if we need to send "resumed-activity" notifications ---
  if (
    previousLastMessageTime !== null &&
    now.toMillis() - previousLastMessageTime.toMillis() >= THREE_DAYS_MS
  ) {
    // Build unique set of users to notify: commenters + followers
    const commentersRefs: admin.firestore.DocumentReference[] =
      chatData.commenters ?? [];
    const followersRefs: admin.firestore.DocumentReference[] =
      chatData.followers ?? [];

    const allRefs = new Map<string, admin.firestore.DocumentReference>();
    for (const ref of [...commentersRefs, ...followersRefs]) {
      if (!allRefs.has(ref.id)) allRefs.set(ref.id, ref);
    }

    // For each user, find their FollowedChat for this chat to link in the notification
    for (const userRef of allRefs.values()) {
      const userFollowedSnap = await db
        .collection("FollowedChat")
        .where("owner", "==", userRef)
        .where("chat", "==", chatRef)
        .get();

      const followedChatRef = userFollowedSnap.empty
        ? null
        : userFollowedSnap.docs[0].ref;

      await db.collection("Notification").add({
        type: "resumed-activity",
        has_been_read: false,
        followed_chat: followedChatRef,
        user: userRef,
        creation_date: now,
      });
    }
  }

  // --- Step 5: Update last_message_time on the chat ---
  await chatRef.update({ last_message_time: now });

  return NextResponse.json({ comment_id: commentRef.id }, { status: 201 });
}