"use client"

import { use } from "react"
import { ChatRoom } from "@/components/chat-room"

export default function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>
}) {
  const { chatId } = use(params)

  return <ChatRoom chatId={chatId} />
}
