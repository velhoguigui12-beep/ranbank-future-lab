"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const HOSTED_HEALTH_URL = "https://ranbank-api.onrender.com/api/health";

export default function BackendWarmup() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/" && pathname !== "/banco") return;

    const healthUrl = window.location.hostname.endsWith(".onrender.com")
      ? HOSTED_HEALTH_URL
      : "/api/health";

    fetch(healthUrl, {
      cache: "no-store",
      headers: { "X-Ranbank-Warmup": "1" },
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
