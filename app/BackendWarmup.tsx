"use client";

import { useEffect } from "react";
import { warmBackend } from "./bank/api";

/**
 * Start exactly one shared backend wake-up when the site opens. Other banking
 * requests await the same warmBackend promise, so session restore and login do
 * not race the cold Java service and create a burst of requests.
 */
export default function BackendWarmup() {
  useEffect(() => {
    void warmBackend().catch(() => undefined);
  }, []);

  return null;
}
