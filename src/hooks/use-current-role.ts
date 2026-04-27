"use client";

import { useEffect } from "react";
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
  const storedRole = getRole() as DashboardRole | null;

  useEffect(() => {
    if (!storedRole) {
      router.replace("/login");
      return;
    }
    if (urlRole && urlRole !== storedRole) {
      router.replace(ROLE_REDIRECTS[storedRole] ?? "/login");
    }
  }, [storedRole, urlRole, router]);

  return storedRole ?? urlRole ?? "ceo";
}
