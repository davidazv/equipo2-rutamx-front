import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Spinner } from '../spinner'

describe('Spinner', () => {
  it('renderiza sin errores', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('tiene aria-label "Loading"', () => {
    render(<Spinner />)
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
  })

  it('renderiza con tamaño sm sin errores', () => {
    render(<Spinner size="sm" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renderiza con tamaño lg sin errores', () => {
    render(<Spinner size="lg" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renderiza variante white sin errores', () => {
    render(<Spinner variant="white" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renderiza variante muted sin errores', () => {
    render(<Spinner variant="muted" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
