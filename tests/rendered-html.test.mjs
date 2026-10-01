import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageUrl = new URL("../app/page.tsx", import.meta.url);
const authUrl = new URL("../app/bank/AuthScreen.tsx", import.meta.url);
const apiUrl = new URL("../app/bank/api.ts", import.meta.url);
const masksUrl = new URL("../app/bank/inputMasks.ts", import.meta.url);
const publicSiteUrl = new URL("../app/PublicSiteGate.tsx", import.meta.url);
const projectsUrl = new URL("../app/ProjectsPublicPage.tsx", import.meta.url);
const organizationUrl = new URL("../app/OrganizationPublicPage.tsx", import.meta.url);
const pwaInstallerUrl = new URL("../app/PwaInstaller.tsx", import.meta.url);
const serviceWorkerUrl = new URL("../public/sw.js", import.meta.url);
const warmupUrl = new URL("../app/BackendWarmup.tsx", import.meta.url);
const proxyUrl = new URL("../app/api/[...path]/route.ts", import.meta.url);
const layoutUrl = new URL("../app/layout.tsx", import.meta.url);
const bankThemeUrl = new URL("../app/bank-theme.css", import.meta.url);
const clarityRefreshUrl = new URL("../app/clarity-refresh.css", import.meta.url);
const bankingSuiteUrl = new URL("../app/BankingSuite.tsx", import.meta.url);
const bankSectionPagesUrl = new URL("../app/bank/BankSectionPages.tsx", import.meta.url);
const bankSectionStylesUrl = new URL("../app/bank-section-pages.css", import.meta.url);
const transactionFormattingUrl = new URL("../app/bank/transactionFormatting.ts", import.meta.url);
const presentationGuideUrl = new URL("../APRESENTACAO.md", import.meta.url);

test("includes the protected access experience", async () => {
  const page = await readFile(pageUrl, "utf8");
  const auth = await readFile(authUrl, "utf8");
  const api = await readFile(apiUrl, "utf8");
  const masks = await readFile(masksUrl, "utf8");
  assert.match(auth, /Acesse sua conta/);
  assert.match(auth, /CPF, conta ou e-mail/);
  assert.match(auth, /Entrar com PIN/);
  assert.match(auth, /Biometria indisponível/);
  assert.match(auth, /Recupere seu acesso/);
  assert.match(auth, /Esqueci meu PIN/);
  assert.match(auth, /Voltar para entrar/);
  assert.ok(auth.indexOf("login-submit") < auth.indexOf("Esqueci meu PIN"));
  assert.ok(auth.indexOf("Esqueci meu PIN") < auth.indexOf("biometric-login"));
  assert.match(auth, /Telefone com DDD/);
  assert.match(masks, /formatCpf/);
  assert.match(masks, /formatLoginIdentification/);
  assert.match(masks, /formatBrazilianPhone/);
  assert.match(api, /credentials: "include"/);
  assert.match(api, /NEXT_PUBLIC_API_URL \?\? "\/api"/);
  assert.doesNotMatch(api, /HOSTED_API_BASE/);
  assert.match(api, /await warmBackend\(\)/);
  assert.match(api, /!transientStatuses\.has\(response\.status\)/);
  assert.match(api, /O servidor demorou para responder/);
  assert.match(auth, /progressMessage/);
  assert.match(page, /Está demorando mais que o normal/);
  assert.match(page, /\/auth\/session/);
  assert.match(page, /\/auth\/logout/);
  assert.doesNotMatch(page, /new EventSource/);
});

