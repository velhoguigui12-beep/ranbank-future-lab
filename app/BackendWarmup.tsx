"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function BackendWarmup() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/banco") return;

    // Fire-and-forget: starts waking the free Render backend while the user is
    // still reading/filling the login form. Authentication is not changed here.
    fetch("/api/auth/session", {
      credentials: "include",
      cache: "no-store",
      headers: { "X-Ranbank-Warmup": "1" },
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
