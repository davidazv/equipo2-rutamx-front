const MOCK_BUS_MODELS = [
  {
    id: 1,
    name: 'E12PRO',
    manufacturer: 'Yutong',
    fuelType: 'ELECTRIC',
    autonomyKm: 300,
    passengerCapacity: 85,
    unitCostUsd: 420000,
    batteryCapacityKwh: 352,
    energyConsumptionKwhKm: 1.0,
    fuelConsumptionLKm: 0,
    maintenanceCostPerKm: 0.12,
    co2EmissionsGKm: 0,
  },
]

const MOCK_ROUTES = [
  { routeId: 'TR13', agencyId: 'MB', routeShortName: 'L13', routeLongName: 'Ruta 13', routeType: 3, distanceKm: 20 },
]

const MOCK_KPI = {
  totalFuelSavingsMXN: 3472000,
  totalCo2AvoidedTons: 450,
  totalInvestmentMXN: 42000000,
  totalElectricCostMXN: 1736000,
  totalDieselCostMXN: 5208000,
  routesAnalyzed: 5,
}

const MOCK_ROI = {
  roiPercent: 42.5,
  paybackYears: 2.4,
  netAnnualReturn: 1800000,
  totalInvestmentMXN: 42000000,
  co2AvoidedTons: 90,
  electricCostPerYear: 1736000,
  dieselCostPerYear: 5208000,
}

describe('01 — Dashboard CEO / ROI', () => {
  beforeEach(() => {
    // Intercept backend API calls before page load
    cy.intercept('GET', '**/api/bus-models*', { body: MOCK_BUS_MODELS }).as('busModels')
    cy.intercept('GET', '**/api/routes*', { body: MOCK_ROUTES }).as('routes')
    cy.intercept('GET', '**/api/kpi/summary*', { body: MOCK_KPI }).as('kpi')
    cy.intercept('GET', '**/api/roi/estimate*', { body: MOCK_ROI }).as('roi')

    cy.visit('/ceo/dashboard', {
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

  it('muestra el panel principal roi-dashboard', () => {
    cy.get('[data-testid="roi-dashboard"]').should('be.visible')
  })

  it('muestra al menos un escenario de expansión de flota', () => {
    cy.contains('Escenarios de expansión de flota').should('be.visible')
  })
})
