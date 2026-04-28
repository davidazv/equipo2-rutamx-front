"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, getRole } from "@/lib/auth";

interface AuthGuardProps {
  requiredRole?: string;
  children: React.ReactNode;
}

export function AuthGuard({ requiredRole, children }: AuthGuardProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = getToken();
    const role = getRole();

    if (!token || !role) {
      router.replace("/login");
      return;
    }

    if (requiredRole && role !== requiredRole) {
      const redirects: Record<string, string> = {
        admin: "/admin",
        ceo: "/ceo/dashboard",
        coo: "/coo/dashboard",
        cmo: "/cmo/dashboard",
      };
      router.replace(redirects[role] ?? "/login");
      return;
    }

    setAllowed(true);
  }, [router, requiredRole]);

  if (!allowed) return null;
  return <>{children}</>;
}
