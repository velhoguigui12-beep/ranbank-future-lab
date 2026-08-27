"use client";

import { useEffect } from "react";

export default function PwaInstaller() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
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
