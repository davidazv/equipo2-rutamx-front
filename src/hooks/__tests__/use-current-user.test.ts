import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

vi.mock('@/lib/auth', () => ({
  getUser: vi.fn(),
}))

import { useCurrentUser } from '../use-current-user'
import { getUser } from '@/lib/auth'

const mockUser = { id: 1, firstName: 'Juan', lastName: 'Pérez', email: 'juan@example.com' }

describe('useCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna el valor que devuelve getUser al montar', async () => {
    // Arrange
    vi.mocked(getUser).mockReturnValue(mockUser)

    // Act
    const { result } = renderHook(() => useCurrentUser())
    await act(async () => {})

    // Assert
    expect(result.current).toEqual(mockUser)
  })

  it('retorna el usuario autenticado después de que el efecto corre', async () => {
    // Arrange
    vi.mocked(getUser).mockReturnValue(mockUser)

    // Act
    const { result } = renderHook(() => useCurrentUser())
    await act(async () => {})

    // Assert
    expect(result.current).toEqual(mockUser)
  })

  it('retorna null cuando no hay sesión activa', async () => {
    // Arrange
    vi.mocked(getUser).mockReturnValue(null)

    // Act
    const { result } = renderHook(() => useCurrentUser())
    await act(async () => {})

    // Assert
    expect(result.current).toBeNull()
  })

  it('llama a getUser exactamente una vez al montar', async () => {
    // Arrange
    vi.mocked(getUser).mockReturnValue(null)

    // Act
    renderHook(() => useCurrentUser())
    await act(async () => {})

    // Assert
    expect(getUser).toHaveBeenCalledOnce()
  })
})
