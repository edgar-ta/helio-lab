"use client"

import { useEffect, useState, useCallback } from "react"
import { getReadings, getComments } from "@/lib/data"
import { PROTOTYPES } from "@/lib/mock-data"
import type { Reading, Comment } from "@/lib/types"
import { PrototypeChart } from "@/components/prototype-chart"
import { CommentFeed } from "@/components/comment-feed"
import { NewCommentDialog } from "@/components/new-comment-dialog"
import { ConnectionsPanel } from "@/components/connections-panel"

export default function DashboardPage() {
  const prototype = PROTOTYPES[0]
  const [readings, setReadings] = useState<Reading[]>([])
  const [comments, setComments] = useState<Comment[]>([])

  const loadData = useCallback(async () => {
    const [r, c] = await Promise.all([
      getReadings(prototype.id),
      getComments(prototype.id),
    ])
    setReadings(r)
    setComments(c)
  }, [prototype.id])

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <div className="flex gap-8 p-6">
      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        {/* Chart */}
        <PrototypeChart
          prototypeName={prototype.name}
          readings={readings}
          comments={comments}
        />

        {/* New comment action */}
        <div className="flex items-center justify-between">
          <div />
          <NewCommentDialog
            prototypeId={prototype.id}
            onCommentAdded={loadData}
          />
        </div>

        {/* Comment feed */}
        <CommentFeed comments={comments} />
      </div>

      {/* Right sidebar: connections */}
      <div className="w-64 shrink-0">
        <ConnectionsPanel />
      </div>
    </div>
  )
}
