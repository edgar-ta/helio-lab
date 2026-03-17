"use client"

import { useEffect, useState, useCallback } from "react"
import { getPrototypes, getReadings, getComments, getFeed, addComment } from "@/lib/api-client"
import type { Prototype, Reading, Comment } from "@/lib/types"
import type { ChatAsPost } from "@/lib/types-local"
import { PrototypeChart, type SelectionRange } from "@/components/prototype-chart"
import { ChatsFeed } from "@/components/chats-feed"
import { NewCommentDialog } from "@/components/new-comment-dialog"
import { ConnectionsPanel } from "@/components/connections-panel"
import { ChartCommentDrawer } from "@/components/chart-comment-drawer"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface PrototypeData {
  prototype: Prototype
  readings: Reading[]
  comments: Comment[]
}

export default function DashboardPage() {
  const { user } = useAuth()

  const [prototypeData, setPrototypeData] = useState<PrototypeData[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [feed, setFeed] = useState<ChatAsPost[]>([])
  const [loading, setLoading] = useState(true)

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selection, setSelection] = useState<SelectionRange | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [prototypes, feedChats] = await Promise.all([
        getPrototypes(),
        getFeed(user!.id),
      ])

      const perPrototype = await Promise.all(
        prototypes.map(async (prototype) => {
          const [rawReadings, comments] = await Promise.all([
            getReadings({ prototypeId: prototype.id }),
            getComments(prototype.id),
          ])
          const readings: Reading[] = rawReadings.map((r) => ({
            ...r,
            date: new Date(r.date),
          }))
          return { prototype, readings, comments }
        })
      )

      setPrototypeData(perPrototype)
      setFeed(feedChats)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  function handleSelectionComplete(range: SelectionRange) {
    setSelection(range)
    setDrawerOpen(true)
  }

  function handleDrawerClose() {
    setDrawerOpen(false)
    setTimeout(() => setSelection(null), 350)
  }

  const active = prototypeData[activeIndex]
  const count = prototypeData.length

  function prev() {
    setActiveIndex((i) => (i - 1 + count) % count)
  }

  function next() {
    setActiveIndex((i) => (i + 1) % count)
  }

  return (
    <div className="flex gap-8 p-6">
      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col gap-6">

        {/* Carousel */}
        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-card">
            <span className="text-sm text-muted-foreground">Cargando prototipos…</span>
          </div>
        ) : count === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-card">
            <span className="text-sm text-muted-foreground">No hay prototipos registrados.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <PrototypeChart
              prototypeName={active.prototype.name}
              readings={active.readings}
              comments={active.comments}
              onSelectionComplete={handleSelectionComplete}
            />

            {count > 1 && (
              <div className="flex items-center justify-between px-1">
                <button
                  onClick={prev}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-card-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </button>

                <div className="flex items-center gap-1.5">
                  {prototypeData.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      aria-label={`Prototipo ${i + 1}`}
                      className={`h-2 rounded-full transition-all ${
                        i === activeIndex
                          ? "w-5 bg-primary"
                          : "w-2 bg-border hover:bg-muted-foreground"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={next}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-card-foreground"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* New comment action */}
        {active && (
          <div className="flex items-center justify-between">
            <div />
            <NewCommentDialog
              prototypeId={active.prototype.id}
              onCommentAdded={loadData}
            />
          </div>
        )}

        {/* Chats feed */}
        <ChatsFeed chats={feed} />
      </div>

      {/* Right sidebar: connections */}
      <div className="w-64 shrink-0">
        <ConnectionsPanel />
      </div>

      {/* Chart section comment drawer */}
      {active && (
        <ChartCommentDrawer
          open={drawerOpen}
          startDate={selection?.startDate ?? null}
          endDate={selection?.endDate ?? null}
          prototypeId={active.prototype.id}
          userId={user!.id}
          onClose={handleDrawerClose}
          onCommentAdded={loadData}
          addComment={addComment}
        />
      )}
    </div>
  )
}