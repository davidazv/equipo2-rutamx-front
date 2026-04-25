import { AgencyInfo } from "@/types";

export const AGENCIES: AgencyInfo[] = [
  {
    id: "metrobus",
    name: "Metrobus",
    displayName: "Metrobus",
    color: "#DC2626",
    icon: "bus",
  },
  {
    id: "metro",
    name: "Metro",
    displayName: "Metro CDMX",
    color: "#F97316",
    icon: "train",
  },
  {
    id: "rtp",
    name: "RTP",
    displayName: "Red de Transporte de Pasajeros",
    color: "#22C55E",
    icon: "bus",
  },
  {
    id: "trolebus",
    name: "Trolebus",
    displayName: "Servicio de Transportes Electricos",
    color: "#3B82F6",
    icon: "bus",
  },
  {
    id: "cablebus",
    name: "Cablebus",
    displayName: "Cablebus CDMX",
    color: "#8B5CF6",
    icon: "cable-car",
  },
];

export const AGENCY_MAP = AGENCIES.reduce(
  (acc, agency) => {
    acc[agency.id] = agency;
    return acc;
  },
  {} as Record<string, AgencyInfo>
);

export const MEXICO_CITY_CENTER: [number, number] = [-99.1332, 19.4326];
export const DEFAULT_ZOOM = 11;
