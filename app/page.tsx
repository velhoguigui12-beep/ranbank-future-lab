"use client";

import { useEffect, useState } from "react";

type DashboardData = {
  customerName: string;
  balance: number;
  account: string;
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
  transactions: [
    { id: 1, title: "Pix recebido", detail: "Maria Silva Â· hoje, 09:41", amount: 250, type: "credit" },
    { id: 2, title: "TransferÃªncia enviada", detail: "JoÃ£o Pereira Â· hoje, 08:15", amount: -120, type: "debit" },
    { id: 3, title: "Pagamento", detail: "Supermercado Bom PreÃ§o Â· ontem, 19:32", amount: -89.9, type: "debit" },
    { id: 4, title: "Compra no cartÃ£o", detail: "Livraria Cultura Â· ontem, 16:20", amount: -45.6, type: "debit" },
  ],
};

const technologies = [
  { icon: "IA", title: "IA e fraudes", text: "Identifique padrÃµes suspeitos e entenda cada sinal de risco." },
  { icon: "BD", title: "Big Data", text: "Transforme grandes volumes de eventos em decisÃµes visuais." },
  { icon: "IoT", title: "Dispositivos", text: "Veja como celulares, caixas e sensores trocam informaÃ§Ãµes." },
  { icon: "â˜", title: "Nuvem", text: "Simule disponibilidade, cÃ³pias e recuperaÃ§Ã£o de serviÃ§os." },
  { icon: "â†¯", title: "AutomaÃ§Ã£o", text: "Acompanhe um fluxo de resposta a incidentes inspirado no n8n." },
  { icon: "â™§", title: "Sustentabilidade", text: "Otimize energia, emissÃµes e capacidade da infraestrutura." },
  { icon: "â‰‹", title: "Comparar", text: "Descubra qual tecnologia atende melhor a cada objetivo e contexto." },
  { icon: "âŒ¾", title: "CiberseguranÃ§a", text: "Simule malwares e acompanhe as camadas de defesa em aÃ§Ã£o." },
  { icon: "â—‰", title: "RA e VR", text: "Compare orientaÃ§Ã£o aumentada e treinamento virtual imersivo." },
  { icon: "R2", title: "RobÃ³tica", text: "Acompanhe sensores, decisÃµes e movimentos de um robÃ´ assistente." },
  { icon: "ID", title: "AutenticaÃ§Ã£o", text: "Combine senha, cÃ³digo, biometria e contexto para proteger o acesso." },
];

const presentationSlides = [
  { chapter: "1 Â· CONTEXTO", icon: "R", title: "Um banco que tambÃ©m ensina", text: "O Ranbank combina serviÃ§os bancÃ¡rios digitais com experiÃªncias curtas sobre tecnologias emergentes e seguranÃ§a.", talk: "Apresente a arquitetura: interface React, backend Java e banco H2.", points: ["Front-end React", "Backend Java", "Banco H2"] },
  { chapter: "2 Â· SEGURANÃ‡A", icon: "!", title: "ProteÃ§Ã£o em vÃ¡rias camadas", text: "ValidaÃ§Ã£o do Pix, anÃ¡lise de fraude, dispositivos confiÃ¡veis e cenÃ¡rios de malware mostram que seguranÃ§a depende de vÃ¡rias barreiras.", talk: "Abra o Pix ou a Central de CiberseguranÃ§a para demonstrar uma defesa.", points: ["PrevenÃ§Ã£o", "DetecÃ§Ã£o", "Resposta"] },
  { chapter: "3 Â· DADOS", icon: "BD", title: "Dados apoiam decisÃµes", text: "O Big Data agrega movimentaÃ§Ãµes e a IA transforma sinais em uma recomendaÃ§Ã£o explicÃ¡vel, sempre com limites claros.", talk: "Destaque como os sinais formam uma pontuaÃ§Ã£o explicÃ¡vel e apoiam a decisÃ£o humana.", points: ["Coleta", "AnÃ¡lise", "ExplicaÃ§Ã£o"] },
  { chapter: "4 Â· CONECTIVIDADE", icon: "IoT", title: "Do dispositivo Ã  nuvem", text: "IoT, computaÃ§Ã£o em nuvem e automaÃ§Ã£o conectam eventos, serviÃ§os redundantes e respostas rÃ¡pidas a incidentes.", talk: "Mostre como um alerta percorre diferentes tecnologias, em vez de apresentar cada uma isoladamente.", points: ["Sensores", "Nuvem", "Workflow"] },
  { chapter: "5 Â· EXPERIÃŠNCIA", icon: "XR", title: "Novas formas de interaÃ§Ã£o", text: "RA, VR e robÃ³tica demonstram orientaÃ§Ã£o contextual, treinamento imersivo e interaÃ§Ã£o entre sistemas digitais e o mundo fÃ­sico.", talk: "Compare o benefÃ­cio com a limitaÃ§Ã£o: privacidade, custo, acessibilidade e supervisÃ£o humana.", points: ["RA e VR", "RobÃ³tica", "Acessibilidade"] },
  { chapter: "6 Â· CONCLUSÃƒO", icon: "âœ“", title: "Tecnologia precisa de propÃ³sito", text: "NÃ£o existe uma tecnologia melhor para tudo. A escolha depende do problema, do custo, dos riscos e das pessoas envolvidas.", talk: "Finalize abrindo o comparador e convide o pÃºblico a escolher um objetivo.", points: ["Contexto", "Responsabilidade", "Impacto"] },
];

