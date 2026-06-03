"use client";

import { motion } from "framer-motion";

// ── SVG ──────────────────────────────────────────────────────────────────

interface BusPlaceholderSvgProps {
  className?: string;
}

/**
 * Silueta plana de autobús urbano. Monocromático sobre `currentColor`
 * (hereda el color del contenedor) con un acento para ventanas/detalles.
 * Se usa como sustituto cuando un modelo de bus no tiene un `.glb` asociado.
 */
export function BusPlaceholderSvg({ className }: BusPlaceholderSvgProps) {
  return (
    <svg
      viewBox="0 0 240 120"
      className={className}
      role="img"
      aria-label="Modelo sin vista 3D"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Modelo sin vista 3D</title>

      {/* Carrocería */}
      <rect
        x="14"
        y="22"
        width="212"
        height="64"
        rx="16"
        fill="currentColor"
        opacity="0.12"
      />
      <rect
        x="14"
        y="22"
        width="212"
        height="64"
        rx="16"
        stroke="currentColor"
        strokeWidth="3"
      />

      {/* Parabrisas (frontal) */}
      <path
        d="M210 30c8 1 12 6 12 14v8h-22V30z"
        fill="currentColor"
        opacity="0.28"
      />

      {/* Franja de ventanas */}
      <rect x="30" y="34" width="26" height="20" rx="4" fill="currentColor" opacity="0.28" />
      <rect x="64" y="34" width="26" height="20" rx="4" fill="currentColor" opacity="0.28" />
      <rect x="98" y="34" width="26" height="20" rx="4" fill="currentColor" opacity="0.28" />
      <rect x="132" y="34" width="26" height="20" rx="4" fill="currentColor" opacity="0.28" />

      {/* Puerta */}
      <rect
        x="166"
        y="34"
        width="22"
        height="44"
        rx="4"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.6"
      />
      <line
        x1="177"
        y1="34"
        x2="177"
        y2="78"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.6"
      />

      {/* Faro */}
      <circle cx="220" cy="70" r="4" fill="currentColor" opacity="0.6" />

      {/* Ruedas */}
      <circle cx="68" cy="90" r="14" fill="currentColor" />
      <circle cx="68" cy="90" r="6" fill="currentColor" opacity="0.25" />
      <circle cx="176" cy="90" r="14" fill="currentColor" />
      <circle cx="176" cy="90" r="6" fill="currentColor" opacity="0.25" />
    </svg>
  );
}

// ── Animated placeholder ───────────────────────────────────────────────────

interface BusPlaceholderProps {
  className?: string;
}

/**
 * Placeholder animado: el SVG "gira" suavemente en el eje Y para imitar el
 * efecto del carrusel 3D sin montar Three.js.
 */
export function BusPlaceholder({ className }: BusPlaceholderProps) {
  return (
    <div
      className={className}
      style={{ perspective: 900 }}
    >
      <motion.div
        className="text-primary"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: [-25, 25, -25] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <BusPlaceholderSvg className="w-[70%] mx-auto" />
        <p className="mt-4 text-center text-sm text-text-secondary">
          Vista 3D no disponible para este modelo
        </p>
      </motion.div>
    </div>
  );
}
