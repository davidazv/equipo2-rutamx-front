"use client";

import { useState, useEffect } from "react";
import { getUser, type CurrentUser } from "@/lib/auth";

export function useCurrentUser(): CurrentUser | null {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  return user;
}
