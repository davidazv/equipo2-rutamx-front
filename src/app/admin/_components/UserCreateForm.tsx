'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
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
import { createUser } from '@/lib/api/users'
import type { User, Role } from '@/lib/api/users'

interface UserFormData {
  fullName: string
  email: string
  role: Role
  password: string
  confirmPassword: string
}

const EMPTY_FORM: UserFormData = {
  fullName: '',
  email: '',
  role: 'ADMIN',
  password: '',
  confirmPassword: '',
}

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/)
  const firstName = parts[0] ?? ''
  const lastName = parts.slice(1).join(' ')
  return { firstName, lastName }
}

interface Props {
  open: boolean
  onClose: () => void
  onCreated: (user: User) => void
  addToast: (message: string, type?: 'success' | 'error' | 'warning') => void
}

export function UserCreateForm({ open, onClose, onCreated, addToast }: Props) {
  const [form, setForm] = useState<UserFormData>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof UserFormData, string>>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM)
      setFormErrors({})
      setShowPassword(false)
      setShowConfirmPassword(false)
    }
  }, [open])

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
    if (!form.password) {
      errors.password = 'La contraseña es obligatoria.'
    } else if (form.password.length < 8) {
      errors.password = 'Mínimo 8 caracteres.'
    } else if (!/[A-Z]/.test(form.password) || !/\d/.test(form.password)) {
      errors.password = 'Debe incluir al menos una mayúscula y un número.'
    }
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit() {
    if (!validateForm()) return
    setSubmitting(true)
    try {
      const { firstName, lastName } = splitFullName(form.fullName)
      const user = await createUser({
        firstName,
        lastName,
        email: form.email,
        role: form.role,
        password: form.password,
      })
      onCreated(user)
      onClose()
      addToast(`Usuario ${user.firstName} ${user.lastName} creado correctamente.`)
    } catch (err) {
      if (err instanceof Error && err.message === 'EMAIL_TAKEN') {
        setFormErrors((prev) => ({ ...prev, email: 'Este correo ya está registrado.' }))
      } else {
        addToast('Ocurrió un error al crear el usuario.', 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo Usuario</DialogTitle>
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

          {/* ── Rol ───────────────────────────────────────────────────── */}
          <section className="flex flex-col gap-3 border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground">Rol</p>
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
          </section>

          {/* ── Contraseña ─────────────────────────────────────────────── */}
          <section className="flex flex-col gap-3 border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground">Contraseña</p>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-text-secondary">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Contraseña"
                  value={form.password}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, password: e.target.value }))
                    setFormErrors((fe) => ({ ...fe, password: undefined }))
                  }}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-xs text-danger">{formErrors.password}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-text-secondary">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repetir contraseña"
                  value={form.confirmPassword}
                  onChange={(e) => {
                    setForm((f) => ({
                      ...f,
                      confirmPassword: e.target.value,
                    }))
                    setFormErrors((fe) => ({
                      ...fe,
                      confirmPassword: undefined,
                    }))
                  }}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground transition-colors"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="text-xs text-danger">
                  {formErrors.confirmPassword}
                </p>
              )}
            </div>
          </section>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            Crear Usuario
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
