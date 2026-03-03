"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AppSidebar } from "@/components/app-sidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <span className="text-muted-foreground">Cargando...</span>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen min-w-[1200px] overflow-hidden bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
