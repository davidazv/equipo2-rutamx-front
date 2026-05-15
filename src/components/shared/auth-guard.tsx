"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, getRole, refreshIdToken } from "@/lib/auth";

interface AuthGuardProps {
  requiredRole?: string;
  children: React.ReactNode;
}

export function AuthGuard({ requiredRole, children }: AuthGuardProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function verify() {
      let token = getToken();
      const role = getRole();

      if (!token) {
        // idToken missing — try to restore the session via the refresh token
        token = await refreshIdToken();
        if (!token) {
          router.replace("/login");
          return;
        }
      }

      if (!role) {
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
    }
    verify();
  }, [router, requiredRole]);

  if (!allowed) return null;
  return <>{children}</>;
}
