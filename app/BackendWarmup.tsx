"use client";

import { useEffect } from "react";
import { warmBackend } from "./bank/api";

export default function BackendWarmup() {
  useEffect(() => {
    void warmBackend().catch(() => undefined);
  }, []);

  return null;
}
