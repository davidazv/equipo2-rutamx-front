import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorState } from '../error-state'

describe('ErrorState', () => {
  it('renderiza sin errores', () => {
    render(<ErrorState />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('muestra el título por defecto cuando no se pasa title', () => {
    render(<ErrorState />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('muestra el título personalizado cuando se pasa como prop', () => {
    render(<ErrorState title="Error de conexión" />)
    expect(screen.getByText('Error de conexión')).toBeInTheDocument()
  })

  it('muestra la descripción cuando se pasa como prop', () => {
    render(<ErrorState description="Intenta de nuevo más tarde" />)
    expect(screen.getByText('Intenta de nuevo más tarde')).toBeInTheDocument()
  })

  it('no muestra descripción cuando no se pasa', () => {
    render(<ErrorState title="Error" />)
    expect(screen.queryByText('Intenta de nuevo')).not.toBeInTheDocument()
  })

  it('muestra la acción cuando se pasa como prop', () => {
    // Arrange / Act
    render(<ErrorState action={<button>Reintentar</button>} />)

    // Assert
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument()
  })

  it('no muestra la acción cuando no se pasa', () => {
    render(<ErrorState />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('muestra el ícono personalizado cuando se pasa', () => {
    render(<ErrorState icon={<span data-testid="custom-icon">!</span>} />)
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })
})
