"use client";
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, @next/next/no-img-element -- Modal backdrops intentionally handle clicks; Vinext serves local decorative images directly. */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import BankingSuite, { type BankingTab } from "./BankingSuite";
import InnovationHub, { type InnovationTab } from "./InnovationHub";
import AuthScreen, { type AuthMode } from "./bank/AuthScreen";
import AccountManagementModal from "./bank/AccountManagementModal";
import PixKeysModal from "./bank/PixKeysModal";
import { API_BASE, apiFetch } from "./bank/api";

type DashboardData = {
  customerName: string;
  balance: number;
  account: string;
  email: string;
  phoneNumber: string;
  maskedDocument: string;
  role: string;
  createdAt: string;
  card: { lastFour: string; blocked: boolean; limit: number; spent: number; available: number };
  transactions: Array<{ id: number; title: string; detail: string; amount: number; type: "credit" | "debit" }>;
};

type FraudAnalysis = {
  score: number;
  level: string;
  recommendation: string;
  method: string;
  signals: Array<{ name: string; weight: string; explanation: string }>;
};

type AnalyticsSummary = {
  totalTransactions: number;
  creditCount: number;
  debitCount: number;
  totalIn: number;
  totalOut: number;
  averageOut: number;
  largestOut: number;
  series: number[];
};

type ConnectedDevice = {
  id: number;
  name: string;
  type: string;
  location: string;
  lastAccess: string;
  trusted: boolean;
  blocked: boolean;
};

type CloudStatus = {
  systemStatus: string;
  availability: string;
  activeRegion: string;
  failureActive: boolean;
  regions: Array<{ name: string; code: string; status: string; trafficPercent: number; latencyMs: number }>;
  timeline: Array<{ time: string; title: string; description: string }>;
};

type AutomationRun = {
  incidentId: string;
  startedAt: string;
  status: string;
  limitation: string;
  steps: Array<{ order: number; title: string; description: string; responsibility: string; duration: string }>;
};

type ChatMessage = { role: "assistant" | "user"; text: string; topic?: string };
type AuthUser = { customerName: string; accountNumber: string };
type PixRecipient = { accountId: number; name: string; accountNumber: string; keyType: string; maskedKey: string };
type BankNotification = { id: number; type: string; title: string; message: string; referenceId?: string; createdAt: string; read: boolean };
type PixReceipt = { transferId: string; transactionId: number; status: string; amount: number; timestamp: string; recipientName: string; recipientAccount: string; maskedPixKey: string; idempotencyKey: string };
type FlowExecution = { id: string; flowType: string; triggerType: string; referenceId?: string; status: string; startedAt: string; completedAt?: string; steps: AutomationRun["steps"] };
type AdminInsights = { generatedAt: string; totalAccounts: number; activeAccounts: number; totalDeposits: number; totalTransactions: number; transactionVolume: number; pixTransfers: number; unreadNotifications: number; flowExecutions: number };

type SustainabilityStatus = {
  optimized: boolean;
  powerKw: number;
  renewablePercent: number;
  carbonKgHour: number;
  pue: number;
  savingsPercent: number;
  sources: Array<{ name: string; percentage: number; type: string }>;
  actions: string[];
};

type ComparisonResponse = {
  goal: string;
  goalLabel: string;
  disclaimer: string;
  results: Array<{
    name: string;
    score: number;
    cost: string;
    maturity: string;
    bestUse: string;
    limitation: string;
  }>;
};

type ThreatScenario = {
  name: string;
  category: string;
  risk: number;
  description: string;
  indicators: string[];
  defenses: Array<{ name: string; result: string; responsibility: string }>;
};

type ImmersiveScenario = {
  code: string;
  name: string;
  title: string;
  definition: string;
  steps: string[];
  equipment: string;
  strength: string;
  limitation: string;
};

type RobotMission = {
  name: string;
  objective: string;
  autonomy: number;
  steps: Array<{ title: string; result: string; technology: string }>;
  humanRole: string;
};

type AuthenticationResult = {
  context: string;
  risk: number;
  decision: string;
  explanation: string;
  factors: Array<{ name: string; status: string; category: string }>;
};

const demoData: DashboardData = {
  customerName: "Ana Ribeiro",
  balance: 8540.75,
  account: "1234-5",
  email: "ana@ranbank.demo",
  phoneNumber: "(61) 99999-0101",
  maskedDocument: "•••.•••.•••-09",
  role: "ADMIN",
  createdAt: new Date().toISOString(),
  card: { lastFour: "1234", blocked: false, limit: 6000, spent: 1248.9, available: 4751.1 },
  transactions: [
    { id: 1, title: "Pix recebido", detail: "Maria Silva · hoje, 09:41", amount: 250, type: "credit" },
    { id: 2, title: "Transferência enviada", detail: "João Pereira · hoje, 08:15", amount: -120, type: "debit" },
    { id: 3, title: "Pagamento", detail: "Supermercado Bom Preço · ontem, 19:32", amount: -89.9, type: "debit" },
    { id: 4, title: "Compra no cartão", detail: "Livraria Cultura · ontem, 16:20", amount: -45.6, type: "debit" },
  ],
};

const technologies = [
  { icon: "IA", title: "IA e fraudes", text: "Identifique padrões suspeitos e entenda cada sinal de risco." },
  { icon: "BD", title: "Big Data", text: "Transforme grandes volumes de eventos em decisões visuais." },
  { icon: "IoT", title: "Dispositivos", text: "Veja como celulares, caixas e sensores trocam informações." },
  { icon: "♧", title: "Sustentabilidade", text: "Veja como energia limpa, software eficiente e reciclagem reduzem o impacto de um banco." },
  { icon: "◉", title: "RA e VR", text: "Compare orientação aumentada e treinamento virtual imersivo." },
  { icon: "☁", title: "Nuvem", text: "Simule disponibilidade, cópias e recuperação de serviços." },
  { icon: "R2", title: "Robótica", text: "Acompanhe sensores, decisões e movimentos de um robô assistente." },
  { icon: "≋", title: "Comparar", text: "Descubra qual tecnologia atende melhor a cada objetivo e contexto." },
  { icon: "↯", title: "Automação", text: "Acompanhe um fluxo de resposta a incidentes inspirado no n8n.", support: true },
  { icon: "⌾", title: "Cibersegurança", text: "Simule malwares e acompanhe as camadas de defesa em ação.", support: true },
  { icon: "ID", title: "Autenticação", text: "Combine senha, código, biometria e contexto para proteger o acesso.", support: true },
];

const officialTopics = ["IA + Big Data", "IoT + Sustentabilidade", "VR + RA", "Computação em nuvem", "Comparação", "Robótica"];

