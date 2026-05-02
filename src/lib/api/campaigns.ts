import { apiFetch } from "./client";

export interface DayDetail {
  viajes: number;
  pasajeros: number;
}

export interface Co2SavingsItem {
  routeId: string;
  routeName: string;
  agencyId: string;
  agencyColor: string;
  distanciaKm: number;
  emisionesDieselTon: number;
  emisionesElectricoTon: number;
  ahorroTon: number;
  score: number;
  prioridad: "Alta" | "Media" | "Baja";
  detallesPorDia: {
    lunes: DayDetail;
    martes: DayDetail;
    miercoles: DayDetail;
    jueves: DayDetail;
    viernes: DayDetail;
    sabado: DayDetail;
    domingo: DayDetail;
  } | null;
}

export interface TripsByDayItem {
  routeId: string;
  routeName: string;
  agencyColor: string;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
  totalSemanal: number;
  demandaDiariaPromedio: number | null;
  calidadDatos: "Alta" | "Media" | "Baja";
}

export async function getCo2Savings(busModelId: number): Promise<Co2SavingsItem[]> {
  const res = await apiFetch(`/api/co2-savings?busModelId=${busModelId}`);
  if (!res.ok) throw new Error(`getCo2Savings: ${res.status}`);
  return res.json();
}

export async function getTripsByDay(): Promise<TripsByDayItem[]> {
  const res = await apiFetch("/api/routes/trips-by-day");
  if (!res.ok) throw new Error(`getTripsByDay: ${res.status}`);
  return res.json();
}
