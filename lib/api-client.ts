/**
 * CONSIDERATIONS
 * 
 * All functions must take in as a parameter an object called `parameters`,
 * which shall include the minimum number of parameters to make the
 * corresponding request to the API endpoint
 * 
 */

import type {
  User,
  Prototype,
  Reading,
  Comment,
  Chat,
  FollowedChat,
  Notification,
  Connection,
} from "./types/backend-types";
import type { ChatAsHighlight, ChatAsPost, UserLocal } from "./types/frontend-types";
import {
  USERS,
  PROTOTYPES,
  READINGS,
  COMMENTS,
  CHATS,
  FOLLOWED_CHATS,
  NOTIFICATIONS,
  CONNECTIONS,
} from "./mock-data";

// In-memory mutable copies for mock mutations
let comments = [...COMMENTS];
let chats = [...CHATS];
let followedChats = [...FOLLOWED_CHATS];
let notifications = [...NOTIFICATIONS];
let connections = [...CONNECTIONS];
let users = [...USERS];

// ── Read operations ────────────────────────────────────────────────

export async function getCurrentUser(parameters: {}): Promise<UserLocal | null> {
  try {
    const response = await fetch("/api/get_current_user", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) return null;

    return await response.json() as UserLocal;
  } catch {
    return null;
  }
}

export async function getAllUsers(): Promise<User[]> {
  return users;
}

export async function getPrototype(
  prototypeId: string,
): Promise<Prototype | null> {
  return PROTOTYPES.find((p) => p.id === prototypeId) ?? null;
}

export async function getPrototypes(): Promise<Prototype[]> {
  const res = await fetch("/api/prototype/get_prototypes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
 
  if (!res.ok) {
    throw new Error(`getPrototypes failed: ${res.status}`);
  }
 
  const data = await res.json();
  return data.prototypes as Prototype[];
}

export async function getReadings(parameters: {
  prototypeId: string;
  latestDate?: string;
}): Promise<(Omit<Reading, "date"> & { date: string })[]> {
  const response = await fetch(
    `/api/prototype/${parameters.prototypeId}/get_latest_data`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        latest_date: parameters.latestDate,
      }),
    },
  );

  if (!response.ok)
    throw new Error(`Failed to fetch readings: ${response.status}`);
  return response.json().then(function(object) {
    return object.readings;
  });
}

export async function getComments(prototypeId?: string): Promise<Comment[]> {
  return [];
}


export async function getChatMessages(chatId: string): Promise<Comment[]> {
  return comments.filter((c) => c.chat === chatId);
}

export async function getChat(chatId: string): Promise<Chat | null> {
  return chats.find((c) => c.id === chatId) ?? null;
}

export async function getConnections(userId: string): Promise<Connection[]> {
  return connections.filter((c) => c.owner === userId);
}

// ── Write operations ───────────────────────────────────────────────

export async function addConnection(
  conn: Omit<Connection, "id">,
): Promise<Connection> {
  const newConn: Connection = {
    ...conn,
    id: `cn${Date.now()}`,
  };
  connections = [...connections, newConn];
  return newConn;
}

export async function removeConnection(connId: string): Promise<void> {
  connections = connections.filter((c) => c.id !== connId);
}

export async function unfollowChat(
  userId: string,
  chatId: string,
): Promise<void> {
  followedChats = followedChats.filter(
    (fc) => !(fc.owner === userId && fc.chat === chatId),
  );
}

export async function markAllNotificationsRead(): Promise<void> {
  notifications = notifications.map((n) => ({ ...n, has_been_read: true }));
}

export async function authenticateUser(parameters: {
  email: string;
  password: string;
}): Promise<UserLocal | null> {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parameters),
  });

  if (!response.ok) return null;
  return response.json();
}

