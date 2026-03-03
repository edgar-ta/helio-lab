export type Timezone = "America/Mexico_City" | "Europe/Madrid"

export interface User {
  id: string
  email: string
  password: string // mock only — will be removed with Firebase Auth
  full_name: string
  degree: string
  profile_picture: string
  last_seen_chat_time: string
  timezone: Timezone
}

export interface Prototype {
  id: string
  name: string
  location: { lat: number; lng: number }
  owner: string
}

export interface Reading {
  id: string
  prototypeId: string
  date: string
  current: number
  voltage: number
  irradiance: number
}

export interface Chat {
  id: string
  creation_date: string
  creator: string
  participants: string[]
}

export interface Comment {
  id: string
  chat: string
  full_name: string
  creation_date: string
  author: string
  degree: string
  text: string
  mentions?: Mention[]
  highlight_start?: string
  highlight_end?: string
  prototype?: string
}

export interface Mention {
  userId: string
  full_name: string
}

export interface FollowedChat {
  id: string
  creation_date: string
  index: number
  owner: string
  chat: string
  last_seen_message_time: string
  last_message_time: string
  silenced: boolean
  name: string
}

export interface Notification {
  id: string
  type: "new_comment" | "mention" | "new_reply"
  has_been_read: boolean
  saved_chat?: string
  creation_date: string
  text: string
  actor_name: string
}

export interface Connection {
  id: string
  owner: string
  name: string
  url: string
  icon: string
}
