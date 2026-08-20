import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageUrl = new URL("../app/page.tsx", import.meta.url);
const publicSiteUrl = new URL("../app/PublicSiteGate.tsx", import.meta.url);

test("includes the protected access experience", async () => {
  const page = await readFile(pageUrl, "utf8");
  assert.match(page, /Entre na sua conta/);
  assert.match(page, /Entrar com PIN/);
  assert.match(page, /Biometria via passkey ainda não cadastrada/);
  assert.match(page, /SESSION_RESTORE_TIMEOUT_MS = 1800/);
  assert.match(page, /autoComplete="off"/);
  assert.match(page, /credentials: "include"/);
  assert.match(page, /\/auth\/session/);
  assert.match(page, /\/auth\/logout/);
});

test("requires a separate four-digit password before sending Pix", async () => {
  const page = await readFile(pageUrl, "utf8");
  assert.match(page, /Revise sua transferência/);
  assert.match(page, /Senha de quatro dígitos do cartão/);
  assert.match(page, /transactionPin/);
  assert.match(page, /Teclado da senha do cart/);
  assert.match(page, /appendTransactionDigit/);
  assert.match(page, /Autorizar transferência/);
});

test("publishes the RanBank video showcase without eager downloads", async () => {
  const page = await readFile(publicSiteUrl, "utf8");
  assert.match(page, /RANBANK EM MOVIMENTO/);
  assert.match(page, /ranbank-demonstracao-04\.mp4/);
  assert.match(page, /preload="metadata"/);
});
