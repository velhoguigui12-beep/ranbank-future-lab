import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageUrl = new URL("../app/page.tsx", import.meta.url);

test("includes the protected access experience", async () => {
  const page = await readFile(pageUrl, "utf8");
  assert.match(page, /Entre na sua conta/);
  assert.match(page, /Entrar com PIN/);
  assert.match(page, /Biometria indisponível/);
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
