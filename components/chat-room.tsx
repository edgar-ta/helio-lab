"use client"

import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  getChatMessages,
  getChat,
  addChatMessage,
  getFollowedChats,
  followChat,
  unfollowChat,
} from "@/lib/data"
import type { Comment, Chat, FollowedChat } from "@/lib/types"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { USERS } from "@/lib/mock-data"
import { ArrowLeft, BookmarkPlus, BookmarkMinus, Send } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ChatRoomProps {
  chatId: string
}

function formatTime(isoString: string) {
  const d = new Date(isoString)
  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d)
}

function formatDate(isoString: string) {
  const d = new Date(isoString)
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d)
}

export function ChatRoom({ chatId }: ChatRoomProps) {
  const { user } = useAuth()
  const [chat, setChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Comment[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [isFollowed, setIsFollowed] = useState(false)
  const [followedChats, setFollowedChats] = useState<FollowedChat[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getChat(chatId).then(setChat)
    getChatMessages(chatId).then((msgs) => {
      setMessages(msgs.sort((a, b) =>
        new Date(a.creation_date).getTime() - new Date(b.creation_date).getTime()
      ))
    })
  }, [chatId])

  useEffect(() => {
    if (user) {
      getFollowedChats(user.id).then((fcs) => {
        setFollowedChats(fcs)
        setIsFollowed(fcs.some((fc) => fc.chat === chatId))
      })
    }
  }, [user, chatId])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !newMessage.trim()) return

    setSending(true)
    const msg = await addChatMessage(chatId, {
      full_name: user.full_name,
      creation_date: new Date().toISOString(),
      author: user.id,
      degree: user.degree,
      text: newMessage.trim(),
    })
    setMessages((prev) => [...prev, msg])
    setNewMessage("")
    setSending(false)
  }

  async function handleToggleFollow() {
    if (!user) return
    if (isFollowed) {
      await unfollowChat(user.id, chatId)
      setIsFollowed(false)
    } else {
      // Use the first message text as chat name, truncated
      const chatName =
        messages[0]?.text.slice(0, 40) || `Chat ${chatId.slice(0, 6)}`
      await followChat(user.id, chatId, chatName)
      setIsFollowed(true)
    }
  }

  const participants = chat?.participants
    .map((pid) => USERS.find((u) => u.id === pid))
    .filter(Boolean) ?? []

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 border-b border-border px-6 py-3">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver
        </Link>

        <div className="flex flex-1 items-center gap-3">
          {/* Participant avatars */}
          <div className="flex -space-x-2">
            {participants.slice(0, 5).map((p) => (
              <Avatar key={p!.id} className="size-7 border-2 border-background">
                <AvatarImage src={p!.profile_picture} alt={p!.full_name} />
                <AvatarFallback className="text-[9px]">
                  {p!.full_name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {participants.map((p) => p!.full_name.split(" ")[0]).join(", ")}
          </span>
        </div>

        <Button
          variant={isFollowed ? "outline" : "default"}
          size="sm"
          onClick={handleToggleFollow}
          className="gap-1.5"
        >
          {isFollowed ? (
            <>
              <BookmarkMinus className="size-4" />
              Dejar de seguir
            </>
          ) : (
            <>
              <BookmarkPlus className="size-4" />
              Seguir chat
            </>
          )}
        </Button>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="flex flex-col gap-4 p-6">
          {messages.map((msg, i) => {
            const isOwn = msg.author === user?.id
            const author = USERS.find((u) => u.id === msg.author)
            const initials = msg.full_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)

            // Show date separator if day changed
            const prevMsg = messages[i - 1]
            const showDate =
              !prevMsg ||
              new Date(msg.creation_date).toDateString() !==
                new Date(prevMsg.creation_date).toDateString()

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="my-4 flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs capitalize text-muted-foreground">
                      {formatDate(msg.creation_date)}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                )}
                <div
                  className={cn(
                    "flex items-start gap-3",
                    isOwn && "flex-row-reverse"
                  )}
                >
                  <Avatar className="size-8 shrink-0">
                    <AvatarImage
                      src={author?.profile_picture}
                      alt={msg.full_name}
                    />
                    <AvatarFallback className="text-[10px]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "flex max-w-md flex-col gap-1 rounded-lg px-4 py-2",
                      isOwn
                        ? "bg-foreground text-background"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {!isOwn && (
                      <span className="text-xs font-semibold">
                        {msg.full_name}
                      </span>
                    )}
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <span
                      className={cn(
                        "text-[10px]",
                        isOwn
                          ? "text-background/70"
                          : "text-muted-foreground"
                      )}
                    >
                      {formatTime(msg.creation_date)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Message input */}
      <div className="border-t border-border px-6 py-3">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <Input
            placeholder="Escribe un mensaje..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={sending || !newMessage.trim()}
          >
            <Send className="size-4" />
            <span className="sr-only">Enviar mensaje</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