function answerLocally(message: string) {
  const normalized = message.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const has = (...terms: string[]) => terms.some((term) => normalized.includes(term));
  if (["oi", "ola", "opa", "bom dia", "boa tarde", "boa noite"].includes(normalized)) return { topic: "Boas-vindas", text: "OlÃ¡! Posso explicar Pix, seguranÃ§a digital, IA, Big Data, nuvem, automaÃ§Ã£o, IoT, robÃ³tica, realidade aumentada e realidade virtual. O que vocÃª quer conhecer?" };
  if (["ajuda", "menu", "assuntos"].includes(normalized) || has("o que posso perguntar", "quais assuntos")) return { topic: "Ajuda", text: "Pergunte sobre o Ranbank, Pix, golpes, malware, autenticaÃ§Ã£o, IA, Big Data, Java, banco de dados, nuvem, IoT, automaÃ§Ã£o, sustentabilidade, robÃ³tica, RA ou VR." };
  if (has("phishing", "golpe", "link suspeito")) return { topic: "SeguranÃ§a", text: "Phishing tenta obter senhas ou dados por engano. Verifique o remetente e o domÃ­nio, evite links inesperados e nunca compartilhe cÃ³digos de autenticaÃ§Ã£o." };
  if (has("malware", "virus", "ransomware", "trojan")) return { topic: "Malware", text: "Malware Ã© um software malicioso. AtualizaÃ§Ãµes, backups, antivÃ­rus, permissÃµes mÃ­nimas e cuidado com downloads ajudam a reduzir o risco." };
  if (has("pix", "chave", "transferencia", "saldo")) return { topic: "Pix", text: "O backend valida a chave Pix, confere o saldo, registra a movimentaÃ§Ã£o no banco H2 e atualiza o painel imediatamente." };
  if (has("fraude", "risco", "transacao suspeita")) return { topic: "Fraudes", text: "A anÃ¡lise combina valor, dispositivo, localizaÃ§Ã£o e horÃ¡rio. Cada sinal contribui para uma pontuaÃ§Ã£o explicÃ¡vel que apoia a decisÃ£o." };
  if (has("inteligencia artificial", "machine learning", "chatbot") || normalized.split(" ").includes("ia")) return { topic: "InteligÃªncia Artificial", text: "A IA reconhece padrÃµes, apoia a detecÃ§Ã£o de fraude e facilita o atendimento. Neste assistente, uma base local responde aos principais temas da apresentaÃ§Ã£o." };
  if (has("big data", "dados", "analytics")) return { topic: "Big Data", text: "Big Data reÃºne e processa grandes volumes de eventos para encontrar padrÃµes, produzir mÃ©tricas e apoiar decisÃµes." };
  if (has("java", "spring", "backend", "frontend", "banco de dados", "h2")) return { topic: "Arquitetura", text: "O frontend React apresenta a interface; o backend Java com Spring Boot aplica regras e oferece APIs; o H2 armazena as informaÃ§Ãµes da aplicaÃ§Ã£o." };
  if (has("iot", "internet das coisas", "dispositivo")) return { topic: "IoT", text: "IoT conecta dispositivos que enviam telemetria. O Ranbank mostra localizaÃ§Ã£o, Ãºltimo acesso, confianÃ§a e aÃ§Ãµes de bloqueio." };
  if (has("nuvem", "cloud", "redundancia", "failover")) return { topic: "Nuvem", text: "A redundÃ¢ncia mantÃ©m serviÃ§os em regiÃµes diferentes. Se a principal falha, o trÃ¡fego pode ser redirecionado para preservar a disponibilidade." };
  if (has("automacao", "n8n", "workflow")) return { topic: "AutomaÃ§Ã£o", text: "A automaÃ§Ã£o recebe alertas, reÃºne contexto, aplica regras, pede validaÃ§Ã£o humana e registra o incidente." };
  if (has("energia", "sustentavel", "sustentabilidade", "green it")) return { topic: "Sustentabilidade", text: "Green IT busca reduzir energia, emissÃµes e desperdÃ­cio por meio de software, infraestrutura eficiente e melhor uso da nuvem." };
  if (has("robotica", "robo")) return { topic: "RobÃ³tica", text: "RobÃ³tica combina sensores, software e atuadores para perceber, decidir e agir, mantendo supervisÃ£o humana nas decisÃµes importantes." };
  if (has("realidade aumentada", "realidade virtual", "imersiva") || normalized.split(" ").some((word) => word === "ra" || word === "vr")) return { topic: "Tecnologias imersivas", text: "RA acrescenta informaÃ§Ãµes ao ambiente real; VR cria um ambiente digital imersivo para treinamento e experiÃªncias." };
  return { topic: "Assistente local", text: "Digite â€˜ajudaâ€™ para ver os assuntos disponÃ­veis ou pergunte sobre seguranÃ§a, Pix, IA, Big Data, IoT, nuvem, automaÃ§Ã£o, sustentabilidade, robÃ³tica, RA ou VR." };
}

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

