import type {
  User,
  Prototype,
  Reading,
  Chat,
  Comment,
  FollowedChat,
  Notification,
  Connection,
} from "./types"

// ── Users ──────────────────────────────────────────────────────────

export const USERS: User[] = [
  {
    id: "u1",
    email: "ivan@heliolab.mx",
    password: "demo1234",
    full_name: "Ivan Zuniga",
    degree: "Doctor en Mecatronica Aplicada",
    profile_picture: "/avatars/ivan.jpg",
    last_seen_chat_time: "2026-02-17T10:00:00-06:00",
    timezone: "America/Mexico_City",
  },
  {
    id: "u2",
    email: "manuel@heliolab.mx",
    password: "demo1234",
    full_name: "Manuel Velazco",
    degree: "Doctor en Tecnologias de la Informacion",
    profile_picture: "/avatars/manuel.jpg",
    last_seen_chat_time: "2026-02-17T09:30:00-06:00",
    timezone: "Europe/Madrid",
  },
  {
    id: "u3",
    email: "francisco@heliolab.mx",
    password: "demo1234",
    full_name: "Francisco Cardoso",
    degree: "Doctor en Energias Renovables",
    profile_picture: "/avatars/francisco.jpg",
    last_seen_chat_time: "2026-02-17T08:00:00-06:00",
    timezone: "America/Mexico_City",
  },
]

// ── Prototypes ─────────────────────────────────────────────────────

export const PROTOTYPES: Prototype[] = [
  {
    id: "p1",
    name: "Prototipo MX1",
    location: { lat: 19.4326, lng: -99.1332 },
    owner: "u1",
  },
]

// ── Readings (simulated hourly for one day) ────────────────────────

function generateReadings(): Reading[] {
  const base = new Date("2026-02-16T12:00:00-06:00")
  const readings: Reading[] = []
  const values = [32, 35, 40, 45, 50, 55, 60, 65, 58, 62, 68, 55, 48, 42, 38, 35, 30, 28, 25]
  for (let i = 0; i < values.length; i++) {
    const date = new Date(base.getTime() + i * 30 * 60 * 1000)
    readings.push({
      id: `r${i + 1}`,
      prototypeId: "p1",
      date: date.toISOString(),
      current: values[i] + Math.random() * 5 - 2.5,
      voltage: values[i] * 0.8 + Math.random() * 3,
      irradiance: values[i] * 12 + Math.random() * 50,
    })
  }
  return readings
}

export const READINGS: Reading[] = generateReadings()

// ── Chats ──────────────────────────────────────────────────────────

export const CHATS: Chat[] = [
  {
    id: "ch1",
    creation_date: "2026-02-16T13:00:00-06:00",
    creator: "u1",
    participants: ["u1", "u2", "u3"],
  },
  {
    id: "ch2",
    creation_date: "2026-02-16T16:12:00-06:00",
    creator: "u2",
    participants: ["u1", "u2"],
  },
  {
    id: "ch3",
    creation_date: "2026-02-17T09:30:00-06:00",
    creator: "u3",
    participants: ["u1", "u3"],
  },
]

// ── Comments ───────────────────────────────────────────────────────

export const COMMENTS: Comment[] = [
  {
    id: "cm1",
    chat: "ch1",
    full_name: "Ivan Zuniga",
    creation_date: "2026-02-16T13:00:00-06:00",
    author: "u1",
    degree: "Doctor en Mecatronica Aplicada",
    text: "El comportamiento en esta seccion del grafico es inusual para la hora del dia. Podrian echarle un vistazo?",
    highlight_start: "2026-02-16T12:30:00-06:00",
    highlight_end: "2026-02-16T14:00:00-06:00",
    prototype: "p1",
  },
  {
    id: "cm2",
    chat: "ch2",
    full_name: "Manuel Velazco",
    creation_date: "2026-02-16T16:12:00-06:00",
    author: "u2",
    degree: "Doctor en Tecnologias de la Informacion",
    text: "La produccion del panel decayo abruptamente en este periodo. @Ivan Zuniga, podrias revisar la configuracion del prototipo?",
    mentions: [{ userId: "u1", full_name: "Ivan Zuniga" }],
    highlight_start: "2026-02-16T16:00:00-06:00",
    highlight_end: "2026-02-16T17:30:00-06:00",
    prototype: "p1",
  },
  {
    id: "cm3",
    chat: "ch3",
    full_name: "Francisco Cardoso",
    creation_date: "2026-02-17T09:30:00-06:00",
    author: "u3",
    degree: "Doctor en Energias Renovables",
    text: "Los valores de irradiancia se normalizaron esta manana. Parece que el problema fue transitorio.",
    prototype: "p1",
  },
  {
    id: "cm4",
    chat: "ch1",
    full_name: "Manuel Velazco",
    creation_date: "2026-02-16T14:05:00-06:00",
    author: "u2",
    degree: "Doctor en Tecnologias de la Informacion",
    text: "Confirmo, yo tambien veo la anomalia. Podria estar relacionada con la calibracion del sensor.",
  },
  {
    id: "cm5",
    chat: "ch2",
    full_name: "Ivan Zuniga",
    creation_date: "2026-02-16T17:00:00-06:00",
    author: "u1",
    degree: "Doctor en Mecatronica Aplicada",
    text: "Ya revise la configuracion, parece que hubo una interrupcion en el suministro electrico. Voy a programar un reinicio.",
  },
]

// ── Followed Chats ─────────────────────────────────────────────────

export const FOLLOWED_CHATS: FollowedChat[] = [
  {
    id: "fc1",
    creation_date: "2026-02-16T13:00:00-06:00",
    index: 0,
    owner: "u1",
    chat: "ch1",
    last_seen_message_time: "2026-02-16T14:05:00-06:00",
    last_message_time: "2026-02-16T14:05:00-06:00",
    silenced: false,
    name: "Comportamiento anormal del sensor",
  },
  {
    id: "fc2",
    creation_date: "2026-02-16T16:12:00-06:00",
    index: 1,
    owner: "u1",
    chat: "ch2",
    last_seen_message_time: "2026-02-16T16:12:00-06:00",
    last_message_time: "2026-02-16T17:00:00-06:00",
    silenced: false,
    name: "Anomalia 16 de Feb",
  },
]

// ── Notifications ──────────────────────────────────────────────────

export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "new_comment",
    has_been_read: false,
    saved_chat: "ch1",
    creation_date: "2026-02-16T14:05:00-06:00",
    text: "Manuel Velazco respondio en el chat",
    actor_name: "Manuel Velazco",
  },
  {
    id: "n2",
    type: "mention",
    has_been_read: false,
    saved_chat: "ch2",
    creation_date: "2026-02-16T16:12:00-06:00",
    text: "Manuel Velazco te menciono en un comentario",
    actor_name: "Manuel Velazco",
  },
  {
    id: "n3",
    type: "new_reply",
    has_been_read: true,
    saved_chat: "ch3",
    creation_date: "2026-02-17T09:30:00-06:00",
    text: "Francisco Cardoso dejo un nuevo comentario",
    actor_name: "Francisco Cardoso",
  },
]

// ── Connections ────────────────────────────────────────────────────

export const CONNECTIONS: Connection[] = [
  {
    id: "cn1",
    owner: "u1",
    name: "Carpeta del equipo",
    url: "https://drive.google.com",
    icon: "folder-open",
  },
  {
    id: "cn2",
    owner: "u1",
    name: "Link de llamada",
    url: "https://meet.google.com",
    icon: "phone",
  },
]
