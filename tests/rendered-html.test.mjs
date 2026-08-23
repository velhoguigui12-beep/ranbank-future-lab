import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageUrl = new URL("../app/page.tsx", import.meta.url);
const authUrl = new URL("../app/bank/AuthScreen.tsx", import.meta.url);
const apiUrl = new URL("../app/bank/api.ts", import.meta.url);
const masksUrl = new URL("../app/bank/inputMasks.ts", import.meta.url);

test("includes the protected access experience", async () => {
  const page = await readFile(pageUrl, "utf8");
  const auth = await readFile(authUrl, "utf8");
  const api = await readFile(apiUrl, "utf8");
  const masks = await readFile(masksUrl, "utf8");
  assert.match(auth, /Entre na sua conta/);
  assert.match(auth, /Entrar com PIN/);
  assert.match(auth, /Biometria indisponível/);
  assert.match(auth, /Recupere seu PIN/);
  assert.match(auth, /Esqueci meu PIN/);
  assert.match(auth, /Voltar para entrar/);
  assert.ok(auth.indexOf("login-submit") < auth.indexOf("Esqueci meu PIN"));
  assert.ok(auth.indexOf("Esqueci meu PIN") < auth.indexOf("biometric-login"));
  assert.match(auth, /Telefone com DDD/);
  assert.match(masks, /formatCpf/);
  assert.match(masks, /formatBrazilianPhone/);
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

test("keeps account controls inside the customer profile", async () => {
  const page = await readFile(pageUrl, "utf8");
  assert.doesNotMatch(page, /Java conectado/);
  assert.doesNotMatch(page, /Iniciar apresentação guiada/);
  assert.doesNotMatch(page, /pix-modal-tools/);
  assert.match(page, /profile-actions/);
  assert.match(page, /Gerenciar chaves Pix/);
  assert.match(page, /Sair da conta/);
  assert.ok(page.indexOf('title: "Robótica"') < page.indexOf('title: "Comparar"'));
});
