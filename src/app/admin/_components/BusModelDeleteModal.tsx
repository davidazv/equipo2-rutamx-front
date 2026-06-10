'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { deleteBusModel } from '@/lib/api/bus-models'
import type { BusModel } from '@/lib/api/bus-models'
import { useConfirmAction } from '@/hooks/use-confirm-action'

// ── Props ──────────────────────────────────────────────────────────────────

interface Props {
  model: BusModel | null
  onClose: () => void
  onDeleted: (modelId: number) => void
  addToast: (message: string, type?: 'success' | 'error' | 'warning') => void
}

// ── Component ──────────────────────────────────────────────────────────────

export function BusModelDeleteModal({ model, onClose, onDeleted, addToast }: Props) {
  const { submitting, confirm: handleConfirm } = useConfirmAction({
    action: async () => {
      if (!model) return
      await deleteBusModel(model.id)
      onDeleted(model.id)
      addToast(`Modelo "${model.name}" eliminado.`, 'warning')
    },
    errorToast: { message: 'Ocurrió un error al eliminar el modelo.' },
    addToast,
    onClose,
  })

  return (
    <Dialog open={model !== null} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Eliminar Modelo</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-2">
          <div className="flex items-start gap-3 rounded-lg bg-danger/5 border border-danger/20 p-3">
            <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              ¿Estás seguro de que deseas eliminar el modelo{' '}
              <strong>{model?.name}</strong> de{' '}
              <strong>{model?.manufacturer}</strong>? Esta acción no se puede
              deshacer.
            </p>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={submitting}>
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
