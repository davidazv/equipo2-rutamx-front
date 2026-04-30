"use client";

import { useState } from "react";
import {
  useCurrentRole,
  type DashboardRole,
} from "@/hooks/use-current-role";

export type MapPageTab = "map" | "fleet";

const TAB_ACCESS: Record<DashboardRole, readonly MapPageTab[]> = {
  ceo: ["map", "fleet"],
  coo: ["map", "fleet"],
  cmo: ["map"],
  admin: ["map", "fleet"],
};

export function useMapPageState() {
  const role = useCurrentRole();
  const allowedTabs = TAB_ACCESS[role];

  const [activeTab, setActiveTabRaw] = useState<MapPageTab>(allowedTabs[0]);

  const safeActiveTab = allowedTabs.includes(activeTab)
    ? activeTab
    : allowedTabs[0];

  const setActiveTab = (tab: MapPageTab) => {
    if (allowedTabs.includes(tab)) setActiveTabRaw(tab);
  };

  return { activeTab: safeActiveTab, setActiveTab, allowedTabs };
}
