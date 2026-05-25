"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, ExternalLink } from "lucide-react";
import UploadCard from "./UploadCard";
import { fetchTableStatus, type TableStatus } from "@/lib/api/upload";

const SOURCES = [
  { label: "GTFS — Datos Abiertos CDMX", url: "https://datos.cdmx.gob.mx/dataset/gtfs" },
  { label: "Afluencia Metrobús", url: "https://datos.cdmx.gob.mx/dataset/afluencia-diaria-de-metrobus-cdmx" },
  { label: "Catálogo Yutong", url: "https://www.yutong.mx/products/ZK5120C.shtml" },
];

const GTFS = "https://datos.cdmx.gob.mx/dataset/gtfs";

const TIER_0 = [
  { tableName: "agency",     displayName: "Agencias",           sourceUrl: GTFS },
  { tableName: "calendar",   displayName: "Calendario",          sourceUrl: GTFS },
  { tableName: "stops",      displayName: "Paradas",             sourceUrl: GTFS },
  { tableName: "bus-models", displayName: "Modelos de Bus",      sourceUrl: "https://www.yutong.mx/products/ZK5120C.shtml" },
  { tableName: "shapes",     displayName: "Formas de Ruta",      sourceUrl: GTFS },
  { tableName: "afluencia",  displayName: "Afluencia Metrobús",  sourceUrl: "https://datos.cdmx.gob.mx/dataset/afluencia-diaria-de-metrobus-cdmx" },
];

const TIER_1 = [{ tableName: "routes",      displayName: "Rutas",               sourceUrl: GTFS }];

const TIER_2 = [{ tableName: "trips",       displayName: "Viajes",              sourceUrl: GTFS }];

const TIER_3 = [
  { tableName: "stop-times",  displayName: "Horarios de Parada", sourceUrl: GTFS },
  { tableName: "frequencies", displayName: "Frecuencias",        sourceUrl: GTFS },
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
      <section className="rounded-lg border border-border bg-muted/40 px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fuentes</span>
        {SOURCES.map((s) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-primary-light hover:underline"
          >
            {s.label}
            <ExternalLink className="h-3 w-3" />
          </a>
        ))}
      </section>
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
              sourceUrl={t.sourceUrl}
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
              sourceUrl={t.sourceUrl}
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
              sourceUrl={t.sourceUrl}
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
              sourceUrl={t.sourceUrl}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
