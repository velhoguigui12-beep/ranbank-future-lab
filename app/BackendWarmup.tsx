"use client";

import { useEffect } from "react";

const HOSTED_HEALTH_URL = "https://ranbank-api.onrender.com/api/health";
const KEEP_ALIVE_INTERVAL_MS = 10 * 60 * 1000;

export default function BackendWarmup() {
  useEffect(() => {
    let lastPingAt = 0;

    const healthUrl = window.location.hostname.endsWith(".onrender.com")
      ? HOSTED_HEALTH_URL
      : "/api/health";

    const ping = () => {
      lastPingAt = Date.now();
      void fetch(healthUrl, {
        method: "GET",
        cache: "no-store",
        credentials: "omit",
        keepalive: true,
        headers: { "X-Ranbank-Warmup": "1" },
      }).catch(() => undefined);
    };

    // Wake the Java API as soon as the visitor opens the RanBank site. This is
    // intentionally fire-and-forget: login is never blocked by the health call.
    ping();

    // Render Free spins down after 15 minutes without inbound traffic. Keeping
    // one lightweight health request every 10 minutes prevents the backend from
    // sleeping while the presentation/site remains open.
    const interval = window.setInterval(ping, KEEP_ALIVE_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastPingAt >= KEEP_ALIVE_INTERVAL_MS) ping();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}
