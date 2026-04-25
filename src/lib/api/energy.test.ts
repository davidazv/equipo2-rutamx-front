import { describe, it, expect, vi, beforeEach } from "vitest";
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

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  };
}

beforeEach(() => {
  mockFetch.mockReset();
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
    mockFetch.mockResolvedValueOnce(jsonResponse(models));

    const result = await getBusModels();

    expect(result).toEqual(models);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/bus-models")
    );
  });

  it("should throw on API error", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse("Not found", 404));

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
    mockFetch.mockResolvedValueOnce(jsonResponse(routes));

    const result = await getRoutes();

    expect(result).toEqual(routes);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/routes")
    );
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
    mockFetch.mockResolvedValueOnce(jsonResponse(routes));

    const result = await getRoutesWithShapes();

    expect(result).toEqual(routes);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/routes/shapes")
    );
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
    mockFetch.mockResolvedValueOnce(jsonResponse(response));

    const result = await calculateEnergyConsumption("TR13", 1, 50);

    expect(result).toEqual(response);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/api/energy-consumption?routeId=TR13&busModelId=1&occupancyPercent=50"
      )
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
    mockFetch.mockResolvedValueOnce(jsonResponse(response));

    await calculateEnergyConsumption("R/1", 1, 0);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("routeId=R%2F1")
    );
  });

  it("should throw on API error", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse("Ruta no encontrada", 404)
    );

    await expect(
      calculateEnergyConsumption("INVALID", 1, 50)
    ).rejects.toThrow();
  });
});
