'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { suspendUser } from '@/lib/api/users'
import type { User } from '@/lib/api/users'

interface Props {
  user: User | null
  onClose: () => void
  onSuspended: (user: User) => void
  addToast: (message: string, type?: 'success' | 'error' | 'warning') => void
}

export function UserSuspendModal({ user, onClose, onSuspended, addToast }: Props) {
  const [suspendReason, setSuspendReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) {
      setSuspendReason('')
    }
  }, [user])

  async function handleConfirm() {
    if (!user) return
    if (!suspendReason.trim()) return
    setSubmitting(true)
    try {
      const updated = await suspendUser(user.id, suspendReason.trim())
      onSuspended(updated)
      addToast(
        `${updated.firstName} ${updated.lastName} ha sido suspendido/a.`,
        'warning'
      )
    } catch {
      addToast('Ocurrió un error al suspender el usuario.', 'error')
    } finally {
      setSubmitting(false)
      onClose()
    }
  }

  return (
    <Dialog
      open={user !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Suspender Usuario</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-2">
          <p className="text-sm text-text-secondary">
            Al suspender a{' '}
            <strong>
              {user?.firstName} {user?.lastName}
            </strong>
            , el acceso quedará bloqueado de inmediato. Indica el motivo:
          </p>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-text-secondary">
              Motivo de suspensión
            </label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-border transition-[box-shadow,border-color] duration-150 placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-light focus-visible:border-primary-light resize-none"
              placeholder="Ej. Acceso no autorizado detectado."
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={submitting || !suspendReason.trim()}
          >
            Suspender
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