function answerLocally(message: string) {
  const normalized = message.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const has = (...terms: string[]) => terms.some((term) => normalized.includes(term));
  if (["oi", "ola", "opa", "bom dia", "boa tarde", "boa noite"].includes(normalized)) return { topic: "Boas-vindas", text: "Olá! Posso explicar Pix, segurança digital, IA, Big Data, nuvem, automação, IoT, robótica, realidade aumentada e realidade virtual. O que você quer conhecer?" };
  if (["ajuda", "menu", "assuntos"].includes(normalized) || has("o que posso perguntar", "quais assuntos")) return { topic: "Ajuda", text: "Pergunte sobre o Ranbank, Pix, golpes, malware, autenticação, IA, Big Data, Java, banco de dados, nuvem, IoT, automação, sustentabilidade, robótica, RA ou VR." };
  if (has("phishing", "golpe", "link suspeito")) return { topic: "Segurança", text: "Phishing tenta obter senhas ou dados por engano. Verifique o remetente e o domínio, evite links inesperados e nunca compartilhe códigos de autenticação." };
  if (has("malware", "virus", "ransomware", "trojan")) return { topic: "Malware", text: "Malware é um software malicioso. Atualizações, backups, antivírus, permissões mínimas e cuidado com downloads ajudam a reduzir o risco." };
  if (has("pix", "chave", "transferencia", "saldo")) return { topic: "Pix", text: "O backend valida a chave Pix, confere o saldo, registra a movimentação no banco H2 e atualiza o painel imediatamente." };
  if (has("boleto", "codigo de barras", "pagamento")) return { topic: "Boletos", text: "A Central Financeira valida o código de barras, o valor, o saldo e o PIN transacional antes de registrar o pagamento e gerar o comprovante." };
  if (has("extrato", "movimentacoes", "comprovante")) return { topic: "Extrato", text: "O extrato reúne entradas e saídas, permite pesquisar movimentações e abre um comprovante individual para cada registro." };
  if (has("cartao", "fatura", "limite")) return { topic: "Cartão virtual", text: "O cartão virtual permite acompanhar a fatura, ajustar o limite com PIN e realizar um bloqueio temporário diretamente no backend." };
  if (has("cofrinho", "reserva", "investimento", "guardar dinheiro")) return { topic: "Reserva Future", text: "O cofrinho separa parte do saldo, acompanha uma meta e mostra uma projeção mensal no painel financeiro." };
  if (has("open finance", "banco aberto", "consentimento")) return { topic: "Open Finance", text: "Open Finance permite compartilhar dados entre instituições por APIs padronizadas, sempre com consentimento, prazo e possibilidade de revogação." };
  if (has("blockchain", "hash", "auditoria", "ledger")) return { topic: "Auditoria encadeada", text: "Cada evento recebe um hash ligado ao registro anterior. Uma alteração quebra a sequência e torna a inconsistência visível." };
  if (has("fraude", "risco", "transacao suspeita")) return { topic: "Fraudes", text: "A análise combina valor, dispositivo, localização e horário. Cada sinal contribui para uma pontuação explicável que apoia a decisão." };
  if (has("inteligencia artificial", "machine learning", "chatbot") || normalized.split(" ").includes("ia")) return { topic: "Inteligência Artificial", text: "A IA reconhece padrões, apoia a detecção de fraude e facilita o atendimento. Neste assistente, uma base local responde aos principais temas da apresentação." };
  if (has("big data", "dados", "analytics")) return { topic: "Big Data", text: "Big Data reúne e processa grandes volumes de eventos para encontrar padrões, produzir métricas e apoiar decisões." };
  if (has("java", "spring", "backend", "frontend", "banco de dados", "h2")) return { topic: "Arquitetura", text: "O frontend React apresenta a interface; o backend Java com Spring Boot aplica regras e oferece APIs; o H2 armazena as informações da aplicação." };
  if (has("iot", "internet das coisas", "dispositivo")) return { topic: "IoT", text: "IoT conecta dispositivos que enviam telemetria. O Ranbank mostra localização, último acesso, confiança e ações de bloqueio." };
  if (has("nuvem", "cloud", "redundancia", "failover")) return { topic: "Nuvem", text: "A redundância mantém serviços em regiões diferentes. Se a principal falha, o tráfego pode ser redirecionado para preservar a disponibilidade." };
  if (has("automacao", "n8n", "workflow")) return { topic: "Automação", text: "A automação recebe alertas, reúne contexto, aplica regras, pede validação humana e registra o incidente." };
  if (has("energia", "sustentavel", "sustentabilidade", "green it")) return { topic: "Sustentabilidade", text: "Green IT é o uso responsável da tecnologia para consumir menos energia e materiais. No Ranbank, ela aparece no uso de energia solar e eólica, na otimização de servidores e nuvem, na redução de emissões e no descarte responsável de cartões e equipamentos." };
  if (has("robotica", "robo")) return { topic: "Robótica", text: "Robótica combina sensores, software e atuadores para perceber, decidir e agir, mantendo supervisão humana nas decisões importantes." };
  if (has("realidade aumentada", "realidade virtual", "imersiva") || normalized.split(" ").some((word) => word === "ra" || word === "vr")) return { topic: "Tecnologias imersivas", text: "RA acrescenta informações ao ambiente real; VR cria um ambiente digital imersivo para treinamento e experiências." };
  return { topic: "Assistente local", text: "Digite ‘ajuda’ para ver os assuntos disponíveis ou pergunte sobre segurança, Pix, IA, Big Data, IoT, nuvem, automação, sustentabilidade, robótica, RA ou VR." };
}

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const parseMoneyInput = (value: string) => {
  const compact = value.trim().replace(/\s/g, "");
  if (compact.includes(",")) return Number(compact.replace(/\./g, "").replace(",", "."));
  if (/^\d{1,3}(\.\d{3})+$/.test(compact)) return Number(compact.replace(/\./g, ""));
  return Number(compact);
};
const SESSION_RESTORE_TIMEOUT_MS = 1800;
export default function Home() {
  const pathname = usePathname();
  const [data, setData] = useState(demoData);
  const [authStatus, setAuthStatus] = useState<"checking" | "authenticated" | "unauthenticated">("checking");
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loginIdentification, setLoginIdentification] = useState("");
  const [loginPin, setLoginPin] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [signup, setSignup] = useState({ customerName: "", documentId: "", email: "", phoneNumber: "", accessPin: "", transactionPin: "" });
  const [recovery, setRecovery] = useState({ identification: "", email: "", transactionPin: "", newAccessPin: "" });
  const [screen, setScreen] = useState<"dashboard" | "lab">("dashboard");
  const [utilityPanel, setUtilityPanel] = useState<"account" | "cards" | "security" | "notifications" | "profile" | null>(null);
  const [bankingOpen, setBankingOpen] = useState(false);
  const [bankingTab, setBankingTab] = useState<BankingTab>("statement");
  const [innovationOpen, setInnovationOpen] = useState(false);
  const [innovationTab, setInnovationTab] = useState<InnovationTab>("open-finance");
  const [notifications, setNotifications] = useState<BankNotification[]>([]);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [pixOpen, setPixOpen] = useState(false);
  const [pixKey, setPixKey] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionPin, setTransactionPin] = useState("");
  const [pixStep, setPixStep] = useState<"details" | "review">("details");
  const [pixStatus, setPixStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [pixError, setPixError] = useState("");
  const [pixRecipient, setPixRecipient] = useState<PixRecipient | null>(null);
  const [pixIdempotencyKey, setPixIdempotencyKey] = useState("");
  const [pixReceipt, setPixReceipt] = useState<PixReceipt | null>(null);
  const [analysis, setAnalysis] = useState<FraudAnalysis | null>(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [devicesOpen, setDevicesOpen] = useState(false);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [cloud, setCloud] = useState<CloudStatus | null>(null);
  const [cloudOpen, setCloudOpen] = useState(false);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [automation, setAutomation] = useState<AutomationRun | null>(null);
  const [automationOpen, setAutomationOpen] = useState(false);
  const [automationRunning, setAutomationRunning] = useState(false);
  const [visibleAutomationSteps, setVisibleAutomationSteps] = useState(0);
  const [flowHistory, setFlowHistory] = useState<FlowExecution[]>([]);
  const [flowHistoryOpen, setFlowHistoryOpen] = useState(false);
  const [flowHistoryLoading, setFlowHistoryLoading] = useState(false);
  const [adminInsights, setAdminInsights] = useState<AdminInsights | null>(null);
  const [adminInsightsOpen, setAdminInsightsOpen] = useState(false);
  const [adminInsightsLoading, setAdminInsightsLoading] = useState(false);
  const [accountManagementOpen, setAccountManagementOpen] = useState(false);
  const [pixKeysOpen, setPixKeysOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMode, setChatMode] = useState<"LOCAL" | "OPENAI" | "LOCAL_FALLBACK">("LOCAL");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: "Olá! Posso explicar as tecnologias e os recursos de segurança do Ranbank.", topic: "Boas-vindas" },
  ]);
  const [sustainability, setSustainability] = useState<SustainabilityStatus | null>(null);
  const [sustainabilityOpen, setSustainabilityOpen] = useState(false);
  const [sustainabilityLoading, setSustainabilityLoading] = useState(false);
  const [comparison, setComparison] = useState<ComparisonResponse | null>(null);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [threat, setThreat] = useState<ThreatScenario | null>(null);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [immersive, setImmersive] = useState<ImmersiveScenario | null>(null);
  const [immersiveOpen, setImmersiveOpen] = useState(false);
  const [immersiveLoading, setImmersiveLoading] = useState(false);
  const [robotMission, setRobotMission] = useState<RobotMission | null>(null);
  const [roboticsOpen, setRoboticsOpen] = useState(false);
  const [roboticsLoading, setRoboticsLoading] = useState(false);
  const [authentication, setAuthentication] = useState<AuthenticationResult | null>(null);
  const [authenticationOpen, setAuthenticationOpen] = useState(false);
  const [authenticationLoading, setAuthenticationLoading] = useState(false);
  const [resettingDemo, setResettingDemo] = useState(false);

  const loadDashboard = async () => {
    try {
      const response = await apiFetch("/dashboard");
      if (!response.ok) throw new Error("Backend indisponível");
      const dashboard: DashboardData = await response.json();
      setData(dashboard);
    } catch {
      // A interface mantém os dados locais enquanto a API não responde.
    }
  };

  useEffect(() => {
    if (pathname === "/") return;
    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), SESSION_RESTORE_TIMEOUT_MS);
    const restoreSession = async () => {
      try {
        const response = await apiFetch("/auth/session", { signal: controller.signal });
        if (!response.ok) throw new Error();
        if (!active) return;
        setAuthUser(await response.json());
        setAuthStatus("authenticated");
        await loadDashboard();
      } catch {
        if (!active) return;
        setAuthUser(null);
        setAuthStatus("unauthenticated");
      } finally {
        window.clearTimeout(timeout);
      }
    };
    restoreSession();
    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/banco") return;
    const requestedMode = new URLSearchParams(window.location.search).get("modo");
    const timer = window.setTimeout(() => {
      if (requestedMode === "criar-conta") setAuthMode("create");
      if (requestedMode === "recuperar-pin") setAuthMode("recover");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    let active = true;
    apiFetch("/notifications").then(async (response) => {
      if (active && response.ok) setNotifications(await response.json());
    }).catch(() => undefined);
    const source = new EventSource(`${API_BASE}/notifications/stream`, { withCredentials: true });
    source.addEventListener("notification", (event) => {
      const incoming = JSON.parse((event as MessageEvent).data) as BankNotification;
      setNotifications((current) => [incoming, ...current.filter((item) => item.id !== incoming.id)]);
    });
    return () => { active = false; source.close(); };
  }, [authStatus]);

  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loginPin.length !== 4) return;
    setLoginLoading(true);
    setLoginError("");
    try {
      const response = await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identification: loginIdentification, pin: loginPin }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Não foi possível entrar." }));
        throw new Error(error.message);
      }
      setAuthUser(await response.json());
      setAuthStatus("authenticated");
      setLoginPin("");
      await loadDashboard();
    } catch (error) {
      setLoginPin("");
      setLoginError(error instanceof Error ? error.message : "Não foi possível entrar.");
    } finally {
      setLoginLoading(false);
    }
  };

  const createDemoAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const response = await apiFetch("/demo-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signup),
      });
      const result = await response.json().catch(() => ({ message: "Não foi possível criar a conta." }));
      if (!response.ok) throw new Error(result.message);
      setAuthUser({ customerName: result.customerName, accountNumber: result.accountNumber });
      setAuthStatus("authenticated");
      await loadDashboard();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Não foi possível criar a conta.");
    } finally {
      setLoginLoading(false);
    }
  };

  const recoverPin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const response = await apiFetch("/auth/recover-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recovery),
      });
      const result = await response.json().catch(() => ({ message: "Não foi possível redefinir o PIN." }));
      if (!response.ok) throw new Error(result.message);
      setLoginIdentification(recovery.identification);
      setRecovery({ identification: "", email: "", transactionPin: "", newAccessPin: "" });
      setAuthMode("login");
      setLoginError(result.message);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Não foi possível redefinir o PIN.");
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = async () => {
    await apiFetch("/auth/logout", { method: "POST" }).catch(() => undefined);
    setAuthUser(null);
    setAuthStatus("unauthenticated");
    setAssistantOpen(false);
    setUtilityPanel(null);
    setBankingOpen(false);
    setInnovationOpen(false);
  };

  const openBanking = (tab: BankingTab) => {
    setBankingTab(tab);
    setBankingOpen(true);
    setUtilityPanel(null);
  };

  const openInnovation = (tab: InnovationTab) => {
    setInnovationTab(tab);
    setInnovationOpen(true);
    setUtilityPanel(null);
  };

  const appendLoginDigit = (digit: string) => {
    setLoginError("");
    setLoginPin((current) => current.length < 4 ? current + digit : current);
  };

  const appendTransactionDigit = (digit: string) => {
    setPixError("");
    setPixStatus("idle");
    setTransactionPin((current) => current.length < 4 ? current + digit : current);
  };

  const reviewPix = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericAmount = parseMoneyInput(amount);
    if (!pixKey.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setPixError("Informe uma chave e um valor válido.");
      setPixStatus("error");
      return;
    }
    setPixStatus("sending");
    setPixError("");
    try {
      const response = await apiFetch(`/pix/recipients/resolve?key=${encodeURIComponent(pixKey)}`);
      const result = await response.json().catch(() => ({ message: "Destinatário não encontrado." }));
      if (!response.ok) throw new Error(result.message);
      setPixRecipient(result);
      setPixIdempotencyKey(crypto.randomUUID());
      setPixStatus("idle");
      setPixStep("review");
    } catch (error) {
      setPixStatus("error");
      setPixError(error instanceof Error ? error.message : "Destinatário não encontrado.");
    }
  };

  const sendPix = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pixStep === "details") {
      reviewPix(event);
      return;
    }
    setPixStatus("sending");
    setPixError("");
    try {
      const response = await apiFetch("/pix/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": pixIdempotencyKey || crypto.randomUUID() },
        body: JSON.stringify({ pixKey, amount: parseMoneyInput(amount), transactionPin }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Não foi possível registrar o Pix." }));
        throw new Error(error.message);
      }
      const receipt: PixReceipt = await response.json();
      await loadDashboard();
      setPixStatus("success");
      setTransactionPin("");
      setPixReceipt(receipt);
      setPixOpen(false);
      setPixStatus("idle");
      setPixStep("details");
      setPixKey("");
      setAmount("");
      setPixRecipient(null);
      setPixIdempotencyKey("");
    } catch (error) {
      setPixError(error instanceof Error ? error.message : "Não foi possível registrar o Pix.");
      setPixStatus("error");
    }
  };

  const analyzeSuspiciousTransaction = async () => {
    setAnalysisLoading(true);
    setAnalysisOpen(true);
    try {
      const response = await apiFetch("/fraud/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 2950, newDevice: true, unusualLocation: true, unusualTime: false }),
      });
      if (!response.ok) throw new Error();
      setAnalysis(await response.json());
    } catch {
      setAnalysis(null);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const openAnalytics = async () => {
    setAnalyticsOpen(true);
    setAnalyticsLoading(true);
    try {
      const response = await apiFetch("/analytics/summary");
      if (!response.ok) throw new Error();
      setAnalytics(await response.json());
    } catch {
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadDevices = async () => {
    setDevicesOpen(true);
    setDevicesLoading(true);
    try {
      const response = await apiFetch("/devices");
      if (!response.ok) throw new Error();
      setDevices(await response.json());
    } catch {
      setDevices([]);
    } finally {
      setDevicesLoading(false);
    }
  };

  const toggleDevice = async (id: number) => {
    const response = await apiFetch(`/devices/${id}/block`, { method: "PATCH" });
    if (response.ok) {
      const updated: ConnectedDevice = await response.json();
      setDevices((current) => current.map((device) => device.id === id ? updated : device));
    }
  };

  const requestCloudStatus = async (path = "/status", method = "GET") => {
    setCloudLoading(true);
    try {
      const response = await apiFetch(`/cloud${path}`, { method });
      if (!response.ok) throw new Error();
      setCloud(await response.json());
    } catch {
      setCloud(null);
    } finally {
      setCloudLoading(false);
    }
  };

  const openCloud = () => {
    setCloudOpen(true);
    requestCloudStatus();
  };

  const runAutomation = async () => {
    setAutomationOpen(true);
    setAutomationRunning(true);
    setAutomation(null);
    setVisibleAutomationSteps(0);
    try {
      const response = await apiFetch("/automation/run", { method: "POST" });
      if (!response.ok) throw new Error();
      const result: AutomationRun = await response.json();
      setAutomation(result);
      result.steps.forEach((_, index) => {
        setTimeout(() => setVisibleAutomationSteps(index + 1), 450 * (index + 1));
      });
      setTimeout(() => setAutomationRunning(false), 450 * (result.steps.length + 1));
    } catch {
      setAutomationRunning(false);
    }
  };

  const sendChatMessage = async (message = chatInput) => {
    const cleanMessage = message.trim();
    if (!cleanMessage || chatLoading) return;
    setChatMessages((current) => [...current, { role: "user", text: cleanMessage }]);
    setChatInput("");
    setChatLoading(true);
    try {
      const response = await apiFetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: cleanMessage }),
      });
      if (!response.ok) throw new Error();
      const result: { answer: string; topic: string; mode: "LOCAL" | "OPENAI" | "LOCAL_FALLBACK" } = await response.json();
      setChatMode(result.mode);
      setChatMessages((current) => [...current, { role: "assistant", text: result.answer, topic: result.topic }]);
    } catch {
      const local = answerLocally(cleanMessage);
      setChatMode("LOCAL");
      setChatMessages((current) => [...current, { role: "assistant", text: local.text, topic: local.topic }]);
    } finally {
      setChatLoading(false);
    }
  };

  const requestSustainability = async (optimize = false) => {
    setSustainabilityLoading(true);
    try {
      const response = await apiFetch(`/sustainability/${optimize ? "optimize" : "status"}`, { method: optimize ? "POST" : "GET" });
      if (!response.ok) throw new Error();
      setSustainability(await response.json());
    } catch {
      setSustainability(null);
    } finally {
      setSustainabilityLoading(false);
    }
  };

  const openSustainability = () => {
    setSustainabilityOpen(true);
    requestSustainability();
  };

  const loadComparison = async (goal = "seguranca") => {
    setComparisonOpen(true);
    setComparisonLoading(true);
    try {
      const response = await apiFetch(`/comparison?goal=${goal}`);
      if (!response.ok) throw new Error();
      setComparison(await response.json());
    } catch {
      setComparison(null);
    } finally {
      setComparisonLoading(false);
    }
  };

  const simulateThreat = async (scenario = "phishing") => {
    setSecurityOpen(true);
    setSecurityLoading(true);
    try {
      const response = await apiFetch(`/security/simulate?threat=${scenario}`);
      if (!response.ok) throw new Error();
      setThreat(await response.json());
    } catch {
      setThreat(null);
    } finally {
      setSecurityLoading(false);
    }
  };

  const loadImmersive = async (mode = "ar") => {
    setImmersiveOpen(true);
    setImmersiveLoading(true);
    try {
      const response = await apiFetch(`/immersive?mode=${mode}`);
      if (!response.ok) throw new Error();
      setImmersive(await response.json());
    } catch {
      setImmersive(null);
    } finally {
      setImmersiveLoading(false);
    }
  };

  const loadRobotMission = async (type = "reception") => {
    setRoboticsOpen(true);
    setRoboticsLoading(true);
    try {
      const response = await apiFetch(`/robotics/mission?type=${type}`);
      if (!response.ok) throw new Error();
      setRobotMission(await response.json());
    } catch {
      setRobotMission(null);
    } finally {
      setRoboticsLoading(false);
    }
  };

  const simulateAuthentication = async (scenario = "trusted") => {
    setAuthenticationOpen(true);
    setAuthenticationLoading(true);
    try {
      const response = await apiFetch(`/authentication/simulate?scenario=${scenario}`, { method: "POST" });
      if (!response.ok) throw new Error();
      setAuthentication(await response.json());
    } catch {
      setAuthentication(null);
    } finally {
      setAuthenticationLoading(false);
    }
  };

  const resetDemo = async () => {
    if (!window.confirm("Restaurar saldo, movimentações e dispositivos da demonstração?")) return;
    setResettingDemo(true);
    try {
      const response = await apiFetch("/demo/reset", { method: "POST" });
      if (!response.ok) throw new Error();
      await loadDashboard();
      setDevices([]);
      setAnalytics(null);
      window.alert("Demonstração restaurada.");
    } catch {
      window.alert("Não foi possível restaurar. Verifique se o backend está ligado.");
    } finally {
      setResettingDemo(false);
    }
  };

  const openFlowHistory = async () => {
    setFlowHistoryOpen(true);
    setFlowHistoryLoading(true);
    try {
      const response = await apiFetch("/automation/executions");
      if (!response.ok) throw new Error();
      setFlowHistory(await response.json());
    } catch {
      setFlowHistory([]);
    } finally {
      setFlowHistoryLoading(false);
    }
  };

  const openAdminInsights = async () => {
    setAdminInsightsOpen(true);
    setAdminInsightsLoading(true);
    try {
      const response = await apiFetch("/admin/insights/summary");
      if (!response.ok) throw new Error();
      setAdminInsights(await response.json());
    } catch {
      setAdminInsights(null);
    } finally {
      setAdminInsightsLoading(false);
    }
  };

  const toggleUtilityCard = async () => {
    const response = await apiFetch("/banking/card/toggle", { method: "PATCH" });
    if (response.ok) await loadDashboard();
  };

  const markAllNotificationsRead = async () => {
    const response = await apiFetch("/notifications/read-all", { method: "PATCH" });
    if (response.ok) setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  };

  if (pathname === "/") return null;

  if (authStatus === "checking") {
    return <main className="login-shell"><section className="login-loading" aria-live="polite"><img src="/ranbank-logo.jpeg" alt="Ranbank"/><i/><p>Verificando seu acesso…</p><small>Isso deve levar menos de dois segundos.</small></section></main>;
  }

  if (authStatus === "unauthenticated") {
    return <AuthScreen mode={authMode} setMode={setAuthMode} identification={loginIdentification}
      setIdentification={setLoginIdentification} pin={loginPin} setPin={setLoginPin} signup={signup}
      setSignup={setSignup} recovery={recovery} setRecovery={setRecovery} loading={loginLoading}
      error={loginError} clearError={() => setLoginError("")} onLogin={login} onCreate={createDemoAccount}
      onRecover={recoverPin} appendDigit={appendLoginDigit}/>;
  }

  return (
    <main className="bank-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => { setScreen("dashboard"); setUtilityPanel(null); }} aria-label="Ir para o início">
          <img className="brand-logo" src="/ranbank-logo.jpeg" alt="Ranbank" />
        </button>

        <nav aria-label="Navegação principal">
          <button className={screen === "dashboard" ? "active" : ""} onClick={() => setScreen("dashboard")}><span>⌂</span> Início</button>
          <button className={utilityPanel === "account" ? "active" : ""} onClick={() => setUtilityPanel("account")}><span>▤</span> Conta</button>
          <button className={bankingOpen && bankingTab === "card" ? "active" : ""} onClick={() => openBanking("card")}><span>▭</span> Cartões</button>
          <button className={utilityPanel === "security" ? "active" : ""} onClick={() => setUtilityPanel("security")}><span>♢</span> Segurança</button>
          <button className={screen === "lab" ? "active" : ""} onClick={() => setScreen("lab")}><span>⚗</span> Future Lab</button>
        </nav>

      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p>{screen === "dashboard" ? "Visão geral" : "Laboratório de inovação"}</p>
            <h1>{screen === "dashboard" ? `Olá, ${data.customerName.split(" ")[0]}` : "Future Lab"}</h1>
          </div>
          <div className="top-actions"><button className="notification-trigger" onClick={() => setUtilityPanel("notifications")} aria-label="Notificações">♧{notifications.some((item) => !item.read) && <i/>}</button><button className="avatar" onClick={() => setUtilityPanel("profile")} aria-label={`Perfil de ${authUser?.customerName ?? "cliente"}`}>{authUser?.customerName.split(/\s+/).map((part) => part[0]).slice(0,2).join("").toUpperCase() || "RB"}</button></div>
        </header>

        {screen === "dashboard" ? (
          <div className="dashboard-grid">
            <div className="dashboard-main">
              <article className="balance-card">
                <div className="balance-copy"><small>Saldo em conta</small><strong>{money.format(data.balance)}</strong><span>Conta •••• {data.account}</span></div>
                <div className="balance-r" aria-hidden="true">R</div>
              </article>

              <div className="quick-actions" aria-label="Ações rápidas">
                <button onClick={() => { setPixStep("details"); setPixOpen(true); }}><span>◆</span>Pix</button>
                <button onClick={() => openBanking("schedule")}><span>◷</span>Agendar</button>
                <button onClick={() => openBanking("bill")}><span>▥</span>Pagar</button>
                <button onClick={() => openBanking("card")}><span>▭</span>Cartões</button>
              </div>

              <article className="transactions-panel">
                <div className="panel-title"><div><p>Conta digital</p><h2>Movimentações recentes</h2></div><button onClick={() => openBanking("statement")}>Ver todas</button></div>
                <div className="transaction-list">
                  {data.transactions.map((transaction) => (
                    <div className="transaction" key={transaction.id}>
                      <span className="transaction-icon">{transaction.type === "credit" ? "↓" : "↑"}</span>
                      <div><strong>{transaction.title}</strong><small>{transaction.detail}</small></div>
                      <b className={transaction.type}>{transaction.amount > 0 ? "+ " : "- "}{money.format(Math.abs(transaction.amount))}</b>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <aside className="future-card">
              <div className="future-heading"><span>FUTURE LAB</span><small>Demonstração educacional</small></div>
              <h2>Tecnologia que protege o seu futuro.</h2>
              <p>Explore como IA, dados, nuvem e automação podem atuar em uma experiência bancária.</p>
              <div className="future-visual" aria-hidden="true"><span>IA</span><span>BD</span><span>IoT</span><i /></div>
              <button onClick={() => setScreen("lab")}>Acessar Future Lab <span>→</span></button>
            </aside>
          </div>
        ) : (
          <div className="lab-layout">
            <div className="lab-intro"><div><span className="lab-tag">6 TÓPICOS · TECNOLOGIAS EMERGENTES NO BANCO</span><h2>Aprenda cada tecnologia usando o Ranbank.</h2><div className="lab-intro-actions"><button className="reset-demo" disabled={resettingDemo} onClick={resetDemo}>{resettingDemo ? "Restaurando…" : "↻ Restaurar ambiente"}</button></div></div><div className="official-topic-list">{officialTopics.map((topic, index) => <span key={topic}><b>{index + 1}</b>{topic}</span>)}</div></div>
            <div className="technology-grid">
              <div className="technology-section-heading"><span>TRILHA PRINCIPAL</span><strong>Demonstrações dos seis tópicos</strong></div>
              {technologies.filter((tech) => !tech.support).map((tech) => <button className={`technology-card ${tech.title === "Comparar" ? "comparison-card" : ""}`} key={tech.title} onClick={() => tech.title === "Big Data" ? openAnalytics() : tech.title === "Dispositivos" ? loadDevices() : tech.title === "Nuvem" ? openCloud() : tech.title === "Sustentabilidade" ? openSustainability() : tech.title === "Comparar" ? loadComparison() : tech.title === "RA e VR" ? loadImmersive() : tech.title === "Robótica" ? loadRobotMission() : undefined}><span>{tech.icon}</span><h3>{tech.title}</h3><p>{tech.text}</p><b>{tech.title !== "IA e fraudes" ? "Abrir painel →" : "Use o cenário abaixo →"}</b></button>)}
              <div className="technology-section-heading support-heading"><span>RECURSOS DE APOIO</span><strong>Serviços que conectam e protegem o banco</strong></div>
              {technologies.filter((tech) => tech.support).map((tech) => <button className="technology-card support-card" key={tech.title} onClick={() => tech.title === "Automação" ? runAutomation() : tech.title === "Cibersegurança" ? simulateThreat() : tech.title === "Autenticação" ? simulateAuthentication() : undefined}><span>{tech.icon}</span><h3>{tech.title}</h3><p>{tech.text}</p><b>Abrir apoio →</b></button>)}
              <button className="technology-card support-card" onClick={() => openInnovation("open-finance")}><span>OF</span><h3>Open Finance</h3><p>Controle consentimentos e reúna dados de instituições diferentes.</p><b>Abrir apoio →</b></button>
              <button className="technology-card support-card" onClick={() => openInnovation("audit")}><span>#</span><h3>Auditoria encadeada</h3><p>Entenda hashes, integridade e rastreabilidade de eventos bancários.</p><b>Abrir apoio →</b></button>
              <button className="technology-card support-card" onClick={() => openInnovation("journey")}><span>360</span><h3>Jornada antifraude</h3><p>Veja IA, dados, IoT, nuvem e automação trabalhando em conjunto.</p><b>Abrir apoio →</b></button>
              <button className="technology-card support-card" onClick={openFlowHistory}><span>RF</span><h3>Histórico RanFlow</h3><p>Acompanhe liquidações Pix e respostas a incidentes persistidas.</p><b>Ver execuções →</b></button>
              {data.role === "ADMIN" && <button className="technology-card support-card admin-card" onClick={openAdminInsights}><span>BI</span><h3>Insights administrativos</h3><p>Visão agregada de contas, depósitos, Pix, alertas e automações.</p><b>Abrir painel →</b></button>}
              {data.role === "ADMIN" && <button className="technology-card support-card admin-card" onClick={() => setAccountManagementOpen(true)}><span>AC</span><h3>Gerenciar contas</h3><p>Desative, reative ou remova dados pessoais de contas de teste.</p><b>Abrir gestão →</b></button>}
            </div>
            <div className="risk-panel">
              <div className="risk-score"><span>Nível de risco</span><div><strong>68</strong><small>/100</small></div><b>MÉDIO</b></div>
              <div className="risk-chart"><div className="panel-title"><div><p>IA E BIG DATA</p><h2>Análise de transação</h2></div><span className="live-pill">● cenário preparado</span></div><div className="bars" aria-label="Gráfico de risco"><i style={{height:"28%"}}/><i style={{height:"46%"}}/><i style={{height:"38%"}}/><i style={{height:"64%"}}/><i style={{height:"52%"}}/><i style={{height:"82%"}}/><i style={{height:"68%"}}/></div><div className="suspicious"><span>!</span><div><strong>Compra fora do padrão</strong><small>Novo dispositivo · R$ 2.950,00 · Manaus, AM · distante de Brasília</small></div><button onClick={analyzeSuspiciousTransaction}>Analisar agora</button></div></div>
            </div>
          </div>
        )}
      </section>

      <button className="assistant-button" onClick={() => setAssistantOpen(!assistantOpen)}><span>✦</span> Assistente</button>
      {assistantOpen && <aside className="assistant-panel" aria-label="Assistente educacional Ranbank"><div className="assistant-header"><span className="assistant-icon">R</span><div><strong>Assistente Ranbank</strong><small className={`assistant-mode mode-${chatMode.toLowerCase()}`}>{chatMode === "OPENAI" ? "IA conectada · OpenAI API" : chatMode === "LOCAL_FALLBACK" ? "API indisponível · modo local" : "Modo local · conteúdo educacional"}</small></div><button onClick={() => setAssistantOpen(false)} aria-label="Fechar assistente">×</button></div><div className="chat-messages" aria-live="polite">{chatMessages.map((message,index) => <article key={index} className={`chat-${message.role}`}>{message.topic && <span>{message.topic}</span>}<p>{message.text}</p></article>)}{chatLoading && <article className="chat-assistant chat-typing" aria-label="Assistente digitando"><i/><i/><i/></article>}</div><div className="chat-suggestions"><button onClick={() => sendChatMessage("Oi")}>Dizer oi</button><button onClick={() => sendChatMessage("O que é phishing?")}>Phishing</button><button onClick={() => sendChatMessage("O que posso perguntar?")}>Ver assuntos</button></div><form className="chat-form" onSubmit={(event) => { event.preventDefault(); sendChatMessage(); }}><input value={chatInput} maxLength={300} onChange={(event) => setChatInput(event.target.value)} placeholder="Digite sua pergunta…" aria-label="Pergunta para o assistente"/><button type="submit" disabled={chatLoading || !chatInput.trim()} aria-label="Enviar pergunta">→</button></form><footer>Conteúdo educacional · não fornece orientação financeira</footer></aside>}
      {pixOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setPixOpen(false)}><section className="pix-modal" role="dialog" aria-modal="true" aria-labelledby="pix-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>PIX RANBANK</span><h2 id="pix-title">Enviar um Pix</h2></div><button onClick={() => setPixOpen(false)} aria-label="Fechar">×</button></header><div className="education-note"><b>i</b><p><strong>Transferência entre contas</strong><br/>O destinatário será localizado antes da autorização, e débito e crédito ocorrerão juntos.</p></div><form onSubmit={sendPix}><label>Chave Pix<input value={pixKey} onChange={(event) => setPixKey(event.target.value)} placeholder="E-mail, CPF, telefone ou chave aleatória" required /><small className="field-help">Para testar com a conta demo, use maria@ranbank.demo</small></label><label>Valor disponível: {money.format(data.balance)}<input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0,00" inputMode="decimal" required /></label>{pixStatus === "error" && <p className="form-error">{pixError}</p>}<button className="confirm-pix" disabled={pixStatus === "sending"}>{pixStatus === "sending" ? "Localizando destinatário…" : pixStatus === "success" ? "Pix concluído ✓" : "Revisar Pix"}</button></form></section></div>}
      {analysisOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setAnalysisOpen(false)}><section className="analysis-modal" role="dialog" aria-modal="true" aria-labelledby="analysis-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>SEGURANÇA EXPLICÁVEL</span><h2 id="analysis-title">Resultado da análise</h2></div><button onClick={() => setAnalysisOpen(false)} aria-label="Fechar">×</button></header>{analysisLoading ? <div className="analysis-loading"><i/><p>Analisando sinais da transação…</p></div> : analysis ? <><div className={`analysis-summary level-${analysis.level.toLowerCase()}`}><div><strong>{analysis.score}</strong><small>/100</small></div><span>Risco {analysis.level}</span></div><div className="method-label">{analysis.method} · resultado demonstrativo</div><div className="signal-list">{analysis.signals.map((signal) => <article key={signal.name}><b>{signal.weight}</b><div><strong>{signal.name}</strong><p>{signal.explanation}</p></div></article>)}</div><div className="recommendation"><span>Recomendação do sistema</span><strong>{analysis.recommendation}</strong></div></> : <div className="analysis-error"><strong>Backend não disponível</strong><p>Reinicie o Spring Boot para carregar o simulador.</p></div>}</section></div>}
      {analyticsOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setAnalyticsOpen(false)}><section className="analytics-modal" role="dialog" aria-modal="true" aria-labelledby="analytics-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>BIG DATA · DADOS DO H2</span><h2 id="analytics-title">Inteligência de movimentações</h2></div><button onClick={() => setAnalyticsOpen(false)} aria-label="Fechar">×</button></header>{analyticsLoading ? <div className="analysis-loading"><i/><p>Agregando movimentações…</p></div> : analytics ? <><div className="metric-grid"><article><span>Eventos analisados</span><strong>{analytics.totalTransactions}</strong><small>{analytics.creditCount} entradas · {analytics.debitCount} saídas</small></article><article><span>Total de entradas</span><strong className="metric-positive">{money.format(analytics.totalIn)}</strong><small>Valores creditados</small></article><article><span>Total de saídas</span><strong>{money.format(analytics.totalOut)}</strong><small>Valores debitados</small></article><article><span>Média por saída</span><strong>{money.format(analytics.averageOut)}</strong><small>Maior: {money.format(analytics.largestOut)}</small></article></div><div className="data-chart"><div><span>VOLUME RELATIVO</span><small>Cada barra representa uma movimentação armazenada</small></div><div className="data-bars">{analytics.series.map((value,index) => { const max = Math.max(...analytics.series.map(Math.abs),1); return <i key={index} className={value >= 0 ? "bar-credit" : "bar-debit"} style={{height:`${Math.max(12, Math.abs(value)/max*100)}%`}} title={money.format(value)}/>; })}</div><div className="chart-legend"><span><i className="legend-credit"/>Entrada</span><span><i className="legend-debit"/>Saída</span></div></div><div className="data-pipeline"><div><b>1</b><span><strong>Coleta</strong><small>Pix e movimentações</small></span></div><i>→</i><div><b>2</b><span><strong>Armazenamento</strong><small>Banco H2</small></span></div><i>→</i><div><b>3</b><span><strong>Agregação</strong><small>API Java</small></span></div><i>→</i><div><b>4</b><span><strong>Visualização</strong><small>Painel React</small></span></div></div><p className="analytics-caption">Em um banco real, esse fluxo processaria volumes muito maiores e exigiria infraestrutura distribuída. Aqui ele foi reduzido para fins didáticos.</p></> : <div className="analysis-error"><strong>Backend não disponível</strong><p>Reinicie o Spring Boot para carregar as estatísticas.</p></div>}</section></div>}
      {devicesOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setDevicesOpen(false)}><section className="devices-modal" role="dialog" aria-modal="true" aria-labelledby="devices-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>IOT · TELEMETRIA DEMONSTRATIVA</span><h2 id="devices-title">Dispositivos conectados</h2></div><button onClick={() => setDevicesOpen(false)} aria-label="Fechar">×</button></header><div className="iot-summary"><div><strong>{devices.filter((device) => !device.blocked).length}</strong><small>ativos</small></div><div><strong>{devices.filter((device) => device.trusted).length}</strong><small>confiáveis</small></div><div><strong>{devices.filter((device) => device.blocked).length}</strong><small>bloqueados</small></div><p>O banco recebe sinais dos aparelhos e reage quando encontra comportamento fora do padrão.</p></div>{devicesLoading ? <div className="analysis-loading"><i/><p>Consultando dispositivos…</p></div> : devices.length ? <div className="device-list">{devices.map((device) => <article key={device.id} className={!device.trusted ? "device-alert" : ""}><span className="device-icon">{device.type === "Celular" ? "▯" : device.type === "Computador" ? "▱" : "IoT"}</span><div><div className="device-name"><strong>{device.name}</strong>{device.blocked ? <b className="blocked-pill">Bloqueado</b> : device.trusted ? <b className="trusted-pill">Confiável</b> : <b className="alert-pill">Revisar</b>}</div><p>{device.type} · {device.location}</p><small>Último sinal: {device.lastAccess}</small></div><button className={device.blocked ? "unblock-button" : "block-button"} onClick={() => toggleDevice(device.id)}>{device.blocked ? "Reativar" : "Bloquear"}</button></article>)}</div> : <div className="analysis-error"><strong>Backend não disponível</strong><p>Reinicie o Spring Boot para carregar os dispositivos.</p></div>}<div className="iot-flow"><span>Dispositivo</span><i>envia telemetria →</i><span>API Java</span><i>avalia confiança →</i><span>Resposta</span></div><p className="analytics-caption">Acompanhe telemetria, confiança e respostas de segurança dos dispositivos conectados.</p></section></div>}
      {cloudOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setCloudOpen(false)}><section className="cloud-modal" role="dialog" aria-modal="true" aria-labelledby="cloud-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>COMPUTAÇÃO EM NUVEM · REDUNDÂNCIA</span><h2 id="cloud-title">Continuidade do Ranbank</h2></div><button onClick={() => setCloudOpen(false)} aria-label="Fechar">×</button></header>{cloudLoading && !cloud ? <div className="analysis-loading"><i/><p>Consultando regiões…</p></div> : cloud ? <><div className={`cloud-overview ${cloud.failureActive ? "cloud-degraded" : ""}`}><div><span>Status do sistema</span><strong>{cloud.systemStatus}</strong></div><div><span>Disponibilidade</span><strong>{cloud.availability}</strong></div><div><span>Região principal</span><strong>{cloud.activeRegion}</strong></div><button disabled={cloudLoading} onClick={() => requestCloudStatus(cloud.failureActive ? "/restore" : "/simulate-failure", "POST")}>{cloudLoading ? "Processando…" : cloud.failureActive ? "Restaurar operação" : "Simular falha"}</button></div><div className="region-grid">{cloud.regions.map((region) => <article key={region.code} className={`region-${region.status.toLowerCase()}`}><div><span className="region-dot"/><small>{region.code}</small></div><h3>{region.name}</h3><b>{region.status}</b><div className="traffic"><span><i style={{width:`${region.trafficPercent}%`}}/></span><small>{region.trafficPercent}% do tráfego</small></div><p>Latência: {region.latencyMs || "—"} ms</p></article>)}</div><div className="recovery-panel"><span>Linha do tempo de resposta</span>{cloud.timeline.map((step,index) => <article key={`${step.time}-${index}`}><b>{step.time}</b><i/><div><strong>{step.title}</strong><p>{step.description}</p></div></article>)}</div><p className="analytics-caption">Simulação local: nenhuma infraestrutura de nuvem real é acionada. O objetivo é demonstrar failover, health checks e distribuição de tráfego.</p></> : <div className="analysis-error"><strong>Backend não disponível</strong><p>Reinicie o Spring Boot para carregar a simulação.</p></div>}</section></div>}
      {automationOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setAutomationOpen(false)}><section className="automation-modal" role="dialog" aria-modal="true" aria-labelledby="automation-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>AUTOMAÇÃO · FLUXO INSPIRADO NO N8N</span><h2 id="automation-title">Resposta a incidente</h2></div><button onClick={() => setAutomationOpen(false)} aria-label="Fechar">×</button></header>{automation ? <><div className="automation-run-header"><div><span>INCIDENTE</span><strong>{automation.incidentId}</strong></div><div><span>STATUS</span><strong>{automationRunning ? "EM EXECUÇÃO" : automation.status}</strong></div><button disabled={automationRunning} onClick={runAutomation}>{automationRunning ? "Executando…" : "Executar novamente"}</button></div><div className="workflow-canvas">{automation.steps.map((step,index) => <article key={step.order} className={index < visibleAutomationSteps ? "step-visible" : "step-waiting"}><div className="workflow-node"><span>{step.order}</span><div><strong>{step.title}</strong><small>{step.responsibility}</small></div><b>{index < visibleAutomationSteps ? "✓" : "…"}</b></div><p>{step.description}</p><footer><span>{step.duration}</span><i>{step.responsibility === "Humano" ? "Ponto de decisão humana" : "Etapa automática"}</i></footer></article>)}</div><div className="automation-limit"><b>!</b><p><strong>Limite da automação</strong><br/>{automation.limitation}</p></div></> : automationRunning ? <div className="analysis-loading"><i/><p>Iniciando workflow…</p></div> : <div className="analysis-error"><strong>Backend não disponível</strong><p>Reinicie o Spring Boot para carregar a automação.</p></div>}</section></div>}
      {sustainabilityOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSustainabilityOpen(false)}>
          <section className="sustainability-modal" role="dialog" aria-modal="true" aria-labelledby="sustainability-title" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div><span>TECNOLOGIAS SUSTENTÁVEIS · GREEN IT</span><h2 id="sustainability-title">Como um banco reduz seu impacto?</h2></div>
              <button onClick={() => setSustainabilityOpen(false)} aria-label="Fechar">×</button>
            </header>
            <div className="green-definition">
              <span>IDEIA PRINCIPAL</span>
              <h3>Tecnologia sustentável usa inovação para consumir menos recursos e gerar menos impacto ambiental.</h3>
              <p>No banco, isso envolve a energia dos data centers, a eficiência da nuvem, a frota de atendimento e o destino de cartões e equipamentos.</p>
            </div>
            <div className="green-use-cases" aria-label="Exemplos de sustentabilidade no banco">
              <article><b>☀</b><div><strong>Energia renovável</strong><p>Solar e eólica abastecem data centers, agências e caixas eletrônicos.</p></div></article>
              <article><b>☁</b><div><strong>Nuvem eficiente</strong><p>Servidores ociosos são consolidados para gastar menos energia.</p></div></article>
              <article><b>EV</b><div><strong>Mobilidade elétrica</strong><p>Frotas elétricas e crédito verde apoiam transportes menos poluentes.</p></div></article>
              <article><b>↻</b><div><strong>Reciclagem inteligente</strong><p>Cartões, baterias e eletrônicos são rastreados até o descarte correto.</p></div></article>
            </div>
            <div className="green-lesson-flow">
              <div><b>1</b><span><strong>MEDIR</strong><small>Consumo e emissões</small></span></div><i>→</i>
              <div><b>2</b><span><strong>ANALISAR</strong><small>Encontrar desperdícios</small></span></div><i>→</i>
              <div><b>3</b><span><strong>OTIMIZAR</strong><small>Ajustar nuvem e energia</small></span></div><i>→</i>
              <div><b>4</b><span><strong>ACOMPANHAR</strong><small>Comparar o resultado</small></span></div>
            </div>
            {sustainabilityLoading && !sustainability ? <div className="analysis-loading"><i/><p>Medindo consumo…</p></div> : sustainability ? <>
              <div className={`green-status ${sustainability.optimized ? "green-optimized" : ""}`}>
                <div><span>Cenário atual</span><strong>{sustainability.optimized ? "INFRAESTRUTURA OTIMIZADA" : "MELHORIAS IDENTIFICADAS"}</strong></div>
                <div><span>Redução de consumo</span><strong>{sustainability.savingsPercent}%</strong></div>
                <button disabled={sustainabilityLoading} onClick={() => requestSustainability(true)}>{sustainabilityLoading ? "Calculando…" : sustainability.optimized ? "Restaurar cenário inicial" : "Aplicar otimização"}</button>
              </div>
              <div className="green-metrics">
                <article><span>Consumo elétrico</span><strong>{sustainability.powerKw.toFixed(1)} kW</strong><small>Menor é mais eficiente</small></article>
                <article><span>Energia renovável</span><strong>{sustainability.renewablePercent}%</strong><small>Maior reduz fontes poluentes</small></article>
                <article><span>Emissões</span><strong>{sustainability.carbonKgHour.toFixed(1)} kg</strong><small>CO₂ equivalente por hora</small></article>
                <article><span>Eficiência PUE</span><strong>{sustainability.pue.toFixed(2)}</strong><small>Quanto mais perto de 1, melhor</small></article>
              </div>
              <div className={`green-result ${sustainability.optimized ? "is-visible" : ""}`}>
                <div><span>ANTES</span><strong>58,4 kW</strong><small>54% renovável · 14,2 kg CO₂/h</small></div>
                <b>→</b>
                <div><span>DEPOIS</span><strong>42,6 kW</strong><small>78% renovável · 8,7 kg CO₂/h</small></div>
                <p><strong>O que mudou?</strong> Serviços não essenciais foram reorganizados, servidores ociosos foram consolidados e a participação de energia renovável aumentou.</p>
              </div>
              <div className="energy-sources"><div><span>DE ONDE VEM A ENERGIA?</span><small>A soma representa toda a matriz utilizada</small></div>{sustainability.sources.map((source) => <article key={source.name}><div><strong>{source.name}</strong><small>{source.type}</small></div><span><i style={{width:`${source.percentage}%`}}/></span><b>{source.percentage}%</b></article>)}</div>
              <div className="green-actions">{sustainability.actions.map((action) => <span key={action}><b>{sustainability.optimized ? "✓" : "!"}</b>{action}</span>)}</div>
              <div className="green-speaker-tip"><b>DICA PARA APRESENTAR</b><p>“Um banco digital não usa papel em todas as operações, mas ainda consome energia e equipamentos. O sistema mede esse impacto, encontra desperdícios e aplica melhorias. Clique em <strong>Aplicar otimização</strong> e compare o antes e o depois.”</p></div>
            </> : <div className="analysis-error"><strong>Backend não disponível</strong><p>Aguarde alguns segundos e tente abrir o painel novamente.</p></div>}
          </section>
        </div>
      )}
      {comparisonOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setComparisonOpen(false)}><section className="comparison-modal" role="dialog" aria-modal="true" aria-labelledby="comparison-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>DECISÃO TECNOLÓGICA · CENÁRIO DIDÁTICO</span><h2 id="comparison-title">Qual tecnologia usar?</h2></div><button onClick={() => setComparisonOpen(false)} aria-label="Fechar">×</button></header><div className="goal-tabs" aria-label="Objetivo da comparação"><button className={comparison?.goal === "seguranca" ? "active" : ""} onClick={() => loadComparison("seguranca")}>Segurança</button><button className={comparison?.goal === "escala" ? "active" : ""} onClick={() => loadComparison("escala")}>Escala</button><button className={comparison?.goal === "eficiencia" ? "active" : ""} onClick={() => loadComparison("eficiencia")}>Eficiência</button></div>{comparisonLoading && !comparison ? <div className="analysis-loading"><i/><p>Comparando alternativas…</p></div> : comparison ? <><div className="comparison-heading"><div><span>OBJETIVO SELECIONADO</span><strong>{comparison.goalLabel}</strong></div><small>Ranking contextual, não uma regra universal</small></div><div className="comparison-list">{comparison.results.map((technology,index) => <article key={technology.name}><div className="comparison-rank"><b>{index + 1}</b><span className="score-ring" style={{background:`conic-gradient(#20c9ef ${technology.score}%, #18365f 0)`}}><i>{technology.score}</i></span></div><div className="comparison-copy"><h3>{technology.name}</h3><p>{technology.bestUse}</p><div><span>Custo <b>{technology.cost}</b></span><span>Maturidade <b>{technology.maturity}</b></span></div></div><div className="comparison-limit"><span>ATENÇÃO</span><p>{technology.limitation}</p></div></article>)}</div><div className="comparison-disclaimer"><b>i</b><p>{comparison.disclaimer}</p></div></> : <div className="analysis-error"><strong>Backend não disponível</strong><p>Reinicie o Spring Boot para carregar a comparação.</p></div>}</section></div>}
      {securityOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setSecurityOpen(false)}><section className="security-modal" role="dialog" aria-modal="true" aria-labelledby="security-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>LABORATÓRIO SEGURO · SIMULAÇÃO</span><h2 id="security-title">Central de Cibersegurança</h2></div><button onClick={() => setSecurityOpen(false)} aria-label="Fechar">×</button></header><div className="threat-tabs"><button className={threat?.name === "Phishing" ? "active" : ""} onClick={() => simulateThreat("phishing")}>Phishing</button><button className={threat?.name === "Ransomware" ? "active" : ""} onClick={() => simulateThreat("ransomware")}>Ransomware</button><button className={threat?.name === "Trojan bancário" ? "active" : ""} onClick={() => simulateThreat("trojan")}>Trojan</button></div>{securityLoading && !threat ? <div className="analysis-loading"><i/><p>Executando cenário controlado…</p></div> : threat ? <><div className="threat-overview"><div className="threat-score"><span>RISCO</span><strong>{threat.risk}</strong><small>/100</small></div><div><span>{threat.category}</span><h3>{threat.name}</h3><p>{threat.description}</p></div><b>AMEAÇA CONTIDA</b></div><div className="security-columns"><section><div className="security-section-title"><span>1</span><div><b>Sinais detectados</b><small>O que o sistema observa</small></div></div><div className="indicator-list">{threat.indicators.map((indicator) => <article key={indicator}><span>!</span><p>{indicator}</p></article>)}</div></section><section><div className="security-section-title"><span>2</span><div><b>Resposta em camadas</b><small>Como a defesa reduz o risco</small></div></div><div className="defense-list">{threat.defenses.map((defense,index) => <article key={defense.name}><div><span>{index + 1}</span><i/></div><section><b>{defense.name}</b><p>{defense.result}</p><small className={defense.responsibility}>{defense.responsibility === "humana" ? "Decisão humana" : "Resposta automática"}</small></section></article>)}</div></section></div><div className="security-note"><b>Importante</b><p>Nenhuma defesa isolada resolve tudo. Segurança real combina pessoas, processos, atualizações, autenticação e monitoramento contínuo.</p></div></> : <div className="analysis-error"><strong>Backend não disponível</strong><p>Reinicie o Spring Boot para executar os cenários.</p></div>}</section></div>}
      {immersiveOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setImmersiveOpen(false)}><section className="immersive-modal" role="dialog" aria-modal="true" aria-labelledby="immersive-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>TECNOLOGIAS IMERSIVAS · DEMONSTRAÇÃO</span><h2 id="immersive-title">Realidade aumentada ou virtual?</h2></div><button onClick={() => setImmersiveOpen(false)} aria-label="Fechar">×</button></header><div className="immersive-tabs"><button className={immersive?.code === "RA" ? "active" : ""} onClick={() => loadImmersive("ar")}><b>RA</b><span>Mundo real + informação</span></button><button className={immersive?.code === "VR" ? "active" : ""} onClick={() => loadImmersive("vr")}><b>VR</b><span>Ambiente totalmente digital</span></button></div>{immersiveLoading && !immersive ? <div className="analysis-loading"><i/><p>Preparando experiência…</p></div> : immersive ? <><div className={`immersive-stage mode-${immersive.code.toLowerCase()}`}><div className="immersive-visual" aria-hidden="true"><div className="scene-building"><span>R</span><i/><i/><i/></div><div className="scene-target"><span>{immersive.code}</span><b>{immersive.code === "RA" ? "Orientação ativa" : "Ambiente simulado"}</b></div><div className="scan-line"/></div><div className="immersive-intro"><span>{immersive.name}</span><h3>{immersive.title}</h3><p>{immersive.definition}</p></div></div><div className="immersive-journey"><span>COMO FUNCIONA NESTE CENÁRIO</span><div>{immersive.steps.map((step,index) => <article key={step}><b>{index + 1}</b><p>{step}</p>{index < immersive.steps.length - 1 && <i>→</i>}</article>)}</div></div><div className="immersive-facts"><article><span>EQUIPAMENTO</span><strong>{immersive.equipment}</strong></article><article><span>PONTO FORTE</span><strong>{immersive.strength}</strong></article><article className="immersive-warning"><span>LIMITAÇÃO</span><strong>{immersive.limitation}</strong></article></div><p className="immersive-caption">Esta tela representa o conceito sem acessar câmera, sensores ou óculos. Em uma aplicação real, permissões, acessibilidade e proteção dos dados do ambiente seriam essenciais.</p></> : <div className="analysis-error"><strong>Backend não disponível</strong><p>Reinicie o Spring Boot para carregar a experiência.</p></div>}</section></div>}
      {roboticsOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setRoboticsOpen(false)}><section className="robotics-modal" role="dialog" aria-modal="true" aria-labelledby="robotics-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>ROBÓTICA · INTERAÇÃO FÍSICA E DIGITAL</span><h2 id="robotics-title">Robô assistente da agência</h2></div><button onClick={() => setRoboticsOpen(false)} aria-label="Fechar">×</button></header><div className="robot-missions"><button onClick={() => loadRobotMission("reception")} className={robotMission?.name === "Recepção inteligente" ? "active" : ""}>Recepção</button><button onClick={() => loadRobotMission("accessibility")} className={robotMission?.name === "Apoio à acessibilidade" ? "active" : ""}>Acessibilidade</button><button onClick={() => loadRobotMission("security")} className={robotMission?.name === "Alerta de segurança" ? "active" : ""}>Segurança</button></div>{roboticsLoading && !robotMission ? <div className="analysis-loading"><i/><p>Carregando missão…</p></div> : robotMission ? <><div className="robot-command"><div className="robot-figure" aria-hidden="true"><div className="robot-head"><i/><i/><span/></div><div className="robot-body"><b>R</b><span/></div><div className="robot-base"/></div><div className="robot-brief"><span>MISSÃO ATUAL</span><h3>{robotMission.name}</h3><p>{robotMission.objective}</p><div><span>Autonomia programada</span><b>{robotMission.autonomy}%</b><i><em style={{width:`${robotMission.autonomy}%`}}/></i></div></div><div className="robot-status"><i/> ONLINE<small>Sensores simulados</small></div></div><div className="robot-process"><span>PERCEPÇÃO → DECISÃO → AÇÃO</span><div>{robotMission.steps.map((step,index) => <article key={step.title}><div className={`robot-step-icon tech-${step.technology}`}><b>{index + 1}</b><span>{step.technology === "sensor" ? "SENSOR" : step.technology === "ia" ? "IA" : step.technology === "humano" ? "PESSOA" : "AÇÃO"}</span></div><section><strong>{step.title}</strong><p>{step.result}</p></section>{index < robotMission.steps.length - 1 && <i>›</i>}</article>)}</div></div><div className="human-handoff"><span>H</span><p><strong>Onde entra o ser humano?</strong><br/>{robotMission.humanRole}</p></div></> : <div className="analysis-error"><strong>Backend não disponível</strong><p>Reinicie o Spring Boot para iniciar o robô.</p></div>}</section></div>}
      {authenticationOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setAuthenticationOpen(false)}><section className="authentication-modal" role="dialog" aria-modal="true" aria-labelledby="authentication-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>IDENTIDADE DIGITAL · DEFESA EM CAMADAS</span><h2 id="authentication-title">Autenticação moderna</h2></div><button onClick={() => setAuthenticationOpen(false)} aria-label="Fechar">×</button></header><div className="auth-scenarios"><button className={authentication?.risk === 14 ? "active" : ""} onClick={() => simulateAuthentication("trusted")}><b>✓</b><span>Acesso habitual<small>Aparelho conhecido</small></span></button><button className={authentication?.risk === 82 ? "active danger" : ""} onClick={() => simulateAuthentication("suspicious")}><b>!</b><span>Acesso suspeito<small>Novo contexto</small></span></button></div>{authenticationLoading && !authentication ? <div className="analysis-loading"><i/><p>Verificando identidade…</p></div> : authentication ? <><div className={`auth-context ${authentication.risk > 50 ? "auth-danger" : ""}`}><div><span>CONTEXTO OBSERVADO</span><strong>{authentication.context}</strong></div><div className="auth-risk"><span>RISCO</span><b>{authentication.risk}</b><small>/100</small></div></div><div className="auth-factors"><div className="auth-factor-heading"><span>FATORES DE AUTENTICAÇÃO</span><small>Mais de uma evidência protege melhor que apenas uma senha</small></div>{authentication.factors.map((factor,index) => <article key={factor.name} className={`factor-${factor.status}`}><div><b>{index + 1}</b>{index < authentication.factors.length - 1 && <i/>}</div><section><span>{factor.category}</span><strong>{factor.name}</strong></section><em>{factor.status === "aprovado" ? "APROVADO ✓" : factor.status === "revisar" ? "REVISAR" : "BLOQUEADO"}</em></article>)}</div><div className={`auth-decision ${authentication.risk > 50 ? "decision-blocked" : ""}`}><span>{authentication.risk > 50 ? "×" : "✓"}</span><div><small>DECISÃO ADAPTATIVA</small><strong>{authentication.decision}</strong><p>{authentication.explanation}</p></div></div><p className="auth-caption">A autenticação combina fatores de identidade, dispositivo e comportamento para avaliar o acesso.</p></> : <div className="analysis-error"><strong>Backend não disponível</strong><p>Reinicie o Spring Boot para executar a autenticação.</p></div>}</section></div>}
      {utilityPanel === "account" && <div className="modal-backdrop" role="presentation" onMouseDown={() => setUtilityPanel(null)}><section className="utility-modal account-utility" role="dialog" aria-modal="true" aria-labelledby="account-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>CONTA DIGITAL</span><h2 id="account-title">Minha conta</h2></div><button onClick={() => setUtilityPanel(null)} aria-label="Fechar">×</button></header><div className="account-summary"><div><span>Saldo disponível</span><strong>{money.format(data.balance)}</strong><small>Conta corrente · Ag. 0001</small></div><b>•••• {data.account}</b></div><div className="account-details"><article><span>Titular</span><strong>{data.customerName}</strong></article><article><span>Tipo de conta</span><strong>Conta digital</strong></article><article><span>Status</span><strong className="status-safe">Ativa e protegida</strong></article><article><span>Instituição</span><strong>Ranbank Digital</strong></article></div><div className="utility-section-title"><span>ÚLTIMAS MOVIMENTAÇÕES</span><button onClick={() => { setUtilityPanel(null); setScreen("dashboard"); }}>Ver na tela inicial</button></div><div className="compact-transactions">{data.transactions.slice(0,4).map((transaction) => <article key={transaction.id}><span>{transaction.type === "credit" ? "↓" : "↑"}</span><div><strong>{transaction.title}</strong><small>{transaction.detail}</small></div><b className={transaction.type}>{transaction.amount > 0 ? "+ " : "- "}{money.format(Math.abs(transaction.amount))}</b></article>)}</div><p className="utility-caption">Movimentações organizadas por data, categoria e valor.</p></section></div>}
      {utilityPanel === "cards" && <div className="modal-backdrop" role="presentation" onMouseDown={() => setUtilityPanel(null)}><section className="utility-modal cards-utility" role="dialog" aria-modal="true" aria-labelledby="cards-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>ECOCARD · FÍSICO E VIRTUAL</span><h2 id="cards-title">Meus cartões</h2></div><button onClick={() => setUtilityPanel(null)} aria-label="Fechar">×</button></header><div className={`bank-card ecocard-bank-card ${data.card.blocked ? "card-is-blocked" : ""}`}><div className="ecocard-asset"><img src="/images/ranbank-ecocard-reference.jpeg" alt="Ecocard RanBank sustentável"/></div>{data.card.blocked && <em>BLOQUEADO</em>}</div><div className="card-metrics"><article><span>Fatura atual</span><strong>{money.format(data.card.spent)}</strong><small>Valores da conta autenticada</small></article><article><span>Limite disponível</span><strong>{money.format(data.card.available)}</strong><small>de {money.format(data.card.limit)}</small></article></div><button className={`card-toggle ${data.card.blocked ? "unlock" : ""}`} onClick={toggleUtilityCard}><span>{data.card.blocked ? "✓" : "×"}</span><div><strong>{data.card.blocked ? "Desbloquear cartão" : "Bloquear temporariamente"}</strong><small>{data.card.blocked ? "Voltar a permitir compras" : "Impede novas compras até o desbloqueio"}</small></div></button><div className="card-actions"><button onClick={() => window.alert(`Cartão final ${data.card.lastFour} · validade 08/31 · CVV oculto`)}>▣ <span>Ver dados</span></button><button onClick={() => window.alert(`Fatura atual de ${money.format(data.card.spent)}`)}>▤ <span>Ver fatura</span></button><button onClick={() => { setUtilityPanel(null); openBanking("card"); }}>↕ <span>Ajustar limite</span></button></div><p className="utility-caption">O mesmo Ecocard, com controle completo no cartão físico e virtual.</p></section></div>}
      {utilityPanel === "security" && <div className="modal-backdrop" role="presentation" onMouseDown={() => setUtilityPanel(null)}><section className="utility-modal security-utility" role="dialog" aria-modal="true" aria-labelledby="security-hub-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>CENTRAL DE PROTEÇÃO</span><h2 id="security-hub-title">Segurança da conta</h2></div><button onClick={() => setUtilityPanel(null)} aria-label="Fechar">×</button></header><div className="security-health"><div className="security-shield">✓</div><div><span>NÍVEL DE PROTEÇÃO</span><strong>Conta protegida</strong><p>As principais camadas de segurança estão ativas.</p></div><b>92<small>/100</small></b></div><div className="security-settings"><article><span>Biometria por passkey</span><strong className="setting-label-off">Não cadastrada</strong><i className="setting-off"/></article><article><span>PIN transacional</span><strong>Ativado</strong><i className="setting-on"/></article><article><span>Avisos de movimentação</span><strong>Ativados</strong><i className="setting-on"/></article><article><span>Dispositivo atual</span><strong>Confiável</strong><i className="setting-on"/></article></div><div className="security-shortcuts"><button onClick={() => { setUtilityPanel(null); setScreen("lab"); simulateAuthentication(); }}><b>ID</b><span><strong>Testar autenticação</strong><small>Compare acesso habitual e suspeito</small></span><i>→</i></button><button onClick={() => { setUtilityPanel(null); setScreen("lab"); simulateThreat(); }}><b>!</b><span><strong>Simular malware</strong><small>Phishing, ransomware e trojan</small></span><i>→</i></button><button onClick={() => { setUtilityPanel(null); setScreen("lab"); loadDevices(); }}><b>IoT</b><span><strong>Gerenciar dispositivos</strong><small>Confiança, telemetria e bloqueios</small></span><i>→</i></button></div></section></div>}
      {utilityPanel === "notifications" && <div className="modal-backdrop utility-side-backdrop" role="presentation" onMouseDown={() => setUtilityPanel(null)}><section className="utility-modal notifications-utility" role="dialog" aria-modal="true" aria-labelledby="notifications-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>CENTRAL DE ALERTAS · TEMPO REAL</span><h2 id="notifications-title">Notificações</h2></div><button onClick={() => setUtilityPanel(null)} aria-label="Fechar">×</button></header><div className="notification-list">{notifications.length ? notifications.map((item) => <article key={item.id} className={!item.read ? "unread" : ""}><b>{item.type === "PIX_RECEIVED" ? "↓" : "✓"}</b><div><strong>{item.title}</strong><p>{item.message}</p><small>{new Date(item.createdAt).toLocaleString("pt-BR")}</small></div></article>) : <div className="empty-notifications"><strong>Nenhum alerta por aqui</strong><p>Novos Pix e eventos de segurança aparecerão em tempo real.</p></div>}</div><button className="read-all" onClick={markAllNotificationsRead} disabled={!notifications.some((item) => !item.read)}>{notifications.some((item) => !item.read) ? "Marcar todas como lidas" : "Tudo lido ✓"}</button></section></div>}
      {utilityPanel === "profile" && <div className="modal-backdrop utility-side-backdrop" role="presentation" onMouseDown={() => setUtilityPanel(null)}><section className="utility-modal profile-utility" role="dialog" aria-modal="true" aria-labelledby="profile-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>PERFIL RANBANK</span><h2 id="profile-title">Dados da conta</h2></div><button onClick={() => setUtilityPanel(null)} aria-label="Fechar">×</button></header><div className="profile-hero"><span>{data.customerName.split(/\s+/).map((part) => part[0]).slice(0,2).join("").toUpperCase()}</span><div><strong>{data.customerName}</strong><small>Cliente Ranbank Future</small></div><b>{data.role === "ADMIN" ? "ADMIN" : "CONTA ATIVA"}</b></div><div className="profile-fields"><article><span>E-mail e chave Pix</span><strong>{data.email || "Não informado"}</strong></article><article><span>Telefone e chave Pix</span><strong>{data.phoneNumber || "Cadastre uma chave telefone na área Pix"}</strong></article><article><span>CPF e chave Pix</span><strong>{data.maskedDocument}</strong></article><article><span>Conta</span><strong>Ag. 0001 · {data.account}</strong></article><article><span>Cliente desde</span><strong>{data.createdAt ? new Date(data.createdAt).toLocaleDateString("pt-BR") : "Hoje"}</strong></article></div><div className="profile-notice"><b>i</b><p>Os dados exibidos pertencem à conta autenticada e estão isolados dos demais clientes.</p></div><div className="profile-actions"><button className="profile-action profile-keys" onClick={() => { setUtilityPanel(null); setPixKeysOpen(true); }}><span>◆</span><div><strong>Gerenciar chaves Pix</strong><small>E-mail, CPF, telefone e chave aleatória</small></div><b>›</b></button><button className="profile-action profile-logout" onClick={logout}><span>↪</span><div><strong>Sair da conta</strong><small>Encerrar esta sessão com segurança</small></div><b>›</b></button></div><button className="profile-home" onClick={() => { setUtilityPanel(null); setScreen("dashboard"); }}>Voltar para minha conta</button></section></div>}
      {pixReceipt && <div className="modal-backdrop receipt-result-backdrop" role="presentation" onMouseDown={() => setPixReceipt(null)}><section className="receipt-result-modal" role="dialog" aria-modal="true" aria-labelledby="pix-receipt-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>COMPROVANTE PIX</span><h2 id="pix-receipt-title">Transferência concluída</h2></div><button onClick={() => setPixReceipt(null)} aria-label="Fechar comprovante">×</button></header><div className="receipt-success-mark">✓</div><strong className="receipt-result-amount">{money.format(pixReceipt.amount)}</strong><p>Enviado para <b>{pixReceipt.recipientName}</b></p><dl><div><dt>Conta de destino</dt><dd>{pixReceipt.recipientAccount}</dd></div><div><dt>Chave Pix</dt><dd>{pixReceipt.maskedPixKey}</dd></div><div><dt>Data e hora</dt><dd>{new Date(pixReceipt.timestamp).toLocaleString("pt-BR")}</dd></div><div><dt>Identificador</dt><dd>{pixReceipt.transferId}</dd></div><div><dt>Idempotência</dt><dd>{pixReceipt.idempotencyKey}</dd></div><div><dt>Status</dt><dd>{pixReceipt.status === "COMPLETED" ? "Concluído" : pixReceipt.status}</dd></div></dl><button className="receipt-result-done" onClick={() => setPixReceipt(null)}>Concluir</button></section></div>}
      {flowHistoryOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setFlowHistoryOpen(false)}><section className="flow-history-modal" role="dialog" aria-modal="true" aria-labelledby="flow-history-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>RANFLOW · EXECUÇÕES PERSISTIDAS</span><h2 id="flow-history-title">Histórico de automações</h2></div><button onClick={() => setFlowHistoryOpen(false)} aria-label="Fechar histórico">×</button></header>{flowHistoryLoading ? <div className="analysis-loading"><i/><p>Carregando execuções…</p></div> : flowHistory.length ? <div className="flow-history-list">{flowHistory.map((flow) => <article key={flow.id}><div><span>{flow.flowType === "PIX_SETTLEMENT" ? "PIX" : "INCIDENTE"}</span><strong>{flow.flowType === "PIX_SETTLEMENT" ? "Liquidação Pix" : "Resposta a incidente"}</strong><small>{new Date(flow.startedAt).toLocaleString("pt-BR")}</small></div><b>{flow.status === "COMPLETED" ? "CONCLUÍDO" : flow.status}</b><p>{flow.steps.length} etapas · gatilho {flow.triggerType}{flow.referenceId ? ` · ref. ${flow.referenceId.slice(0,8)}` : ""}</p></article>)}</div> : <div className="empty-notifications"><strong>Nenhuma execução registrada</strong><p>Execute uma automação ou faça um Pix para alimentar o histórico.</p></div>}</section></div>}
      {adminInsightsOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setAdminInsightsOpen(false)}><section className="admin-insights-modal" role="dialog" aria-modal="true" aria-labelledby="admin-insights-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>RANBANK BI · ACESSO ADMINISTRATIVO</span><h2 id="admin-insights-title">Insights da operação</h2></div><button onClick={() => setAdminInsightsOpen(false)} aria-label="Fechar insights">×</button></header>{adminInsightsLoading ? <div className="analysis-loading"><i/><p>Agregando dados do banco…</p></div> : adminInsights ? <><div className="admin-insights-grid"><article><span>Contas ativas</span><strong>{adminInsights.activeAccounts}</strong><small>{adminInsights.totalAccounts} registros preservados</small></article><article><span>Depósitos</span><strong>{money.format(adminInsights.totalDeposits)}</strong><small>saldo agregado</small></article><article><span>Pix</span><strong>{adminInsights.pixTransfers}</strong><small>transferências concluídas</small></article><article><span>Movimentações</span><strong>{adminInsights.totalTransactions}</strong><small>{money.format(adminInsights.transactionVolume)} em volume</small></article><article><span>Alertas pendentes</span><strong>{adminInsights.unreadNotifications}</strong><small>notificações não lidas</small></article><article><span>RanFlow</span><strong>{adminInsights.flowExecutions}</strong><small>execuções persistidas</small></article></div><p className="admin-generated">Atualizado em {new Date(adminInsights.generatedAt).toLocaleString("pt-BR")}</p></> : <div className="analysis-error"><strong>Acesso indisponível</strong><p>Este painel exige uma conta administradora.</p></div>}</section></div>}
      {pixOpen && pixStep === "review" && <div className="modal-backdrop pin-confirmation-backdrop" role="presentation" onMouseDown={() => { setPixOpen(false); setPixStep("details"); setTransactionPin(""); }}><section className="pin-confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="pin-confirmation-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>CONFIRMAÇÃO SEGURA</span><h2 id="pin-confirmation-title">Revise sua transferência</h2></div><button onClick={() => { setPixOpen(false); setPixStep("details"); setTransactionPin(""); }} aria-label="Fechar">×</button></header><div className="transfer-review"><article><span>DESTINATÁRIO</span><strong>{pixRecipient?.name ?? "Destinatário validado"}</strong><small>{pixRecipient?.maskedKey} · conta {pixRecipient?.accountNumber}</small></article><article><span>VALOR</span><strong>{money.format(parseMoneyInput(amount))}</strong></article></div><div className="transaction-security-note"><b>4</b><p><strong>Segunda camada de proteção</strong><br/>Digite a senha de quatro dígitos do cartão para autorizar.</p></div><form onSubmit={sendPix}><label className="transaction-pin-field"><span>Senha do cartão</span><input type="password" value={transactionPin} onChange={(event) => setTransactionPin(event.target.value.replace(/\D/g, "").slice(0,4))} inputMode="numeric" pattern="[0-9]*" autoComplete="off" maxLength={4} placeholder="••••" aria-label="Senha de quatro dígitos do cartão"/></label><div className="transaction-pin-dots" aria-label={`${transactionPin.length} de 4 dígitos informados`}>{[0,1,2,3].map((index) => <i key={index} className={index < transactionPin.length ? "filled" : ""}/>)}</div><div className="numeric-keypad transaction-keypad" aria-label="Teclado da senha do cartão">{["1","2","3","4","5","6","7","8","9"].map((digit) => <button key={digit} type="button" onClick={() => appendTransactionDigit(digit)}>{digit}</button>)}<span aria-hidden="true"/><button type="button" onClick={() => appendTransactionDigit("0")}>0</button><button className="erase-key" type="button" onClick={() => setTransactionPin((current) => current.slice(0,-1))} aria-label="Apagar último dígito da senha">⌫</button></div>{pixStatus === "error" && <p className="form-error" role="alert">{pixError}</p>}{pixStatus === "success" && <p className="transfer-success">Transferência concluída nas duas contas ✓</p>}<div className="pin-confirmation-actions"><button type="button" onClick={() => { setPixStep("details"); setTransactionPin(""); setPixError(""); setPixStatus("idle"); }}>← Corrigir dados</button><button type="submit" className="authorize-transfer" disabled={pixStatus === "sending" || transactionPin.length !== 4}>{pixStatus === "sending" ? "Autorizando…" : pixStatus === "success" ? "Concluída ✓" : "Autorizar transferência"}</button></div></form><footer>Conta demo: PIN transacional <b>7314</b></footer></section></div>}
      <BankingSuite open={bankingOpen} initialTab={bankingTab} onClose={() => setBankingOpen(false)} onChanged={loadDashboard} />
      <InnovationHub open={innovationOpen} initialTab={innovationTab} onClose={() => setInnovationOpen(false)} />
      <AccountManagementModal open={accountManagementOpen} onClose={() => setAccountManagementOpen(false)} />
      <PixKeysModal open={pixKeysOpen} onClose={() => setPixKeysOpen(false)} />
    </main>
  );
}