export default function Home() {
  const [data, setData] = useState(demoData);
  const [screen, setScreen] = useState<"dashboard" | "lab">("dashboard");
  const [utilityPanel, setUtilityPanel] = useState<"account" | "cards" | "security" | "notifications" | "profile" | null>(null);
  const [cardBlocked, setCardBlocked] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [pixOpen, setPixOpen] = useState(false);
  const [pixKey, setPixKey] = useState("");
  const [amount, setAmount] = useState("");
  const [pixStatus, setPixStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [pixError, setPixError] = useState("");
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
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMode, setChatMode] = useState<"LOCAL" | "OPENAI" | "LOCAL_FALLBACK">("LOCAL");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: "OlÃ¡! Posso explicar as tecnologias e os recursos de seguranÃ§a do Ranbank.", topic: "Boas-vindas" },
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
  const [presentationOpen, setPresentationOpen] = useState(false);
  const [presentationStep, setPresentationStep] = useState(0);
  const [authentication, setAuthentication] = useState<AuthenticationResult | null>(null);
  const [authenticationOpen, setAuthenticationOpen] = useState(false);
  const [authenticationLoading, setAuthenticationLoading] = useState(false);
  const [resettingDemo, setResettingDemo] = useState(false);

  const loadDashboard = async () => {
    try {
      const response = await fetch(`${API_BASE}/dashboard`);
      if (!response.ok) throw new Error("Backend indisponÃ­vel");
      const dashboard: DashboardData = await response.json();
      setData(dashboard);
      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const sendPix = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPixStatus("sending");
    setPixError("");
    try {
      const response = await fetch(`${API_BASE}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pixKey, amount: Number(amount.replace(",", ".")) }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "NÃ£o foi possÃ­vel registrar o Pix." }));
        throw new Error(error.message);
      }
      await loadDashboard();
      setPixStatus("success");
      setPixKey("");
      setAmount("");
      setTimeout(() => { setPixOpen(false); setPixStatus("idle"); }, 900);
    } catch (error) {
      setPixError(error instanceof Error ? error.message : "NÃ£o foi possÃ­vel registrar o Pix.");
      setPixStatus("error");
    }
  };

  const analyzeSuspiciousTransaction = async () => {
    setAnalysisLoading(true);
    setAnalysisOpen(true);
    try {
      const response = await fetch(`${API_BASE}/fraud/analyze`, {
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
      const response = await fetch(`${API_BASE}/analytics/summary`);
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
      const response = await fetch(`${API_BASE}/devices`);
      if (!response.ok) throw new Error();
      setDevices(await response.json());
    } catch {
      setDevices([]);
    } finally {
      setDevicesLoading(false);
    }
  };

  const toggleDevice = async (id: number) => {
    const response = await fetch(`${API_BASE}/devices/${id}/block`, { method: "PATCH" });
    if (response.ok) {
      const updated: ConnectedDevice = await response.json();
      setDevices((current) => current.map((device) => device.id === id ? updated : device));
    }
  };

  const requestCloudStatus = async (path = "/status", method = "GET") => {
    setCloudLoading(true);
    try {
      const response = await fetch(`${API_BASE}/cloud${path}`, { method });
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
      const response = await fetch(`${API_BASE}/automation/run`, { method: "POST" });
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
      const response = await fetch(`${API_BASE}/chat`, {
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
      const response = await fetch(`${API_BASE}/sustainability/${optimize ? "optimize" : "status"}`, { method: optimize ? "POST" : "GET" });
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
      const response = await fetch(`${API_BASE}/comparison?goal=${goal}`);
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
      const response = await fetch(`${API_BASE}/security/simulate?threat=${scenario}`);
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
      const response = await fetch(`${API_BASE}/immersive?mode=${mode}`);
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
      const response = await fetch(`${API_BASE}/robotics/mission?type=${type}`);
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
      const response = await fetch(`${API_BASE}/authentication/simulate?scenario=${scenario}`, { method: "POST" });
      if (!response.ok) throw new Error();
      setAuthentication(await response.json());
    } catch {
      setAuthentication(null);
    } finally {
      setAuthenticationLoading(false);
    }
  };

  const resetDemo = async () => {
    if (!window.confirm("Restaurar saldo, movimentaÃ§Ãµes e dispositivos da demonstraÃ§Ã£o?")) return;
    setResettingDemo(true);
    try {
      const response = await fetch(`${API_BASE}/demo/reset`, { method: "POST" });
      if (!response.ok) throw new Error();
      await loadDashboard();
      setDevices([]);
      setAnalytics(null);
      window.alert("DemonstraÃ§Ã£o restaurada.");
    } catch {
      window.alert("NÃ£o foi possÃ­vel restaurar. Verifique se o backend estÃ¡ ligado.");
    } finally {
      setResettingDemo(false);
    }
  };

  return (
    <main className="bank-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => { setScreen("dashboard"); setUtilityPanel(null); }} aria-label="Ir para o inÃ­cio">
          <img className="brand-logo" src="/ranbank-logo.jpeg" alt="Ranbank" />
        </button>

        <nav aria-label="NavegaÃ§Ã£o principal">
          <button className={screen === "dashboard" ? "active" : ""} onClick={() => setScreen("dashboard")}><span>âŒ‚</span> InÃ­cio</button>
          <button className={utilityPanel === "account" ? "active" : ""} onClick={() => setUtilityPanel("account")}><span>â–¤</span> Conta</button>
          <button className={utilityPanel === "cards" ? "active" : ""} onClick={() => setUtilityPanel("cards")}><span>â–­</span> CartÃµes</button>
          <button className={utilityPanel === "security" ? "active" : ""} onClick={() => setUtilityPanel("security")}><span>â™¢</span> SeguranÃ§a</button>
          <button className={screen === "lab" ? "active" : ""} onClick={() => setScreen("lab")}><span>âš—</span> Future Lab</button>
        </nav>

        <div className="sidebar-status">
          <span className={backendOnline ? "status-online" : ""} />
          <div><strong>{backendOnline ? "Java conectado" : "Modo demonstraÃ§Ã£o"}</strong><small>{backendOnline ? "API local ativa" : "Dados locais seguros"}</small></div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p>{screen === "dashboard" ? "VisÃ£o geral" : "LaboratÃ³rio de inovaÃ§Ã£o"}</p>
            <h1>{screen === "dashboard" ? `OlÃ¡, ${data.customerName.split(" ")[0]}` : "Future Lab"}</h1>
          </div>
          <div className="top-actions"><button className="notification-trigger" onClick={() => setUtilityPanel("notifications")} aria-label="NotificaÃ§Ãµes">â™§{!notificationsRead && <i/>}</button><button className="avatar" onClick={() => setUtilityPanel("profile")} aria-label="Perfil de Ana Ribeiro">AR</button></div>
        </header>

        {screen === "dashboard" ? (
          <div className="dashboard-grid">
            <div className="dashboard-main">
              <article className="balance-card">
                <div className="balance-copy"><small>Saldo em conta</small><strong>{money.format(data.balance)}</strong><span>Conta â€¢â€¢â€¢â€¢ {data.account}</span></div>
                <div className="balance-r" aria-hidden="true">R</div>
              </article>

              <div className="quick-actions" aria-label="AÃ§Ãµes rÃ¡pidas">
                {[ ["â—†", "Pix"], ["â‡„", "Transferir"], ["â–¥", "Pagar"], ["â–­", "CartÃµes"] ].map(([icon, label]) => (
                  <button key={label} onClick={() => label === "Pix" ? setPixOpen(true) : label === "CartÃµes" ? setUtilityPanel("cards") : undefined}><span>{icon}</span>{label}</button>
                ))}
              </div>

              <article className="transactions-panel">
                <div className="panel-title"><div><p>Conta digital</p><h2>MovimentaÃ§Ãµes recentes</h2></div><button>Ver todas</button></div>
                <div className="transaction-list">
                  {data.transactions.map((transaction) => (
                    <div className="transaction" key={transaction.id}>
                      <span className="transaction-icon">{transaction.type === "credit" ? "â†“" : "â†‘"}</span>
                      <div><strong>{transaction.title}</strong><small>{transaction.detail}</small></div>
                      <b className={transaction.type}>{transaction.amount > 0 ? "+ " : "- "}{money.format(Math.abs(transaction.amount))}</b>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <aside className="future-card">
              <div className="future-heading"><span>FUTURE LAB</span><small>DemonstraÃ§Ã£o educacional</small></div>
              <h2>Tecnologia que protege o seu futuro.</h2>
              <p>Explore como IA, dados, nuvem e automaÃ§Ã£o podem atuar em uma experiÃªncia bancÃ¡ria.</p>
              <div className="future-visual" aria-hidden="true"><span>IA</span><span>BD</span><span>IoT</span><i /></div>
              <button onClick={() => setScreen("lab")}>Acessar Future Lab <span>â†’</span></button>
            </aside>
          </div>
        ) : (
          <div className="lab-layout">
            <div className="lab-intro"><div><span className="lab-tag">TECNOLOGIAS EMERGENTES NA PRÃTICA</span><h2>Experimente antes de apenas ouvir.</h2><div className="lab-intro-actions"><button className="start-presentation" onClick={() => { setPresentationStep(0); setPresentationOpen(true); }}>â–¶ Iniciar apresentaÃ§Ã£o guiada</button><button className="reset-demo" disabled={resettingDemo} onClick={resetDemo}>{resettingDemo ? "Restaurandoâ€¦" : "â†» Restaurar ambiente"}</button></div></div><p>Explore aplicaÃ§Ãµes, benefÃ­cios, riscos e decisÃµes humanas em cada tecnologia.</p></div>
            <div className="technology-grid">
              {technologies.map((tech) => <button className={`technology-card ${tech.title === "Comparar" ? "comparison-card" : ""}`} key={tech.title} onClick={() => tech.title === "Big Data" ? openAnalytics() : tech.title === "Dispositivos" ? loadDevices() : tech.title === "Nuvem" ? openCloud() : tech.title === "AutomaÃ§Ã£o" ? runAutomation() : tech.title === "Sustentabilidade" ? openSustainability() : tech.title === "Comparar" ? loadComparison() : tech.title === "CiberseguranÃ§a" ? simulateThreat() : tech.title === "RA e VR" ? loadImmersive() : tech.title === "RobÃ³tica" ? loadRobotMission() : tech.title === "AutenticaÃ§Ã£o" ? simulateAuthentication() : undefined}><span>{tech.icon}</span><h3>{tech.title}</h3><p>{tech.text}</p><b>{tech.title !== "IA e fraudes" ? "Abrir painel â†’" : "Use o cenÃ¡rio abaixo â†’"}</b></button>)}
            </div>
            <div className="risk-panel">
              <div className="risk-score"><span>NÃ­vel de risco</span><div><strong>68</strong><small>/100</small></div><b>MÃ‰DIO</b></div>
              <div className="risk-chart"><div className="panel-title"><div><p>IA E BIG DATA</p><h2>AnÃ¡lise de transaÃ§Ã£o</h2></div><span className="live-pill">â— cenÃ¡rio preparado</span></div><div className="bars" aria-label="GrÃ¡fico de risco"><i style={{height:"28%"}}/><i style={{height:"46%"}}/><i style={{height:"38%"}}/><i style={{height:"64%"}}/><i style={{height:"52%"}}/><i style={{height:"82%"}}/><i style={{height:"68%"}}/></div><div className="suspicious"><span>!</span><div><strong>Compra fora do padrÃ£o</strong><small>Novo dispositivo Â· R$ 2.950,00 Â· BrasÃ­lia, DF</small></div><button onClick={analyzeSuspiciousTransaction}>Analisar agora</button></div></div>
            </div>
          </div>
        )}
      </section>

      <button className="assistant-button" onClick={() => setAssistantOpen(!assistantOpen)}><span>âœ¦</span> Assistente</button>
      {assistantOpen && <aside className="assistant-panel" aria-label="Assistente educacional Ranbank"><div className="assistant-header"><span className="assistant-icon">R</span><div><strong>Assistente Ranbank</strong><small className={`assistant-mode mode-${chatMode.toLowerCase()}`}>{chatMode === "OPENAI" ? "IA conectada Â· OpenAI API" : chatMode === "LOCAL_FALLBACK" ? "API indisponÃ­vel Â· modo local" : "Modo local Â· conteÃºdo educacional"}</small></div><button onClick={() => setAssistantOpen(false)} aria-label="Fechar assistente">Ã—</button></div><div className="chat-messages" aria-live="polite">{chatMessages.map((message,index) => <article key={index} className={`chat-${message.role}`}>{message.topic && <span>{message.topic}</span>}<p>{message.text}</p></article>)}{chatLoading && <article className="chat-assistant chat-typing" aria-label="Assistente digitando"><i/><i/><i/></article>}</div><div className="chat-suggestions"><button onClick={() => sendChatMessage("Oi")}>Dizer oi</button><button onClick={() => sendChatMessage("O que Ã© phishing?")}>Phishing</button><button onClick={() => sendChatMessage("O que posso perguntar?")}>Ver assuntos</button></div><form className="chat-form" onSubmit={(event) => { event.preventDefault(); sendChatMessage(); }}><input value={chatInput} maxLength={300} onChange={(event) => setChatInput(event.target.value)} placeholder="Digite sua perguntaâ€¦" aria-label="Pergunta para o assistente"/><button type="submit" disabled={chatLoading || !chatInput.trim()} aria-label="Enviar pergunta">â†’</button></form><footer>ConteÃºdo educacional Â· nÃ£o fornece orientaÃ§Ã£o financeira</footer></aside>}
      {pixOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setPixOpen(false)}><section className="pix-modal" role="dialog" aria-modal="true" aria-labelledby="pix-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>PIX DEMONSTRATIVO</span><h2 id="pix-title">Enviar um Pix</h2></div><button onClick={() => setPixOpen(false)} aria-label="Fechar">Ã—</button></header><div className="education-note"><b>i</b><p><strong>OperaÃ§Ã£o educacional</strong><br/>Nenhum dinheiro real serÃ¡ movimentado.</p></div><form onSubmit={sendPix}><label>Chave Pix<input value={pixKey} onChange={(event) => setPixKey(event.target.value)} placeholder="CPF, celular, e-mail ou chave aleatÃ³ria" required /><small className="field-help">Celular com DDD Â· CPF com 11 dÃ­gitos Â· chave aleatÃ³ria no formato UUID</small></label><label>Valor disponÃ­vel: {money.format(data.balance)}<input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0,00" inputMode="decimal" required /></label>{pixStatus === "error" && <p className="form-error">{pixError}</p>}<button className="confirm-pix" disabled={pixStatus === "sending"}>{pixStatus === "sending" ? "Validandoâ€¦" : pixStatus === "success" ? "Pix registrado âœ“" : "Confirmar simulaÃ§Ã£o"}</button></form></section></div>}
      {analysisOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setAnalysisOpen(false)}><section className="analysis-modal" role="dialog" aria-modal="true" aria-labelledby="analysis-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>SEGURANÃ‡A EXPLICÃVEL</span><h2 id="analysis-title">Resultado da anÃ¡lise</h2></div><button onClick={() => setAnalysisOpen(false)} aria-label="Fechar">Ã—</button></header>{analysisLoading ? <div className="analysis-loading"><i/><p>Analisando sinais da transaÃ§Ã£oâ€¦</p></div> : analysis ? <><div className={`analysis-summary level-${analysis.level.toLowerCase()}`}><div><strong>{analysis.score}</strong><small>/100</small></div><span>Risco {analysis.level}</span></div><div className="method-label">{analysis.method} Â· resultado demonstrativo</div><div className="signal-list">{analysis.signals.map((signal) => <article key={signal.name}><b>{signal.weight}</b><div><strong>{signal.name}</strong><p>{signal.explanation}</p></div></article>)}</div><div className="recommendation"><span>RecomendaÃ§Ã£o do sistema</span><strong>{analysis.recommendation}</strong></div></> : <div className="analysis-error"><strong>Backend nÃ£o disponÃ­vel</strong><p>Reinicie o Spring Boot para carregar o simulador.</p></div>}</section></div>}
      {analyticsOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setAnalyticsOpen(false)}><section className="analytics-modal" role="dialog" aria-modal="true" aria-labelledby="analytics-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>BIG DATA Â· DADOS DO H2</span><h2 id="analytics-title">InteligÃªncia de movimentaÃ§Ãµes</h2></div><button onClick={() => setAnalyticsOpen(false)} aria-label="Fechar">Ã—</button></header>{analyticsLoading ? <div className="analysis-loading"><i/><p>Agregando movimentaÃ§Ãµesâ€¦</p></div> : analytics ? <><div className="metric-grid"><article><span>Eventos analisados</span><strong>{analytics.totalTransactions}</strong><small>{analytics.creditCount} entradas Â· {analytics.debitCount} saÃ­das</small></article><article><span>Total de entradas</span><strong className="metric-positive">{money.format(analytics.totalIn)}</strong><small>Valores creditados</small></article><article><span>Total de saÃ­das</span><strong>{money.format(analytics.totalOut)}</strong><small>Valores debitados</small></article><article><span>MÃ©dia por saÃ­da</span><strong>{money.format(analytics.averageOut)}</strong><small>Maior: {money.format(analytics.largestOut)}</small></article></div><div className="data-chart"><div><span>VOLUME RELATIVO</span><small>Cada barra representa uma movimentaÃ§Ã£o armazenada</small></div><div className="data-bars">{analytics.series.map((value,index) => { const max = Math.max(...analytics.series.map(Math.abs),1); return <i key={index} className={value >= 0 ? "bar-credit" : "bar-debit"} style={{height:`${Math.max(12, Math.abs(value)/max*100)}%`}} title={money.format(value)}/>; })}</div><div className="chart-legend"><span><i className="legend-credit"/>Entrada</span><span><i className="legend-debit"/>SaÃ­da</span></div></div><div className="data-pipeline"><div><b>1</b><span><strong>Coleta</strong><small>Pix e movimentaÃ§Ãµes</small></span></div><i>â†’</i><div><b>2</b><span><strong>Armazenamento</strong><small>Banco H2</small></span></div><i>â†’</i><div><b>3</b><span><strong>AgregaÃ§Ã£o</strong><small>API Java</small></span></div><i>â†’</i><div><b>4</b><span><strong>VisualizaÃ§Ã£o</strong><small>Painel React</small></span></div></div><p className="analytics-caption">Em um banco real, esse fluxo processaria volumes muito maiores e exigiria infraestrutura distribuÃ­da. Aqui ele foi reduzido para fins didÃ¡ticos.</p></> : <div className="analysis-error"><strong>Backend nÃ£o disponÃ­vel</strong><p>Reinicie o Spring Boot para carregar as estatÃ­sticas.</p></div>}</section></div>}
      {devicesOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setDevicesOpen(false)}><section className="devices-modal" role="dialog" aria-modal="true" aria-labelledby="devices-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>IOT Â· TELEMETRIA DEMONSTRATIVA</span><h2 id="devices-title">Dispositivos conectados</h2></div><button onClick={() => setDevicesOpen(false)} aria-label="Fechar">Ã—</button></header><div className="iot-summary"><div><strong>{devices.filter((device) => !device.blocked).length}</strong><small>ativos</small></div><div><strong>{devices.filter((device) => device.trusted).length}</strong><small>confiÃ¡veis</small></div><div><strong>{devices.filter((device) => device.blocked).length}</strong><small>bloqueados</small></div><p>O banco recebe sinais dos aparelhos e reage quando encontra comportamento fora do padrÃ£o.</p></div>{devicesLoading ? <div className="analysis-loading"><i/><p>Consultando dispositivosâ€¦</p></div> : devices.length ? <div className="device-list">{devices.map((device) => <article key={device.id} className={!device.trusted ? "device-alert" : ""}><span className="device-icon">{device.type === "Celular" ? "â–¯" : device.type === "Computador" ? "â–±" : "IoT"}</span><div><div className="device-name"><strong>{device.name}</strong>{device.blocked ? <b className="blocked-pill">Bloqueado</b> : device.trusted ? <b className="trusted-pill">ConfiÃ¡vel</b> : <b className="alert-pill">Revisar</b>}</div><p>{device.type} Â· {device.location}</p><small>Ãšltimo sinal: {device.lastAccess}</small></div><button className={device.blocked ? "unblock-button" : "block-button"} onClick={() => toggleDevice(device.id)}>{device.blocked ? "Reativar" : "Bloquear"}</button></article>)}</div> : <div className="analysis-error"><strong>Backend nÃ£o disponÃ­vel</strong><p>Reinicie o Spring Boot para carregar os dispositivos.</p></div>}<div className="iot-flow"><span>Dispositivo</span><i>envia telemetria â†’</i><span>API Java</span><i>avalia confianÃ§a â†’</i><span>Resposta</span></div><p className="analytics-caption">Todos os aparelhos e eventos exibidos sÃ£o fictÃ­cios. O mÃ³dulo demonstra o conceito de IoT, nÃ£o monitora equipamentos reais.</p></section></div>}
      {cloudOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setCloudOpen(false)}><section className="cloud-modal" role="dialog" aria-modal="true" aria-labelledby="cloud-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>COMPUTAÃ‡ÃƒO EM NUVEM Â· REDUNDÃ‚NCIA</span><h2 id="cloud-title">Continuidade do Ranbank</h2></div><button onClick={() => setCloudOpen(false)} aria-label="Fechar">Ã—</button></header>{cloudLoading && !cloud ? <div className="analysis-loading"><i/><p>Consultando regiÃµesâ€¦</p></div> : cloud ? <><div className={`cloud-overview ${cloud.failureActive ? "cloud-degraded" : ""}`}><div><span>Status do sistema</span><strong>{cloud.systemStatus}</strong></div><div><span>Disponibilidade</span><strong>{cloud.availability}</strong></div><div><span>RegiÃ£o principal</span><strong>{cloud.activeRegion}</strong></div><button disabled={cloudLoading} onClick={() => requestCloudStatus(cloud.failureActive ? "/restore" : "/simulate-failure", "POST")}>{cloudLoading ? "Processandoâ€¦" : cloud.failureActive ? "Restaurar operaÃ§Ã£o" : "Simular falha"}</button></div><div className="region-grid">{cloud.regions.map((region) => <article key={region.code} className={`region-${region.status.toLowerCase()}`}><div><span className="region-dot"/><small>{region.code}</small></div><h3>{region.name}</h3><b>{region.status}</b><div className="traffic"><span><i style={{width:`${region.trafficPercent}%`}}/></span><small>{region.trafficPercent}% do trÃ¡fego</small></div><p>LatÃªncia: {region.latencyMs || "â€”"} ms</p></article>)}</div><div className="recovery-panel"><span>Linha do tempo de resposta</span>{cloud.timeline.map((step,index) => <article key={`${step.time}-${index}`}><b>{step.time}</b><i/><div><strong>{step.title}</strong><p>{step.description}</p></div></article>)}</div><p className="analytics-caption">SimulaÃ§Ã£o local: nenhuma infraestrutura de nuvem real Ã© acionada. O objetivo Ã© demonstrar failover, health checks e distribuiÃ§Ã£o de trÃ¡fego.</p></> : <div className="analysis-error"><strong>Backend nÃ£o disponÃ­vel</strong><p>Reinicie o Spring Boot para carregar a simulaÃ§Ã£o.</p></div>}</section></div>}
      {automationOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setAutomationOpen(false)}><section className="automation-modal" role="dialog" aria-modal="true" aria-labelledby="automation-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>AUTOMAÃ‡ÃƒO Â· FLUXO INSPIRADO NO N8N</span><h2 id="automation-title">Resposta a incidente</h2></div><button onClick={() => setAutomationOpen(false)} aria-label="Fechar">Ã—</button></header>{automation ? <><div className="automation-run-header"><div><span>INCIDENTE</span><strong>{automation.incidentId}</strong></div><div><span>STATUS</span><strong>{automationRunning ? "EM EXECUÃ‡ÃƒO" : automation.status}</strong></div><button disabled={automationRunning} onClick={runAutomation}>{automationRunning ? "Executandoâ€¦" : "Executar novamente"}</button></div><div className="workflow-canvas">{automation.steps.map((step,index) => <article key={step.order} className={index < visibleAutomationSteps ? "step-visible" : "step-waiting"}><div className="workflow-node"><span>{step.order}</span><div><strong>{step.title}</strong><small>{step.responsibility}</small></div><b>{index < visibleAutomationSteps ? "âœ“" : "â€¦"}</b></div><p>{step.description}</p><footer><span>{step.duration}</span><i>{step.responsibility === "Humano" ? "Ponto de decisÃ£o humana" : "Etapa automÃ¡tica"}</i></footer></article>)}</div><div className="automation-limit"><b>!</b><p><strong>Limite da automaÃ§Ã£o</strong><br/>{automation.limitation}</p></div></> : automationRunning ? <div className="analysis-loading"><i/><p>Iniciando workflowâ€¦</p></div> : <div className="analysis-error"><strong>Backend nÃ£o disponÃ­vel</strong><p>Reinicie o Spring Boot para carregar a automaÃ§Ã£o.</p></div>}</section></div>}
      {sustainabilityOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setSustainabilityOpen(false)}><section className="sustainability-modal" role="dialog" aria-modal="true" aria-labelledby="sustainability-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>GREEN IT Â· EFICIÃŠNCIA ENERGÃ‰TICA</span><h2 id="sustainability-title">Infraestrutura sustentÃ¡vel</h2></div><button onClick={() => setSustainabilityOpen(false)} aria-label="Fechar">Ã—</button></header>{sustainabilityLoading && !sustainability ? <div className="analysis-loading"><i/><p>Medindo consumoâ€¦</p></div> : sustainability ? <><div className={`green-status ${sustainability.optimized ? "green-optimized" : ""}`}><div><span>Estado</span><strong>{sustainability.optimized ? "OTIMIZADO" : "MELHORIAS DISPONÃVEIS"}</strong></div><div><span>Economia simulada</span><strong>{sustainability.savingsPercent}%</strong></div><button disabled={sustainabilityLoading} onClick={() => requestSustainability(true)}>{sustainabilityLoading ? "Calculandoâ€¦" : sustainability.optimized ? "Desfazer otimizaÃ§Ã£o" : "Otimizar infraestrutura"}</button></div><div className="green-metrics"><article><span>Consumo</span><strong>{sustainability.powerKw.toFixed(1)} kW</strong><small>PotÃªncia instantÃ¢nea</small></article><article><span>Energia renovÃ¡vel</span><strong>{sustainability.renewablePercent}%</strong><small>ParticipaÃ§Ã£o na matriz</small></article><article><span>EmissÃµes</span><strong>{sustainability.carbonKgHour.toFixed(1)} kg</strong><small>COâ‚‚ equivalente / hora</small></article><article><span>PUE</span><strong>{sustainability.pue.toFixed(2)}</strong><small>EficiÃªncia do data center</small></article></div><div className="energy-sources"><div><span>COMPOSIÃ‡ÃƒO ENERGÃ‰TICA</span><small>Dados fictÃ­cios para demonstraÃ§Ã£o</small></div>{sustainability.sources.map((source) => <article key={source.name}><div><strong>{source.name}</strong><small>{source.type}</small></div><span><i style={{width:`${source.percentage}%`}}/></span><b>{source.percentage}%</b></article>)}</div><div className="green-actions">{sustainability.actions.map((action,index) => <span key={action}><b>{sustainability.optimized ? "âœ“" : "!"}</b>{action}</span>)}</div><p className="analytics-caption">Os valores sÃ£o simulados. O mÃ³dulo demonstra como software, nuvem e gestÃ£o energÃ©tica podem reduzir desperdÃ­cio e emissÃµes.</p></> : <div className="analysis-error"><strong>Backend nÃ£o disponÃ­vel</strong><p>Reinicie o Spring Boot para carregar as mÃ©tricas.</p></div>}</section></div>}
      {comparisonOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setComparisonOpen(false)}><section className="comparison-modal" role="dialog" aria-modal="true" aria-labelledby="comparison-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>DECISÃƒO TECNOLÃ“GICA Â· CENÃRIO DIDÃTICO</span><h2 id="comparison-title">Qual tecnologia usar?</h2></div><button onClick={() => setComparisonOpen(false)} aria-label="Fechar">Ã—</button></header><div className="goal-tabs" aria-label="Objetivo da comparaÃ§Ã£o"><button className={comparison?.goal === "seguranca" ? "active" : ""} onClick={() => loadComparison("seguranca")}>SeguranÃ§a</button><button className={comparison?.goal === "escala" ? "active" : ""} onClick={() => loadComparison("escala")}>Escala</button><button className={comparison?.goal === "eficiencia" ? "active" : ""} onClick={() => loadComparison("eficiencia")}>EficiÃªncia</button></div>{comparisonLoading && !comparison ? <div className="analysis-loading"><i/><p>Comparando alternativasâ€¦</p></div> : comparison ? <><div className="comparison-heading"><div><span>OBJETIVO SELECIONADO</span><strong>{comparison.goalLabel}</strong></div><small>Ranking contextual, nÃ£o uma regra universal</small></div><div className="comparison-list">{comparison.results.map((technology,index) => <article key={technology.name}><div className="comparison-rank"><b>{index + 1}</b><span className="score-ring" style={{background:`conic-gradient(#20c9ef ${technology.score}%, #18365f 0)`}}><i>{technology.score}</i></span></div><div className="comparison-copy"><h3>{technology.name}</h3><p>{technology.bestUse}</p><div><span>Custo <b>{technology.cost}</b></span><span>Maturidade <b>{technology.maturity}</b></span></div></div><div className="comparison-limit"><span>ATENÃ‡ÃƒO</span><p>{technology.limitation}</p></div></article>)}</div><div className="comparison-disclaimer"><b>i</b><p>{comparison.disclaimer}</p></div></> : <div className="analysis-error"><strong>Backend nÃ£o disponÃ­vel</strong><p>Reinicie o Spring Boot para carregar a comparaÃ§Ã£o.</p></div>}</section></div>}
      {securityOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setSecurityOpen(false)}><section className="security-modal" role="dialog" aria-modal="true" aria-labelledby="security-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>LABORATÃ“RIO SEGURO Â· SIMULAÃ‡ÃƒO</span><h2 id="security-title">Central de CiberseguranÃ§a</h2></div><button onClick={() => setSecurityOpen(false)} aria-label="Fechar">Ã—</button></header><div className="threat-tabs"><button className={threat?.name === "Phishing" ? "active" : ""} onClick={() => simulateThreat("phishing")}>Phishing</button><button className={threat?.name === "Ransomware" ? "active" : ""} onClick={() => simulateThreat("ransomware")}>Ransomware</button><button className={threat?.name === "Trojan bancÃ¡rio" ? "active" : ""} onClick={() => simulateThreat("trojan")}>Trojan</button></div>{securityLoading && !threat ? <div className="analysis-loading"><i/><p>Executando cenÃ¡rio controladoâ€¦</p></div> : threat ? <><div className="threat-overview"><div className="threat-score"><span>RISCO</span><strong>{threat.risk}</strong><small>/100</small></div><div><span>{threat.category}</span><h3>{threat.name}</h3><p>{threat.description}</p></div><b>AMEAÃ‡A CONTIDA</b></div><div className="security-columns"><section><div className="security-section-title"><span>1</span><div><b>Sinais detectados</b><small>O que o sistema observa</small></div></div><div className="indicator-list">{threat.indicators.map((indicator) => <article key={indicator}><span>!</span><p>{indicator}</p></article>)}</div></section><section><div className="security-section-title"><span>2</span><div><b>Resposta em camadas</b><small>Como a defesa reduz o risco</small></div></div><div className="defense-list">{threat.defenses.map((defense,index) => <article key={defense.name}><div><span>{index + 1}</span><i/></div><section><b>{defense.name}</b><p>{defense.result}</p><small className={defense.responsibility}>{defense.responsibility === "humana" ? "DecisÃ£o humana" : "Resposta automÃ¡tica"}</small></section></article>)}</div></section></div><div className="security-note"><b>Importante</b><p>Nenhuma defesa isolada resolve tudo. SeguranÃ§a real combina pessoas, processos, atualizaÃ§Ãµes, autenticaÃ§Ã£o e monitoramento contÃ­nuo.</p></div></> : <div className="analysis-error"><strong>Backend nÃ£o disponÃ­vel</strong><p>Reinicie o Spring Boot para executar os cenÃ¡rios.</p></div>}</section></div>}
      {immersiveOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setImmersiveOpen(false)}><section className="immersive-modal" role="dialog" aria-modal="true" aria-labelledby="immersive-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>TECNOLOGIAS IMERSIVAS Â· DEMONSTRAÃ‡ÃƒO</span><h2 id="immersive-title">Realidade aumentada ou virtual?</h2></div><button onClick={() => setImmersiveOpen(false)} aria-label="Fechar">Ã—</button></header><div className="immersive-tabs"><button className={immersive?.code === "RA" ? "active" : ""} onClick={() => loadImmersive("ar")}><b>RA</b><span>Mundo real + informaÃ§Ã£o</span></button><button className={immersive?.code === "VR" ? "active" : ""} onClick={() => loadImmersive("vr")}><b>VR</b><span>Ambiente totalmente digital</span></button></div>{immersiveLoading && !immersive ? <div className="analysis-loading"><i/><p>Preparando experiÃªnciaâ€¦</p></div> : immersive ? <><div className={`immersive-stage mode-${immersive.code.toLowerCase()}`}><div className="immersive-visual" aria-hidden="true"><div className="scene-building"><span>R</span><i/><i/><i/></div><div className="scene-target"><span>{immersive.code}</span><b>{immersive.code === "RA" ? "OrientaÃ§Ã£o ativa" : "Ambiente simulado"}</b></div><div className="scan-line"/></div><div className="immersive-intro"><span>{immersive.name}</span><h3>{immersive.title}</h3><p>{immersive.definition}</p></div></div><div className="immersive-journey"><span>COMO FUNCIONA NESTE CENÃRIO</span><div>{immersive.steps.map((step,index) => <article key={step}><b>{index + 1}</b><p>{step}</p>{index < immersive.steps.length - 1 && <i>â†’</i>}</article>)}</div></div><div className="immersive-facts"><article><span>EQUIPAMENTO</span><strong>{immersive.equipment}</strong></article><article><span>PONTO FORTE</span><strong>{immersive.strength}</strong></article><article className="immersive-warning"><span>LIMITAÃ‡ÃƒO</span><strong>{immersive.limitation}</strong></article></div><p className="immersive-caption">Esta tela representa o conceito sem acessar cÃ¢mera, sensores ou Ã³culos. Em uma aplicaÃ§Ã£o real, permissÃµes, acessibilidade e proteÃ§Ã£o dos dados do ambiente seriam essenciais.</p></> : <div className="analysis-error"><strong>Backend nÃ£o disponÃ­vel</strong><p>Reinicie o Spring Boot para carregar a experiÃªncia.</p></div>}</section></div>}
      {roboticsOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setRoboticsOpen(false)}><section className="robotics-modal" role="dialog" aria-modal="true" aria-labelledby="robotics-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>ROBÃ“TICA Â· INTERAÃ‡ÃƒO FÃSICA E DIGITAL</span><h2 id="robotics-title">RobÃ´ assistente da agÃªncia</h2></div><button onClick={() => setRoboticsOpen(false)} aria-label="Fechar">Ã—</button></header><div className="robot-missions"><button onClick={() => loadRobotMission("reception")} className={robotMission?.name === "RecepÃ§Ã£o inteligente" ? "active" : ""}>RecepÃ§Ã£o</button><button onClick={() => loadRobotMission("accessibility")} className={robotMission?.name === "Apoio Ã  acessibilidade" ? "active" : ""}>Acessibilidade</button><button onClick={() => loadRobotMission("security")} className={robotMission?.name === "Alerta de seguranÃ§a" ? "active" : ""}>SeguranÃ§a</button></div>{roboticsLoading && !robotMission ? <div className="analysis-loading"><i/><p>Carregando missÃ£oâ€¦</p></div> : robotMission ? <><div className="robot-command"><div className="robot-figure" aria-hidden="true"><div className="robot-head"><i/><i/><span/></div><div className="robot-body"><b>R</b><span/></div><div className="robot-base"/></div><div className="robot-brief"><span>MISSÃƒO ATUAL</span><h3>{robotMission.name}</h3><p>{robotMission.objective}</p><div><span>Autonomia programada</span><b>{robotMission.autonomy}%</b><i><em style={{width:`${robotMission.autonomy}%`}}/></i></div></div><div className="robot-status"><i/> ONLINE<small>Sensores simulados</small></div></div><div className="robot-process"><span>PERCEPÃ‡ÃƒO â†’ DECISÃƒO â†’ AÃ‡ÃƒO</span><div>{robotMission.steps.map((step,index) => <article key={step.title}><div className={`robot-step-icon tech-${step.technology}`}><b>{index + 1}</b><span>{step.technology === "sensor" ? "SENSOR" : step.technology === "ia" ? "IA" : step.technology === "humano" ? "PESSOA" : "AÃ‡ÃƒO"}</span></div><section><strong>{step.title}</strong><p>{step.result}</p></section>{index < robotMission.steps.length - 1 && <i>â€º</i>}</article>)}</div></div><div className="human-handoff"><span>H</span><p><strong>Onde entra o ser humano?</strong><br/>{robotMission.humanRole}</p></div></> : <div className="analysis-error"><strong>Backend nÃ£o disponÃ­vel</strong><p>Reinicie o Spring Boot para iniciar o robÃ´.</p></div>}</section></div>}
      {presentationOpen && <div className="presentation-backdrop" role="presentation"><section className="presentation-modal" role="dialog" aria-modal="true" aria-labelledby="presentation-title" tabIndex={0} onKeyDown={(event) => { if (event.key === "ArrowRight") setPresentationStep((step) => Math.min(presentationSlides.length - 1, step + 1)); if (event.key === "ArrowLeft") setPresentationStep((step) => Math.max(0, step - 1)); if (event.key === "Escape") setPresentationOpen(false); }}><header><div className="presentation-brand"><b>R</b><span>RANBANK<br/><small>ROTEIRO DE APRESENTAÃ‡ÃƒO</small></span></div><div className="presentation-count">{String(presentationStep + 1).padStart(2,"0")} / {String(presentationSlides.length).padStart(2,"0")}</div><button onClick={() => setPresentationOpen(false)} aria-label="Fechar apresentaÃ§Ã£o">Ã—</button></header><div className="presentation-progress"><i style={{width:`${((presentationStep + 1) / presentationSlides.length) * 100}%`}}/></div><div className="presentation-content"><div className="presentation-visual"><span>{presentationSlides[presentationStep].icon}</span><div>{presentationSlides[presentationStep].points.map((point,index) => <i key={point} style={{transform:`rotate(${index * 120}deg) translateY(-82px)`}}><b style={{transform:`rotate(-${index * 120}deg)`}}>{point}</b></i>)}</div></div><article><span>{presentationSlides[presentationStep].chapter}</span><h2 id="presentation-title">{presentationSlides[presentationStep].title}</h2><p>{presentationSlides[presentationStep].text}</p><div className="speaker-note"><b>DICA DE FALA</b><p>{presentationSlides[presentationStep].talk}</p></div></article></div><footer><button disabled={presentationStep === 0} onClick={() => setPresentationStep((step) => Math.max(0, step - 1))}>â† Anterior</button><div>{presentationSlides.map((_,index) => <button key={index} className={index === presentationStep ? "active" : ""} onClick={() => setPresentationStep(index)} aria-label={`Ir para etapa ${index + 1}`}/>)}</div>{presentationStep < presentationSlides.length - 1 ? <button className="presentation-next" onClick={() => setPresentationStep((step) => step + 1)}>PrÃ³ximo â†’</button> : <button className="presentation-next" onClick={() => { setPresentationOpen(false); loadComparison(); }}>Abrir comparador â†’</button>}</footer></section></div>}
      {authenticationOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setAuthenticationOpen(false)}><section className="authentication-modal" role="dialog" aria-modal="true" aria-labelledby="authentication-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>IDENTIDADE DIGITAL Â· DEFESA EM CAMADAS</span><h2 id="authentication-title">AutenticaÃ§Ã£o moderna</h2></div><button onClick={() => setAuthenticationOpen(false)} aria-label="Fechar">Ã—</button></header><div className="auth-scenarios"><button className={authentication?.risk === 14 ? "active" : ""} onClick={() => simulateAuthentication("trusted")}><b>âœ“</b><span>Acesso habitual<small>Aparelho conhecido</small></span></button><button className={authentication?.risk === 82 ? "active danger" : ""} onClick={() => simulateAuthentication("suspicious")}><b>!</b><span>Acesso suspeito<small>Novo contexto</small></span></button></div>{authenticationLoading && !authentication ? <div className="analysis-loading"><i/><p>Verificando identidadeâ€¦</p></div> : authentication ? <><div className={`auth-context ${authentication.risk > 50 ? "auth-danger" : ""}`}><div><span>CONTEXTO OBSERVADO</span><strong>{authentication.context}</strong></div><div className="auth-risk"><span>RISCO</span><b>{authentication.risk}</b><small>/100</small></div></div><div className="auth-factors"><div className="auth-factor-heading"><span>FATORES DE AUTENTICAÃ‡ÃƒO</span><small>Mais de uma evidÃªncia protege melhor que apenas uma senha</small></div>{authentication.factors.map((factor,index) => <article key={factor.name} className={`factor-${factor.status}`}><div><b>{index + 1}</b>{index < authentication.factors.length - 1 && <i/>}</div><section><span>{factor.category}</span><strong>{factor.name}</strong></section><em>{factor.status === "aprovado" ? "APROVADO âœ“" : factor.status === "revisar" ? "REVISAR" : "BLOQUEADO"}</em></article>)}</div><div className={`auth-decision ${authentication.risk > 50 ? "decision-blocked" : ""}`}><span>{authentication.risk > 50 ? "Ã—" : "âœ“"}</span><div><small>DECISÃƒO ADAPTATIVA</small><strong>{authentication.decision}</strong><p>{authentication.explanation}</p></div></div><p className="auth-caption">Biometria e comportamento sÃ£o representados apenas por dados fictÃ­cios. Nenhuma cÃ¢mera, impressÃ£o digital ou informaÃ§Ã£o pessoal Ã© coletada.</p></> : <div className="analysis-error"><strong>Backend nÃ£o disponÃ­vel</strong><p>Reinicie o Spring Boot para executar a autenticaÃ§Ã£o.</p></div>}</section></div>}
      {utilityPanel === "account" && <div className="modal-backdrop" role="presentation" onMouseDown={() => setUtilityPanel(null)}><section className="utility-modal account-utility" role="dialog" aria-modal="true" aria-labelledby="account-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>CONTA DIGITAL</span><h2 id="account-title">Minha conta</h2></div><button onClick={() => setUtilityPanel(null)} aria-label="Fechar">Ã—</button></header><div className="account-summary"><div><span>Saldo disponÃ­vel</span><strong>{money.format(data.balance)}</strong><small>Conta corrente Â· Ag. 0001</small></div><b>â€¢â€¢â€¢â€¢ {data.account}</b></div><div className="account-details"><article><span>Titular</span><strong>{data.customerName}</strong></article><article><span>Tipo de conta</span><strong>Conta digital</strong></article><article><span>Status</span><strong className="status-safe">Ativa e protegida</strong></article><article><span>InstituiÃ§Ã£o</span><strong>Ranbank demonstrativo</strong></article></div><div className="utility-section-title"><span>ÃšLTIMAS MOVIMENTAÃ‡Ã•ES</span><button onClick={() => { setUtilityPanel(null); setScreen("dashboard"); }}>Ver na tela inicial</button></div><div className="compact-transactions">{data.transactions.slice(0,4).map((transaction) => <article key={transaction.id}><span>{transaction.type === "credit" ? "â†“" : "â†‘"}</span><div><strong>{transaction.title}</strong><small>{transaction.detail}</small></div><b className={transaction.type}>{transaction.amount > 0 ? "+ " : "- "}{money.format(Math.abs(transaction.amount))}</b></article>)}</div><p className="utility-caption">Dados fictÃ­cios usados apenas nesta demonstraÃ§Ã£o educacional.</p></section></div>}
      {utilityPanel === "cards" && <div className="modal-backdrop" role="presentation" onMouseDown={() => setUtilityPanel(null)}><section className="utility-modal cards-utility" role="dialog" aria-modal="true" aria-labelledby="cards-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>CARTÃƒO VIRTUAL Â· DEMONSTRAÃ‡ÃƒO</span><h2 id="cards-title">Meus cartÃµes</h2></div><button onClick={() => setUtilityPanel(null)} aria-label="Fechar">Ã—</button></header><div className={`bank-card ${cardBlocked ? "card-is-blocked" : ""}`}><div><img src="/ranbank-logo.jpeg" alt=""/><span>RANBANK PLATINUM</span></div><strong>â€¢â€¢â€¢â€¢ &nbsp;â€¢â€¢â€¢â€¢ &nbsp;â€¢â€¢â€¢â€¢ &nbsp;4821</strong><footer><span>ANA RIBEIRO</span><b>VIRTUAL</b></footer>{cardBlocked && <em>BLOQUEADO</em>}</div><div className="card-metrics"><article><span>Fatura atual</span><strong>{money.format(1248.9)}</strong><small>Fecha em 12 dias</small></article><article><span>Limite disponÃ­vel</span><strong>{money.format(4751.1)}</strong><small>de R$ 6.000,00</small></article></div><button className={`card-toggle ${cardBlocked ? "unlock" : ""}`} onClick={() => setCardBlocked(!cardBlocked)}><span>{cardBlocked ? "âœ“" : "Ã—"}</span><div><strong>{cardBlocked ? "Desbloquear cartÃ£o" : "Bloquear temporariamente"}</strong><small>{cardBlocked ? "Voltar a permitir compras simuladas" : "Impede novas compras na demonstraÃ§Ã£o"}</small></div></button><div className="card-actions"><button onClick={() => window.alert("Dados protegidos: 4821 Â· validade 08/31 Â· CVV oculto")}>â–£ <span>Ver dados</span></button><button onClick={() => window.alert("Fatura fictÃ­cia de R$ 1.248,90")}>â–¤ <span>Ver fatura</span></button><button onClick={() => window.alert("Limite ajustÃ¡vel apenas na versÃ£o demonstrativa")}>â†• <span>Ajustar limite</span></button></div><p className="utility-caption">Este cartÃ£o Ã© fictÃ­cio e nÃ£o realiza compras reais.</p></section></div>}
      {utilityPanel === "security" && <div className="modal-backdrop" role="presentation" onMouseDown={() => setUtilityPanel(null)}><section className="utility-modal security-utility" role="dialog" aria-modal="true" aria-labelledby="security-hub-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>CENTRAL DE PROTEÃ‡ÃƒO</span><h2 id="security-hub-title">SeguranÃ§a da conta</h2></div><button onClick={() => setUtilityPanel(null)} aria-label="Fechar">Ã—</button></header><div className="security-health"><div className="security-shield">âœ“</div><div><span>NÃVEL DE PROTEÃ‡ÃƒO</span><strong>Conta protegida</strong><p>As principais camadas de seguranÃ§a estÃ£o ativas.</p></div><b>92<small>/100</small></b></div><div className="security-settings"><article><span>Biometria</span><strong>Ativada</strong><i className="setting-on"/></article><article><span>AutenticaÃ§Ã£o em dois fatores</span><strong>Ativada</strong><i className="setting-on"/></article><article><span>Avisos de movimentaÃ§Ã£o</span><strong>Ativados</strong><i className="setting-on"/></article><article><span>Dispositivo atual</span><strong>ConfiÃ¡vel</strong><i className="setting-on"/></article></div><div className="security-shortcuts"><button onClick={() => { setUtilityPanel(null); setScreen("lab"); simulateAuthentication(); }}><b>ID</b><span><strong>Testar autenticaÃ§Ã£o</strong><small>Compare acesso habitual e suspeito</small></span><i>â†’</i></button><button onClick={() => { setUtilityPanel(null); setScreen("lab"); simulateThreat(); }}><b>!</b><span><strong>Simular malware</strong><small>Phishing, ransomware e trojan</small></span><i>â†’</i></button><button onClick={() => { setUtilityPanel(null); setScreen("lab"); loadDevices(); }}><b>IoT</b><span><strong>Gerenciar dispositivos</strong><small>ConfianÃ§a, telemetria e bloqueios</small></span><i>â†’</i></button></div></section></div>}
      {utilityPanel === "notifications" && <div className="modal-backdrop utility-side-backdrop" role="presentation" onMouseDown={() => setUtilityPanel(null)}><section className="utility-modal notifications-utility" role="dialog" aria-modal="true" aria-labelledby="notifications-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>CENTRAL DE ALERTAS</span><h2 id="notifications-title">NotificaÃ§Ãµes</h2></div><button onClick={() => setUtilityPanel(null)} aria-label="Fechar">Ã—</button></header><div className="notification-list"><article className={!notificationsRead ? "unread" : ""}><b>âœ“</b><div><strong>Pix protegido</strong><p>As novas validaÃ§Ãµes de saldo e chave estÃ£o ativas.</p><small>Agora</small></div></article><article className={!notificationsRead ? "unread" : ""}><b>!</b><div><strong>Tentativa suspeita simulada</strong><p>Novo dispositivo identificado no Future Lab.</p><small>HÃ¡ 18 minutos</small></div></article><article><b>â˜</b><div><strong>ServiÃ§os disponÃ­veis</strong><p>RegiÃ£o principal da nuvem operando normalmente.</p><small>Hoje, 08:30</small></div></article></div><button className="read-all" onClick={() => setNotificationsRead(true)} disabled={notificationsRead}>{notificationsRead ? "Tudo lido âœ“" : "Marcar todas como lidas"}</button></section></div>}
      {utilityPanel === "profile" && <div className="modal-backdrop utility-side-backdrop" role="presentation" onMouseDown={() => setUtilityPanel(null)}><section className="utility-modal profile-utility" role="dialog" aria-modal="true" aria-labelledby="profile-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>PERFIL DEMONSTRATIVO</span><h2 id="profile-title">Dados da cliente</h2></div><button onClick={() => setUtilityPanel(null)} aria-label="Fechar">Ã—</button></header><div className="profile-hero"><span>AR</span><div><strong>{data.customerName}</strong><small>Cliente Ranbank Future</small></div><b>CONTA ATIVA</b></div><div className="profile-fields"><article><span>E-mail</span><strong>ana.ribeiro@exemplo.com</strong></article><article><span>Telefone</span><strong>(11) â€¢â€¢â€¢â€¢â€¢-4821</strong></article><article><span>Conta</span><strong>Ag. 0001 Â· {data.account}</strong></article><article><span>PreferÃªncia</span><strong>NotificaÃ§Ãµes digitais</strong></article></div><div className="profile-notice"><b>i</b><p>Todos os dados exibidos sÃ£o fictÃ­cios e existem apenas para a apresentaÃ§Ã£o.</p></div><button className="profile-home" onClick={() => { setUtilityPanel(null); setScreen("dashboard"); }}>Voltar para minha conta</button></section></div>}
    </main>
  );
}

