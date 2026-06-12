const MOCK_ELECTRIC_MODELS = [
  {
    id: 1,
    name: 'E12PRO',
    manufacturer: 'Yutong',
    fuelType: 'ELECTRIC',
    autonomyKm: 300,
    passengerCapacity: 85,
    unitCostUsd: 420000,
    batteryCapacityKwh: 352,
    energyConsumptionKwhKm: 1,
    fuelConsumptionLKm: 0,
    maintenanceCostPerKm: 0.12,
    co2EmissionsGKm: 0,
  },
]

const MOCK_ROUTES_WITH_SHAPES = [
  {
    routeId: 'TR13',
    agencyId: 'MB',
    routeShortName: 'L13',
    routeLongName: 'Ruta 13',
    routeType: 3,
    routeColor: '1E40AF',
    distanceKm: 20,
    coordinates: [
      [-99.1, 19.4],
      [-99.2, 19.5],
    ],
  },
]

const MOCK_AGENCIES_WITH_COLORS = [
  { agencyId: 'MB', agencyName: 'Metrobús', agencyColor: '1E40AF', routeCount: 7 },
]

const MOCK_ENERGY_RESULT = {
  routeId: 'TR13',
  routeDistanceKm: 20,
  busModelId: 1,
  busModelName: 'E12PRO',
  occupancyPercent: 50,
  estimatedConsumptionKwh: 20.5,
  batteryPercentAfter: 94.2,
  remainingRangeKm: 282.5,
  canCompleteRoute: true,
}

describe('02 — Simulación de consumo de batería', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/bus-models*', { body: MOCK_ELECTRIC_MODELS }).as('busModels')
    cy.intercept('GET', '**/api/routes/shapes*', { body: MOCK_ROUTES_WITH_SHAPES }).as('routesShapes')
    cy.intercept('GET', '**/api/agencies/with-colors*', { body: MOCK_AGENCIES_WITH_COLORS }).as('agencies')
    cy.intercept('GET', '**/api/energy-consumption*', { body: MOCK_ENERGY_RESULT }).as('energy')
    // Stub mapbox-gl para entorno headless
    cy.intercept('GET', 'https://events.mapbox.com/**', { body: {} })
    cy.intercept('GET', 'https://api.mapbox.com/**', { body: {} })

    cy.visit('/ceo/map', {
      onBeforeLoad(win) {
        win.localStorage.setItem('rutamx_id_token', 'fake-cypress-token')
        win.localStorage.setItem('rutamx_role', 'ceo')
        win.localStorage.setItem(
          'rutamx_user',
          JSON.stringify({ id: 1, firstName: 'Test', lastName: 'CEO', email: 'ceo@test.com' })
        )
      },
    })
  })

  it('muestra el formulario de simulación', () => {
    // Select route then enter detail view
    cy.contains('Ruta 13', { timeout: 10000 }).click()
    cy.contains('Ver detalle').click()
    cy.get('[data-testid="simulation-form"]', { timeout: 10000 }).should('be.visible')
  })

  it('muestra la sección de resultados de simulación', () => {
    cy.contains('Ruta 13', { timeout: 10000 }).click()
    cy.contains('Ver detalle').click()
    cy.get('[data-testid="simulation-result"]', { timeout: 10000 }).should('be.visible')
  })
})
