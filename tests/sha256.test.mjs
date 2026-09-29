import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

test("computes the same SHA-256 as Node for the chained audit demo", async (t) => {
  let sha256;
  try {
    ({ sha256 } = await import("../app/bank/sha256.ts"));
  } catch {
    t.skip("Esta versão do Node não lê TypeScript diretamente.");
    return;
  }
  const samples = ["", "abc", "Pix enviado · R$ 50,00", "á".repeat(70), "x".repeat(1000)];
  for (const sample of samples) {
    assert.equal(sha256(sample), createHash("sha256").update(sample, "utf8").digest("hex"));
  }
});
