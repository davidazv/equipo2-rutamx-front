"use client";

import { useParams } from "next/navigation";

export type DashboardRole = "ceo" | "coo" | "cmo" | "admin";

const VALID_ROLES: DashboardRole[] = ["ceo", "coo", "cmo", "admin"];

export function useCurrentRole(): DashboardRole {
  const params = useParams();
  const role = (params?.role as string | undefined)?.toLowerCase();
  return role && (VALID_ROLES as string[]).includes(role)
    ? (role as DashboardRole)
    : "ceo";
}
