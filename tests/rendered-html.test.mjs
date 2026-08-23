import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageUrl = new URL("../app/page.tsx", import.meta.url);
const authUrl = new URL("../app/bank/AuthScreen.tsx", import.meta.url);
const apiUrl = new URL("../app/bank/api.ts", import.meta.url);

test("includes the protected access experience", async () => {
  const page = await readFile(pageUrl, "utf8");
  const auth = await readFile(authUrl, "utf8");
  const api = await readFile(apiUrl, "utf8");
  assert.match(auth, /Entre na sua conta/);
  assert.match(auth, /Entrar com PIN/);
  assert.match(auth, /Biometria indisponível/);
  assert.match(auth, /Recupere seu PIN/);
  assert.match(api, /credentials: "include"/);
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
