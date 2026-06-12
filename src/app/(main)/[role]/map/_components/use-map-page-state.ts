"use client";

import { useState } from "react";
import {
  useCurrentRole,
  type DashboardRole,
} from "@/hooks/use-current-role";

export type MapPageTab =
  | "map"
  | "fleet"
  | "campanas-ambientales"
  | "optimizacion-flota";

const TAB_ACCESS: Record<DashboardRole, readonly MapPageTab[]> = {
  admin: ["map", "optimizacion-flota", "campanas-ambientales"],
  ceo:   ["map", "optimizacion-flota"],
  coo:   ["map", "optimizacion-flota"],
  cmo:   ["optimizacion-flota", "campanas-ambientales"],
};

export function useMapPageState() {
  const role = useCurrentRole();
  const allowedTabs = TAB_ACCESS[role];

  const [activeTab, setActiveTab] = useState<MapPageTab>(allowedTabs[0]);

  const safeActiveTab = allowedTabs.includes(activeTab)
    ? activeTab
    : allowedTabs[0];

  const setActiveTabSafe = (tab: MapPageTab) => {
    if (allowedTabs.includes(tab)) setActiveTab(tab);
  };

  return { activeTab: safeActiveTab, setActiveTab: setActiveTabSafe, allowedTabs };
}
