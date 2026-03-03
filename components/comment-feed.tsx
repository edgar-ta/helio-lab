"use client"

import { useMemo } from "react"
import type { Comment } from "@/lib/types"
import { CommentCard } from "@/components/comment-card"
import { PROTOTYPES } from "@/lib/mock-data"

interface CommentFeedProps {
  comments: Comment[]
}

const DAY_NAMES: Record<number, string> = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miercoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sabado",
}

export function CommentFeed({ comments }: CommentFeedProps) {
  // Group comments by day, only root comments (those with a prototype reference or highlight)
  const grouped = useMemo(() => {
    const rootComments = comments.filter(
      (c) => c.prototype || c.highlight_start
    )

    // Sort by creation_date descending within groups, but groups by date ascending
    const groups = new Map<string, Comment[]>()

    // Sort comments by date
    const sorted = [...rootComments].sort(
      (a, b) =>
        new Date(a.creation_date).getTime() -
        new Date(b.creation_date).getTime()
    )

    for (const comment of sorted) {
      const date = new Date(comment.creation_date)
      const dayKey = date.toISOString().split("T")[0]
      if (!groups.has(dayKey)) {
        groups.set(dayKey, [])
      }
      groups.get(dayKey)!.push(comment)
    }

    return Array.from(groups.entries()).map(([dayKey, dayComments]) => {
      const date = new Date(dayKey + "T12:00:00")
      const dayName = DAY_NAMES[date.getDay()] ?? dayKey
      return { dayKey, dayName, comments: dayComments }
    })
  }, [comments])

  if (grouped.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No hay comentarios aun.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {grouped.map((group) => (
        <div key={group.dayKey} className="flex flex-col gap-3">
          {/* Day header */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 rounded-full bg-foreground" />
            <h3 className="text-base font-bold text-foreground">
              {group.dayName}
            </h3>
          </div>

          {/* Comments for this day */}
          <div className="flex flex-col gap-3">
            {group.comments.map((comment) => {
              const proto = comment.prototype
                ? PROTOTYPES.find((p) => p.id === comment.prototype)
                : null
              return (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  prototypeName={proto?.name}
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
