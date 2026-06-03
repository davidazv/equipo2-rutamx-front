import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
  useRouter: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  getRole: vi.fn(),
}))

import { useCurrentRole } from '../use-current-role'
import { useParams, useRouter } from 'next/navigation'
import { getRole } from '@/lib/auth'

describe('useCurrentRole', () => {
  const mockReplace = vi.fn()

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({ replace: mockReplace } as ReturnType<typeof useRouter>)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('retorna el rol correcto cuando el URL role y el almacenado coinciden', async () => {
    // Arrange
    vi.mocked(useParams).mockReturnValue({ role: 'ceo' })
    vi.mocked(getRole).mockReturnValue('ceo')

    // Act
    const { result } = renderHook(() => useCurrentRole())
    await act(async () => {})

    // Assert
    expect(result.current).toBe('ceo')
  })

  it('redirige a /login cuando no hay rol almacenado', async () => {
    // Arrange
    vi.mocked(useParams).mockReturnValue({ role: 'ceo' })
    vi.mocked(getRole).mockReturnValue(null)

    // Act
    renderHook(() => useCurrentRole())
    await act(async () => {})

    // Assert
    expect(mockReplace).toHaveBeenCalledWith('/login')
  })

  it('redirige a la ruta del rol almacenado cuando el URL role no coincide', async () => {
    // Arrange
    vi.mocked(useParams).mockReturnValue({ role: 'cmo' })
    vi.mocked(getRole).mockReturnValue('ceo')

    // Act
    renderHook(() => useCurrentRole())
    await act(async () => {})

    // Assert
    expect(mockReplace).toHaveBeenCalledWith('/ceo/dashboard')
  })

  it('retorna "ceo" como fallback cuando no hay params ni rol almacenado', async () => {
    // Arrange
    vi.mocked(useParams).mockReturnValue({})
    vi.mocked(getRole).mockReturnValue(null)

    // Act
    const { result } = renderHook(() => useCurrentRole())

    // Assert — antes del efecto storedRole=null, urlRole=undefined → fallback "ceo"
    expect(result.current).toBe('ceo')
  })

  it('retorna el rol almacenado cuando no hay parámetro URL', async () => {
    // Arrange
    vi.mocked(useParams).mockReturnValue({})
    vi.mocked(getRole).mockReturnValue('coo')

    // Act
    const { result } = renderHook(() => useCurrentRole())
    await act(async () => {})

    // Assert
    expect(result.current).toBe('coo')
  })
})
