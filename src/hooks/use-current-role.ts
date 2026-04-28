"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getRole } from "@/lib/auth";

export type DashboardRole = "ceo" | "coo" | "cmo" | "admin";

const ROLE_REDIRECTS: Record<string, string> = {
  admin: "/admin",
  ceo: "/ceo/dashboard",
  coo: "/coo/dashboard",
  cmo: "/cmo/dashboard",
};

export function useCurrentRole(): DashboardRole {
  const params = useParams();
  const router = useRouter();
  const urlRole = (params?.role as string | undefined)?.toLowerCase() as DashboardRole | undefined;

  const [storedRole, setStoredRole] = useState<DashboardRole | null>(null);

  useEffect(() => {
    const role = getRole() as DashboardRole | null;
    setStoredRole(role);
    if (!role) {
      router.replace("/login");
      return;
    }
    if (urlRole && urlRole !== role) {
      router.replace(ROLE_REDIRECTS[role] ?? "/login");
    }
  }, [urlRole, router]);

  return storedRole ?? urlRole ?? "ceo";
}
