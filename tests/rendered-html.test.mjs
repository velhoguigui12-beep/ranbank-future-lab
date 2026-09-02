import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageUrl = new URL("../app/page.tsx", import.meta.url);
const authUrl = new URL("../app/bank/AuthScreen.tsx", import.meta.url);
const apiUrl = new URL("../app/bank/api.ts", import.meta.url);
const masksUrl = new URL("../app/bank/inputMasks.ts", import.meta.url);
const publicSiteUrl = new URL("../app/PublicSiteGate.tsx", import.meta.url);
const projectsUrl = new URL("../app/ProjectsPublicPage.tsx", import.meta.url);
const pwaInstallerUrl = new URL("../app/PwaInstaller.tsx", import.meta.url);
const serviceWorkerUrl = new URL("../public/sw.js", import.meta.url);
const warmupUrl = new URL("../app/BackendWarmup.tsx", import.meta.url);
const proxyUrl = new URL("../app/api/[...path]/route.ts", import.meta.url);
const layoutUrl = new URL("../app/layout.tsx", import.meta.url);
const bankThemeUrl = new URL("../app/bank-theme.css", import.meta.url);
const bankingSuiteUrl = new URL("../app/BankingSuite.tsx", import.meta.url);

test("includes the protected access experience", async () => {
  const page = await readFile(pageUrl, "utf8");
  const auth = await readFile(authUrl, "utf8");
  const api = await readFile(apiUrl, "utf8");
  const masks = await readFile(masksUrl, "utf8");
  assert.match(auth, /Acesse sua conta/);
  assert.match(auth, /Entrar com PIN/);
  assert.match(auth, /Biometria indisponível/);
  assert.match(auth, /Recupere seu acesso/);
  assert.match(auth, /Esqueci meu PIN/);
  assert.match(auth, /Voltar para entrar/);
  assert.ok(auth.indexOf("login-submit") < auth.indexOf("Esqueci meu PIN"));
  assert.ok(auth.indexOf("Esqueci meu PIN") < auth.indexOf("biometric-login"));
  assert.match(auth, /Telefone com DDD/);
  assert.match(masks, /formatCpf/);
  assert.match(masks, /formatBrazilianPhone/);
  assert.match(api, /credentials: "include"/);
  assert.match(api, /NEXT_PUBLIC_API_URL \?\? "\/api"/);
  assert.doesNotMatch(api, /HOSTED_API_BASE/);
  assert.match(api, /await warmBackend\(\)/);
  assert.match(api, /sessionStartRetryDelays/);
  assert.match(api, /response\.status !== 429/);
  assert.match(api, /BACKEND_WARMUP_TIMEOUTS_MS = \[75000, 10000, 10000\]/);
  assert.match(api, /O servidor demorou para responder/);
  assert.match(auth, /progressMessage/);
  assert.match(page, /O primeiro acesso no Render gratuito pode levar cerca de um minuto/);
  assert.match(page, /\/auth\/session/);
  assert.match(page, /\/auth\/logout/);
  assert.doesNotMatch(page, /new EventSource/);
});

