'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { deleteUser } from '@/lib/api/users'
import type { User } from '@/lib/api/users'

interface Props {
  user: User | null
  onClose: () => void
  onDeleted: (userId: number) => void
  addToast: (message: string, type?: 'success' | 'error' | 'warning') => void
}

export function UserDeleteModal({ user, onClose, onDeleted, addToast }: Props) {
  const [submitting, setSubmitting] = useState(false)

  async function handleConfirm() {
    if (!user) return
    setSubmitting(true)
    try {
      await deleteUser(user.id)
      onDeleted(user.id)
      addToast(
        `Usuario ${user.firstName} ${user.lastName} eliminado.`,
        'warning'
      )
    } catch {
      addToast('Ocurrió un error al eliminar el usuario.', 'error')
    } finally {
      setSubmitting(false)
      onClose()
    }
  }

  return (
    <Dialog
      open={user !== null}
      onOpenChange={(open) => { if (!open) onClose() }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Eliminar Usuario</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-2">
          <div className="flex items-start gap-3 rounded-lg bg-danger/5 border border-danger/20 p-3">
            <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              ¿Estás seguro de que deseas eliminar a{' '}
              <strong>
                {user?.firstName} {user?.lastName}
              </strong>
              ? El usuario será bloqueado de inmediato y su cuenta quedará
              inaccesible.
            </p>
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
            disabled={submitting}
          >
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
