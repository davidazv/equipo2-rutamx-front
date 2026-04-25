const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface AgencyResponse {
  agencyId: string;
  agencyName: string;
}

export async function getAgencies(): Promise<AgencyResponse[]> {
  const res = await fetch(`${API_BASE}/api/agencies`);
  if (!res.ok) {
    const text = await res.text().catch(() => "Error desconocido");
    throw new Error(text);
  }
  return res.json();
}
