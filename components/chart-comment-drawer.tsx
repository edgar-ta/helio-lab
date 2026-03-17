"use client"

import { useEffect, useRef, useState } from "react"
import { X, Send, MessageSquarePlus } from "lucide-react"
import { Comment } from "@/lib/types"

interface ChartCommentDrawerProps {
  open: boolean
  startDate: Date | null
  endDate: Date | null
  prototypeId: string
  userId: string
  onClose: () => void
  onCommentAdded: () => void
  addComment: (parameters: {
    userId: string
    prototypeId: string
    startDate: string
    endDate: string
    comment: string
  }) => Promise<Comment>
}

function formatDateRange(start: Date | null, end: Date | null): string {
  if (!start || !end) return ""
  const fmt = (d: Date) => {
    const h = d.getHours()
    const m = d.getMinutes().toString().padStart(2, "0")
    const period = h >= 12 ? "p.m." : "a.m."
    return `${(h % 12 || 12).toString().padStart(2, "0")}:${m} ${period}`
  }
  return `${fmt(start)} — ${fmt(end)}`
}

export function ChartCommentDrawer({
  open,
  startDate,
  endDate,
  prototypeId,
  userId,
  onClose,
  onCommentAdded,
  addComment,
}: ChartCommentDrawerProps) {
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus textarea when drawer opens
  useEffect(() => {
    if (open) {
      setComment("")
      setError(null)
      setTimeout(() => textareaRef.current?.focus(), 300)
    }
  }, [open])

  async function handleSubmit() {
    if (!comment.trim() || !startDate || !endDate) return
    setSubmitting(true)
    setError(null)
    try {
      await addComment({
        userId,
        prototypeId,
        startDate: startDate!.toISOString(),
        endDate: endDate!.toISOString(),
        comment: comment.trim(),
      })
      onCommentAdded()
      onClose()
    } catch (e) {
      setError("No se pudo publicar el comentario. Intenta de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
          open ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
        style={{ willChange: "transform, opacity" }}
      >
        <div className="mx-auto max-w-2xl">
          <div
            className="rounded-t-2xl border border-b-0 border-border bg-card shadow-2xl"
            style={{ boxShadow: "0 -8px 40px rgba(0,0,0,0.18)" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>

            <div className="px-5 pb-6 pt-2">
              {/* Header */}
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <MessageSquarePlus className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">
                      Comentar sección
                    </p>
                    {startDate && endDate && (
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {formatDateRange(startDate, endDate)}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-card-foreground"
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Selection preview pill */}
              {startDate && endDate && (
                <div className="mb-3 flex items-center gap-2 rounded-lg bg-primary/8 px-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-primary/60" />
                  <div
                    className="h-1.5 flex-1 rounded-full bg-primary/30"
                    style={{ minWidth: 0 }}
                  >
                    <div className="h-full w-full rounded-full bg-primary/50" />
                  </div>
                  <div className="h-2 w-2 rounded-full bg-primary/60" />
                </div>
              )}

              {/* Textarea */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu comentario sobre esta sección..."
                  rows={3}
                  disabled={submitting}
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 transition-colors"
                />
              </div>

              {error && (
                <p className="mt-2 text-xs text-destructive">{error}</p>
              )}

              {/* Footer */}
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                    ⌘
                  </kbd>{" "}
                  +{" "}
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                    Enter
                  </kbd>{" "}
                  para publicar
                </p>
                <button
                  onClick={handleSubmit}
                  disabled={!comment.trim() || submitting}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      Publicando…
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Publicar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}