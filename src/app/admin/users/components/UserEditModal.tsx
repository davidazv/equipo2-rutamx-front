'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateUser } from '@/lib/api/users'
import type { User, Role, UserStatus } from '@/lib/api/users'

interface UserFormData {
  fullName: string
  email: string
  role: Role
  status: UserStatus
}

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/)
  const firstName = parts[0] ?? ''
  const lastName = parts.slice(1).join(' ')
  return { firstName, lastName }
}

interface Props {
  user: User | null
  onClose: () => void
  onUpdated: (user: User) => void
  addToast: (message: string, type?: 'success' | 'error' | 'warning') => void
}

export function UserEditModal({ user, onClose, onUpdated, addToast }: Props) {
  const [form, setForm] = useState<UserFormData>({
    fullName: '',
    email: '',
    role: 'ADMIN',
    status: 'ACTIVE',
  })
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof UserFormData, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        role: user.role,
        status: user.status,
      })
      setFormErrors({})
    }
  }, [user])

  function validateForm(): boolean {
    const errors: Partial<Record<keyof UserFormData, string>> = {}

    if (!form.fullName.trim()) {
      errors.fullName = 'El nombre es obligatorio.'
    }
    if (!form.email.trim()) {
      errors.email = 'El correo es obligatorio.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Ingresa un correo válido.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit() {
    if (!user) return
    if (!validateForm()) return
    setSubmitting(true)
    try {
      const { firstName, lastName } = splitFullName(form.fullName)
      const updated = await updateUser(user.id, {
        firstName,
        lastName,
        email: form.email,
        role: form.role,
        status: form.status,
      })
      onUpdated(updated)
      onClose()
      addToast(
        `Los datos de ${updated.firstName} ${updated.lastName} han sido actualizados.`
      )
    } catch (err) {
      if (err instanceof Error && err.message === 'EMAIL_TAKEN') {
        setFormErrors((prev) => ({
          ...prev,
          email: 'Este correo ya está registrado.',
        }))
      } else {
        addToast('Ocurrió un error al actualizar el usuario.', 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={user !== null} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 mt-2">
          {/* ── Información ────────────────────────────────────────────── */}
          <section className="flex flex-col gap-3">
            <p className="text-sm font-medium text-foreground">Información</p>

            {/* Nombre completo */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-text-secondary">
                Nombre completo
              </label>
              <Input
                placeholder="Nombre Apellido"
                value={form.fullName}
                onChange={(e) => {
                  setForm((f) => ({ ...f, fullName: e.target.value }))
                  setFormErrors((fe) => ({ ...fe, fullName: undefined }))
                }}
              />
              {formErrors.fullName && (
                <p className="text-xs text-danger">{formErrors.fullName}</p>
              )}
            </div>

            {/* Correo */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-text-secondary">
                Correo electrónico
              </label>
              <Input
                type="email"
                placeholder="correo@rutamx.com"
                value={form.email}
                onChange={(e) => {
                  setForm((f) => ({ ...f, email: e.target.value }))
                  setFormErrors((fe) => ({ ...fe, email: undefined }))
                }}
              />
              {formErrors.email && (
                <p className="text-xs text-danger">{formErrors.email}</p>
              )}
            </div>
          </section>

          {/* ── Rol y Estado ───────────────────────────────────────────── */}
          <section className="flex flex-col gap-3 border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground">Rol y Estado</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-text-secondary">Rol</label>
                <Select
                  value={form.role}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, role: v as Role }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="CEO">CEO</SelectItem>
                    <SelectItem value="COO">COO</SelectItem>
                    <SelectItem value="CMO">CMO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-text-secondary">Estado</label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, status: v as UserStatus }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Activo</SelectItem>
                    <SelectItem value="SUSPENDED">Suspendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
