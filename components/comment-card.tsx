"use client"

import { useRouter } from "next/navigation"
import type { Comment } from "@/lib/types"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Star, CheckSquare } from "lucide-react"
import { USERS } from "@/lib/mock-data"

interface CommentCardProps {
  comment: Comment
  prototypeName?: string
}

const TZ_LABELS: Record<string, string> = {
  "America/Mexico_City": "MEX",
  "Europe/Madrid": "ESP",
}

function formatTimeWithTz(
  isoString: string,
  timezone: string
): { primary: string; secondary?: string } {
  const date = new Date(isoString)
  const authorTz = timezone
  const authorLabel = TZ_LABELS[authorTz] || authorTz

  const primaryFormatter = new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: authorTz,
  })
  const primary = `${primaryFormatter.format(date)} ${authorLabel}`

  // Get the other timezone
  const otherTz =
    authorTz === "America/Mexico_City"
      ? "Europe/Madrid"
      : "America/Mexico_City"
  const otherLabel = TZ_LABELS[otherTz]

  const secondaryFormatter = new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: otherTz,
  })
  const secondary = `${secondaryFormatter.format(date)} ${otherLabel}`

  return { primary, secondary }
}

function renderTextWithMentions(text: string) {
  // Split text by @mentions pattern
  const parts = text.split(/(@[\w\s]+?)(?=,|\.|!|\?|\s(?![A-Z])|\s*$)/)
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      return (
        <strong key={i} className="text-foreground">
          {part}
        </strong>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export function CommentCard({ comment, prototypeName }: CommentCardProps) {
  const router = useRouter()
  const author = USERS.find((u) => u.id === comment.author)
  const authorTz = author?.timezone || "America/Mexico_City"
  const countryBadge = TZ_LABELS[authorTz] || ""

  const initials = comment.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)

  const { primary, secondary } = formatTimeWithTz(
    comment.creation_date,
    authorTz
  )

  // Only show secondary time if author is in a different timezone from Mexico
  const showSecondary = authorTz !== "America/Mexico_City"

  return (
    <button
      onClick={() => router.push(`/chat/${comment.chat}`)}
      className="w-full text-left rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Author info */}
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarImage
              src={author?.profile_picture}
              alt={comment.full_name}
            />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-card-foreground">
                {comment.full_name}
              </span>
              {countryBadge && (
                <span className="text-[10px] font-medium text-muted-foreground">
                  {countryBadge}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {comment.degree}
            </span>
          </div>
        </div>

        {/* Prototype name + action icons */}
        <div className="flex items-center gap-2">
          {prototypeName && (
            <span className="text-sm font-medium text-card-foreground">
              {prototypeName}
            </span>
          )}
          <button
            className="text-muted-foreground transition-colors hover:text-chart-1"
            aria-label="Marcar como favorito"
            onClick={(e) => e.stopPropagation()}
          >
            <Star className="size-4" />
          </button>
          <button
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Marcar como visto"
            onClick={(e) => e.stopPropagation()}
          >
            <CheckSquare className="size-4" />
          </button>
        </div>
      </div>

      {/* Comment text */}
      <p className="mt-3 text-sm leading-relaxed text-card-foreground">
        {renderTextWithMentions(comment.text)}
      </p>

      {/* Time */}
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <span>{primary}</span>
        {showSecondary && secondary && (
          <>
            <span className="text-border">{"·"}</span>
            <span>{secondary}</span>
          </>
        )}
      </div>
    </button>
  )
}
