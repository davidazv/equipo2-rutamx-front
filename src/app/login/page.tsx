"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { signIn, getToken } from "@/lib/auth";

/* ── Station data ── */
type Station = {
  id: string;
  label: string;
  y: number;
  isTerminal?: boolean;
  isTransfer?: boolean;
  metroLines?: string[];
  tooltip: string;
};

const STATIONS: Station[] = [
  { id: "central-norte", label: "Central del Norte", y: 55,  isTerminal: true,  metroLines: [],          tooltip: "Terminal Norte — Fin de línea" },
  { id: "tepito",        label: "Tepito",             y: 160, metroLines: [],          tooltip: "Mercado de Tepito" },
  { id: "lagunilla",     label: "Lagunilla",          y: 248, isTransfer: true,  metroLines: [],          tooltip: "Corredor Verde · Lagunilla" },
  { id: "bellas-artes",  label: "Bellas Artes",       y: 338, isTransfer: true,  metroLines: ["L2","L8"], tooltip: "Correspondencia Metro L2 · L8" },
  { id: "hidalgo",       label: "Hidalgo",            y: 410, isTransfer: true,  metroLines: ["L2","L3"], tooltip: "Correspondencia Metro L2 · L3" },
  { id: "salto",         label: "Salto del Agua",     y: 480, isTransfer: true,  metroLines: ["L1","L8"], tooltip: "Correspondencia Metro L1 · L8" },
  { id: "doctores",      label: "Doctores",           y: 550, metroLines: [],          tooltip: "Hospital General de México" },
  { id: "scop",          label: "Centro SCOP",        y: 622, isTransfer: true,  metroLines: ["L3"],      tooltip: "Correspondencia Metro L3" },
  { id: "taxquena",      label: "Taxqueña",           y: 710, isTerminal: true,  isTransfer: true, metroLines: ["L2"], tooltip: "Terminal Sur · Metro L2" },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

function emailFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.email ?? null;
  } catch {
    return null;
  }
}

const LX  = 185;
const Y0  = 55;
const Y1  = 710;
const LEN = Y1 - Y0;
const STREETS = [80, 125, 165, 210, 255, 300, 345, 385, 420, 455, 495, 530, 568, 600, 638, 672, 705];

