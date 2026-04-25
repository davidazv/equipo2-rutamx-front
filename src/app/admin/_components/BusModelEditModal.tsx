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
  fuel_type: FuelType
  autonomy_km: string
  passenger_capacity: string
  unit_cost_usd: string
  battery_capacity_kwh: string
  charge_time_hours: string
  max_speed_kmh: string
}

type FormErrors = Partial<Record<keyof BusModelFormData, string>>

const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  ELECTRIC: 'Eléctrico',
  HYBRID: 'Híbrido',
  HYDROGEN: 'Hidrógeno',
}

// ── Helpers ────────────────────────────────────────────────────────────────

function parsePositiveFloat(value: string): number | null {
  const n = parseFloat(value)
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
    fuel_type: model.fuel_type,
    autonomy_km: String(model.autonomy_km),
    passenger_capacity: String(model.passenger_capacity),
    unit_cost_usd: String(model.unit_cost_usd),
    battery_capacity_kwh: String(model.battery_capacity_kwh),
    charge_time_hours: String(model.charge_time_hours),
    max_speed_kmh: String(model.max_speed_kmh),
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
    fuel_type: 'ELECTRIC',
    autonomy_km: '',
    passenger_capacity: '',
    unit_cost_usd: '',
    battery_capacity_kwh: '',
    charge_time_hours: '',
    max_speed_kmh: '',
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  // Preload form data when model changes
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

    if (parsePositiveInt(form.autonomy_km) === null)
      errors.autonomy_km = 'Ingresa un número entero mayor a 0.'
    if (parsePositiveInt(form.passenger_capacity) === null)
      errors.passenger_capacity = 'Ingresa un número entero mayor a 0.'
    if (parsePositiveFloat(form.unit_cost_usd) === null)
      errors.unit_cost_usd = 'Ingresa un valor mayor a 0.'
    if (parsePositiveFloat(form.battery_capacity_kwh) === null)
      errors.battery_capacity_kwh = 'Ingresa un valor mayor a 0.'
    if (parsePositiveFloat(form.charge_time_hours) === null)
      errors.charge_time_hours = 'Ingresa un valor mayor a 0.'
    if (parsePositiveInt(form.max_speed_kmh) === null)
      errors.max_speed_kmh = 'Ingresa un número entero mayor a 0.'

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
        fuel_type: form.fuel_type,
        autonomy_km: parsePositiveInt(form.autonomy_km)!,
        passenger_capacity: parsePositiveInt(form.passenger_capacity)!,
        unit_cost_usd: parsePositiveFloat(form.unit_cost_usd)!,
        battery_capacity_kwh: parsePositiveFloat(form.battery_capacity_kwh)!,
        charge_time_hours: parsePositiveFloat(form.charge_time_hours)!,
        max_speed_kmh: parsePositiveInt(form.max_speed_kmh)!,
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

  // ── Field helper ───────────────────────────────────────────────────────

  function field(key: keyof BusModelFormData) {
    return {
      value: form[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((f) => ({ ...f, [key]: e.target.value }))
        setFormErrors((fe) => ({ ...fe, [key]: undefined }))
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
                <Input placeholder="ej. eCitaro G" {...field('name')} />
                {formErrors.name && <p className="text-xs text-danger">{formErrors.name}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-text-secondary">Fabricante</label>
                <Input placeholder="ej. Mercedes-Benz" {...field('manufacturer')} />
                {formErrors.manufacturer && <p className="text-xs text-danger">{formErrors.manufacturer}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-text-secondary">Tipo de combustible</label>
              <Select
                value={form.fuel_type}
                onValueChange={(v) => setForm((f) => ({ ...f, fuel_type: v as FuelType }))}
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
                <Input type="number" min="1" placeholder="ej. 250" {...field('autonomy_km')} />
                {formErrors.autonomy_km && <p className="text-xs text-danger">{formErrors.autonomy_km}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-text-secondary">Capacidad de pasajeros</label>
                <Input type="number" min="1" placeholder="ej. 120" {...field('passenger_capacity')} />
                {formErrors.passenger_capacity && <p className="text-xs text-danger">{formErrors.passenger_capacity}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-text-secondary">Capacidad batería (kWh)</label>
                <Input type="number" min="0.1" step="0.1" placeholder="ej. 392" {...field('battery_capacity_kwh')} />
                {formErrors.battery_capacity_kwh && <p className="text-xs text-danger">{formErrors.battery_capacity_kwh}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-text-secondary">Tiempo de carga (horas)</label>
                <Input type="number" min="0.1" step="0.1" placeholder="ej. 3.5" {...field('charge_time_hours')} />
                {formErrors.charge_time_hours && <p className="text-xs text-danger">{formErrors.charge_time_hours}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-text-secondary">Velocidad máxima (km/h)</label>
                <Input type="number" min="1" placeholder="ej. 80" {...field('max_speed_kmh')} />
                {formErrors.max_speed_kmh && <p className="text-xs text-danger">{formErrors.max_speed_kmh}</p>}
              </div>
            </div>
          </section>

          {/* ── Costos ─────────────────────────────────────────────────── */}
          <section className="flex flex-col gap-3 border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground">Costos</p>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-text-secondary">Costo unitario (USD)</label>
              <Input type="number" min="1" step="1000" placeholder="ej. 620000" {...field('unit_cost_usd')} />
              {formErrors.unit_cost_usd && <p className="text-xs text-danger">{formErrors.unit_cost_usd}</p>}
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
