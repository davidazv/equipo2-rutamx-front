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
import { updateBusModel } from '@/lib/api/bus-models'
import type { BusModel, FuelType } from '@/lib/api/bus-models'

// ── Types ──────────────────────────────────────────────────────────────────

interface BusModelFormData {
  name: string
  manufacturer: string
  fuelType: FuelType
  autonomyKm: string
  passengerCapacity: string
  unitCostUsd: string
  batteryCapacityKwh: string
}

type FormErrors = Partial<Record<keyof BusModelFormData, string>>

const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  ELECTRIC: 'Eléctrico',
  DIESEL: 'Diésel',
}

// ── Helpers ────────────────────────────────────────────────────────────────

function parsePositiveFloat(value: string): number | null {
  const n = parseFloat(value.replace(/,/g, ''))
  return isNaN(n) || n <= 0 ? null : n
}

function parsePositiveInt(value: string): number | null {
  const n = parseInt(value, 10)
  return isNaN(n) || n <= 0 ? null : n
}

function modelToForm(model: BusModel): BusModelFormData {
  return {
    name: model.name,
    manufacturer: model.manufacturer,
    fuelType: model.fuelType,
    autonomyKm: String(model.autonomyKm),
    passengerCapacity: String(model.passengerCapacity),
    unitCostUsd: model.unitCostUsd.toLocaleString('es-MX'),
    batteryCapacityKwh: String(model.batteryCapacityKwh ?? 0),
  }
}

// ── Props ──────────────────────────────────────────────────────────────────

interface Props {
  model: BusModel | null
  onClose: () => void
  onUpdated: (model: BusModel) => void
  addToast: (message: string, type?: 'success' | 'error' | 'warning') => void
}

// ── Component ──────────────────────────────────────────────────────────────

export function BusModelEditModal({ model, onClose, onUpdated, addToast }: Props) {
  const [form, setForm] = useState<BusModelFormData>({
    name: '',
    manufacturer: '',
    fuelType: 'ELECTRIC',
    autonomyKm: '',
    passengerCapacity: '',
    unitCostUsd: '',
    batteryCapacityKwh: '',
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (model) {
      setForm(modelToForm(model))
      setFormErrors({})
    }
  }, [model])

  // ── Validation ─────────────────────────────────────────────────────────

  function validateForm(): boolean {
    const errors: FormErrors = {}

    if (!form.name.trim()) errors.name = 'El nombre es obligatorio.'
    if (!form.manufacturer.trim()) errors.manufacturer = 'El fabricante es obligatorio.'

    if (parsePositiveInt(form.autonomyKm) === null)
      errors.autonomyKm = 'Ingresa un número entero mayor a 0.'
    if (parsePositiveInt(form.passengerCapacity) === null)
      errors.passengerCapacity = 'Ingresa un número entero mayor a 0.'
    if (parsePositiveFloat(form.unitCostUsd) === null)
      errors.unitCostUsd = 'Ingresa un valor mayor a 0.'
    if (parsePositiveFloat(form.batteryCapacityKwh) === null)
      errors.batteryCapacityKwh = 'Ingresa un valor mayor a 0.'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // ── Submit ─────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!model) return
    if (!validateForm()) return
    setSubmitting(true)
    try {
      const updated = await updateBusModel(model.id, {
        name: form.name.trim(),
        manufacturer: form.manufacturer.trim(),
        fuelType: form.fuelType,
        autonomyKm: parsePositiveInt(form.autonomyKm)!,
        passengerCapacity: parsePositiveInt(form.passengerCapacity)!,
        unitCostUsd: parsePositiveFloat(form.unitCostUsd)!,
        batteryCapacityKwh: parsePositiveFloat(form.batteryCapacityKwh)!,
      })
      onUpdated(updated)
      onClose()
      addToast(`Modelo "${updated.name}" actualizado correctamente.`, 'success')
    } catch (err) {
      if (err instanceof Error && err.message === 'MODEL_ALREADY_EXISTS') {
        setFormErrors((prev) => ({
          ...prev,
          name: 'Ya existe un modelo con ese nombre y fabricante.',
        }))
      } else {
        addToast('Ocurrió un error al actualizar el modelo.', 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ── Field helpers ──────────────────────────────────────────────────────

  function field(key: keyof BusModelFormData) {
    return {
      value: form[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((f) => ({ ...f, [key]: e.target.value }))
        setFormErrors((fe) => ({ ...fe, [key]: undefined }))
      },
    }
  }

  function costField() {
    return {
      value: form.unitCostUsd,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const digits = e.target.value.replace(/[^0-9]/g, '')
        const formatted = digits ? parseInt(digits, 10).toLocaleString('es-MX') : ''
        setForm((f) => ({ ...f, unitCostUsd: formatted }))
        setFormErrors((fe) => ({ ...fe, unitCostUsd: undefined }))
      },
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <Dialog open={model !== null} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Modelo de Autobús</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 mt-2">

          {/* ── Identificación ─────────────────────────────────────────── */}
          <section className="flex flex-col gap-3">
            <p className="text-sm font-medium text-foreground">Identificación</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-text-secondary">Nombre del modelo</label>
                <Input placeholder="ej. Yutong E12PRO" {...field('name')} />
                {formErrors.name && <p className="text-xs text-danger">{formErrors.name}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-text-secondary">Fabricante</label>
                <Input placeholder="ej. Yutong" {...field('manufacturer')} />
                {formErrors.manufacturer && <p className="text-xs text-danger">{formErrors.manufacturer}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-text-secondary">Tipo de combustible</label>
              <Select
                value={form.fuelType}
                onValueChange={(v) => setForm((f) => ({ ...f, fuelType: v as FuelType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(FUEL_TYPE_LABELS) as FuelType[]).map((ft) => (
                    <SelectItem key={ft} value={ft}>{FUEL_TYPE_LABELS[ft]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* ── Especificaciones técnicas ──────────────────────────────── */}
          <section className="flex flex-col gap-3 border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground">Especificaciones Técnicas</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-text-secondary">Autonomía (km)</label>
                <Input type="number" min="1" placeholder="ej. 300" {...field('autonomyKm')} />
                {formErrors.autonomyKm && <p className="text-xs text-danger">{formErrors.autonomyKm}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-text-secondary">Capacidad de pasajeros</label>
                <Input type="number" min="1" placeholder="ej. 85" {...field('passengerCapacity')} />
                {formErrors.passengerCapacity && <p className="text-xs text-danger">{formErrors.passengerCapacity}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-text-secondary">Capacidad batería (kWh)</label>
                <Input type="number" min="0.1" step="0.1" placeholder="ej. 352" {...field('batteryCapacityKwh')} />
                {formErrors.batteryCapacityKwh && <p className="text-xs text-danger">{formErrors.batteryCapacityKwh}</p>}
              </div>
            </div>
          </section>

          {/* ── Costos ─────────────────────────────────────────────────── */}
          <section className="flex flex-col gap-3 border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground">Costos</p>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-text-secondary">Costo unitario (USD)</label>
              <Input inputMode="numeric" placeholder="ej. 420,000" {...costField()} />
              {formErrors.unitCostUsd && <p className="text-xs text-danger">{formErrors.unitCostUsd}</p>}
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
