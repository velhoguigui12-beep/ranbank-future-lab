"use client";

/**
 * Render Free is allowed to wake on the first real banking request.
 * Keeping this component as a no-op avoids an extra /health request racing
 * with session restore/login while the backend is cold.
 */
export default function BackendWarmup() {
  return null;
}
