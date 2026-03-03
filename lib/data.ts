import type {
  User,
  Prototype,
  Reading,
  Comment,
  Chat,
  FollowedChat,
  Notification,
  Connection,
} from "./types"
import {
  USERS,
  PROTOTYPES,
  READINGS,
  COMMENTS,
  CHATS,
  FOLLOWED_CHATS,
  NOTIFICATIONS,
  CONNECTIONS,
} from "./mock-data"

// In-memory mutable copies for mock mutations
let comments = [...COMMENTS]
let chats = [...CHATS]
let followedChats = [...FOLLOWED_CHATS]
let notifications = [...NOTIFICATIONS]
let connections = [...CONNECTIONS]
let users = [...USERS]

// ── Read operations ────────────────────────────────────────────────

export async function authenticateUser(
  email: string,
  password: string
): Promise<User | null> {
  const user = users.find((u) => u.email === email && u.password === password)
  return user ?? null
}

export async function getUser(userId: string): Promise<User | null> {
  return users.find((u) => u.id === userId) ?? null
}

export async function getAllUsers(): Promise<User[]> {
  return users
}

export async function getPrototype(
  prototypeId: string
): Promise<Prototype | null> {
  return PROTOTYPES.find((p) => p.id === prototypeId) ?? null
}

export async function getPrototypes(): Promise<Prototype[]> {
  return PROTOTYPES
}

export async function getReadings(prototypeId: string): Promise<Reading[]> {
  return READINGS.filter((r) => r.prototypeId === prototypeId)
}

export async function getComments(prototypeId?: string): Promise<Comment[]> {
  if (prototypeId) {
    return comments.filter((c) => c.prototype === prototypeId)
  }
  return comments
}

export async function getChatMessages(chatId: string): Promise<Comment[]> {
  return comments.filter((c) => c.chat === chatId)
}

export async function getChat(chatId: string): Promise<Chat | null> {
  return chats.find((c) => c.id === chatId) ?? null
}

export async function getFollowedChats(
  userId: string
): Promise<FollowedChat[]> {
  return followedChats.filter((fc) => fc.owner === userId)
}

export async function getNotifications(
  userId: string
): Promise<Notification[]> {
  // In a real app, notifications would be filtered by userId
  return notifications
}

export async function getConnections(userId: string): Promise<Connection[]> {
  return connections.filter((c) => c.owner === userId)
}

// ── Write operations ───────────────────────────────────────────────

export async function addComment(
  comment: Omit<Comment, "id">
): Promise<Comment> {
  const newComment: Comment = {
    ...comment,
    id: `cm${Date.now()}`,
  }
  comments = [newComment, ...comments]

  // Automatically create a chat for this comment if it references a new chat
  const existingChat = chats.find((c) => c.id === comment.chat)
  if (!existingChat) {
    const newChat: Chat = {
      id: comment.chat,
      creation_date: comment.creation_date,
      creator: comment.author,
      participants: [comment.author],
    }
    chats = [...chats, newChat]
  }

  return newComment
}

export async function addChatMessage(
  chatId: string,
  message: Omit<Comment, "id" | "chat">
): Promise<Comment> {
  const newMessage: Comment = {
    ...message,
    id: `cm${Date.now()}`,
    chat: chatId,
  }
  comments = [...comments, newMessage]

  // Add participant if not already present
  chats = chats.map((c) => {
    if (c.id === chatId && !c.participants.includes(message.author)) {
      return { ...c, participants: [...c.participants, message.author] }
    }
    return c
  })

  return newMessage
}

export async function addConnection(
  conn: Omit<Connection, "id">
): Promise<Connection> {
  const newConn: Connection = {
    ...conn,
    id: `cn${Date.now()}`,
  }
  connections = [...connections, newConn]
  return newConn
}

export async function removeConnection(connId: string): Promise<void> {
  connections = connections.filter((c) => c.id !== connId)
}

export async function updateUserProfile(
  userId: string,
  data: Partial<User>
): Promise<User | null> {
  users = users.map((u) => (u.id === userId ? { ...u, ...data } : u))
  return users.find((u) => u.id === userId) ?? null
}

export async function followChat(
  userId: string,
  chatId: string,
  name: string
): Promise<FollowedChat> {
  const fc: FollowedChat = {
    id: `fc${Date.now()}`,
    creation_date: new Date().toISOString(),
    index: followedChats.filter((f) => f.owner === userId).length,
    owner: userId,
    chat: chatId,
    last_seen_message_time: new Date().toISOString(),
    last_message_time: new Date().toISOString(),
    silenced: false,
    name,
  }
  followedChats = [...followedChats, fc]
  return fc
}

export async function unfollowChat(
  userId: string,
  chatId: string
): Promise<void> {
  followedChats = followedChats.filter(
    (fc) => !(fc.owner === userId && fc.chat === chatId)
  )
}

export async function markNotificationRead(notifId: string): Promise<void> {
  notifications = notifications.map((n) =>
    n.id === notifId ? { ...n, has_been_read: true } : n
  )
}

export async function markAllNotificationsRead(): Promise<void> {
  notifications = notifications.map((n) => ({ ...n, has_been_read: true }))
}
