"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface BubbleBackgroundProps {
  readonly className?: string;
  readonly children?: React.ReactNode;
  readonly interactive?: boolean;
  readonly colors?: {
    readonly first: string;
    readonly second: string;
    readonly third: string;
    readonly fourth: string;
    readonly fifth: string;
  };
}

export function BubbleBackground({
  className,
  children,
  interactive = false,
  colors = {
    first: "47,128,237",
    second: "59,130,246",
    third: "139,92,246",
    fourth: "249,115,22",
    fifth: "34,197,94",
  },
}: BubbleBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current || !cursorRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    cursorRef.current.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
  }, []);

  useEffect(() => {
    if (!interactive) return;
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, [interactive, handleMouseMove]);

  const makeGradient = (color: string) =>
    `radial-gradient(circle at center, rgba(${color}, 0.8) 0%, rgba(${color}, 0) 50%)`;

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 overflow-hidden bg-gradient-to-br from-[#1a1c20] to-[#111214]",
        className
      )}
    >
      <div
        className="absolute inset-0"
        style={{ filter: "blur(40px)" }}
      >
        {/* Bubble 1 — slow vertical bob */}
        <div
          className="absolute rounded-full mix-blend-hard-light animate-[bubble-bob_30s_ease-in-out_infinite]"
          style={{
            width: "80%", height: "80%", top: "10%", left: "10%",
            background: makeGradient(colors.first),
          }}
        />
        {/* Bubble 2 — rotate orbit */}
        <div
          className="absolute inset-0 flex justify-center items-center animate-[spin_20s_linear_infinite]"
          style={{ transformOrigin: "calc(50% - 400px) center" }}
        >
          <div
            className="rounded-full mix-blend-hard-light"
            style={{
              width: "80%", height: "80%",
              background: makeGradient(colors.second),
            }}
          />
        </div>
        {/* Bubble 3 — slow orbit */}
        <div
          className="absolute inset-0 flex justify-center items-center animate-[spin_40s_linear_infinite]"
          style={{ transformOrigin: "calc(50% + 400px) center" }}
        >
          <div
            className="absolute rounded-full mix-blend-hard-light"
            style={{
              width: "80%", height: "80%",
              top: "calc(50% + 200px)", left: "calc(50% - 500px)",
              background: makeGradient(colors.third),
            }}
          />
        </div>
        {/* Bubble 4 — horizontal drift */}
        <div
          className="absolute rounded-full mix-blend-hard-light opacity-70 animate-[bubble-drift_40s_ease-in-out_infinite]"
          style={{
            width: "80%", height: "80%", top: "10%", left: "10%",
            background: makeGradient(colors.fourth),
          }}
        />
        {/* Bubble 5 — large slow orbit */}
        <div
          className="absolute inset-0 flex justify-center items-center animate-[spin_20s_linear_infinite]"
          style={{ transformOrigin: "calc(50% - 800px) calc(50% + 200px)" }}
        >
          <div
            className="absolute rounded-full mix-blend-hard-light"
            style={{
              width: "160%", height: "160%",
              top: "calc(50% - 80%)", left: "calc(50% - 80%)",
              background: makeGradient(colors.fifth),
            }}
          />
        </div>
        {/* Interactive cursor bubble */}
        {interactive && (
          <div
            ref={cursorRef}
            className="absolute rounded-full mix-blend-hard-light opacity-70 transition-transform duration-300 ease-out pointer-events-none"
            style={{
              width: "100%", height: "100%",
              top: "50%", left: "50%",
              background: makeGradient("220,38,38"),
            }}
          />
        )}
      </div>

      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  );
}
