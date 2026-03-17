"use client"

import { useMemo, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceArea,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { Reading, Comment } from "@/lib/types"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { USERS } from "@/lib/mock-data"

export interface SelectionRange {
  startDate: Date
  endDate: Date
}

interface PrototypeChartProps {
  prototypeName: string
  readings: Reading[]
  comments: Comment[]
  onSelectionComplete?: (range: SelectionRange) => void
}

function formatTime(date: Date) {
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, "0")
  const period = hours >= 12 ? "p.m." : "a.m."
  const h = hours % 12 || 12
  return `${h.toString().padStart(2, "0")}:${minutes} ${period}`
}

export function PrototypeChart({
  prototypeName,
  readings,
  comments,
  onSelectionComplete,
}: PrototypeChartProps) {
  const router = useRouter()

  // Drag-selection state
  const [selectionStart, setSelectionStart] = useState<string | null>(null)
  const [selectionEnd, setSelectionEnd] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const isDraggingRef = useRef(false)

  const chartData = useMemo(() => {
    return readings.map((r) => ({
      time: new Date(r.date).getTime(),
      timeLabel: formatTime(r.date),
      // Keep original date for selection
      date: r.date instanceof Date ? r.date : new Date(r.date),
      voltage: Math.round(r.voltage * 10) / 10,
    }))
  }, [readings])

  // Map timeLabel → date for resolving selection
  const timeLabelToDate = useMemo(() => {
    const map = new Map<string, Date>()
    chartData.forEach((d) => map.set(d.timeLabel, d.date))
    return map
  }, [chartData])

  const highlightedComments = useMemo(() => {
    return comments.filter((c) => c.highlight_start && c.highlight_end)
  }, [comments])

  const avatarPositions = useMemo(() => {
    if (!chartData.length) return []
    const minTime = chartData[0].time
    const maxTime = chartData[chartData.length - 1].time
    const range = maxTime - minTime

    return highlightedComments.map((c) => {
      const start = new Date(c.highlight_start!).getTime()
      const end = new Date(c.highlight_end!).getTime()
      const center = (start + end) / 2
      const percent = ((center - minTime) / range) * 100
      const user = USERS.find((u) => u.id === c.author)
      return {
        commentId: c.id,
        chatId: c.chat,
        percent: Math.max(2, Math.min(98, percent)),
        user,
      }
    })
  }, [highlightedComments, chartData])

  function handleHighlightClick(chatId: string) {
    router.push(`/chat/${chatId}`)
  }

  // Recharts mouse event handlers
  const handleMouseDown = useCallback((e: any) => {
    if (!e?.activeLabel) return
    isDraggingRef.current = true
    setIsDragging(true)
    setSelectionStart(e.activeLabel)
    setSelectionEnd(null)
  }, [])

  const handleMouseMove = useCallback((e: any) => {
    if (!isDraggingRef.current || !e?.activeLabel) return
    setSelectionEnd(e.activeLabel)
  }, [])

  const handleMouseUp = useCallback((e: any) => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    setIsDragging(false)

    const endLabel = e?.activeLabel ?? selectionEnd
    if (!selectionStart || !endLabel) {
      setSelectionStart(null)
      setSelectionEnd(null)
      return
    }

    const startDate = timeLabelToDate.get(selectionStart)
    const endDate = timeLabelToDate.get(endLabel)

    if (!startDate || !endDate || startDate.getTime() === endDate.getTime()) {
      setSelectionStart(null)
      setSelectionEnd(null)
      return
    }

    // Normalize order
    const [sd, ed] =
      startDate <= endDate ? [startDate, endDate] : [endDate, startDate]

    onSelectionComplete?.({ startDate: sd, endDate: ed })

    // Clear drag state (keep highlight visible until drawer closes)
    setSelectionStart(null)
    setSelectionEnd(null)
  }, [selectionStart, selectionEnd, timeLabelToDate, onSelectionComplete])

  if (!chartData.length) return null

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-card-foreground">
            {prototypeName}
          </h2>
          {isDragging && (
            <span className="animate-pulse text-xs text-muted-foreground">
              Arrastra para seleccionar un rango
            </span>
          )}
          {!isDragging && (
            <span className="text-xs text-muted-foreground">
              Haz clic y arrastra para comentar
            </span>
          )}
        </div>

        {/* Chart wrapper — cursor crosshair while dragging */}
        <div
          className={`h-64 ${isDragging ? "cursor-col-resize" : "cursor-crosshair"}`}
          // Prevent text selection during drag
          onMouseLeave={() => {
            if (isDraggingRef.current) {
              isDraggingRef.current = false
              setIsDragging(false)
              setSelectionStart(null)
              setSelectionEnd(null)
            }
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border/50"
              />
              <XAxis
                dataKey="timeLabel"
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                interval="preserveStartEnd"
                tickCount={8}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                domain={["auto", "auto"]}
              />
              {/* Hide tooltip while dragging to avoid distraction */}
              {!isDragging && (
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    borderColor: "var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--color-card-foreground)" }}
                />
              )}

              {/* Existing comment highlights */}
              {highlightedComments.map((c) => (
                <ReferenceArea
                  key={c.id}
                  x1={
                    chartData.reduce((closest, d) => {
                      const target = new Date(c.highlight_start!).getTime()
                      return Math.abs(d.time - target) <
                        Math.abs(closest.time - target)
                        ? d
                        : closest
                    }, chartData[0]).timeLabel
                  }
                  x2={
                    chartData.reduce((closest, d) => {
                      const target = new Date(c.highlight_end!).getTime()
                      return Math.abs(d.time - target) <
                        Math.abs(closest.time - target)
                        ? d
                        : closest
                    }, chartData[chartData.length - 1]).timeLabel
                  }
                  fill="var(--color-highlight)"
                  fillOpacity={1}
                  stroke="none"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleHighlightClick(c.chat)}
                />
              ))}

              {/* Active drag selection highlight */}
              {isDragging && selectionStart && selectionEnd && (
                <ReferenceArea
                  x1={selectionStart}
                  x2={selectionEnd}
                  fill="var(--color-primary)"
                  fillOpacity={0.15}
                  stroke="var(--color-primary)"
                  strokeOpacity={0.4}
                  strokeWidth={1}
                  strokeDasharray="4 2"
                />
              )}

              <Line
                type="monotone"
                dataKey="voltage"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                dot={false}
                activeDot={isDragging ? false : { r: 4, fill: "var(--color-chart-1)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Avatars below chart */}
      {avatarPositions.length > 0 && (
        <div className="relative h-10 mx-4">
          {avatarPositions.map((ap) => (
            <button
              key={ap.commentId}
              className="absolute -translate-x-1/2 transition-transform hover:scale-110"
              style={{ left: `${ap.percent}%` }}
              onClick={() => handleHighlightClick(ap.chatId)}
              aria-label={`Ver chat de ${ap.user?.name}`}
            >
              <Avatar className="size-8 border-2 border-card">
                <AvatarImage
                  src={ap.user?.profile_picture}
                  alt={ap.user?.name ?? ""}
                />
                <AvatarFallback className="text-[10px]">
                  {ap.user?.name?.slice(0, 2) ?? "?"}
                </AvatarFallback>
              </Avatar>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}