import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApiFetch = vi.fn();
vi.mock("./client", () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

import { getBusModels, getBusModelById, type BusModel } from "./bus-models";

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  };
}

const SAMPLE_MODEL: BusModel = {
  id: 1,
  name: "Yutong E12PRO",
  manufacturer: "Yutong",
  fuelType: "ELECTRIC",
  autonomyKm: 300,
  passengerCapacity: 85,
  unitCostUsd: 420000,
  batteryCapacityKwh: 352.08,
  energyConsumptionKwhKm: 1,
  fuelConsumptionLKm: 0,
  maintenanceCostPerKm: 0.12,
  co2EmissionsGKm: 0,
};

const DIESEL_MODEL: BusModel = {
  id: 4,
  name: "Yutong DMT Hybrid H8",
  manufacturer: "Yutong",
  fuelType: "DIESEL",
  autonomyKm: 400,
  passengerCapacity: 61,
  unitCostUsd: 120000,
  batteryCapacityKwh: 0,
  energyConsumptionKwhKm: 0,
  fuelConsumptionLKm: 0.35,
  maintenanceCostPerKm: 0.22,
  co2EmissionsGKm: 940,
};

beforeEach(() => {
  mockApiFetch.mockReset();
});

describe("getBusModels", () => {
  it("should fetch from /api/bus-models", async () => {
    const models = [SAMPLE_MODEL, DIESEL_MODEL];
    mockApiFetch.mockResolvedValueOnce(jsonResponse(models));

    const result = await getBusModels();

    expect(result).toEqual(models);
    expect(mockApiFetch).toHaveBeenCalledWith("/api/bus-models");
  });

  it("should return array of bus models with correct types", async () => {
    mockApiFetch.mockResolvedValueOnce(jsonResponse([SAMPLE_MODEL]));

    const result = await getBusModels();

    expect(result).toHaveLength(1);
    expect(result[0].fuelType).toBe("ELECTRIC");
    expect(result[0].autonomyKm).toBe(300);
    expect(result[0].passengerCapacity).toBe(85);
    expect(result[0].unitCostUsd).toBe(420000);
  });

  it("should throw on API error", async () => {
    mockApiFetch.mockResolvedValueOnce(jsonResponse("Server error", 500));

    await expect(getBusModels()).rejects.toThrow("Failed to fetch bus models: 500");
  });

  it("should throw on network failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(getBusModels()).rejects.toThrow("Network error");
  });

  it("should return empty array when no models exist", async () => {
    mockApiFetch.mockResolvedValueOnce(jsonResponse([]));

    const result = await getBusModels();

    expect(result).toEqual([]);
  });

  it("should include both electric and diesel models", async () => {
    mockApiFetch.mockResolvedValueOnce(jsonResponse([SAMPLE_MODEL, DIESEL_MODEL]));

    const result = await getBusModels();

    const fuelTypes = result.map((m) => m.fuelType);
    expect(fuelTypes).toContain("ELECTRIC");
    expect(fuelTypes).toContain("DIESEL");
  });
});

describe("getBusModelById", () => {
  it("should fetch single model by id", async () => {
    mockApiFetch.mockResolvedValueOnce(jsonResponse(SAMPLE_MODEL));

    const result = await getBusModelById(1);

    expect(result).toEqual(SAMPLE_MODEL);
    expect(mockApiFetch).toHaveBeenCalledWith("/api/bus-models/1");
  });

  it("should throw on 404", async () => {
    mockApiFetch.mockResolvedValueOnce(jsonResponse("Not found", 404));

    await expect(getBusModelById(999)).rejects.toThrow("Bus model not found: 404");
  });

  it("should return all financial fields", async () => {
    mockApiFetch.mockResolvedValueOnce(jsonResponse(SAMPLE_MODEL));

    const result = await getBusModelById(1);

    expect(result.unitCostUsd).toBe(420000);
    expect(result.maintenanceCostPerKm).toBe(0.12);
    expect(result.co2EmissionsGKm).toBe(0);
  });

  it("should return diesel model with fuel consumption", async () => {
    mockApiFetch.mockResolvedValueOnce(jsonResponse(DIESEL_MODEL));

    const result = await getBusModelById(4);

    expect(result.fuelType).toBe("DIESEL");
    expect(result.fuelConsumptionLKm).toBe(0.35);
    expect(result.co2EmissionsGKm).toBe(940);
  });
});

import { createBusModel, updateBusModel, deleteBusModel } from "./bus-models";

