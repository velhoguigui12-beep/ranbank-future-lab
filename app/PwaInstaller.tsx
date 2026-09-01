"use client";

import { useEffect } from "react";

export default function PwaInstaller() {
  useEffect(() => {
    const isLocalDevelopment = ["localhost", "127.0.0.1", "[::1]"].includes(
      window.location.hostname,
    );

    if ("serviceWorker" in navigator && isLocalDevelopment) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(registrations.map((registration) => registration.unregister())),
        )
        .catch(() => undefined);

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
    } else if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    // Keep RanBank installable as a PWA, but do not render our own floating card
    // over banking controls. Installation stays available from the browser/native UI.
    const suppressCustomPrompt = (event: Event) => {
      event.preventDefault();
    };

    window.addEventListener("beforeinstallprompt", suppressCustomPrompt);
    return () => window.removeEventListener("beforeinstallprompt", suppressCustomPrompt);
  }, []);

  return null;
}
