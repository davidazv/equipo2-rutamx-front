import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// RTL no detecta automáticamente afterEach de Vitest — hay que registrarlo explícitamente
afterEach(() => cleanup())

// Necesario para que auth.ts no lance error al importarse en tests
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key-for-testing'

// Mock mínimo de canvas para que Chart.js no rompa en jsdom
HTMLCanvasElement.prototype.getContext = () => null