test("offers a persistent, accessible dark mode across the bank", async () => {
  const page = await readFile(pageUrl, "utf8");
  const layout = await readFile(layoutUrl, "utf8");
  const theme = await readFile(bankThemeUrl, "utf8");
  assert.match(page, /ranbank-theme/);
  assert.match(page, /aria-pressed/);
  assert.match(page, /Ativar modo escuro/);
  assert.doesNotMatch(page, /balance-brand/);
  assert.match(layout, /bank-theme\.css/);
  assert.match(theme, /data-bank-theme="dark"/);
  assert.match(theme, /color-scheme:dark/);
  assert.match(theme, /ranbank-balance-logo-flat\.jpeg/);
  assert.match(theme, /background-blend-mode:lighten,normal/);
  assert.match(theme, /quick-actions span\{color:#79b8ff!important;background:transparent!important\}/);
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

test("provides a Brasília-first public bank and privacy center", async () => {
  const publicSite = await readFile(publicSiteUrl, "utf8");
  const theme = await readFile(bankThemeUrl, "utf8");
  const page = await readFile(pageUrl, "utf8");
  assert.match(publicSite, /Feito em Brasília para o futuro/i);
  assert.match(publicSite, /\(61\) 4004-2028/);
  assert.match(publicSite, /CENTRAL DE SEGURANÇA RANBANK/);
  assert.match(publicSite, /HttpOnly e Secure no ambiente hospedado/);
  assert.match(publicSite, /Somente essenciais/);
  assert.match(publicSite, /Aceitar todos/);
  assert.match(publicSite, /SecurityPublicPage/);
  assert.match(publicSite, /PrivacyPublicPage/);
  assert.match(publicSite, /RANBANK EM MOVIMENTO/);
  assert.match(publicSite, /ranbank-demonstracao-04\.mp4/);
  assert.match(publicSite, /\/banco\?modo=criar-conta/);
  assert.match(publicSite, /rb-public-theme-toggle/);
  assert.match(publicSite, /aria-pressed/);
  assert.match(publicSite, /ranbank-theme/);
  assert.match(theme, /rb-impact-shell/);
  assert.match(theme, /rb-info-page/);
  assert.match(theme, /rb-institute-page/);
  assert.match(page, /requestedMode === "criar-conta"/);
});

test("presents a clearly identified educational impact portfolio", async () => {
  const publicSite = await readFile(publicSiteUrl, "utf8");
  const projects = await readFile(projectsUrl, "utf8");
  assert.match(publicSite, /Impacto & Projetos/);
  assert.match(projects, /Portal de Impacto/);
  assert.match(projects, /carteira\s+<strong>demonstrativa<\/strong>/i);
  assert.match(projects, /metas anuais simuladas/i);
  assert.match(projects, /Estratégia Nacional de Educação Financeira/);
  assert.match(projects, /Política Nacional de Educação Digital/);
  assert.match(projects, /não significam\s+vínculo, certificação ou parceria oficial/i);
});

test("keeps local previews free from stale PWA styles", async () => {
  const installer = await readFile(pwaInstallerUrl, "utf8");
  const serviceWorker = await readFile(serviceWorkerUrl, "utf8");
  assert.match(installer, /localhost/);
  assert.match(installer, /getRegistrations/);
  assert.match(installer, /registration\.unregister/);
  assert.match(installer, /ranbank-shell-/);
  assert.match(serviceWorker, /ranbank-shell-v4/);
  assert.match(serviceWorker, /"\/projetos"/);
  assert.match(serviceWorker, /css\|js\|woff/);
  assert.match(serviceWorker, /cache\.put\(request, copy\)/);
});

test("warms the hosted API before the customer reaches login", async () => {
  const warmup = await readFile(warmupUrl, "utf8");
  const layout = await readFile(layoutUrl, "utf8");
  const api = await readFile(apiUrl, "utf8");
  assert.match(warmup, /warmBackend\(\)/);
  assert.match(api, /backendWarmupPromise/);
  assert.match(api, /X-Ranbank-Warmup/);
  assert.doesNotMatch(layout, /rel="preconnect"/);
  assert.doesNotMatch(warmup, /ranbank-api\.onrender\.com/);
});

test("bounds stalled proxy requests and preserves upstream retry guidance", async () => {
  const proxy = await readFile(proxyUrl, "utf8");
  assert.match(proxy, /UPSTREAM_TIMEOUT_MS = 70000/);
  assert.match(proxy, /signal: upstreamController\.signal/);
  assert.match(proxy, /request\.signal\.addEventListener\("abort"/);
  assert.match(proxy, /"retry-after"/);
  assert.match(proxy, /"ratelimit-reset"/);
});

test("keeps account controls inside the customer profile", async () => {
  const page = await readFile(pageUrl, "utf8");
  assert.doesNotMatch(page, /Java conectado/);
  assert.doesNotMatch(page, /Iniciar apresentação guiada/);
  assert.doesNotMatch(page, /pix-modal-tools/);
  assert.match(page, /profile-actions/);
  assert.match(page, /Gerenciar chaves Pix/);
  assert.match(page, /Sair da conta/);
  assert.ok(page.indexOf("Robótica assistiva") < page.indexOf("Comparar tecnologias"));
});

test("shows the Ecocard artwork in the card control panel", async () => {
  const bankingSuite = await readFile(bankingSuiteUrl, "utf8");
  assert.match(bankingSuite, /ecocard-suite-face/);
  assert.match(bankingSuite, /ranbank-ecocard-reference\.jpeg/);
  assert.match(bankingSuite, /Cartão Eco RanBank sustentável/);
});
