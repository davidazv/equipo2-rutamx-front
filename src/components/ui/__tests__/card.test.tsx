import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card'

describe('Card', () => {
  it('renderiza sin errores', () => {
    render(<Card>Contenido</Card>)
    expect(screen.getByText('Contenido')).toBeInTheDocument()
  })

  it('muestra children correctamente', () => {
    render(<Card><span>Hijo</span></Card>)
    expect(screen.getByText('Hijo')).toBeInTheDocument()
  })
})

describe('CardHeader', () => {
  it('renderiza sin errores', () => {
    render(<CardHeader>Header</CardHeader>)
    expect(screen.getByText('Header')).toBeInTheDocument()
  })
})

describe('CardTitle', () => {
  it('renderiza sin errores', () => {
    render(<CardTitle>Título</CardTitle>)
    expect(screen.getByText('Título')).toBeInTheDocument()
  })

  it('muestra el texto pasado como children', () => {
    render(<CardTitle>Mi tarjeta</CardTitle>)
    expect(screen.getByRole('heading', { name: /mi tarjeta/i })).toBeInTheDocument()
  })
})

describe('CardDescription', () => {
  it('renderiza sin errores', () => {
    render(<CardDescription>Descripción</CardDescription>)
    expect(screen.getByText('Descripción')).toBeInTheDocument()
  })
})

describe('CardContent', () => {
  it('renderiza sin errores', () => {
    render(<CardContent>Contenido</CardContent>)
    expect(screen.getByText('Contenido')).toBeInTheDocument()
  })
})

describe('CardFooter', () => {
  it('renderiza sin errores', () => {
    render(<CardFooter>Footer</CardFooter>)
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('muestra múltiples children', () => {
    render(
      <CardFooter>
        <span>Cancelar</span>
        <span>Guardar</span>
      </CardFooter>
    )
    expect(screen.getByText('Cancelar')).toBeInTheDocument()
    expect(screen.getByText('Guardar')).toBeInTheDocument()
  })
})

describe('Card — composición completa', () => {
  it('renderiza todos los sub-componentes sin errores', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Título</CardTitle>
          <CardDescription>Descripción</CardDescription>
        </CardHeader>
        <CardContent>Cuerpo</CardContent>
        <CardFooter>Pie</CardFooter>
      </Card>
    )
    expect(screen.getByText('Título')).toBeInTheDocument()
    expect(screen.getByText('Descripción')).toBeInTheDocument()
    expect(screen.getByText('Cuerpo')).toBeInTheDocument()
    expect(screen.getByText('Pie')).toBeInTheDocument()
  })
})
