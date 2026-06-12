'use client'

import { useState } from 'react'

type ToastType = 'success' | 'error' | 'warning'

interface UseConfirmActionOptions {
  /** The async operation to run when the user confirms. */
  action: () => Promise<void>
  /** Toast shown when the action throws. */
  errorToast: { message: string; type?: ToastType }
  /** Toast publisher (same signature used across admin modals). */
  addToast: (message: string, type?: ToastType) => void
  /** Always called after the action settles (success or error). */
  onClose: () => void
}

/**
 * Encapsulates the confirm-modal submit lifecycle shared by the admin
 * confirmation modals: toggles a `submitting` flag, runs the action, shows an
 * error toast on failure, and always closes the modal when finished.
 *
 * The caller's `action` is responsible for its own success side effects
 * (success toast, list callbacks) so each modal keeps its specific behaviour.
 */
export function useConfirmAction({
  action,
  errorToast,
  addToast,
  onClose,
}: UseConfirmActionOptions) {
  const [submitting, setSubmitting] = useState(false)

  async function confirm() {
    setSubmitting(true)
    try {
      await action()
    } catch {
      addToast(errorToast.message, errorToast.type ?? 'error')
    } finally {
      setSubmitting(false)
      onClose()
    }
  }

  return { submitting, confirm }
}
