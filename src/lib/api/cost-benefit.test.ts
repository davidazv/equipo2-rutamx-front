import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCostBenefitReport, type CostBenefitReportResponse } from "./cost-benefit";

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

const mockReport: CostBenefitReportResponse = {
  routeId: "TR13",
  routeDistanceKm: 20.0,
  numberOfBuses: 10,
  electricModelName: "Yutong E12PRO",
  dieselModelName: "Yutong DMT Hybrid H8",
  totalInvestmentMXN: 73500000.0,
  paybackYears: 20.8,
  points: [
    { year: 1, electricCumulativeMXN: 75310400.0, dieselCumulativeMXN: 53444000.0, breakEvenYear: false },
    { year: 2, electricCumulativeMXN: 77120800.0, dieselCumulativeMXN: 106888000.0, breakEvenYear: false },
    { year: 10, electricCumulativeMXN: 91604000.0, dieselCumulativeMXN: 534440000.0, breakEvenYear: false },
  ],
};

beforeEach(() => {
  mockFetch.mockReset();
});

describe("getCostBenefitReport", () => {
  it("should call API with correct query params", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(mockReport));

    const result = await getCostBenefitReport("TR13", 1, 4, 10, 10);

    expect(result).toEqual(mockReport);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/api/reports/cost-benefit?routeId=TR13&electricModelId=1&dieselModelId=4&buses=10&years=10"
      )
    );
  });

  it("should encode routeId with special characters", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(mockReport));

    await getCostBenefitReport("R/1", 1, 4, 10, 10);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("routeId=R%2F1")
    );
  });

  it("should throw on API error (404)", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse("Ruta no encontrada", 404));

    await expect(getCostBenefitReport("INVALID", 1, 4, 10, 10)).rejects.toThrow();
  });

  it("should throw on API error (400)", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse("Parametros invalidos", 400));

    await expect(getCostBenefitReport("TR13", -1, -1, 0, 0)).rejects.toThrow();
  });

  it("should return correct number of points", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(mockReport));

    const result = await getCostBenefitReport("TR13", 1, 4, 10, 10);

    expect(result.points).toHaveLength(3);
  });

  it("should include paybackYears in response", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(mockReport));

    const result = await getCostBenefitReport("TR13", 1, 4, 10, 10);

    expect(result.paybackYears).toBeGreaterThan(0);
  });

  it("should include model names in response", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(mockReport));

    const result = await getCostBenefitReport("TR13", 1, 4, 10, 10);

    expect(result.electricModelName).toBe("Yutong E12PRO");
    expect(result.dieselModelName).toBe("Yutong DMT Hybrid H8");
  });

  it("should pass years param correctly", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(mockReport));

    await getCostBenefitReport("TR13", 1, 4, 10, 15);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("years=15")
    );
  });
});
