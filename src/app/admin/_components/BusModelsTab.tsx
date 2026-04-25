'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Zap,
  Flame,
  Droplets,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { getBusModels } from '@/lib/api/bus-models'
import type { BusModel, FuelType } from '@/lib/api/bus-models'

import { BusModelCreateModal } from './BusModelCreateModal'
import { BusModelEditModal } from './BusModelEditModal'
import { BusModelDeleteModal } from './BusModelDeleteModal'

// ── Types ──────────────────────────────────────────────────────────────────

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning'
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

// ── Sub-components ─────────────────────────────────────────────────────────

const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  ELECTRIC: 'Eléctrico',
  HYBRID: 'Híbrido',
  HYDROGEN: 'Hidrógeno',
}

const FUEL_TYPE_ICONS: Record<FuelType, React.ReactNode> = {
  ELECTRIC: <Zap className="h-3 w-3" />,
  HYBRID: <Flame className="h-3 w-3" />,
  HYDROGEN: <Droplets className="h-3 w-3" />,
}

const FUEL_TYPE_VARIANT: Record<FuelType, 'success' | 'default' | 'secondary'> = {
  ELECTRIC: 'success',
  HYBRID: 'default',
  HYDROGEN: 'secondary',
}

function FuelTypeBadge({ fuelType }: { fuelType: FuelType }) {
  return (
    <Badge variant={FUEL_TYPE_VARIANT[fuelType]} className="gap-1">
      {FUEL_TYPE_ICONS[fuelType]}
      {FUEL_TYPE_LABELS[fuelType]}
    </Badge>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const colours: Record<Toast['type'], string> = {
    success: 'bg-surface border-success/30 text-success',
    error: 'bg-surface border-danger/30 text-danger',
    warning: 'bg-surface border-warning/30 text-warning',
  }
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-md text-sm font-medium ${colours[toast.type]}`}
    >
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Cerrar notificación"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────

export default function BusModelsTab() {
  const [busModels, setBusModels] = useState<BusModel[]>([])
  const [search, setSearch] = useState('')
  const [toasts, setToasts] = useState<Toast[]>([])

  const [createOpen, setCreateOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<BusModel | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BusModel | null>(null)

  useEffect(() => {
    getBusModels().then(setBusModels)
  }, [])

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const filteredModels = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return busModels
    return busModels.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.manufacturer.toLowerCase().includes(q) ||
        m.fuel_type.toLowerCase().includes(q)
    )
  }, [busModels, search])

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
          <Input
            placeholder="Buscar modelos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Agregar Modelo
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-surface shadow-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Modelo</TableHead>
              <TableHead>Fabricante</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Autonomía (km)</TableHead>
              <TableHead className="text-right">Pasajeros</TableHead>
              <TableHead className="text-right">Batería (kWh)</TableHead>
              <TableHead className="text-right">Vel. Máx. (km/h)</TableHead>
              <TableHead className="text-right">Costo (USD)</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredModels.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-text-muted py-12">
                  No se encontraron modelos.
                </TableCell>
              </TableRow>
            )}
            {filteredModels.map((model) => (
              <TableRow key={model.id}>
                <TableCell className="font-medium">{model.name}</TableCell>
                <TableCell className="text-text-secondary">{model.manufacturer}</TableCell>
                <TableCell><FuelTypeBadge fuelType={model.fuel_type} /></TableCell>
                <TableCell className="text-right font-mono text-sm">{model.autonomy_km}</TableCell>
                <TableCell className="text-right font-mono text-sm">{model.passenger_capacity}</TableCell>
                <TableCell className="text-right font-mono text-sm">{model.battery_capacity_kwh}</TableCell>
                <TableCell className="text-right font-mono text-sm">{model.max_speed_kmh}</TableCell>
                <TableCell className="text-right font-mono text-sm">{formatCurrency(model.unit_cost_usd)}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => setEditingModel(model)}
                      title="Editar modelo"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => setDeleteTarget(model)}
                      title="Eliminar modelo"
                      className="text-danger hover:text-danger hover:bg-danger/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modals */}
      <BusModelCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(model) => setBusModels((prev) => [...prev, model])}
        addToast={addToast}
      />
      <BusModelEditModal
        model={editingModel}
        onClose={() => setEditingModel(null)}
        onUpdated={(updated) =>
          setBusModels((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
        }
        addToast={addToast}
      />
      <BusModelDeleteModal
        model={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={(modelId) => setBusModels((prev) => prev.filter((m) => m.id !== modelId))}
        addToast={addToast}
      />

      {/* Toast stack */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-80">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismissToast} />
          ))}
        </div>
      )}
    </>
  )
}
