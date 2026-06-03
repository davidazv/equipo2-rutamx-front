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
  {
    id: 2,
    name: 'ZK6126',
    manufacturer: 'Yutong',
    fuelType: 'DIESEL',
    autonomyKm: 400,
    passengerCapacity: 100,
    unitCostUsd: 120000,
    batteryCapacityKwh: 0,
    energyConsumptionKwhKm: 0,
    fuelConsumptionLKm: 0.35,
    maintenanceCostPerKm: 0.22,
    co2EmissionsGKm: 940,
  },
]

describe('03 — Comparativa de modelos de autobús', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/bus-models*', { body: MOCK_BUS_MODELS }).as('busModels')
    cy.intercept('GET', '**/admin/users*', { body: [] }).as('users')

    cy.visit('/admin', {
      onBeforeLoad(win) {
        win.localStorage.setItem('rutamx_id_token', 'fake-cypress-token')
        win.localStorage.setItem('rutamx_role', 'admin')
        win.localStorage.setItem(
          'rutamx_user',
          JSON.stringify({ id: 1, firstName: 'Test', lastName: 'Admin', email: 'admin@test.com' })
        )
      },
    })
  })

  it('muestra la tabla de modelos de autobús', () => {
    // Admin page defaults to "usuarios" tab — switch to "Catálogo de Buses"
    cy.contains('Catálogo de Buses', { timeout: 10000 }).click()
    cy.get('[data-testid="bus-models-table"]', { timeout: 10000 }).should('be.visible')
  })

  it('abre el panel de detalle al hacer click en el botón de edición del primer modelo', () => {
    cy.contains('Catálogo de Buses', { timeout: 10000 }).click()
    cy.get('[data-testid="bus-models-table"]', { timeout: 10000 }).should('be.visible')

    // Hace click en el botón de editar de la primera fila
    cy.get('[data-testid="bus-models-table"]')
      .find('button[title="Editar modelo"]')
      .first()
      .click()

    // Verifica que el panel de detalle (modal de edición) aparece
    cy.get('[data-testid="bus-model-detail"]').should('be.visible')
  })
})
