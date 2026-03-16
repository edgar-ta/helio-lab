"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { updateUserProfile } from "@/lib/api-client"
import type { Timezone } from "@/lib/types"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

const TIMEZONES: { value: Timezone; label: string }[] = [
  { value: "America/Mexico_City", label: "Mexico (Ciudad de Mexico)" },
  { value: "Europe/Madrid", label: "Espana (Madrid)" },
]

export function ProfileForm() {
  const { user, refreshUser } = useAuth()
  const [fullName, setFullName] = useState(user?.full_name ?? "")
  const [degree, setDegree] = useState(user?.degree ?? "")
  const [timezone, setTimezone] = useState<Timezone>(
    user?.timezone ?? "America/Mexico_City"
  )
  const [saving, setSaving] = useState(false)

  if (!user) return null

  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await updateUserProfile(user!.id, {
      full_name: fullName.trim(),
      degree: degree.trim(),
      timezone,
    })
    await refreshUser()
    setSaving(false)
    toast.success("Perfil actualizado correctamente")
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-xl font-bold text-foreground">Mi perfil</h1>

      <Card className="max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={user.profile_picture} alt={user.full_name} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{user.full_name}</CardTitle>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="full-name">Nombre completo</Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="degree">Grado academico</Label>
              <Input
                id="degree"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="Ej: Doctor en Mecatronica Aplicada"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="timezone">Zona horaria</Label>
              <Select
                value={timezone}
                onValueChange={(v) => setTimezone(v as Timezone)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona tu zona horaria" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={saving} className="mt-2 self-start">
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
