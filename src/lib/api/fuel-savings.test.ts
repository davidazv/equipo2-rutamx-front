import { describe, it, expect, vi, beforeEach } from "vitest";
import { getFuelSavings, type FuelSavingsResponse } from "./fuel-savings";

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
  mockFetch.mockReset();
});

describe("getFuelSavings", () => {
  it("should fetch fuel savings with correct params", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(mockSavings));

    const result = await getFuelSavings("TR13", 1, 10, 5);

    expect(result).toEqual(mockSavings);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/api/fuel-savings?routeId=TR13&modelId=1&buses=10&years=5"
      )
    );
  });

  it("should throw on API error", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse("Ruta no encontrada", 404));

    await expect(getFuelSavings("INVALID", 1, 10)).rejects.toThrow();
  });

  it("should encode routeId with special characters", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(mockSavings));

    await getFuelSavings("R/1", 1, 10);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("routeId=R%2F1")
    );
  });

  it("should use default years when not provided", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(mockSavings));

    await getFuelSavings("TR13", 1, 10);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("years=5")
    );
  });

  it("should pass custom years param", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(mockSavings));

    await getFuelSavings("TR13", 1, 10, 3);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("years=3")
    );
  });
});
