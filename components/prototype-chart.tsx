"use client"

import { useMemo } from "react"
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

interface PrototypeChartProps {
  prototypeName: string
  readings: Reading[]
  comments: Comment[]
}

function formatTime(isoString: string) {
  const d = new Date(isoString)
  const hours = d.getHours()
  const minutes = d.getMinutes().toString().padStart(2, "0")
  const period = hours >= 12 ? "p.m." : "a.m."
  const h = hours % 12 || 12
  return `${h.toString().padStart(2, "0")}:${minutes} ${period}`
}

export function PrototypeChart({
  prototypeName,
  readings,
  comments,
}: PrototypeChartProps) {
  const router = useRouter()

  const chartData = useMemo(() => {
    return readings.map((r) => ({
      time: new Date(r.date).getTime(),
      timeLabel: formatTime(r.date),
      voltage: Math.round(r.voltage * 10) / 10,
    }))
  }, [readings])

  const highlightedComments = useMemo(() => {
    return comments.filter((c) => c.highlight_start && c.highlight_end)
  }, [comments])

  // Get unique comment avatars positioned by their highlight center
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

  if (!chartData.length) return null

  const minTime = chartData[0].time
  const maxTime = chartData[chartData.length - 1].time

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-lg font-bold text-card-foreground">
          {prototypeName}
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
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
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  borderColor: "var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--color-card-foreground)" }}
              />

              {/* Highlight areas for comments */}
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

              <Line
                type="monotone"
                dataKey="voltage"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "var(--color-chart-1)" }}
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
              aria-label={`Ver chat de ${ap.user?.full_name}`}
            >
              <Avatar className="size-8 border-2 border-card">
                <AvatarImage
                  src={ap.user?.profile_picture}
                  alt={ap.user?.full_name ?? ""}
                />
                <AvatarFallback className="text-[10px]">
                  {ap.user?.full_name?.slice(0, 2) ?? "?"}
                </AvatarFallback>
              </Avatar>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
