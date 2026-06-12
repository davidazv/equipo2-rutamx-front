'use client'

import type React from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { BusModel, FuelType } from '@/lib/api/bus-models'

// ── Types ──────────────────────────────────────────────────────────────────

export interface BusModelFormData {
  name: string
  manufacturer: string
  fuelType: FuelType
  autonomyKm: string
  passengerCapacity: string
  unitCostUsd: string
  batteryCapacityKwh: string
}

export type BusModelFormErrors = Partial<Record<keyof BusModelFormData, string>>

export const EMPTY_BUS_MODEL_FORM: BusModelFormData = {
  name: '',
  manufacturer: '',
  fuelType: 'ELECTRIC',
  autonomyKm: '',
  passengerCapacity: '',
  unitCostUsd: '',
  batteryCapacityKwh: '',
}

const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  ELECTRIC: 'Eléctrico',
  DIESEL: 'Diésel',
}

// ── Helpers ────────────────────────────────────────────────────────────────

export function parsePositiveFloat(value: string): number | null {
  const n = Number.parseFloat(value.replaceAll(/,/g, ''))
  return Number.isNaN(n) || n <= 0 ? null : n
}

export function parsePositiveInt(value: string): number | null {
  const n = Number.parseInt(value, 10)
  return Number.isNaN(n) || n <= 0 ? null : n
}

export function modelToBusModelForm(model: BusModel): BusModelFormData {
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

export function validateBusModelForm(form: BusModelFormData): BusModelFormErrors {
  const errors: BusModelFormErrors = {}

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

  return errors
}

// ── Fields component ─────────────────────────────────────────────────────────

interface BusModelFormFieldsProps {
  readonly form: BusModelFormData
  readonly setForm: React.Dispatch<React.SetStateAction<BusModelFormData>>
  readonly formErrors: BusModelFormErrors
  readonly setFormErrors: React.Dispatch<React.SetStateAction<BusModelFormErrors>>
}

export function BusModelFormFields({
  form,
  setForm,
  formErrors,
  setFormErrors,
}: BusModelFormFieldsProps) {
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
        const digits = e.target.value.replace(/\D/g, '')
        const formatted = digits ? Number.parseInt(digits, 10).toLocaleString('es-MX') : ''
        setForm((f) => ({ ...f, unitCostUsd: formatted }))
        setFormErrors((fe) => ({ ...fe, unitCostUsd: undefined }))
      },
    }
  }

  return (
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
  )
}
