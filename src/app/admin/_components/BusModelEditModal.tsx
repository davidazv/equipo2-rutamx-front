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
import { updateBusModel } from '@/lib/api/bus-models'
import type { BusModel } from '@/lib/api/bus-models'
import {
  BusModelFormFields,
  modelToBusModelForm,
  parsePositiveFloat,
  parsePositiveInt,
  validateBusModelForm,
  type BusModelFormData,
  type BusModelFormErrors,
} from './bus-model-form'

// ── Props ──────────────────────────────────────────────────────────────────

interface Props {
  readonly model: BusModel | null
  readonly onClose: () => void
  readonly onUpdated: (model: BusModel) => void
  readonly addToast: (message: string, type?: 'success' | 'error' | 'warning') => void
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
  const [formErrors, setFormErrors] = useState<BusModelFormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (model) {
      setForm(modelToBusModelForm(model))
      setFormErrors({})
    }
  }, [model])

  // ── Validation ─────────────────────────────────────────────────────────

  function validateForm(): boolean {
    const errors = validateBusModelForm(form)
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

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <Dialog open={model !== null} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="bus-model-detail">
        <DialogHeader>
          <DialogTitle>Editar Modelo de Autobús</DialogTitle>
        </DialogHeader>

        <BusModelFormFields
          form={form}
          setForm={setForm}
          formErrors={formErrors}
          setFormErrors={setFormErrors}
        />

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
