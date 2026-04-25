// Agency Types
export type Agency = "metrobus" | "metro" | "rtp" | "trolebus" | "cablebus";

export interface AgencyInfo {
  id: Agency;
  name: string;
  displayName: string;
  color: string;
  icon: string;
}

// Route Types
export interface Stop {
  id: string;
  name: string;
  coordinates: [number, number];
  sequence: number;
}

export interface Route {
  id: string;
  name: string;
  shortName: string;
  agency: Agency;
  color: string;
  coordinates: [number, number][];
  stops: Stop[];
  distanceKm: number;
  estimatedTimeMinutes: number;
  frequency: number;
  operatingHours: {
    start: string;
    end: string;
  };
}
