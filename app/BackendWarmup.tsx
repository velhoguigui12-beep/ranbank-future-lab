"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

let backendWarmupStarted = false;

export default function BackendWarmup() {
  const pathname = usePathname();

  useEffect(() => {
    if (backendWarmupStarted) return;
    backendWarmupStarted = true;

    fetch("/api/health", {
      cache: "no-store",
      headers: { "X-Ranbank-Warmup": "1" },
    }).catch(() => {
      backendWarmupStarted = false;
    });
  }, [pathname]);

  return null;
}