test("offers a persistent, accessible dark mode across the bank", async () => {
  const page = await readFile(pageUrl, "utf8");
  const layout = await readFile(layoutUrl, "utf8");
  const theme = await readFile(bankThemeUrl, "utf8");
  const clarity = await readFile(clarityRefreshUrl, "utf8");
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
  assert.match(clarity, /data-bank-theme="dark".*rb-public-footer/);
  assert.match(clarity, /data-bank-theme="dark".*org-chart-section/);
  assert.match(clarity, /--bank-card:#111/);
});

test("keeps technology status cards readable in dark mode", async () => {
  const bankV2 = await readFile(new URL("../app/bank-v2.css", import.meta.url), "utf8");
  assert.match(bankV2, /data-bank-theme="dark".*bank-tech-signals-v2 article/);
  assert.match(bankV2, /bank-tech-signals-v2 strong\{color:#f0f5fb!important\}/);
});

test("requires a separate four-digit password before sending Pix", async () => {
  const page = await readFile(pageUrl, "utf8");
  const sectionStyles = await readFile(bankSectionStylesUrl, "utf8");
  assert.match(page, /Revise sua transferência/);
  assert.match(page, /Senha de quatro dígitos do cartão/);
  assert.match(page, /transactionPin/);
  assert.match(page, /Teclado da senha do cart/);
  assert.match(page, /appendTransactionDigit/);
  assert.match(page, /Autorizar transferência/);
  assert.match(page, /formatMoneyFromDigits/);
  assert.match(page, /inputMode="numeric"/);
  assert.match(sectionStyles, /pix-cent-amount/);
  assert.match(sectionStyles, /data-bank-theme="dark".*pin-confirmation-modal/);
});

test("uses full pages for account, cards and security", async () => {
  const page = await readFile(pageUrl, "utf8");
  const sections = await readFile(bankSectionPagesUrl, "utf8");
  assert.match(page, /setScreen\("account"\)/);
  assert.match(page, /setScreen\("cards"\)/);
  assert.match(page, /setScreen\("security"\)/);
  assert.match(sections, /AccountSectionPage/);
  assert.ok(page.includes('<BankingSuite key={`${screen}-${raniTick}`} ownCard={ownCard} open embedded'), "o cartão recarrega quando a Rani muda algo");
  assert.match(sections, /SecuritySectionPage/);
});

test("shows precise transactions from newest to oldest", async () => {
  const formatting = await readFile(transactionFormattingUrl, "utf8");
  const bankingSuite = await readFile(bankingSuiteUrl, "utf8");
  assert.match(formatting, /second: "2-digit"/);
  assert.match(formatting, /new Date\(right\.occurredAt\).*new Date\(left\.occurredAt\)/);
  assert.match(bankingSuite, /sortTransactionsNewestFirst/);
  assert.match(bankingSuite, /transactionDescription/);
});

test("provides a Brasília-first public bank and privacy center", async () => {
  const publicSite = await readFile(publicSiteUrl, "utf8");
  const theme = await readFile(bankThemeUrl, "utf8");
  const page = await readFile(pageUrl, "utf8");
  assert.match(publicSite, /Banco digital educacional/);
  assert.doesNotMatch(publicSite, /\(61\) 4004-2028/);
  assert.match(publicSite, /instagram\.com\/ranbank\.df/);
  assert.match(publicSite, /tiktok\.com\/@ranbank\.df/);
  assert.match(publicSite, /Central de Segurança RanBank/);
  assert.match(publicSite, /Sessão com prazo/);
  assert.doesNotMatch(publicSite, /tentativas repetidas causam bloqueio/);
  assert.match(publicSite, /Somente essenciais/);
  assert.match(publicSite, /Aceitar todos/);
  assert.match(publicSite, /SecurityPublicPage/);
  assert.match(publicSite, /PrivacyPublicPage/);
  assert.match(publicSite, /Observatório Febraban, julho de 2025/);
  assert.match(publicSite, /Relatório de Gestão do Pix/);
  assert.match(publicSite, /\/banco\?modo=criar-conta/);
  assert.match(publicSite, /rs-menu-toggle/);
  assert.match(publicSite, /<img src="\/ranbank-logo-transparent\.png" alt="RanBank" \/>/);
  assert.match(publicSite, /aria-expanded/);
  assert.match(publicSite, /Projeto educacional e demonstrativo/);
  assert.doesNotMatch(publicSite, /rs-notice/);
  assert.match(theme, /rb-impact-shell/);
  assert.match(theme, /rb-info-page/);
  assert.match(theme, /rb-institute-page/);
  assert.match(page, /requestedMode === "criar-conta"/);
});

test("presents a clearly identified educational impact portfolio", async () => {
  const publicSite = await readFile(publicSiteUrl, "utf8");
  const projects = await readFile(projectsUrl, "utf8");
  assert.match(publicSite, /Projetos e impacto/);
  assert.match(projects, /Projetos com propósito/);
  assert.doesNotMatch(projects, /rs-hero-index|frentes de atuação/);
  assert.match(projects, /<strong>propostas demonstrativas<\/strong>/i);
  assert.match(projects, /não apresentamos\s+resultados inventados/i);
  assert.match(projects, /Estratégia Nacional de Educação Financeira/);
  assert.match(projects, /Agência Brasileira de Apoio à Gestão do SUS/);
  assert.match(projects, /Apoio a iniciativas indígenas e comunitárias/);
  assert.match(projects, /não significam\s+vínculo, certificação ou parceria oficial/i);
  assert.doesNotMatch(projects, /Elas do Futuro/);
  assert.doesNotMatch(projects, /ranbank-demonstracao-03\.mp4/);
});

test("shows the institutional identity, FAQ and a project-wide non-commercial seal", async () => {
  const publicSite = await readFile(publicSiteUrl, "utf8");
  const layout = await readFile(layoutUrl, "utf8");
  const presentationGuide = await readFile(presentationGuideUrl, "utf8");
  assert.match(publicSite, /Missão, visão e valores/);
  assert.match(publicSite, /Facilitar a vida financeira das pessoas/);
  assert.match(publicSite, /Impacto positivo/);
  assert.match(publicSite, /Tecnologia para simplificar\. Segurança para proteger/);
  assert.match(publicSite, /Brasília - DF/);
  assert.doesNotMatch(publicSite, /Brasília, DF/);
  assert.match(presentationGuide, /## Identidade institucional/);
  assert.match(presentationGuide, /### Nosso compromisso/);
  assert.match(publicSite, /Dúvidas frequentes/);
  assert.match(publicSite, /O que é o RanBank\?/);
  assert.match(publicSite, /O que a Rani pode fazer\?/);
  assert.match(publicSite, /id="visao-valores"/);
  assert.match(publicSite, /id="duvidas"/);
  assert.match(layout, /Sem valor comercial/);
  assert.match(layout, /rb-noncommercial-seal/);
});

test("provides an interactive organization chart with role profiles", async () => {
  const publicSite = await readFile(publicSiteUrl, "utf8");
  const organization = await readFile(organizationUrl, "utf8");
  assert.match(publicSite, /href="\/organograma"/);
  assert.match(organization, /ESTRUTURA ORGANIZACIONAL/);
  assert.match(organization, /Presidente \/ CEO/);
  assert.match(organization, /Ouvidora-Geral/);
  assert.match(organization, /Vice-Presidente/);
  assert.match(organization, /Desenvolvedor \/ Analista de TI/);
  assert.match(organization, /Assistente \/ Analista de RH/);
  // Crachá ao passar o mouse ou tocar, em vez de uma página com letra genérica.
  assert.match(organization, /function RoleBadge\(/);
  assert.match(organization, /Quem ocupa o cargo/);
  assert.doesNotMatch(organization, /PROFISSIONAL RESPONSÁVEL|charAt\(0\)/);
});

test("keeps local previews free from stale PWA styles", async () => {
  const installer = await readFile(pwaInstallerUrl, "utf8");
  const serviceWorker = await readFile(serviceWorkerUrl, "utf8");
  assert.match(installer, /getRegistrations/);
  assert.match(installer, /registration\.unregister/);
  assert.match(installer, /ranbank-shell-/);
  assert.match(serviceWorker, /ranbank-shell-v4/);
  assert.match(serviceWorker, /"\/projetos"/);
  assert.match(serviceWorker, /"\/organograma"/);
  assert.match(serviceWorker, /css\|js\|woff/);
  assert.match(serviceWorker, /cache\.put\(request, copy\)/);
});

test("warms the API through the same-origin proxy before login", async () => {
  const warmup = await readFile(warmupUrl, "utf8");
  const layout = await readFile(layoutUrl, "utf8");
  assert.match(warmup, /warmBackend\(\)/);
  assert.doesNotMatch(layout, /rel="preconnect"/);
  assert.doesNotMatch(layout, /onrender\.com/);
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
  assert.match(page, /Meu perfil/);
  assert.match(page, /Gerenciar chaves Pix/);
  assert.match(page, /Sair da conta/);
  assert.match(page, /setLab\("scam"\)/);
  assert.doesNotMatch(page, /Robótica assistiva|simulateThreat|analyzeSuspiciousTransaction/);
});

test("shows the Ecocard artwork in the card control panel", async () => {
  const bankingSuite = await readFile(bankingSuiteUrl, "utf8");
  const sections = await readFile(bankSectionPagesUrl, "utf8");
  assert.match(bankingSuite, /ecocard-suite-face/);
  assert.match(bankingSuite, /ranbank-ecocard-nativa-frente\.webp/);
  assert.match(bankingSuite, /Frente ilustrativa do cartão Ecocard RanBank/);
  assert.doesNotMatch(sections, /ranbank-ecocard-reference\.jpeg/);
});

test("introduces Rani as the assistant on the bank and on the public site", async () => {
  const page = await readFile(pageUrl, "utf8");
  const assistant = await readFile(new URL("../app/RaniAssistant.tsx", import.meta.url), "utf8");
  const knowledge = await readFile(new URL("../app/rani-knowledge.ts", import.meta.url), "utf8");
  const publicSite = await readFile(publicSiteUrl, "utf8");
  assert.match(page, /Fale com a Rani/);
  assert.match(page, /<RaniAssistant context="bank"/);
  assert.match(publicSite, /<RaniAssistant context="site"/);
  assert.match(page, /ran-assistente-humana\.png/);
  assert.match(assistant, /ran-assistente-humana\.png/);
  assert.match(knowledge, /Eu sou a Rani/);
  assert.match(knowledge, /não tem parcerias oficiais/);
  // Chat com cara de banco: ações na conta, tolerância a erros, memória e atendimento simulado.
  assert.match(knowledge, /export type RaniAction = "balance" \| "recent" \| "blockCard" \| "unblockCard" \| "human"/);
  assert.match(knowledge, /function distance\(a: string, b: string\)/);
  assert.match(knowledge, /lastTopic\?: string/);
  assert.match(assistant, /\/banking\/card\/toggle/);
  assert.match(assistant, /esta parte é uma simulação/);
  assert.match(assistant, /Como foi a conversa com a Rani\?/);
  assert.doesNotMatch(page, /\bRan\b/);
  assert.match(page, /bank-project-menu-v2/);
  assert.match(page, /Explore o RanBank/);
  assert.doesNotMatch(page, /ran-mascote-conceito-v1\.png/);
});

test("keeps the bank home focused and moves project details into menus", async () => {
  const page = await readFile(pageUrl, "utf8");
  assert.match(page, /Seu dinheiro em um só lugar/);
  assert.match(page, /data\.transactions\.slice\(0, 3\)/);
  assert.match(page, /> Início<\/button>/);
  assert.match(page, /Conheça o projeto RanBank/);
});

test("uses Rani as a guide in public help and security", async () => {
  const publicSite = await readFile(publicSiteUrl, "utf8");
  assert.match(publicSite, /rs-ran-help/);
  assert.match(publicSite, /Falar com a Rani/);
  assert.match(publicSite, /rs-ran-tip/);
  assert.match(publicSite, /Dica da Rani/);
  assert.match(publicSite, /ranbank-demonstracao-04\.mp4/);
  // Só os primeiros segundos do vídeo da menina: a parte com a outra bandeira nunca aparece.
  assert.match(publicSite, /ranbank-historia-2026\.mp4#t=0,4/);
  assert.match(publicSite, /const HERO_CLIP_END = 3\.5;/);
  assert.doesNotMatch(publicSite, /\bRan\b/);
});

test("keeps every technology demo interactive instead of scripted", async () => {
  const labs = await readFile(new URL("../app/bank/Labs.tsx", import.meta.url), "utf8");
  const flow = await readFile(new URL("../app/bank/RanFlow.tsx", import.meta.url), "utf8");
  for (const lab of ["CloudLab", "EnergyLab", "CompareLab", "ScamLab", "LoginLab", "ChainLab"]) assert.ok(labs.includes(`function ${lab}(`), `${lab} deve existir`);
  assert.match(labs, /sha256\(/);
  assert.match(flow, /function evaluate\(event: FlowEvent, rules: Rules\)/);
  assert.match(flow, /Reprocessar com regras novas/);
});

test("gives new accounts the basic card and keeps the Ecocard for house clients", async () => {
  const cards = await readFile(new URL("../app/bank/cards.ts", import.meta.url), "utf8");
  const catalog = await readFile(new URL("../app/bank/CardCatalog.tsx", import.meta.url), "utf8");
  const suite = await readFile(new URL("../app/BankingSuite.tsx", import.meta.url), "utf8");
  assert.match(cards, /HOUSE_CLIENT_ACCOUNTS = \["1234-5"\]/);
  assert.match(catalog, /id: "basic", name: "RanBank"/);
  assert.match(catalog, /O Ecocard é para clientes da casa/);
  assert.doesNotMatch(catalog, /id: "originario"/);
  // Valores com máscara e limite na barra de arrastar.
  assert.match(suite, /const maskMoney = /);
  assert.match(suite, /type="range" min=\{minLimit\} max=\{LIMIT_MAX\[ownCard\]\}/);
});

test("announces the RanBank Foundation as coming soon between Quem somos and Ajuda", async () => {
  const publicSite = await readFile(new URL("../app/PublicSiteGate.tsx", import.meta.url), "utf8");
  const route = await readFile(new URL("../app/fundacao/page.tsx", import.meta.url), "utf8");
  assert.match(publicSite, /\{ href: "\/organograma", label: "Quem somos" \},\s*\{ href: "\/fundacao", label: "Fundação" \},\s*\{ href: "\/#duvidas", label: "Ajuda" \}/);
  assert.match(publicSite, /export function FoundationPublicPage\(\)/);
  assert.match(publicSite, /<span className="fd-soon">Em breve<\/span>/);
  assert.match(route, /FoundationPublicPage/);
});

test("shows the app from the inside with four calm, interactive screens", async () => {
  const publicSite = await readFile(new URL("../app/PublicSiteGate.tsx", import.meta.url), "utf8");
  const calm = await readFile(new URL("../app/CalmBank.tsx", import.meta.url), "utf8");
  for (const title of ["Caí num golpe. E agora?", "O mês sem sustos.", "Quem manda é você.", "Avisos que acalmam."]) assert.ok(publicSite.includes(title), title);
  for (const demo of ["ScamHelpDemo", "MonthDemo", "ControlDemo", "NoticesDemo"]) assert.match(calm, new RegExp(`export function ${demo}\\(`));
  // O site não usa termos técnicos: quem explica é a pessoa que apresenta.
  assert.doesNotMatch(publicSite + calm, /\bUX\b|ansiedade|carga cognitiva/i);
  assert.ok(!calm.includes("fetch("), "as telas não enviam nada");
});
