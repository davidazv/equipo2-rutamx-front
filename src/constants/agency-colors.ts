export interface AgencyColorInfo {
  displayName: string;
  /** Fallback color when routeColor is missing from GTFS */
  fallback: string;
  /** Description shown in the legend (only for multi-color agencies) */
  description?: string;
  /**
   * undefined  → single-color agency (all routes share fallback)
   * string[]   → sample of official line colors from GTFS
   */
  sampleColors?: string[];
}

/**
 * Color metadata per agency (transport type).
 * Single-color agencies have no `sampleColors`.
 * Multi-color agencies include a representative sample from the GTFS data.
 */
export const AGENCY_COLOR_INFO: Record<string, AgencyColorInfo> = {
  METRO: {
    displayName: "Metro",
    fallback: "#F9D616",
    description: "Cada línea tiene su color oficial",
    sampleColors: ["#F9D616", "#0071C1", "#D81E05", "#A02D96", "#F94F8E"],
  },
  MB: {
    displayName: "Metrobús",
    fallback: "#D40D0D",
    description: "Cada línea tiene su color oficial",
    sampleColors: ["#D40D0D", "#141982", "#7A9A01", "#8D1A96", "#FF9A03"],
  },
  RTP: {
    displayName: "RTP",
    fallback: "#00A099",
    description: "Rutas agrupadas por color de zona",
    sampleColors: ["#00A099", "#E20613", "#A5C731", "#FC9408", "#2D2E82"],
  },
  PUMABUS: {
    displayName: "Pumabús",
    fallback: "#FFE616",
    description: "Cada ruta con su color propio",
    sampleColors: ["#FFE616", "#5155A4", "#00673E", "#F47325", "#00B3EE"],
  },
  TROLE: {
    displayName: "Trolebús",
    fallback: "#1F5AF0",
  },
  CC: {
    displayName: "Corredores Concesionados",
    fallback: "#9B26B6",
  },
  CBB: {
    displayName: "Cablebús",
    fallback: "#4EC3E0",
  },
  TL: {
    displayName: "Tren Ligero",
    fallback: "#1F5AF0",
  },
  SUB: {
    displayName: "Tren Suburbano",
    fallback: "#FF0000",
  },
  INTERURBANO: {
    displayName: "Interurbano",
    fallback: "#83332E",
  },
  SEMOVI: {
    displayName: "SEMOVI",
    fallback: "#009B3A",
  },
};

/** Quick lookup helpers */
export function getAgencyFallback(agencyId: string): string {
  return AGENCY_COLOR_INFO[agencyId]?.fallback ?? DEFAULT_ROUTE_COLOR;
}

export function isMultiColor(agencyId: string): boolean {
  return (AGENCY_COLOR_INFO[agencyId]?.sampleColors?.length ?? 0) > 1;
}

/** Generic fallback if the agencyId is completely unknown */
export const DEFAULT_ROUTE_COLOR = "#6B7280";