export default function LoginPage() {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);

      let destination = "/dashboard";
      const token = getToken();
      if (token) {
        const currentEmail = emailFromToken(token);
        const res = await fetch(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const users: Array<{ email: string; roleName: string }> = await res.json();
          const me = users.find(
            (u) => u.email.toLowerCase() === currentEmail?.toLowerCase()
          );
          const roleRoutes: Record<string, string> = {
            ADMIN: "/admin",
            CEO:   "/ceo/dashboard",
            COO:   "/coo/dashboard",
            CMO:   "/cmo/dashboard",
          };
          if (me?.roleName && roleRoutes[me.roleName]) {
            destination = roleRoutes[me.roleName];
          }
        }
      }

      router.push(destination);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ height: "100dvh", overflow: "hidden", display: "flex" }}>

      {/* ══════════════════════════════════
          LEFT — Trolebús map
          ══════════════════════════════════ */}
      <div style={{ width: "62%", flexShrink: 0, height: "100%", display: "flex" }} className="hidden md:flex">
        <div style={{ flex: 1, margin: "20px", borderRadius: "48px", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }} className="bg-[#0f172a] select-none">

          {/* Dot grid */}
          <div
            style={{
              position: "absolute", inset: 0,
              backgroundImage: "radial-gradient(circle, #64748b 1px, transparent 1px)",
              backgroundSize: "22px 22px",
              opacity: 0.12,
              zIndex: 1,
              pointerEvents: "none",
            }}
          />

          {/* Map SVG */}
          <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "36px", paddingBottom: "8px", paddingLeft: "12px", paddingRight: "12px", position: "relative", zIndex: 2 }}>
            <svg
              viewBox="0 28 440 720"
              style={{ maxHeight: "92%", width: "auto", maxWidth: "100%" }}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="gv" x="-300%" y="-300%" width="700%" height="700%">
                  <feGaussianBlur stdDeviation="7" result="b"/>
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <filter id="gl" x="-80%" y="-10%" width="260%" height="120%">
                  <feGaussianBlur stdDeviation="2.5" result="b"/>
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <filter id="gn" x="-200%" y="-200%" width="500%" height="500%">
                  <feGaussianBlur stdDeviation="3.5" result="b"/>
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>

              {/* City grid — horizontal streets */}
              {STREETS.map((y) => (
                <line key={y} x1="0" y1={y} x2="440" y2={y} stroke="#1a2540" strokeWidth="1.2"/>
              ))}
              {/* City grid — vertical streets */}
              {[45, 95, 145, 240, 310, 370, 430].map((x) => (
                <line key={x} x1={x} y1="28" x2={x} y2="750" stroke="#192030" strokeWidth="2.5"/>
              ))}

              {/* Crossing route lines */}
              <path d="M 15,85 L 75,85 L 185,248 L 290,310 L 390,310"
                stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.65"/>
              {[{cx:75,cy:85},{cx:185,cy:248},{cx:290,cy:310}].map((p,i)=>(
                <circle key={i} cx={p.cx} cy={p.cy} r="4" fill="#14532d" stroke="#22c55e" strokeWidth="1.5"/>
              ))}

              <path d="M 15,290 L 100,290 L 185,338 L 380,338 L 420,300"
                stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.65"/>
              {[{cx:100,cy:290},{cx:185,cy:338},{cx:310,cy:338}].map((p,i)=>(
                <circle key={i} cx={p.cx} cy={p.cy} r="4" fill="#431407" stroke="#f97316" strokeWidth="1.5"/>
              ))}

              <path d="M 15,375 L 110,410 L 185,410 L 360,410 L 430,370"
                stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.65"/>
              {[{cx:110,cy:410},{cx:185,cy:410},{cx:290,cy:410}].map((p,i)=>(
                <circle key={i} cx={p.cx} cy={p.cy} r="4" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5"/>
              ))}

              <path d="M 15,535 L 100,480 L 185,480 L 350,480 L 430,445"
                stroke="#a855f7" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.65"/>
              {[{cx:100,cy:480},{cx:185,cy:480},{cx:310,cy:480}].map((p,i)=>(
                <circle key={i} cx={p.cx} cy={p.cy} r="4" fill="#3b0764" stroke="#a855f7" strokeWidth="1.5"/>
              ))}

              <path d="M 185,622 L 280,575 L 380,560 L 430,560"
                stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.65"/>
              {[{cx:280,cy:575},{cx:380,cy:560}].map((p,i)=>(
                <circle key={i} cx={p.cx} cy={p.cy} r="4" fill="#451a03" stroke="#f59e0b" strokeWidth="1.5"/>
              ))}

              <path d="M 185,55 L 270,28 L 380,28 L 430,28"
                stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
              <path d="M 185,710 L 90,748" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
              <path d="M 185,710 L 270,748" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>

              {/* Route labels */}
              <text x="20" y="78"  fill="#166534" fontSize="7.5" fontFamily="sans-serif" fontWeight="600">Corredor Verde</text>
              <text x="20" y="283" fill="#9a3412" fontSize="7.5" fontFamily="sans-serif" fontWeight="600">Ruta Naranja</text>
              <text x="20" y="368" fill="#1e40af" fontSize="7.5" fontFamily="sans-serif" fontWeight="600">Metro L2</text>
              <text x="20" y="542" fill="#6b21a8" fontSize="7.5" fontFamily="sans-serif" fontWeight="600">Metrobús L4</text>

              {/* Eje Central street band */}
              <line x1={LX} y1="28" x2={LX} y2="750" stroke="#172033" strokeWidth="10"/>

              {/* Route base */}
              <line x1={LX} y1={Y0} x2={LX} y2={Y1} stroke="#075985" strokeWidth="4.5" strokeLinecap="round"/>

              {/* Animated draw on mount */}
              <motion.line
                x1={LX} y1={Y0} x2={LX} y2={Y1}
                stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round"
                filter="url(#gl)"
                strokeDasharray={LEN}
                initial={{ strokeDashoffset: LEN }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 2, ease: "easeInOut", delay: 0.4 }}
              />

              {/* Vehicle glow — infinite N→S */}
              <motion.circle cx={LX} r={12} fill="#38bdf8" opacity={0.9} filter="url(#gv)"
                animate={{ cy: [Y0, Y1] }}
                transition={{ duration: 8, ease: "linear", repeat: Infinity, repeatDelay: 1.5 }}
              />
              <motion.circle cx={LX} r={4.5} fill="white"
                animate={{ cy: [Y0, Y1] }}
                transition={{ duration: 8, ease: "linear", repeat: Infinity, repeatDelay: 1.5 }}
              />

              {/* Ping rings on transfer stations */}
              {STATIONS.filter((s) => s.isTransfer).map((s, i) => (
                <motion.circle key={`ping-${s.id}`} cx={LX} cy={s.y}
                  r={s.isTerminal ? 11 : 8} fill="none" stroke="#22d3ee" strokeWidth="1"
                  animate={{ r: [s.isTerminal ? 11 : 8, s.isTerminal ? 26 : 22], opacity: [0.5, 0] }}
                  transition={{ duration: 2.8, ease: "easeOut", repeat: Infinity, delay: i * 0.6, repeatDelay: 0.4 }}
                />
              ))}

              {/* Stations */}
              {STATIONS.map((s) => {
                const isHov = hovered === s.id;
                const r = s.isTerminal ? 11 : s.isTransfer ? 8 : 6;
                const showAbove = s.y > 580;

                return (
                  <g key={s.id}
                    onMouseEnter={() => setHovered(s.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ cursor: "pointer" }}
                  >
                    {isHov && (
                      <motion.circle cx={LX} cy={s.y} r={r} fill="none" stroke="#7dd3fc" strokeWidth="1.5"
                        animate={{ r: [r, r + 18], opacity: [0.8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                      />
                    )}

                    {s.isTransfer && (
                      <circle cx={LX} cy={s.y} r={r + 4} fill="none"
                        stroke={isHov ? "#7dd3fc" : "#1d4ed8"}
                        strokeWidth="1.5"
                        strokeDasharray={s.isTerminal ? undefined : "3 2"}
                      />
                    )}

                    <circle cx={LX} cy={s.y} r={r}
                      fill={isHov ? "#0ea5e9" : s.isTerminal ? "#075985" : "#0c4a6e"}
                      stroke={isHov ? "#e0f2fe" : "#38bdf8"}
                      strokeWidth={s.isTerminal ? 2.5 : 2}
                      filter={isHov ? "url(#gn)" : undefined}
                      style={{ transition: "fill 0.2s" }}
                    />
                    <circle cx={LX} cy={s.y} r={s.isTerminal ? 4.5 : 2.5}
                      fill={isHov ? "white" : "#bae6fd"}
                      style={{ transition: "fill 0.2s" }}
                    />

                    <text x={LX + 20} y={s.y + 4}
                      fill={isHov ? "#e2e8f0" : s.isTransfer || s.isTerminal ? "#94a3b8" : "#64748b"}
                      fontSize={s.isTerminal ? "11" : s.isTransfer ? "10" : "9"}
                      fontWeight={s.isTerminal || s.isTransfer ? "600" : "400"}
                      fontFamily="sans-serif"
                      style={{ transition: "fill 0.2s" }}
                    >
                      {s.label}
                    </text>

                    {s.metroLines && s.metroLines.map((line, li) => (
                      <g key={li}>
                        <rect x={LX - 28 - li * 24} y={s.y - 7} width="20" height="13" rx="3"
                          fill="#1e3a8a" stroke="#3b82f6" strokeWidth="0.7"/>
                        <text x={LX - 18 - li * 24} y={s.y + 3.5}
                          fill="#93c5fd" fontSize="7" textAnchor="middle"
                          fontFamily="sans-serif" fontWeight="700">
                          {line}
                        </text>
                      </g>
                    ))}

                    {isHov && (
                      <g>
                        <rect x={LX + 18} y={showAbove ? s.y - 28 : s.y + 12}
                          width="148" height="18" rx="4"
                          fill="#0f172a" stroke="#0ea5e9" strokeWidth="0.8" opacity="0.97"/>
                        <text x={LX + 22} y={showAbove ? s.y - 15 : s.y + 24}
                          fill="#7dd3fc" fontSize="7.8" fontFamily="sans-serif">
                          {s.tooltip}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              <text x={LX - 9} y={Y0 - 14} fill="#334155" fontSize="9" fontFamily="sans-serif">N ↑</text>
              <text x={LX - 9} y={Y1 + 20} fill="#334155" fontSize="9" fontFamily="sans-serif">S ↓</text>
            </svg>
          </div>

          {/* Bottom branding */}
          <div className="relative z-10 px-8 pb-8 pt-2">
            <h2 className="font-serif text-3xl font-bold text-white leading-snug tracking-tight">
              Movilidad inteligente<br />para la capital.
            </h2>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed">
              Gestión avanzada de rutas y flotas del<br />
              Sistema de Transportes Eléctricos · CDMX
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
          RIGHT — Login form
          ══════════════════════════════════ */}
      <div style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflowY: "auto" }} className="bg-white px-12 py-8">

        {/* Brand */}
        <div className="w-full max-w-md flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-13 h-13 rounded-xl bg-[#1e40af] flex items-center justify-center shadow-md flex-shrink-0 p-2.5">
              <svg width="28" height="28" viewBox="0 0 16 16" fill="none">
                <circle cx="3" cy="8" r="2" fill="white"/>
                <circle cx="13" cy="4" r="2" fill="white"/>
                <circle cx="13" cy="12" r="2" fill="white"/>
                <line x1="5" y1="8" x2="11" y2="4" stroke="white" strokeWidth="1.5"/>
                <line x1="5" y1="8" x2="11" y2="12" stroke="white" strokeWidth="1.5"/>
              </svg>
            </div>
            <span className="text-4xl font-bold text-gray-900 tracking-tight">RutaMx</span>
          </div>
        </div>

        {/* Heading */}
        <div className="w-full max-w-md mb-8 text-center">
          <h1 className="font-serif text-5xl font-bold text-gray-900 leading-tight">
            Bienvenido<br />de nuevo
          </h1>
        </div>

        {/* Form */}
        <form className="w-full max-w-md space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
              Correo electrónico
            </label>
            <Input
              type="email"
              placeholder="nombre@empresa.com"
              className="h-14 px-5 text-base bg-gray-50 border-gray-200 rounded-xl focus:bg-white transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
              Contraseña
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              className="h-14 px-5 text-base bg-gray-50 border-gray-200 rounded-xl focus:bg-white transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end">
            <Link href="/contact-admin" className="text-xs text-[#1e40af] hover:underline font-medium">
              ¿Problemas para ingresar?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full h-14 bg-[#1e40af] hover:bg-[#1e3a8a] text-white text-base font-semibold rounded-xl transition-colors"
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-10">
          © 2025 RutaMx · Plataforma de gestión de rutas
        </p>
      </div>

    </div>
  );
}
