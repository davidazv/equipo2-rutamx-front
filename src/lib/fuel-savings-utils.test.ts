import { describe, it, expect } from "vitest";
import {
  buildMonthlyChartData,
  buildAnnualChartData,
  buildAccumulatedChartData,
  buildCSVContent,
  formatMXN,
  formatLiters,
} from "./fuel-savings-utils";
import type { FuelSavingsResponse } from "@/lib/api/fuel-savings";

const mockData: FuelSavingsResponse = {
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

describe("buildMonthlyChartData", () => {
  it("should create 12 monthly labels for both charts", () => {
    const { mxn, liters } = buildMonthlyChartData(mockData);
    expect(mxn.labels).toHaveLength(12);
    expect(mxn.labels[0]).toBe("Ene");
    expect(mxn.labels[11]).toBe("Dic");
    expect(liters.labels).toHaveLength(12);
  });

  it("should have separate datasets for MXN and liters", () => {
    const { mxn, liters } = buildMonthlyChartData(mockData);
    expect(mxn.datasets).toHaveLength(1);
    expect(mxn.datasets[0].label).toBe("Ahorro MXN");
    expect(liters.datasets).toHaveLength(1);
    expect(liters.datasets[0].label).toBe("Litros ahorrados");
  });

  it("should divide annual savings by 12", () => {
    const { mxn, liters } = buildMonthlyChartData(mockData);
    const expectedMXN = Math.round(3472000 / 12);
    const expectedLiters = Math.round(217000 / 12);
    expect(mxn.datasets[0].data[0]).toBe(expectedMXN);
    expect(liters.datasets[0].data[0]).toBe(expectedLiters);
  });

  it("should have consistent values across all months", () => {
    const { mxn } = buildMonthlyChartData(mockData);
    const first = mxn.datasets[0].data[0];
    mxn.datasets[0].data.forEach((v) => expect(v).toBe(first));
  });
});

describe("buildAnnualChartData", () => {
  it("should create labels for each projection year", () => {
    const { mxn } = buildAnnualChartData(mockData);
    expect(mxn.labels).toHaveLength(5);
    expect(mxn.labels[0]).toBe("Año 1");
    expect(mxn.labels[4]).toBe("Año 5");
  });

  it("should multiply savings by year number", () => {
    const { mxn } = buildAnnualChartData(mockData);
    expect(mxn.datasets[0].data[0]).toBe(Math.round(3472000 * 1));
    expect(mxn.datasets[0].data[2]).toBe(Math.round(3472000 * 3));
    expect(mxn.datasets[0].data[4]).toBe(Math.round(3472000 * 5));
  });

  it("should have increasing values year over year", () => {
    const { mxn } = buildAnnualChartData(mockData);
    for (let i = 1; i < mxn.datasets[0].data.length; i++) {
      expect(mxn.datasets[0].data[i]).toBeGreaterThan(mxn.datasets[0].data[i - 1]);
    }
  });
});

describe("buildAccumulatedChartData", () => {
  it("should create line chart datasets with fill", () => {
    const { mxn, liters } = buildAccumulatedChartData(mockData);
    expect(mxn.datasets[0].fill).toBe(true);
    expect(mxn.datasets[0].borderColor).toBe("#1e40af");
    expect(liters.datasets[0].borderColor).toBe("#22c77a");
  });

  it("should have same accumulated values as annual", () => {
    const annual = buildAnnualChartData(mockData);
    const accumulated = buildAccumulatedChartData(mockData);
    expect(accumulated.mxn.datasets[0].data).toEqual(annual.mxn.datasets[0].data);
  });
});

describe("buildCSVContent", () => {
  it("should generate monthly CSV with 13 rows (header + 12 months)", () => {
    const csv = buildCSVContent(mockData, "mensual");
    const lines = csv.split("\n");
    expect(lines).toHaveLength(13);
    expect(lines[0]).toBe("Mes,Ahorro MXN,Ahorro Litros");
    expect(lines[1]).toContain("Ene");
  });

  it("should generate annual CSV with 6 rows (header + 5 years)", () => {
    const csv = buildCSVContent(mockData, "anual");
    const lines = csv.split("\n");
    expect(lines).toHaveLength(6);
    expect(lines[0]).toBe("Año,Ahorro MXN,Ahorro Litros");
    expect(lines[1]).toContain("Año 1");
  });

  it("should generate accumulated CSV with correct header", () => {
    const csv = buildCSVContent(mockData, "acumulado");
    const lines = csv.split("\n");
    expect(lines[0]).toBe("Año,Ahorro Acumulado MXN,Ahorro Acumulado Litros");
    expect(lines).toHaveLength(6);
  });

  it("should contain correct monthly values", () => {
    const csv = buildCSVContent(mockData, "mensual");
    const firstDataLine = csv.split("\n")[1];
    const expectedMXN = String(Math.round(3472000 / 12));
    expect(firstDataLine).toContain(expectedMXN);
  });

  it("should contain correct annual values for year 3", () => {
    const csv = buildCSVContent(mockData, "anual");
    const year3Line = csv.split("\n")[3];
    const expectedMXN = String(Math.round(3472000 * 3));
    expect(year3Line).toContain(expectedMXN);
  });
});

describe("formatMXN", () => {
  it("should format millions with M suffix", () => {
    expect(formatMXN(3472000)).toBe("$3.5M");
  });

  it("should format thousands with locale", () => {
    const result = formatMXN(500000);
    expect(result).toContain("$");
    expect(result).toContain("500");
  });

  it("should format small numbers", () => {
    expect(formatMXN(100)).toBe("$100");
  });
});

describe("formatLiters", () => {
  it("should format millions with M L suffix", () => {
    expect(formatLiters(1500000)).toBe("1.5M L");
  });

  it("should format thousands with L suffix", () => {
    const result = formatLiters(217000);
    expect(result).toContain("217");
    expect(result).toContain("L");
  });
});
