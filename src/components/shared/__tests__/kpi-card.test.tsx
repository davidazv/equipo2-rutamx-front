import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KpiCard } from '../kpi-card'

describe('KpiCard', () => {
  it('renderiza sin errores', () => {
    render(<KpiCard title="Buses activos" value={42} />)
    expect(screen.getByText('Buses activos')).toBeInTheDocument()
  })

  it('muestra el título pasado como prop', () => {
    render(<KpiCard title="Rutas operadas" value={15} />)
    expect(screen.getByText('Rutas operadas')).toBeInTheDocument()
  })

  it('muestra el valor numérico pasado como prop', () => {
    render(<KpiCard title="KPI" value={42} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('muestra el valor como string pasado como prop', () => {
    render(<KpiCard title="Ahorro" value="$1,234 MXN" />)
    expect(screen.getByText('$1,234 MXN')).toBeInTheDocument()
  })

  it('muestra el sub cuando se pasa como prop', () => {
    render(<KpiCard title="KPI" value={42} sub="+5% este mes" />)
    expect(screen.getByText('+5% este mes')).toBeInTheDocument()
  })

  it('no muestra sub cuando no se pasa', () => {
    render(<KpiCard title="KPI" value={42} />)
    expect(screen.queryByText('+5% este mes')).not.toBeInTheDocument()
  })

  it('muestra el ícono cuando se pasa como prop', () => {
    render(<KpiCard title="KPI" value={1} icon={<span data-testid="my-icon">★</span>} />)
    expect(screen.getByTestId('my-icon')).toBeInTheDocument()
  })

  it('no muestra contenedor de ícono cuando no se pasa icon', () => {
    render(<KpiCard title="KPI" value={1} />)
    expect(screen.queryByTestId('my-icon')).not.toBeInTheDocument()
  })
})
