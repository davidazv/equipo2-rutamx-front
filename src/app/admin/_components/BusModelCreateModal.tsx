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
import { createBusModel } from '@/lib/api/bus-models'
import type { BusModel } from '@/lib/api/bus-models'
import {
  BusModelFormFields,
  EMPTY_BUS_MODEL_FORM,
  parsePositiveFloat,
  parsePositiveInt,
  validateBusModelForm,
  type BusModelFormData,
  type BusModelFormErrors,
} from './bus-model-form'

// ── Props ──────────────────────────────────────────────────────────────────

interface Props {
  readonly open: boolean
  readonly onClose: () => void
  readonly onCreated: (model: BusModel) => void
  readonly addToast: (message: string, type?: 'success' | 'error' | 'warning') => void
}

// ── Component ──────────────────────────────────────────────────────────────

export function BusModelCreateModal({ open, onClose, onCreated, addToast }: Props) {
  const [form, setForm] = useState<BusModelFormData>(EMPTY_BUS_MODEL_FORM)
  const [formErrors, setFormErrors] = useState<BusModelFormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(EMPTY_BUS_MODEL_FORM)
      setFormErrors({})
    }
  }, [open])

  // ── Validation ─────────────────────────────────────────────────────────

  function validateForm(): boolean {
    const errors = validateBusModelForm(form)
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // ── Submit ─────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!validateForm()) return
    setSubmitting(true)
    try {
      const model = await createBusModel({
        name: form.name.trim(),
        manufacturer: form.manufacturer.trim(),
        fuelType: form.fuelType,
        autonomyKm: parsePositiveInt(form.autonomyKm)!,
        passengerCapacity: parsePositiveInt(form.passengerCapacity)!,
        unitCostUsd: parsePositiveFloat(form.unitCostUsd)!,
        batteryCapacityKwh: parsePositiveFloat(form.batteryCapacityKwh)!,
      })
      onCreated(model)
      onClose()
      addToast(`Modelo "${model.name}" agregado correctamente.`, 'success')
    } catch (err) {
      if (err instanceof Error && err.message === 'MODEL_ALREADY_EXISTS') {
        setFormErrors((prev) => ({
          ...prev,
          name: 'Ya existe un modelo con ese nombre y fabricante.',
        }))
      } else {
        addToast('Ocurrió un error al crear el modelo.', 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Modelo de Autobús</DialogTitle>
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
            Agregar Modelo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
