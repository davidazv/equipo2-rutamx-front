import { describe, it, expect, vi, beforeEach } from "vitest";
import { getComparativeReport, type ComparativeReportResponse } from "./comparative";

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

const mockReport: ComparativeReportResponse = {
  routeId: "TR13",
  routeDistanceKm: 20.0,
  numberOfBuses: 10,
  electricModelName: "Yutong E12PRO",
  electricCostPerYear: 1736000.0,
  electricMaintenanceCostPerYear: 74400.0,
  electricTotalCostPerYear: 1810400.0,
  electricCo2TonsPerYear: 0.0,
  dieselModelName: "Yutong DMT Hybrid H8",
  dieselCostPerYear: 5208000.0,
  dieselMaintenanceCostPerYear: 136400.0,
  dieselTotalCostPerYear: 5344400.0,
  dieselCo2TonsPerYear: 582.8,
  annualSavingsMXN: 3534000.0,
  co2AvoidedTonsPerYear: 582.8,
  savingsPercent: 66.12,
};

beforeEach(() => {
  mockFetch.mockReset();
});

describe("getComparativeReport", () => {
  it("should call API with correct query params", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(mockReport));

    const result = await getComparativeReport("TR13", 1, 4, 10);

    expect(result).toEqual(mockReport);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/api/reports/comparative?routeId=TR13&electricModelId=1&dieselModelId=4&buses=10"
      )
    );
  });

  it("should encode routeId with special characters", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(mockReport));

    await getComparativeReport("R/1", 1, 4, 10);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("routeId=R%2F1")
    );
  });

  it("should throw on API error (404)", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse("Ruta no encontrada", 404));

    await expect(getComparativeReport("INVALID", 1, 4, 10)).rejects.toThrow();
  });

  it("should throw on API error (400)", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse("Parametros invalidos", 400));

    await expect(getComparativeReport("TR13", -1, -1, 10)).rejects.toThrow();
  });

  it("should use provided buses param", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ ...mockReport, numberOfBuses: 20 }));

    const result = await getComparativeReport("TR13", 1, 4, 20);

    expect(result.numberOfBuses).toBe(20);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("buses=20")
    );
  });

  it("electricTotalCostPerYear should be less than dieselTotalCostPerYear in happy path", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(mockReport));

    const result = await getComparativeReport("TR13", 1, 4, 10);

    expect(result.electricTotalCostPerYear).toBeLessThan(result.dieselTotalCostPerYear);
  });
});
