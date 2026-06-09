import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApiGet = vi.fn();
vi.mock("./client", () => ({
  apiGet: (...args: unknown[]) => mockApiGet(...args),
}));

import { getFuelSavings, type FuelSavingsResponse } from "./fuel-savings";

const mockSavings: FuelSavingsResponse = {
  routeId: "TR13",
  routeDistanceKm: 20.0,
  busModelId: 1,
  busModelName: "Yutong E12PRO",
  numberOfBuses: 10,
  fuelSavingsMXN: 3472000.0,
  fuelSavingsLiters: 217000.0,
  dieselReferencePriceMXN: 24.0,
  dieselConsumptionLKm: 0.35,
  dieselCostPerYear: 5208000.0,
  electricCostPerYear: 1736000.0,
  projectionYears: 5,
};

beforeEach(() => {
  mockApiGet.mockReset();
});

describe("getFuelSavings", () => {
  it("should fetch fuel savings with correct params", async () => {
    mockApiGet.mockResolvedValueOnce(mockSavings);

    const result = await getFuelSavings("TR13", 1, 10, 5);

    expect(result).toEqual(mockSavings);
    expect(mockApiGet).toHaveBeenCalledWith(
      "/api/fuel-savings?routeId=TR13&modelId=1&buses=10&years=5"
    );
  });

  it("should throw on API error", async () => {
    mockApiGet.mockRejectedValueOnce(new Error("Ruta no encontrada"));

    await expect(getFuelSavings("INVALID", 1, 10)).rejects.toThrow();
  });

  it("should encode routeId with special characters", async () => {
    mockApiGet.mockResolvedValueOnce(mockSavings);

    await getFuelSavings("R/1", 1, 10);

    expect(mockApiGet).toHaveBeenCalledWith(
      expect.stringContaining("routeId=R%2F1")
    );
  });

  it("should use default years when not provided", async () => {
    mockApiGet.mockResolvedValueOnce(mockSavings);

    await getFuelSavings("TR13", 1, 10);

    expect(mockApiGet).toHaveBeenCalledWith(
      expect.stringContaining("years=5")
    );
  });

  it("should pass custom years param", async () => {
    mockApiGet.mockResolvedValueOnce(mockSavings);

    await getFuelSavings("TR13", 1, 10, 3);

    expect(mockApiGet).toHaveBeenCalledWith(
      expect.stringContaining("years=3")
    );
  });
});
