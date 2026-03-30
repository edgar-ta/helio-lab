"use client"

import { useEffect, useRef, useState } from "react"
import { Send, X, Crosshair } from "lucide-react"
import type { Comment } from "@/lib/types/backend-types"

interface ChartCommentBarProps {
  selection: { startDate: Date; endDate: Date } | null
  prototypeId: string
  userId: string
  onClearSelection: () => void
  onCommentAdded: () => void
  addComment: (parameters: {
    userId: string
    prototypeId: string
    startDate: string
    endDate: string
    comment: string
  }) => Promise<Comment>
}

function formatTime(d: Date) {
  const h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, "0")
  const period = h >= 12 ? "p.m." : "a.m."
  return `${(h % 12 || 12).toString().padStart(2, "0")}:${m} ${period}`
}

export function ChartCommentBar({
  selection,
  prototypeId,
  userId,
  onClearSelection,
  onCommentAdded,
  addComment,
}: ChartCommentBarProps) {
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const hasSelection = selection !== null
  const canSubmit = hasSelection && comment.trim().length > 0 && !submitting

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [comment])

  // Focus when selection first appears
  useEffect(() => {
    if (hasSelection) {
      setTimeout(() => textareaRef.current?.focus(), 50)
    }
  }, [hasSelection])

  async function handleSubmit() {
    if (!canSubmit || !selection) return
    setSubmitting(true)
    setError(null)
    try {
      await addComment({
        userId,
        prototypeId,
        startDate: selection.startDate.toISOString(),
        endDate: selection.endDate.toISOString(),
        comment: comment.trim(),
      })
      setComment("")
      onClearSelection()
      onCommentAdded()
    } catch {
      setError("No se pudo publicar. Intenta de nuevo.")
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

  function handleClear() {
    setComment("")
    setError(null)
    onClearSelection()
  }

  return (
    <div className="sticky bottom-0 z-30 px-0 pb-4 pt-2">
      {/* Frosted container */}
      <div
        className={`
          relative rounded-2xl border transition-all duration-200
          ${hasSelection
            ? "border-orange-400/50 bg-card shadow-[0_0_0_3px_rgba(251,146,60,0.12)] shadow-lg"
            : "border-border bg-card/80 shadow-md backdrop-blur-sm"
          }
        `}
      >
        {/* Selection pill — slides in when active */}
        <div
          className={`
            overflow-hidden transition-all duration-200 ease-out
            ${hasSelection ? "max-h-12 opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          {selection && (
            <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-1">
              <div className="flex items-center gap-2">
                <Crosshair className="h-3.5 w-3.5 shrink-0 text-orange-400" />
                <span className="text-xs font-medium text-orange-400 tabular-nums">
                  {formatTime(selection.startDate)} — {formatTime(selection.endDate)}
                </span>
              </div>
              <button
                onClick={handleClear}
                className="rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Cancelar selección"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Input row */}
        <div className="flex items-end gap-2 px-3 py-3">
          <textarea
            ref={textareaRef}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              hasSelection
                ? "Escribe un comentario sobre la sección seleccionada…"
                : "Selecciona una sección del gráfico para comentar…"
            }
            disabled={submitting}
            rows={1}
            className={`
              flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none
              placeholder:text-muted-foreground/60 disabled:opacity-50
              text-card-foreground
              transition-colors duration-150
              max-h-40 overflow-y-auto
            `}
            style={{ scrollbarWidth: "none" }}
          />

          {/* Send button */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            aria-label="Publicar comentario"
            className={`
              shrink-0 flex h-8 w-8 items-center justify-center rounded-xl
              transition-all duration-150
              ${canSubmit
                ? "bg-orange-400 text-white shadow-sm hover:bg-orange-500 active:scale-95"
                : "bg-muted text-muted-foreground cursor-not-allowed"
              }
            `}
          >
            {submitting
              ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              : <Send className="h-3.5 w-3.5" />
            }
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="px-4 pb-2 text-xs text-destructive">{error}</p>
        )}

        {/* Keyboard hint — only when selection active */}
        {hasSelection && !error && (
          <p className="px-4 pb-2 text-[11px] text-muted-foreground/60">
            <kbd className="rounded border border-border bg-muted px-1 py-px font-mono text-[10px]">⌘</kbd>
            {" + "}
            <kbd className="rounded border border-border bg-muted px-1 py-px font-mono text-[10px]">Enter</kbd>
            {" para publicar"}
          </p>
        )}
      </div>
    </div>
  )
}