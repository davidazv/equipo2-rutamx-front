const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface AgencyResponse {
  agencyId: string;
  agencyName: string;
}

export interface AgencyWithColorsResponse {
  agencyId: string;
  agencyName: string;
  agencyColor: string | null;
  sampleRouteColors: string[];
  multiColor: boolean;
}

export async function getAgencies(): Promise<AgencyResponse[]> {
  const res = await fetch(`${API_BASE}/api/agencies`);
  if (!res.ok) {
    const text = await res.text().catch(() => "Error desconocido");
    throw new Error(text);
  }
  return res.json();
}

export async function getAgenciesWithColors(): Promise<AgencyWithColorsResponse[]> {
  const res = await fetch(`${API_BASE}/api/agencies/with-colors`);
  if (!res.ok) {
    const text = await res.text().catch(() => "Error desconocido");
    throw new Error(text);
  }
  return res.json();
}
