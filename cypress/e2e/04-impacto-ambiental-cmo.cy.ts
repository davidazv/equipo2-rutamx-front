const MOCK_ROUTE_STATS = [
  {
    routeId: 'TR13',
    routeName: 'Línea 13',
    agencyId: 'MB',
    avgDailyPassengers: 12000,
    co2AhorradoTonAnio: 42.5,
    co2DieselTonAnio: 55.0,
    co2ElectricoTonAnio: 12.5,
    distanciaKm: 20,
    headwayMinutes: 8,
  },
]

const MOCK_AGENCIES = [
  { agencyId: 'MB', agencyName: 'Metrobús', agencyColor: '1E40AF', routeCount: 7 },
]

describe('04 — Impacto ambiental CMO / ahorro de CO₂', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/cmo/route-stats*', { body: MOCK_ROUTE_STATS }).as('routeStats')
    cy.intercept('GET', '**/api/agencies*', { body: MOCK_AGENCIES }).as('agencies')

    cy.visit('/cmo/dashboard', {
      onBeforeLoad(win) {
        win.localStorage.setItem('rutamx_id_token', 'fake-cypress-token')
        win.localStorage.setItem('rutamx_role', 'cmo')
        win.localStorage.setItem(
          'rutamx_user',
          JSON.stringify({ id: 1, firstName: 'Test', lastName: 'CMO', email: 'cmo@test.com' })
        )
      },
    })
  })

  it('muestra el componente de ahorro de CO₂ del CMO', () => {
    cy.get('[data-testid="co2-savings-chart"]', { timeout: 10000 }).should('be.visible')
  })

  it('contiene texto relacionado con CO₂ en pantalla', () => {
    cy.get('[data-testid="co2-savings-chart"]', { timeout: 10000 })
      .contains(/CO₂|toneladas|ton/i)
      .should('exist')
  })
})
