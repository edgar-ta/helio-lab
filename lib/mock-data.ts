import type {
  User,
  Admin,
  Prototype,
  Reading,
  Chat,
  Comment,
  FollowedChat,
  Notification,
  Connection,
} from "@/lib/types"

// ─────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────

export const USERS: User[] = [
  {
    id: "user-1",
    name: "Valentina",
    last_name: "Reyes Morales",
    hashed_password: "$2b$10$mockhashedpassword1",
    role: "researcher",
    email: "valentina.reyes@heliolab.mx",
    degree: "Dra. en Ingeniería Solar",
    profile_picture: "https://api.dicebear.com/9.x/avataaars/svg?seed=valentina",
    last_chat_seen_time: new Date("2026-03-15T18:00:00"),
    last_interaction_time: new Date("2026-03-15T20:30:00"),
    timezone: "America/Mexico_City",
  },
  {
    id: "user-2",
    name: "Rodrigo",
    last_name: "Figueroa Castro",
    hashed_password: "$2b$10$mockhashedpassword2",
    role: "researcher",
    email: "rodrigo.figueroa@heliolab.mx",
    degree: "M.C. en Energías Renovables",
    profile_picture: "https://api.dicebear.com/9.x/avataaars/svg?seed=rodrigo",
    last_chat_seen_time: new Date("2026-03-15T17:00:00"),
    last_interaction_time: new Date("2026-03-15T19:45:00"),
    timezone: "America/Mexico_City",
  },
  {
    id: "user-3",
    name: "Sofía",
    last_name: "Mendoza Ruiz",
    hashed_password: "$2b$10$mockhashedpassword3",
    role: "researcher",
    email: "sofia.mendoza@heliolab.mx",
    degree: "Ing. en Sistemas Fotovoltaicos",
    profile_picture: "https://api.dicebear.com/9.x/avataaars/svg?seed=sofia",
    last_chat_seen_time: new Date("2026-03-14T22:00:00"),
    last_interaction_time: new Date("2026-03-15T09:10:00"),
    timezone: "America/Mexico_City",
  },
]

// ─────────────────────────────────────────────
// Admins
// ─────────────────────────────────────────────

export const ADMINS: Admin[] = [
  {
    id: "admin-1",
    name: "Carlos",
    last_name: "Ortega Vega",
    hashed_password: "$2b$10$mockhashedpassword_admin1",
    role: "admin",
  },
]

// ─────────────────────────────────────────────
// Readings (subtable of Prototype)
// ─────────────────────────────────────────────

export const READINGS: Reading[] = Array.from({ length: 48 }, (_, i) => ({
  id: `reading-${i + 1}`,
  date: new Date(Date.now() - (47 - i) * 30 * 60 * 1000), // every 30 min, last 24 h
  current: parseFloat((5 + Math.sin(i / 4) * 2 + Math.random() * 0.5).toFixed(2)),
  voltage: parseFloat((220 + Math.cos(i / 5) * 10 + Math.random() * 2).toFixed(2)),
  irradiance: parseFloat((600 + Math.sin(i / 3) * 200 + Math.random() * 30).toFixed(2)),
}))

// ─────────────────────────────────────────────
// Prototypes
// ─────────────────────────────────────────────

export const PROTOTYPES: Prototype[] = [
  {
    id: "TVcXS3QLvugbY6AYMcUk",
    name: "Prototipo Alfa — Azotea Sur",
    code: "AUTH-CODE-ALFA",
    location: { latitude: 20.5888, longitude: -100.3899 }, // Querétaro
    owner: "user-1",
    readings: READINGS,
  },
  {
    id: "prototype-2",
    name: "Prototipo Beta — Campo Norte",
    code: "AUTH-CODE-BETA",
    location: { latitude: 20.6024, longitude: -100.4012 },
    owner: "user-2",
    readings: [],
  },
]

// ─────────────────────────────────────────────
// Chats
// ─────────────────────────────────────────────

export const CHATS: Chat[] = [
  {
    id: "chat-1",
    creation_date: new Date("2026-03-15T10:00:00"),
    last_message_time: new Date("2026-03-15T10:45:00"),
    creator: "user-1",
    first_comment: "comment-1",
    readings: READINGS.slice(0, 6), // snapshot copied at comment time
    commenters: ["user-1", "user-2"],
    followers: ["user-3"],
  },
  {
    id: "chat-2",
    creation_date: new Date("2026-03-14T14:30:00"),
    last_message_time: new Date("2026-03-14T15:10:00"),
    creator: "user-2",
    first_comment: "comment-3",
    readings: READINGS.slice(10, 18),
    commenters: ["user-2"],
    followers: ["user-1"],
  },
  {
    id: "chat-3",
    creation_date: new Date("2026-03-13T09:00:00"),
    last_message_time: new Date("2026-03-13T09:00:00"),
    creator: "user-3",
    first_comment: "comment-4",
    commenters: ["user-3"],
    followers: [],
  },
]