describe("createBusModel", () => {
  const input = {
    name: "Test Bus",
    manufacturer: "Test Co",
    fuelType: "ELECTRIC" as const,
    autonomyKm: 300,
    passengerCapacity: 80,
    unitCostUsd: 400000,
    batteryCapacityKwh: 350,
  };

  it("should create a bus model successfully", async () => {
    mockApiFetch.mockResolvedValueOnce(jsonResponse(SAMPLE_MODEL, 201));

    const result = await createBusModel(input);

    expect(result).toEqual(SAMPLE_MODEL);
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/api/bus-models",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("should throw MODEL_ALREADY_EXISTS on 409", async () => {
    mockApiFetch.mockResolvedValueOnce(jsonResponse(null, 409));

    await expect(createBusModel(input)).rejects.toThrow("MODEL_ALREADY_EXISTS");
  });

  it("should throw CREATE_FAILED on other errors", async () => {
    mockApiFetch.mockResolvedValueOnce(jsonResponse(null, 500));

    await expect(createBusModel(input)).rejects.toThrow("CREATE_FAILED");
  });

  it("should send null for missing optional fields", async () => {
    mockApiFetch.mockResolvedValueOnce(jsonResponse(SAMPLE_MODEL, 201));

    await createBusModel(input);

    const body = JSON.parse(mockApiFetch.mock.calls[0][1].body);
    expect(body.energyConsumptionKwhKm).toBeNull();
    expect(body.fuelConsumptionLKm).toBeNull();
    expect(body.maintenanceCostPerKm).toBeNull();
    expect(body.co2EmissionsGKm).toBeNull();
  });

  it("should send provided optional fields", async () => {
    mockApiFetch.mockResolvedValueOnce(jsonResponse(SAMPLE_MODEL, 201));
    const withOptionals = { ...input, energyConsumptionKwhKm: 1, co2EmissionsGKm: 0 };

    await createBusModel(withOptionals);

    const body = JSON.parse(mockApiFetch.mock.calls[0][1].body);
    expect(body.energyConsumptionKwhKm).toBe(1);
    expect(body.co2EmissionsGKm).toBe(0);
  });
});

describe("updateBusModel", () => {
  it("should merge partial input with current model", async () => {
    mockApiFetch
      .mockResolvedValueOnce(jsonResponse(SAMPLE_MODEL))
      .mockResolvedValueOnce(jsonResponse(SAMPLE_MODEL));

    const result = await updateBusModel(1, { name: "Updated Name" });

    expect(result).toEqual(SAMPLE_MODEL);
    const body = JSON.parse(mockApiFetch.mock.calls[1][1].body);
    expect(body.name).toBe("Updated Name");
    expect(body.manufacturer).toBe(SAMPLE_MODEL.manufacturer);
  });

  it("should throw MODEL_NOT_FOUND on 404", async () => {
    mockApiFetch
      .mockResolvedValueOnce(jsonResponse(SAMPLE_MODEL))
      .mockResolvedValueOnce(jsonResponse(null, 404));

    await expect(updateBusModel(999, {})).rejects.toThrow("MODEL_NOT_FOUND");
  });

  it("should throw MODEL_ALREADY_EXISTS on 409", async () => {
    mockApiFetch
      .mockResolvedValueOnce(jsonResponse(SAMPLE_MODEL))
      .mockResolvedValueOnce(jsonResponse(null, 409));

    await expect(updateBusModel(1, { name: "Dup" })).rejects.toThrow("MODEL_ALREADY_EXISTS");
  });

  it("should throw UPDATE_FAILED on other errors", async () => {
    mockApiFetch
      .mockResolvedValueOnce(jsonResponse(SAMPLE_MODEL))
      .mockResolvedValueOnce(jsonResponse(null, 500));

    await expect(updateBusModel(1, {})).rejects.toThrow("UPDATE_FAILED");
  });
});

describe("deleteBusModel", () => {
  it("should delete a bus model successfully", async () => {
    mockApiFetch.mockResolvedValueOnce(jsonResponse(null, 204));

    await expect(deleteBusModel(1)).resolves.toBeUndefined();
    expect(mockApiFetch).toHaveBeenCalledWith("/api/bus-models/1", { method: "DELETE" });
  });

  it("should throw MODEL_NOT_FOUND on 404", async () => {
    mockApiFetch.mockResolvedValueOnce(jsonResponse(null, 404));

    await expect(deleteBusModel(999)).rejects.toThrow("MODEL_NOT_FOUND");
  });

  it("should throw DELETE_FAILED on other errors", async () => {
    mockApiFetch.mockResolvedValueOnce(jsonResponse(null, 500));

    await expect(deleteBusModel(1)).rejects.toThrow("DELETE_FAILED");
  });
});
