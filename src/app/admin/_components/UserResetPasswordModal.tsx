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
import { PasswordRequirements, passwordMeetsRequirements } from '@/components/ui/password-requirements'
import { resetUserPassword } from '@/lib/api/users'
import type { User } from '@/lib/api/users'

interface Props {
  user: User | null
  onClose: () => void
  addToast: (message: string, type?: 'success' | 'error' | 'warning') => void
}

export function UserResetPasswordModal({ user, onClose, addToast }: Props) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      setNewPassword('')
      setConfirmPassword('')
    }
  }, [user])

  async function handleConfirm() {
    if (!user) return
    if (!passwordMeetsRequirements(newPassword)) return
    if (newPassword !== confirmPassword) return
    setSubmitting(true)
    try {
      await resetUserPassword(user.id, newPassword)
      addToast(`Contraseña de ${user.firstName} ${user.lastName} restablecida correctamente.`)
      onClose()
    } catch {
      addToast('Ocurrió un error al restablecer la contraseña.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const passwordsMatch = newPassword === confirmPassword
  const canSubmit = passwordMeetsRequirements(newPassword) && passwordsMatch && !submitting

  return (
    <Dialog open={user !== null} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Restablecer Contraseña</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <p className="text-sm text-text-secondary">
            Establece una nueva contraseña para{' '}
            <strong>{user?.firstName} {user?.lastName}</strong>.
            El usuario podrá iniciar sesión con ella de inmediato.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Nueva contraseña
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={submitting}
            />
            <PasswordRequirements password={newPassword} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Confirmar contraseña
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={submitting}
            />
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-red-500">Las contraseñas no coinciden</p>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!canSubmit}>
            {submitting ? 'Restableciendo...' : 'Restablecer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
