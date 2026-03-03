"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import type { User } from "./types"
import { authenticateUser, getUser } from "./data"

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("heliolab_user_id")
    if (stored) {
      getUser(stored).then((u) => {
        setUser(u)
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string): Promise<{ error?: string }> => {
      const u = await authenticateUser(email, password)
      if (!u) {
        return { error: "Credenciales invalidas" }
      }
      setUser(u)
      localStorage.setItem("heliolab_user_id", u.id)
      return {}
    },
    []
  )

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem("heliolab_user_id")
  }, [])

  const refreshUser = useCallback(async () => {
    if (user) {
      const u = await getUser(user.id)
      if (u) setUser(u)
    }
  }, [user])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}
