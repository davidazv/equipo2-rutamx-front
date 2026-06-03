import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '../badge'

describe('Badge', () => {
  it('renderiza sin errores', () => {
    render(<Badge>Nuevo</Badge>)
    expect(screen.getByText('Nuevo')).toBeInTheDocument()
  })

  it('muestra el contenido pasado como children', () => {
    render(<Badge>Estado activo</Badge>)
    expect(screen.getByText('Estado activo')).toBeInTheDocument()
  })

  it('renderiza variante secondary sin errores', () => {
    render(<Badge variant="secondary">Secundario</Badge>)
    expect(screen.getByText('Secundario')).toBeInTheDocument()
  })

  it('renderiza variante destructive sin errores', () => {
    render(<Badge variant="destructive">Error</Badge>)
    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('renderiza variante success sin errores', () => {
    render(<Badge variant="success">Activo</Badge>)
    expect(screen.getByText('Activo')).toBeInTheDocument()
  })

  it('renderiza variante warning sin errores', () => {
    render(<Badge variant="warning">Pendiente</Badge>)
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
  })

  it('renderiza variante outline sin errores', () => {
    render(<Badge variant="outline">Outline</Badge>)
    expect(screen.getByText('Outline')).toBeInTheDocument()
  })
})
