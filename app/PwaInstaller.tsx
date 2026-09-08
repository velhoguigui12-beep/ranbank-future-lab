"use client";

import { useEffect } from "react";

export default function PwaInstaller() {
  useEffect(() => {
    // Stability mode for the classroom demo: remove old RanBank service workers
    // and cached shells so a stale bundle cannot keep showing an already-fixed
    // API error after a new Render deploy.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(registrations.map((registration) => registration.unregister())),
        )
        .catch(() => undefined);
    }

    if ("caches" in window) {
      window.caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((key) => key.startsWith("ranbank-shell-"))
              .map((key) => window.caches.delete(key)),
          ),
        )
        .catch(() => undefined);
    }

    const suppressCustomPrompt = (event: Event) => {
      event.preventDefault();
    };

    window.addEventListener("beforeinstallprompt", suppressCustomPrompt);
    return () => window.removeEventListener("beforeinstallprompt", suppressCustomPrompt);
  }, []);

  return null;
}
