"use client";

import UploadCard from "./components/UploadCard";

const TIER_0 = [
  {
    tableName: "agency",
    displayName: "Agencias",
    description: "Agencias de transporte (agency.csv)",
  },
  {
    tableName: "calendar",
    displayName: "Calendario",
    description: "Disponibilidad de servicio por día (calendar.csv)",
  },
  {
    tableName: "stops",
    displayName: "Paradas",
    description: "Paradas del sistema de transporte (stops.csv)",
  },
  {
    tableName: "bus-models",
    displayName: "Modelos de Bus",
    description: "Catálogo de modelos de autobús (bus_models.csv)",
  },
  {
    tableName: "shapes",
    displayName: "Formas de Ruta",
    description: "Trazado geográfico de rutas (shapes.csv) — archivo grande",
  },
  {
    tableName: "afluencia",
    displayName: "Afluencia Metrobús",
    description: "Datos de afluencia diaria (afluenciamb.csv)",
  },
];

const TIER_1 = [
  {
    tableName: "routes",
    displayName: "Rutas",
    description:
      "Rutas de transporte (routes.csv) — asigna colores automáticamente si faltan",
  },
];

const TIER_2 = [
  {
    tableName: "trips",
    displayName: "Viajes",
    description: "Viajes programados (trips.csv)",
  },
];

const TIER_3 = [
  {
    tableName: "stop-times",
    displayName: "Horarios de Parada",
    description: "Horarios por parada por viaje (stop_times.csv) — archivo grande",
  },
  {
    tableName: "frequencies",
    displayName: "Frecuencias",
    description: "Frecuencias de servicio (frequencies.csv)",
  },
];

export default function UploadPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Carga de Datos GTFS</h1>
        <p className="text-muted-foreground mt-1">
          Sube archivos CSV para poblar las tablas de datos. Respeta el orden de
          dependencias: primero las tablas base, luego las dependientes.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Sin dependencias</h2>
        <p className="text-sm text-muted-foreground">
          Estas tablas pueden cargarse en cualquier orden.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {TIER_0.map((t) => (
            <UploadCard key={t.tableName} {...t} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Requiere: Agencias</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {TIER_1.map((t) => (
            <UploadCard key={t.tableName} {...t} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Requiere: Rutas + Calendario</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {TIER_2.map((t) => (
            <UploadCard key={t.tableName} {...t} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Requiere: Viajes + Paradas</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {TIER_3.map((t) => (
            <UploadCard key={t.tableName} {...t} />
          ))}
        </div>
      </section>
    </div>
  );
}
