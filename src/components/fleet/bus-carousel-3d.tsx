"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Zap, Fuel } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { BusModel } from "@/lib/api/bus-models";
import { formatNumber } from "@/lib/utils";

const GLB_FILES = [
  "/primer-modelo.glb",
  "/BYD_K7.glb",
  "/BYD_K9.glb",
  "/New_Flyer_Xcelsior_XE40.glb",
  "/Proterra_ZX5.glb",
  "/Volvo_7900_electric.glb",
];

function getGlbForIndex(index: number) {
  return GLB_FILES[index % GLB_FILES.length];
}

function BusModel3D({ glbPath }: { glbPath: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(glbPath);

  useEffect(() => {
    if (groupRef.current) {
      gsap.fromTo(
        groupRef.current.rotation,
        { y: -Math.PI / 4 },
        { y: Math.PI / 4, duration: 8, repeat: -1, yoyo: true, ease: "sine.inOut" },
      );
    }
  }, []);

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={12} />
    </group>
  );
}

for (const glb of GLB_FILES) {
  useGLTF.preload(glb);
}

function CarouselScene({ glbPath }: { glbPath: string }) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.lookAt(0, 0, 0);
    }
  }, []);

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[12, 5, 12]} fov={50} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, 5, -5]} intensity={0.5} />
      <spotLight position={[0, 15, 0]} angle={0.3} intensity={0.8} />
      <color attach="background" args={["#f1f5f9"]} />
      <BusModel3D glbPath={glbPath} />
    </>
  );
}

interface BusCarousel3DProps {
  models: BusModel[];
}

export function BusCarousel3D({ models }: BusCarousel3DProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (models.length === 0) return null;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? models.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === models.length - 1 ? 0 : prev + 1));
  };

  const bus = models[currentIndex];

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="relative h-[600px] overflow-hidden bg-slate-100">
        <Canvas>
          <CarouselScene glbPath={getGlbForIndex(currentIndex)} />
        </Canvas>

        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-surface/80 backdrop-blur-sm hover:bg-surface transition-colors"
        >
          <ChevronLeft className="h-6 w-6 text-foreground" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-surface/80 backdrop-blur-sm hover:bg-surface transition-colors"
        >
          <ChevronRight className="h-6 w-6 text-foreground" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {models.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? "w-8 bg-primary-light" : "w-2 bg-primary-light/20"
              }`}
            />
          ))}
        </div>
      </Card>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="h-[600px]"
        >
          <Card className="p-6 h-full flex flex-col">
            <div className="space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{bus.manufacturer} {bus.name}</h3>
                  <p className="text-sm text-text-secondary">
                    Modelo {currentIndex + 1} de {models.length}
                  </p>
                </div>
                <Badge variant={bus.fuelType === "ELECTRIC" ? "success" : "default"} className="gap-1">
                  {bus.fuelType === "ELECTRIC" ? <Zap className="h-3 w-3" /> : <Fuel className="h-3 w-3" />}
                  {bus.fuelType === "ELECTRIC" ? "Eléctrico" : "Diésel"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-text-secondary">Autonomía</p>
                  <p className="text-lg font-semibold">{formatNumber(bus.autonomyKm)} km</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Batería</p>
                  <p className="text-lg font-semibold">{formatNumber(bus.batteryCapacityKwh ?? 0)} kWh</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Capacidad</p>
                  <p className="text-lg font-semibold">{bus.passengerCapacity} pas.</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Consumo</p>
                  <p className="text-lg font-semibold">{bus.energyConsumptionKwhKm ?? 0} kWh/km</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-text-secondary">Costo Unitario</p>
                  <p className="text-sm font-medium">${formatNumber(bus.unitCostUsd / 1000)}K USD</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Mantenimiento</p>
                  <p className="text-sm font-medium">${bus.maintenanceCostPerKm ?? 0}/km</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">CO₂ Emisiones</p>
                  <p className="text-sm font-medium">{formatNumber(bus.co2EmissionsGKm ?? 0)} g/km</p>
                </div>
                {bus.fuelType === "DIESEL" && (
                  <div>
                    <p className="text-xs text-text-secondary">Consumo Combustible</p>
                    <p className="text-sm font-medium">{bus.fuelConsumptionLKm ?? 0} L/km</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
