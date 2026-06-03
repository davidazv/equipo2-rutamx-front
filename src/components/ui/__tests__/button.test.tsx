import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../button'

describe('Button', () => {
  it('renderiza sin errores', () => {
    // Arrange / Act
    render(<Button>Guardar</Button>)

    // Assert
    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument()
  })

  it('muestra el texto pasado como children', () => {
    render(<Button>Cancelar</Button>)
    expect(screen.getByText('Cancelar')).toBeInTheDocument()
  })

  it('llama onClick al hacer click', async () => {
    // Arrange
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Enviar</Button>)

    // Act
    await user.click(screen.getByRole('button'))

    // Assert
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('está deshabilitado cuando se pasa la prop disabled', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('no llama onClick cuando está deshabilitado', async () => {
    // Arrange
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>Disabled</Button>)

    // Act
    await user.click(screen.getByRole('button'))

    // Assert
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renderiza variante destructive sin errores', () => {
    render(<Button variant="destructive">Eliminar</Button>)
    expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument()
  })

  it('renderiza variante outline sin errores', () => {
    render(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('button', { name: /outline/i })).toBeInTheDocument()
  })

  it('renderiza tamaño sm sin errores', () => {
    render(<Button size="sm">Pequeño</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
