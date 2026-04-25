"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import UploadCard from "./UploadCard";
import { fetchTableStatus, type TableStatus } from "@/lib/api/upload";

const TIER_0 = [
  { tableName: "agency", displayName: "Agencias" },
  { tableName: "calendar", displayName: "Calendario" },
  { tableName: "stops", displayName: "Paradas" },
  { tableName: "bus-models", displayName: "Modelos de Bus" },
  { tableName: "shapes", displayName: "Formas de Ruta" },
  { tableName: "afluencia", displayName: "Afluencia Metrobús" },
];

const TIER_1 = [{ tableName: "routes", displayName: "Rutas" }];

const TIER_2 = [{ tableName: "trips", displayName: "Viajes" }];

const TIER_3 = [
  { tableName: "stop-times", displayName: "Horarios de Parada" },
  { tableName: "frequencies", displayName: "Frecuencias" },
];

export default function UploadTab() {
  const [status, setStatus] = useState<TableStatus>({});
  const [loading, setLoading] = useState(true);

  const loadStatus = useCallback(async () => {
    try {
      const data = await fetchTableStatus();
      setStatus(data);
    } catch {
      // silently fail — cards will show as "sin datos"
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleUploaded = (tableName: string, rowCount: number) => {
    setStatus((prev) => ({
      ...prev,
      [tableName]: { rowCount, uploadedAt: new Date().toISOString() },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Sin dependencias</h2>
        <p className="text-sm text-muted-foreground">
          Estas tablas pueden cargarse en cualquier orden.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {TIER_0.map((t) => (
            <UploadCard
              key={t.tableName}
              {...t}
              rowCount={status[t.tableName]?.rowCount ?? 0}
              uploadedAt={status[t.tableName]?.uploadedAt ?? null}
              onUploaded={handleUploaded}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Requiere: Agencias</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {TIER_1.map((t) => (
            <UploadCard
              key={t.tableName}
              {...t}
              rowCount={status[t.tableName]?.rowCount ?? 0}
              uploadedAt={status[t.tableName]?.uploadedAt ?? null}
              onUploaded={handleUploaded}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Requiere: Rutas + Calendario</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {TIER_2.map((t) => (
            <UploadCard
              key={t.tableName}
              {...t}
              rowCount={status[t.tableName]?.rowCount ?? 0}
              uploadedAt={status[t.tableName]?.uploadedAt ?? null}
              onUploaded={handleUploaded}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Requiere: Viajes + Paradas</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {TIER_3.map((t) => (
            <UploadCard
              key={t.tableName}
              {...t}
              rowCount={status[t.tableName]?.rowCount ?? 0}
              uploadedAt={status[t.tableName]?.uploadedAt ?? null}
              onUploaded={handleUploaded}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
