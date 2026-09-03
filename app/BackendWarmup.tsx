"use client";

/**
 * Stability mode: do not generate background keep-alive traffic from every
 * browser tab. The first real banking request wakes the backend through the
 * same-origin proxy, which also makes recurrent 429s easier to isolate.
 */
export default function BackendWarmup() {
  return null;
}