export async function addChatMessage(parameters: {
  userId: string;
  chatId: string;
  comment: string;
}): Promise<Comment> {
  const response = await fetch(
    `/api/researcher/${parameters.userId}/comment_in_chat`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat: parameters.chatId,
        comment: parameters.comment,
      }),
    },
  );

  if (!response.ok)
    throw new Error(`Failed to add message: ${response.status}`);
  return response.json();
}

export async function followChat(parameters: {
  userId: string;
  chatId: string;
  name: string;
}): Promise<FollowedChat> {
  const response = await fetch(
    `/api/researcher/${parameters.userId}/follow_chat`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat: parameters.chatId,
        name: parameters.name,
      }),
    },
  );

  if (!response.ok)
    throw new Error(`Failed to follow chat: ${response.status}`);
  return response.json();
}

export async function markNotificationRead(parameters: {
  userId: string;
  notificationId: string;
}): Promise<void> {
  const response = await fetch(
    `/api/researcher/${parameters.userId}/read_notification`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notification: parameters.notificationId }),
    },
  );

  if (!response.ok)
    throw new Error(`Failed to mark notification: ${response.status}`);
}

export async function getNotifications(parameters: {
  userId: string;
}): Promise<Notification[]> {
  const response = await fetch(
    `/api/researcher/${parameters.userId}/get_notifications`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    },
  );

  if (!response.ok)
    throw new Error(`Failed to fetch notifications: ${response.status}`);
  return response.json().then(function(object) {
    return object.notifications;
  });
}

export async function getFollowedChats(parameters: {
  userId: string;
}): Promise<FollowedChat[]> {
  const response = await fetch(
    `/api/researcher/${parameters.userId}/get_followed_chats`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    },
  );

  if (!response.ok)
    throw new Error(`Failed to fetch followed chats: ${response.status}`);
  const data = await response.json();
  return data.followed_chats as FollowedChat[];
}

export async function updateUserProfile(parameters: {
  userId: string;
  name?: string;
  last_name?: string;
  degree?: string;
  timezone?: string;
}): Promise<User | null> {
  const { userId, ...body } = parameters;
  const response = await fetch(`/api/researcher/${userId}/update_profile_data`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok)
    throw new Error(`Failed to update profile: ${response.status}`);
  return response.json();
}

export async function addComment(parameters: {
  userId: string;
  prototypeId: string;
  startDate: string;
  endDate: string;
  comment: string;
}): Promise<Comment> {
  const response = await fetch(
    `/api/researcher/${parameters.userId}/comment_outside_chat`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prototype: parameters.prototypeId,
        start_date: parameters.startDate,
        end_date: parameters.endDate,
        comment: parameters.comment,
      }),
    },
  );

  if (!response.ok)
    throw new Error(`Failed to add comment: ${response.status}`);
  return response.json();
}

export async function getFeed(parameters: {
  researcherId: string,
  latestChatId?: string
}): Promise<ChatAsPost[]> {
  const { researcherId, latestChatId } = parameters;

  const res = await fetch(`/api/researcher/${researcherId}/get_feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latest_chat_id: latestChatId ?? null }),
  });

  if (!res.ok) {
    throw new Error(`getFeed failed: ${res.status}`);
  }

  const data = await res.json();
  return data.chats.map((c: any) => ({
    ...c,
    creation_date: new Date(c.creation_date),
    readings: c.readings.map((r: any) => ({
      ...r,
      date: new Date(r.date),
    })),
  })) as ChatAsPost[];
}

export async function getHighlights(parameters: {
  prototypeId: string
  latestDate?: Date
}): Promise<ChatAsHighlight[]> {
  const res = await fetch(`/api/prototype/${parameters.prototypeId}/get_highlights`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latest_date: parameters.latestDate?.toISOString() ?? null }),
  })

  if (!res.ok) {
    throw new Error(`getHighlights failed: ${res.status}`)
  }

  const data = await res.json()
  return data.highlights.map((h: any) => ({
    ...h,
    start_date: new Date(h.start_date),
    end_date: new Date(h.end_date),
  })) as ChatAsHighlight[]
}