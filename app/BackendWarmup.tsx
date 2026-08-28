"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function BackendWarmup() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/" && pathname !== "/banco") return;

    // Wake the free Render backend as early as possible. Starting on the public
    // home means the API can already be warm when the visitor clicks "Acessar minha conta".
    fetch("/api/health", {
      credentials: "include",
      cache: "no-store",
      headers: { "X-Ranbank-Warmup": "1" },
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
