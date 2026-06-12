import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApiGet = vi.fn();
vi.mock("./client", () => ({
  apiGet: (...args: unknown[]) => mockApiGet(...args),
}));

import {
  calculateEnergyConsumption,
  getBusModels,
  getRoutes,
  getRoutesWithShapes,
  type EnergyConsumptionResponse,
  type BusModelResponse,
  type RouteResponse,
  type RouteWithShapes,
} from "./energy";

beforeEach(() => {
  mockApiGet.mockReset();
});

describe("getBusModels", () => {
  it("should fetch electric and diesel bus models", async () => {
    const models: BusModelResponse[] = [
      {
        id: 1,
        name: "E12PRO",
        manufacturer: "Yutong",
        fuelType: "ELECTRIC",
        autonomyKm: 300,
        passengerCapacity: 85,
        unitCostUsd: 420000,
        batteryCapacityKwh: 352.08,
        energyConsumptionKwhKm: 1.0,
        fuelConsumptionLKm: 0,
        maintenanceCostPerKm: 0.12,
        co2EmissionsGKm: 0,
      },
    ];
    mockApiGet.mockResolvedValueOnce(models);

    const result = await getBusModels();

    expect(result).toEqual(models);
    expect(mockApiGet).toHaveBeenCalledWith("/api/bus-models");
  });

  it("should throw on API error", async () => {
    mockApiGet.mockRejectedValueOnce(new Error("Not found"));

    await expect(getBusModels()).rejects.toThrow();
  });
});

describe("getRoutes", () => {
  it("should fetch routes with distance", async () => {
    const routes: RouteResponse[] = [
      {
        routeId: "TR13",
        agencyId: "SEMOVI",
        routeShortName: "13",
        routeLongName: "Trolebus Linea 13",
        routeType: 11,
        distanceKm: 20.0,
      },
    ];
    mockApiGet.mockResolvedValueOnce(routes);

    const result = await getRoutes();

    expect(result).toEqual(routes);
    expect(mockApiGet).toHaveBeenCalledWith("/api/routes");
  });
});

describe("getRoutesWithShapes", () => {
  it("should fetch routes with coordinates", async () => {
    const routes: RouteWithShapes[] = [
      {
        routeId: "TR13",
        agencyId: "SEMOVI",
        routeShortName: "13",
        routeLongName: "Trolebus Linea 13",
        routeType: 11,
        routeColor: null,
        distanceKm: 20.0,
        coordinates: [
          [-99.065139, 19.345718],
          [-99.07, 19.355],
        ],
      },
    ];
    mockApiGet.mockResolvedValueOnce(routes);

    const result = await getRoutesWithShapes();

    expect(result).toEqual(routes);
    expect(mockApiGet).toHaveBeenCalledWith("/api/routes/shapes");
  });
});

describe("calculateEnergyConsumption", () => {
  it("should call API with correct query params", async () => {
    const response: EnergyConsumptionResponse = {
      routeId: "TR13",
      routeDistanceKm: 20.0,
      busModelId: 1,
      busModelName: "Yutong E12PRO",
      occupancyPercent: 50,
      estimatedConsumptionKwh: 28.3,
      batteryPercentAfter: 90.6,
      remainingRangeKm: 191.7,
      canCompleteRoute: true,
    };
    mockApiGet.mockResolvedValueOnce(response);

    const result = await calculateEnergyConsumption("TR13", 1, 50);

    expect(result).toEqual(response);
    expect(mockApiGet).toHaveBeenCalledWith(
      "/api/energy-consumption?routeId=TR13&busModelId=1&occupancyPercent=50"
    );
  });

  it("should encode routeId with special characters", async () => {
    const response: EnergyConsumptionResponse = {
      routeId: "R/1",
      routeDistanceKm: 10.0,
      busModelId: 1,
      busModelName: "Test",
      occupancyPercent: 0,
      estimatedConsumptionKwh: 12.6,
      batteryPercentAfter: 95.0,
      remainingRangeKm: 250.0,
      canCompleteRoute: true,
    };
    mockApiGet.mockResolvedValueOnce(response);

    await calculateEnergyConsumption("R/1", 1, 0);

    expect(mockApiGet).toHaveBeenCalledWith(
      expect.stringContaining("routeId=R%2F1")
    );
  });

  it("should throw on API error", async () => {
    mockApiGet.mockRejectedValueOnce(new Error("Ruta no encontrada"));

    await expect(
      calculateEnergyConsumption("INVALID", 1, 50)
    ).rejects.toThrow();
  });
});
