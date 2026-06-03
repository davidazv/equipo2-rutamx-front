const MOCK_SUMMARY = {
  totalRoutes: 52,
  avgDailyPassengers: 18500,
  peakHour: '08:00',
}

const MOCK_TREND = [
  { day: 'Lunes', avgPassengers: 20000 },
  { day: 'Martes', avgPassengers: 19500 },
  { day: 'Miércoles', avgPassengers: 18000 },
  { day: 'Jueves', avgPassengers: 19000 },
  { day: 'Viernes', avgPassengers: 21000 },
  { day: 'Sábado', avgPassengers: 12000 },
  { day: 'Domingo', avgPassengers: 8000 },
]

const MOCK_HOURLY = {
  occupancyByHour: [
    { hour: 7, occupancyPct: 85 },
    { hour: 8, occupancyPct: 95 },
    { hour: 9, occupancyPct: 70 },
  ],
  busDemand: [
    { hour: 7, busesRequired: 40 },
    { hour: 8, busesRequired: 52 },
    { hour: 9, busesRequired: 35 },
  ],
}

const MOCK_AGENCIES = [
  { agencyId: 'MB', agencyName: 'Metrobús', agencyColor: '1E40AF', routeCount: 7 },
  { agencyId: 'RTP', agencyName: 'RTP', agencyColor: '15803D', routeCount: 12 },
]

describe('05 — Operaciones COO / afluencia por ruta', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/kpi/operational-summary*', { body: MOCK_SUMMARY }).as('summary')
    cy.intercept('GET', '**/api/kpi/passenger-trend*', { body: MOCK_TREND }).as('trend')
    cy.intercept('GET', '**/api/kpi/hourly-stats*', { body: MOCK_HOURLY }).as('hourly')
    cy.intercept('GET', '**/api/agencies*', { body: MOCK_AGENCIES }).as('agencies')

    cy.visit('/coo/dashboard', {
      onBeforeLoad(win) {
        win.localStorage.setItem('rutamx_id_token', 'fake-cypress-token')
        win.localStorage.setItem('rutamx_role', 'coo')
        win.localStorage.setItem(
          'rutamx_user',
          JSON.stringify({ id: 1, firstName: 'Test', lastName: 'COO', email: 'coo@test.com' })
        )
      },
    })
  })

  it('muestra el panel de operaciones de flota', () => {
    cy.get('[data-testid="fleet-operations-panel"]', { timeout: 10000 }).should('be.visible')
  })

  it('muestra la gráfica de tendencia de pasajeros por día de la semana', () => {
    cy.get('[data-testid="fleet-operations-panel"]', { timeout: 10000 })
      .contains('Tendencia de Pasajeros')
      .should('be.visible')
  })
})