// ─────────────────────────────────────────────
// Comments
// ─────────────────────────────────────────────

export const COMMENTS: Comment[] = [
  {
    id: "comment-1",
    chat: "chat-1",
    full_name: "Valentina Reyes Morales",
    creation_date: new Date("2026-03-15T10:00:00"),
    author: "user-1",
    degree: "Dra. en Ingeniería Solar",
    text: "Se observa una caída de voltaje inusual entre las 08:00 y las 09:30. ¿Podría estar relacionada con la nubosidad registrada esa mañana?",
    highlight_start: new Date("2026-03-15T08:00:00"),
    highlight_end: new Date("2026-03-15T09:30:00"),
  },
  {
    id: "comment-2",
    chat: "chat-1",
    full_name: "Rodrigo Figueroa Castro",
    creation_date: new Date("2026-03-15T10:45:00"),
    author: "user-2",
    degree: "M.C. en Energías Renovables",
    text: "Concuerdo. La irradiancia también muestra un valle pronunciado en ese mismo intervalo. Habría que correlacionar con los datos meteorológicos.",
  },
  {
    id: "comment-3",
    chat: "chat-2",
    full_name: "Rodrigo Figueroa Castro",
    creation_date: new Date("2026-03-14T14:30:00"),
    author: "user-2",
    degree: "M.C. en Energías Renovables",
    text: "Pico de corriente destacable alrededor del mediodía. Corresponde con el ángulo de incidencia óptimo.",
    highlight_start: new Date("2026-03-14T12:00:00"),
    highlight_end: new Date("2026-03-14T13:00:00"),
  },
  {
    id: "comment-4",
    chat: "chat-3",
    full_name: "Sofía Mendoza Ruiz",
    creation_date: new Date("2026-03-13T09:00:00"),
    author: "user-3",
    degree: "Ing. en Sistemas Fotovoltaicos",
    text: "Inicio de monitoreo continuo del prototipo Beta. Se configuraron los intervalos de muestreo a 30 minutos.",
  },
]

// ─────────────────────────────────────────────
// Followed Chats
// ─────────────────────────────────────────────

export const FOLLOWED_CHATS: FollowedChat[] = [
  {
    id: "followed-1",
    creation_date: new Date("2026-03-15T10:00:00"),
    index: 0,
    owner: "user-1",
    chat: "chat-1",
    last_message_seen_time: "comment-2", // Reference to last Comment seen
    silenced: false,
    name: "Caída de voltaje mar. 15",
  },
  {
    id: "followed-2",
    creation_date: new Date("2026-03-14T14:30:00"),
    index: 0,
    owner: "user-1",
    chat: "chat-2",
    last_message_seen_time: "comment-3",
    silenced: false,
    name: "Pico mediodía mar. 14",
  },
  {
    id: "followed-3",
    creation_date: new Date("2026-03-15T10:00:00"),
    index: 0,
    owner: "user-2",
    chat: "chat-1",
    last_message_seen_time: "comment-1",
    silenced: false,
    name: "Anomalía voltaje Alfa",
  },
]

// ─────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────

export const NOTIFICATIONS: Notification[] = [
  {
    id: "notification-1",
    type: "resumed-activity",
    has_been_read: false,
    followed_chat: "followed-1",
    user: "user-1",
    creation_date: new Date("2026-03-15T10:45:00"),
  },
  {
    id: "notification-2",
    type: "resumed-activity",
    has_been_read: true,
    followed_chat: "followed-3",
    user: "user-2",
    creation_date: new Date("2026-03-15T10:45:00"),
  },
];

export const CONNECTIONS: Connection[] = [
  {
    id: "connection-1",
    owner: "user-1",
    link: "https://orcid.org/0000-0001-2345-6789",
    type: "orcid",
  },
  {
    id: "connection-2",
    owner: "user-1",
    link: "https://scholar.google.com/citations?user=abc123",
    type: "google_scholar",
  },
  {
    id: "connection-3",
    owner: "user-2",
    link: "https://www.researchgate.net/profile/Rodrigo-Figueroa",
    type: "researchgate",
  },
  {
    id: "connection-4",
    owner: "user-3",
    link: "https://linkedin.com/in/sofia-mendoza-ruiz",
    type: "linkedin",
  },
]