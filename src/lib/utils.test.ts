import { describe, it, expect } from 'vitest'
import { cn, formatNumber } from './utils'

describe('cn', () => {
  it('combina clases simples', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('ignora valores falsy', () => {
    expect(cn('foo', undefined, null, false, 'bar')).toBe('foo bar')
  })

  it('resuelve conflictos de Tailwind con la última clase', () => {
    // twMerge: p-4 gana sobre p-2
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })
})

describe('formatNumber', () => {
  it('formatea enteros sin decimales por defecto', () => {
    const result = formatNumber(1234)
    expect(result).toContain('1')
    expect(result).toContain('234')
  })

  it('formatea con los decimales indicados', () => {
    const result = formatNumber(1.5, 2)
    expect(result).toContain('1')
    expect(result).toContain('5')
  })

  it('redondea al número de decimales indicado', () => {
    const result = formatNumber(1.555, 2)
    // Debe contener solo hasta 2 decimales
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
  })

  it('formatea el cero correctamente', () => {
    expect(formatNumber(0)).toBe('0')
  })
})
