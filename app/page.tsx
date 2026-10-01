"use client";
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, @next/next/no-img-element, @next/next/no-html-link-for-pages -- Modal backdrops intentionally handle clicks; Vinext serves local decorative images directly; the link back to the public site should reload the page. */

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { BankingTab } from "./BankingSuite";
import type { InnovationTab } from "./InnovationHub";
import AuthScreen, { type AuthMode } from "./bank/AuthScreen";
import { apiFetch, clearAccountSession } from "./bank/api";
import { AccountSectionPage, SecuritySectionPage } from "./bank/BankSectionPages";
import { BkLoading, BkSheet, BkUnavailable } from "./bank/BkSheet";
import { LabSheet, type LabId } from "./bank/Labs";
import RaniAssistant, { openRani } from "./RaniAssistant";
import CardCatalog from "./bank/CardCatalog";
import { ownCardFor, OWN_CARD_NAME } from "./bank/cards";
import { transactionDescription, type TransactionView } from "./bank/transactionFormatting";

const BankingSuite = lazy(() => import("./BankingSuite"));
const InnovationHub = lazy(() => import("./InnovationHub"));
const AccountManagementModal = lazy(() => import("./bank/AccountManagementModal"));
const PixKeysModal = lazy(() => import("./bank/PixKeysModal"));

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
  transactions: TransactionView[];
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

type AutomationRun = {
  incidentId: string;
  startedAt: string;
  status: string;
  limitation: string;
  steps: Array<{ order: number; title: string; description: string; responsibility: string; duration: string }>;
};

type AuthUser = { customerName: string; accountNumber: string };
type PixRecipient = { accountId: number; name: string; accountNumber: string; keyType: string; maskedKey: string };
type BankNotification = { id: number; type: string; title: string; message: string; referenceId?: string; createdAt: string; read: boolean };
// Os servidores mandam "R$ 50.00"; na tela mostramos "R$ 50,00".
const formatNoticeMoney = (text: string) => text.replace(/R\$ ?(\d+(?:\.\d{1,2})?)(?!\d)/g, (_, value: string) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value)));
const NOTICE_CHECK_MS = 5000;
type PixReceipt = { transferId: string; transactionId: number; status: string; amount: number; timestamp: string; recipientName: string; recipientAccount: string; maskedPixKey: string; idempotencyKey: string };
type FlowExecution = { id: string; flowType: string; triggerType: string; referenceId?: string; status: string; startedAt: string; completedAt?: string; steps: AutomationRun["steps"] };
type AdminInsights = { generatedAt: string; totalAccounts: number; activeAccounts: number; totalDeposits: number; totalTransactions: number; transactionVolume: number; pixTransfers: number; unreadNotifications: number; flowExecutions: number };
type BankTheme = "light" | "dark";

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
    { id: 4, title: "Pix recebido", detail: "Maria Silva", amount: 250, type: "credit", occurredAt: new Date(Date.now() - 18 * 60_000).toISOString() },
    { id: 3, title: "Transferência enviada", detail: "João Pereira", amount: -120, type: "debit", occurredAt: new Date(Date.now() - 127 * 60_000).toISOString() },
    { id: 2, title: "Pagamento", detail: "Supermercado Bom Preço", amount: -89.9, type: "debit", occurredAt: new Date(Date.now() - 27 * 60 * 60_000).toISOString() },
    { id: 1, title: "Compra no cartão", detail: "Livraria Cultura", amount: -45.6, type: "debit", occurredAt: new Date(Date.now() - 30 * 60 * 60_000).toISOString() },
  ],
};

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const parseMoneyInput = (value: string) => {
  const compact = value.trim().replace(/\s/g, "");
  if (compact.includes(",")) return Number(compact.replace(/\./g, "").replace(",", "."));
  if (/^\d{1,3}(\.\d{3})+$/.test(compact)) return Number(compact.replace(/\./g, ""));
  return Number(compact);
};
const formatMoneyFromDigits = (value: string) => {
  const digits = value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 11);
  const cents = Number(digits || "0");
  return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(cents / 100);
};
type BankIconName = "home" | "pix" | "statement" | "card" | "shield" | "spark" | "bell" | "sun" | "moon" | "eye" | "eyeOff" | "pay" | "transfer" | "schedule" | "chevron" | "help" | "logout" | "chart" | "device" | "cloud" | "leaf" | "brain" | "automation" | "lock" | "user" | "key";

function BankIcon({ name, size = 20 }: { name: BankIconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<BankIconName, React.ReactNode> = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-6h6v6"/></>,
    pix: <><path d="m12 3 3.2 3.2a3.5 3.5 0 0 0 5 0"/><path d="m12 21-3.2-3.2a3.5 3.5 0 0 0-5 0"/><path d="m3 12 3.2-3.2a3.5 3.5 0 0 1 5 0l1.6 1.6a3.5 3.5 0 0 0 5 0L21 7.2"/><path d="m21 12-3.2 3.2a3.5 3.5 0 0 1-5 0l-1.6-1.6a3.5 3.5 0 0 0-5 0L3 16.8"/></>,
    statement: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6"/></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/></>,
    shield: <><path d="M12 3 5 6v5c0 4.8 2.8 8 7 10 4.2-2 7-5.2 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></>,
    spark: <><path d="m12 3 1.4 4.1L17.5 9l-4.1 1.9L12 15l-1.4-4.1L6.5 9l4.1-1.9L12 3Z"/><path d="m18.5 15 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
    moon: <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
    eyeOff: <><path d="m3 3 18 18"/><path d="M10.6 6.2A11.8 11.8 0 0 1 12 6c6.5 0 10 6 10 6a18 18 0 0 1-2.1 2.8M6.6 6.6C3.6 8.3 2 12 2 12s3.5 6 10 6a10 10 0 0 0 4.1-.8"/></>,
    pay: <><path d="M4 5h16v14H4z"/><path d="M7 9h10M7 13h5"/></>,
    transfer: <><path d="M4 7h14M15 4l3 3-3 3M20 17H6M9 14l-3 3 3 3"/></>,
    schedule: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.4 2.2c-.8.4-1.2.8-1.2 1.8M12 17h.01"/></>,
    logout: <><path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9"/></>,
    chart: <><path d="M4 19V9M10 19V5M16 19v-7M22 19V3"/></>,
    device: <><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 18h4"/></>,
    cloud: <path d="M7 18h11a4 4 0 0 0 .5-8A7 7 0 0 0 5 9a4.5 4.5 0 0 0 2 9Z"/>,
    leaf: <><path d="M20 4C10 4 5 9 5 15c0 3 2 5 5 5 6 0 10-6 10-16Z"/><path d="M5 21c2-6 6-9 11-12"/></>,
    brain: <><path d="M9.5 4.5A3 3 0 0 0 5 7v1a3 3 0 0 0-1 5.2A3 3 0 0 0 7 18h2.5V4.5ZM14.5 4.5A3 3 0 0 1 19 7v1a3 3 0 0 1 1 5.2A3 3 0 0 1 17 18h-2.5V4.5Z"/></>,
    automation: <><path d="M4 7h11M12 4l3 3-3 3M20 17H9M12 14l-3 3 3 3"/><circle cx="4" cy="17" r="1"/><circle cx="20" cy="7" r="1"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    key: <><circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 8.7-8.7M16 7l2.5 2.5M18.5 4.5 21 7"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

export default function Home() {
  const pathname = usePathname();
  const [data, setData] = useState(demoData);
  const [accessError, setAccessError] = useState("");
  const [restoreAttempt, setRestoreAttempt] = useState(0);
  const [authStatus, setAuthStatus] = useState<"checking" | "authenticated" | "unauthenticated">("checking");
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loginIdentification, setLoginIdentification] = useState("");
  const [loginPin, setLoginPin] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginProgress, setLoginProgress] = useState("");
  const [loginError, setLoginError] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [signup, setSignup] = useState({ customerName: "", documentId: "", email: "", phoneNumber: "", accessPin: "", transactionPin: "" });
  const [recovery, setRecovery] = useState({ identification: "", email: "", transactionPin: "", newAccessPin: "" });
  const [screen, updateScreen] = useState<"dashboard" | "account" | "cards" | "pix" | "statement" | "security" | "lab" | "services">("dashboard");
  const setScreen = (next: typeof screen) => {
    updateScreen(next);
    const url = new URL(window.location.href);
    url.searchParams.set("aba", next);
    if (url.href !== window.location.href) window.history.pushState({}, "", url);
    window.scrollTo({ top: 0 });
  };
  useEffect(() => {
    const sync = () => {
      const requested = new URLSearchParams(window.location.search).get("aba");
      const allowed = ["dashboard", "account", "cards", "pix", "statement", "security", "lab", "services"];
      updateScreen(allowed.includes(requested ?? "") ? requested as typeof screen : "dashboard");
    };
    const timer = window.setTimeout(sync, 0);
    window.addEventListener("popstate", sync);
    return () => { window.clearTimeout(timer); window.removeEventListener("popstate", sync); };
  }, []);
  const [utilityPanel, setUtilityPanel] = useState<"account" | "cards" | "security" | "notifications" | "profile" | null>(null);
  const [bankingOpen, setBankingOpen] = useState(false);
  const [bankingTab, setBankingTab] = useState<BankingTab>("statement");
  const [innovationOpen, setInnovationOpen] = useState(false);
  const [innovationTab, setInnovationTab] = useState<InnovationTab>("open-finance");
  const [notifications, setNotifications] = useState<BankNotification[]>([]);
  const [incomingPix, setIncomingPix] = useState<BankNotification | null>(null);
  const seenNotices = useRef<Set<number> | null>(null);
  const reloadDashboard = useRef<() => Promise<void>>(async () => undefined);
  const [lab, setLab] = useState<LabId | null>(null);
  const [raniTick, setRaniTick] = useState(0);

  const [pixKey, setPixKey] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionPin, setTransactionPin] = useState("");
  const [pixStep, setPixStep] = useState<"details" | "review">("details");
  const [pixStatus, setPixStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [pixError, setPixError] = useState("");
  const [pixRecipient, setPixRecipient] = useState<PixRecipient | null>(null);
  const [pixIdempotencyKey, setPixIdempotencyKey] = useState("");
  const [pixReceipt, setPixReceipt] = useState<PixReceipt | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [devicesOpen, setDevicesOpen] = useState(false);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [flowHistory, setFlowHistory] = useState<FlowExecution[]>([]);
  const [flowHistoryOpen, setFlowHistoryOpen] = useState(false);
  const [flowHistoryLoading, setFlowHistoryLoading] = useState(false);
  const [adminInsights, setAdminInsights] = useState<AdminInsights | null>(null);
  const [adminInsightsOpen, setAdminInsightsOpen] = useState(false);
  const [adminInsightsLoading, setAdminInsightsLoading] = useState(false);
  const [accountManagementOpen, setAccountManagementOpen] = useState(false);
  const [pixKeysOpen, setPixKeysOpen] = useState(false);
  const [resettingDemo, setResettingDemo] = useState(false);
  const [bankTheme, setBankTheme] = useState<BankTheme>("light");
  const [balanceVisible, setBalanceVisible] = useState(true);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("ranbank-theme");
    const initialTheme: BankTheme = savedTheme === "dark" ? "dark" : "light";
    document.documentElement.dataset.bankTheme = initialTheme;
    const syncTheme = window.setTimeout(() => setBankTheme(initialTheme), 0);
    return () => {
      window.clearTimeout(syncTheme);
      delete document.documentElement.dataset.bankTheme;
    };
  }, []);

  const toggleBankTheme = () => {
    const nextTheme: BankTheme = bankTheme === "dark" ? "light" : "dark";
    setBankTheme(nextTheme);
    window.localStorage.setItem("ranbank-theme", nextTheme);
    document.documentElement.dataset.bankTheme = nextTheme;
  };

  useEffect(() => {
    if (!loginLoading) return;
    const wakeupTimer = window.setTimeout(
      () => setLoginProgress("Conectando com segurança…"),
      1500,
    );
    const coldStartTimer = window.setTimeout(
      () => setLoginProgress("Está demorando mais que o normal. Confira sua internet e aguarde mais um pouco."),
      10000,
    );
    return () => {
      window.clearTimeout(wakeupTimer);
      window.clearTimeout(coldStartTimer);
    };
  }, [loginLoading]);

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
  useEffect(() => { reloadDashboard.current = loadDashboard; });

  useEffect(() => {
    if (pathname === "/" || authStatus !== "checking") return;
    let active = true;
    const controller = new AbortController();

    const restoreSession = async () => {
      try {
        const response = await apiFetch("/auth/session", { signal: controller.signal });
        if (response.status === 401 || response.status === 403) {
          if (active) { clearAccountSession(); setAuthUser(null); setAuthStatus("unauthenticated"); }
          return;
        }
        if (!response.ok) throw new Error("O servidor não respondeu. Tente de novo.");
        const session = await response.json();
        if (!active) return;
        setAccessError("");
        setAuthUser(session);
        setAuthStatus("authenticated");
        await loadDashboard();
      } catch (error) {
        if (active) setAccessError(error instanceof Error ? error.message : "Não foi possível conectar ao servidor.");
      }
    };
    restoreSession();
    return () => {
      active = false;
      controller.abort();
    };
  }, [pathname, restoreAttempt, authStatus]);

  useEffect(() => {
    if (pathname !== "/banco") return;
    const requestedMode = new URLSearchParams(window.location.search).get("modo");
    const timer = window.setTimeout(() => {
      if (requestedMode === "criar-conta") setAuthMode("create");
      if (requestedMode === "recuperar-pin") setAuthMode("recover");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  // Confere avisos a cada 5 segundos: um Pix recebido aparece na tela sem precisar recarregar.
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    let active = true;
    seenNotices.current = null;
    const check = async () => {
      if (document.hidden) return;
      try {
        const response = await apiFetch("/notifications");
        if (!active || !response.ok) return;
        const list = await response.json() as BankNotification[];
        const seen = seenNotices.current;
        const received = seen ? list.filter((notice) => !seen.has(notice.id) && notice.type === "PIX_RECEIVED") : [];
        seenNotices.current = new Set(list.map((notice) => notice.id));
        setNotifications(list);
        if (received.length) {
          setIncomingPix(received[0]);
          void reloadDashboard.current();
        }
      } catch {
        // Sem conexão agora: tenta de novo na próxima volta.
      }
    };
    void check();
    const timer = window.setInterval(() => { void check(); }, NOTICE_CHECK_MS);
    // Ao voltar para a aba, confere na hora.
    const onVisible = () => { if (!document.hidden) void check(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { active = false; window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, [authStatus]);

  useEffect(() => {
    if (!incomingPix) return;
    const timer = window.setTimeout(() => setIncomingPix(null), 8000);
    return () => window.clearTimeout(timer);
  }, [incomingPix]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    const retry = () => { void loadDashboard(); };
    const exit = () => { clearAccountSession(); setAuthStatus("unauthenticated"); setAuthUser(null); };
    window.addEventListener("ranbank:retry-account", retry);
    window.addEventListener("ranbank:reauthenticate", exit);
    return () => { window.removeEventListener("ranbank:retry-account", retry); window.removeEventListener("ranbank:reauthenticate", exit); };
  }, [authStatus]);

  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loginLoading || loginPin.length !== 4) return;
    setLoginLoading(true);
    setLoginProgress("Conectando ao ambiente seguro…");
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
      setNotifications([]);
      setData(demoData);
      setLoginPin("");
      await loadDashboard();
    } catch (error) {
      setLoginPin("");
      setLoginError(error instanceof Error ? error.message : "Não foi possível entrar.");
    } finally {
      setLoginLoading(false);
      setLoginProgress("");
    }
  };

  const createDemoAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginLoading(true);
    setLoginProgress("Conectando ao ambiente seguro…");
    setLoginError("");
    try {
      const response = await apiFetch("/demo-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signup),
      });
      const result = await response.json().catch(() => ({ message: "Não foi possível criar a conta." }));
      if (!response.ok) throw new Error(result.message);
      setSignup({ customerName: "", documentId: "", email: "", phoneNumber: "", accessPin: "", transactionPin: "" });
      setNotifications([]);
      setAuthUser({ customerName: result.customerName, accountNumber: result.accountNumber });
      setAuthStatus("authenticated");
      await loadDashboard();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Não foi possível criar a conta.");
    } finally {
      setLoginLoading(false);
      setLoginProgress("");
    }
  };

  const recoverPin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginLoading(true);
    setLoginProgress("Conectando ao ambiente seguro…");
    setLoginError("");
    try {
      const response = await apiFetch("/auth/recover-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recovery),
      });
      const result = await response.json().catch(() => ({ message: "Não foi possível redefinir a senha." }));
      if (!response.ok) throw new Error(result.message);
      setLoginIdentification(recovery.identification);
      setRecovery({ identification: "", email: "", transactionPin: "", newAccessPin: "" });
      setAuthMode("login");
      setLoginError(result.message);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Não foi possível redefinir a senha.");
    } finally {
      setLoginLoading(false);
      setLoginProgress("");
    }
  };

  const logout = async () => {
    await apiFetch("/auth/logout", { method: "POST" }).catch(() => undefined);
    setAuthUser(null);
    setAuthStatus("unauthenticated");
    setUtilityPanel(null);
    setBankingOpen(false);
    setInnovationOpen(false);
    setData(demoData);
    setNotifications([]);
    setPixReceipt(null);
    setTransactionPin("");
    setScreen("dashboard");
  };

  const openBanking = (tab: BankingTab) => {
    if (tab === "statement" || tab === "card") { setScreen(tab === "card" ? "cards" : "statement"); setBankingOpen(false); setUtilityPanel(null); return; }
    setBankingTab(tab);
    setBankingOpen(false);
    setScreen("services");
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
      setPixError("Informe uma chave e um valor válidos.");
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

  const resetDemo = async () => {
    if (!window.confirm("Restaurar saldo, movimentações e dispositivos da demonstração da Ana?")) return;
    setResettingDemo(true);
    try {
      const response = await apiFetch("/demo/reset", { method: "POST" });
      if (!response.ok) throw new Error();
      await loadDashboard();
      setDevices([]);
      setAnalytics(null);
      window.alert("Demonstração restaurada.");
    } catch {
      window.alert("Não foi possível restaurar agora. Tente de novo em alguns segundos.");
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

  const markAllNotificationsRead = async () => {
    const response = await apiFetch("/notifications/read-all", { method: "PATCH" });
    if (response.ok) setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  };

  if (pathname === "/") return null;

  if (authStatus === "checking") {
    return <main className="bk-splash" aria-live="polite"><span className="bk-logo"><img src="/ranbank-logo-transparent.png" alt="RanBank" /></span>{accessError ? <><h1>Não conseguimos abrir sua conta</h1><p>{accessError}</p><div className="bk-splash-actions"><button className="bk-btn bk-btn-primary" onClick={() => { setAccessError(""); setRestoreAttempt(value => value + 1); }}>Tentar novamente</button><button className="bk-btn bk-btn-ghost" onClick={() => { clearAccountSession(); setAuthStatus("unauthenticated"); }}>Ir para o login</button></div></> : <><i className="bk-spinner" /><p>Abrindo o RanBank…</p><button className="bk-splash-skip" onClick={() => { setRestoreAttempt(value => value + 1); clearAccountSession(); setAuthStatus("unauthenticated"); }}>Ir para o login</button></>}</main>;
  }

  if (authStatus === "unauthenticated") {
    return <AuthScreen mode={authMode} setMode={setAuthMode} identification={loginIdentification}
      setIdentification={setLoginIdentification} pin={loginPin} setPin={setLoginPin} signup={signup}
      setSignup={setSignup} recovery={recovery} setRecovery={setRecovery} loading={loginLoading}
      progressMessage={loginProgress}
      error={loginError} clearError={() => setLoginError("")} onLogin={login} onCreate={createDemoAccount}
      onRecover={recoverPin} appendDigit={appendLoginDigit}/>;
  }

  const firstName = data.customerName.split(" ")[0];
  const ownCard = ownCardFor(data.account);
  const initials = (authUser?.customerName ?? data.customerName).split(/\s+/).map((part) => part[0]).slice(0,2).join("").toUpperCase() || "RB";
  const shown = (value: number) => balanceVisible ? money.format(value) : "R$ ••••";
  const openPix = () => { setPixStep("details"); setScreen("pix"); };
  const cardUsage = Math.min(100, (data.card.spent / Math.max(data.card.limit, 1)) * 100);

  return (
    <main className="bk-shell">
      <aside className="bk-sidebar">
        <button className="bk-brand" onClick={() => { setScreen("dashboard"); setUtilityPanel(null); }} aria-label="Ir para o início">
          <span className="bk-logo"><img src="/ranbank-logo-transparent.png" alt="RanBank" /></span>
        </button>
        <nav className="bk-nav" aria-label="Navegação principal">
          <small>Dia a dia</small>
          <button className={screen === "dashboard" ? "active" : ""} onClick={() => setScreen("dashboard")}><BankIcon name="home" /> Início</button>
          <button className={screen === "pix" ? "active" : ""} onClick={openPix}><BankIcon name="pix" /> Pix</button>
          <button className={screen === "statement" ? "active" : ""} onClick={() => openBanking("statement")}><BankIcon name="statement" /> Extrato</button>
          <button className={screen === "cards" ? "active" : ""} onClick={() => setScreen("cards")}><BankIcon name="card" /> Carteira</button>
          <button className={screen === "services" ? "active" : ""} onClick={() => openBanking("bill")}><BankIcon name="pay" /> Pagar e guardar</button>
          <small>Proteção</small>
          <button className={screen === "security" ? "active" : ""} onClick={() => setScreen("security")}><BankIcon name="shield" /> Segurança</button>
          <small>Conheça</small>
          <button className={screen === "lab" ? "active" : ""} onClick={() => setScreen("lab")}><BankIcon name="spark" /> Como o banco funciona</button>
        </nav>
        <div className="bk-sidebar-foot">
          <a href="/">← Voltar ao site</a>
          <button onClick={logout}><BankIcon name="logout" size={18} /> Sair da conta</button>
        </div>
      </aside>

      <section className="bk-workspace">
        <header className="bk-topbar">
          <button type="button" className="bk-mobile-brand" onClick={() => { setScreen("dashboard"); setUtilityPanel(null); }} aria-label="Voltar ao início do RanBank"><span className="bk-logo"><img src="/ranbank-logo-transparent.png" alt="RanBank" /></span></button>
          <p className="bk-notice"><b>Projeto educacional.</b> Nenhum valor é real.</p>
          <div className="bk-top-actions">
            <button className="bk-icon-btn" type="button" onClick={() => setBalanceVisible((current) => !current)} aria-label={balanceVisible ? "Esconder valores" : "Mostrar valores"} title={balanceVisible ? "Esconder valores" : "Mostrar valores"}><BankIcon name={balanceVisible ? "eye" : "eyeOff"} /></button>
            <button className="bk-icon-btn" type="button" onClick={toggleBankTheme} aria-label={bankTheme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"} aria-pressed={bankTheme === "dark"} title={bankTheme === "dark" ? "Modo claro" : "Modo escuro"}><BankIcon name={bankTheme === "dark" ? "sun" : "moon"} /></button>
            <button className="bk-icon-btn" type="button" onClick={() => setUtilityPanel("notifications")} aria-label="Notificações"><BankIcon name="bell" />{notifications.some((item) => !item.read) && <i />}</button>
            <button className="bk-avatar" type="button" onClick={() => setUtilityPanel("profile")} aria-label={`Abrir perfil de ${authUser?.customerName ?? "cliente"}`}>{initials}</button>
          </div>
        </header>

        {screen === "dashboard" ? (
          <div className="bk-home">
            <header className="bk-greeting">
              <h1>Olá, {firstName}</h1>
              <p>Seu dinheiro em um só lugar.</p>
            </header>

            <section className="bk-block bk-area-account" aria-label="Conta">
              <button className="bk-row" onClick={() => setScreen("account")}><span>Conta</span><BankIcon name="chevron" size={18} /></button>
              <strong className="bk-balance">{shown(data.balance)}</strong>
              <small className="bk-muted">Saldo disponível</small>
            </section>

            <section className="bk-actions bk-area-actions" aria-label="Acessos rápidos">
              <button onClick={openPix}><span><BankIcon name="pix" /></span>Pix</button>
              <button onClick={() => openBanking("bill")}><span><BankIcon name="pay" /></span>Pagar</button>
              <button onClick={() => openBanking("schedule")}><span><BankIcon name="schedule" /></span>Agendar</button>
              <button onClick={() => openBanking("savings")}><span><BankIcon name="chart" /></span>Guardar</button>
            </section>

            <section className="bk-block bk-area-moves" aria-label="Últimas movimentações">
              <button className="bk-row" onClick={() => openBanking("statement")}><span>Últimas movimentações</span><BankIcon name="chevron" size={18} /></button>
              {data.transactions.length ? (
                <ul className="bk-list">
                  {data.transactions.slice(0, 3).map((transaction) => (
                    <li key={transaction.id}>
                      <button onClick={() => openBanking("statement")}>
                        <span className={`bk-tx-icon ${transaction.type}`} aria-hidden="true">{transaction.type === "credit" ? "↓" : "↑"}</span>
                        <span className="bk-tx-copy"><strong>{transaction.title}</strong><small>{transactionDescription(transaction)}</small></span>
                        <b className={transaction.type}>{balanceVisible ? `${transaction.amount > 0 ? "+ " : "- "}${money.format(Math.abs(transaction.amount))}` : "••••"}</b>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : <p className="bk-muted">Nenhuma movimentação ainda.</p>}
            </section>

            <div className="bk-home-side">
              <section className="bk-block bk-area-card" aria-label={ownCard === "ecocard" ? "Cartão Ecocard" : "Cartão RanBank"}>
                <button className="bk-row" onClick={() => setScreen("cards")}><span>{ownCard === "ecocard" ? "Cartão Ecocard" : "Cartão RanBank"} {data.card.blocked && <em className="bk-tag is-warn">Bloqueado</em>}</span><BankIcon name="chevron" size={18} /></button>
                <small className="bk-muted">Fatura atual</small>
                <strong className="bk-amount">{shown(data.card.spent)}</strong>
                <div className="bk-meter" aria-hidden="true"><i style={{ width: `${cardUsage}%` }} /></div>
                <small className="bk-muted">Limite disponível de {shown(data.card.available)}</small>
              </section>

              <aside className="bk-discover bk-area-discover bank-project-menu-v2" aria-label="Conheça o projeto RanBank">
                <h2>Explore o RanBank</h2>
                <div>
                  <button onClick={() => setScreen("security")}><span><BankIcon name="shield" /></span><strong>Segurança</strong><small>Como a conta é protegida</small></button>
                  <button onClick={() => setScreen("lab")}><span><BankIcon name="spark" /></span><strong>Como o banco funciona</strong><small>A tecnologia por trás</small></button>
                  <button onClick={openRani}><span className="bk-discover-ran"><img src="/images/ran-assistente-humana.png" alt="" /></span><strong>Fale com a Rani</strong><small>Dúvidas em palavras simples</small></button>
                </div>
              </aside>
            </div>
          </div>
        ) : screen === "account" ? (
          <AccountSectionPage data={data} onStatement={() => openBanking("statement")} />
        ) : screen === "pix" ? (
          <div className="bk-page bk-pix">
            <header className="bk-page-head"><h1>Pix</h1><p>Envie dinheiro na hora para outra conta RanBank.</p></header>
            <div className="bk-pix-grid">
              <div className="bk-pix-main">
                {pixStep === "details" && <>
                  <section className="bk-panel" aria-labelledby="pix-title">
                    <h2 id="pix-title" className="bk-panel-title">Enviar um Pix</h2>
                    <form className="bk-form" onSubmit={sendPix}>
                      <label>Chave Pix de quem vai receber<input value={pixKey} onChange={(event) => setPixKey(event.target.value)} placeholder="E-mail, CPF, celular ou chave aleatória" required /></label>
                      <label>Valor<span className="bk-money"><b>R$</b><input className="pix-cent-amount" value={amount} onChange={(event) => setAmount(formatMoneyFromDigits(event.target.value))} onFocus={(event) => event.currentTarget.select()} placeholder="0,00" inputMode="numeric" aria-label="Valor do Pix em reais e centavos" required /></span><small>Disponível: {shown(data.balance)}</small></label>
                      {pixStatus === "error" && <p className="bk-error" role="alert">{pixError}</p>}
                      <button className="bk-btn bk-btn-primary" disabled={pixStatus === "sending"}>{pixStatus === "sending" ? "Procurando quem vai receber…" : "Continuar"}</button>
                    </form>
                  </section>
                </>}
                {pixStep === "review" && (
                  <section className="bk-panel bk-review" aria-labelledby="pin-confirmation-title">
                    <h2 id="pin-confirmation-title" className="bk-panel-title">Revise sua transferência</h2>
                    <dl>
                      <div><dt>Para</dt><dd><strong>{pixRecipient?.name ?? "Destinatário validado"}</strong><small>{pixRecipient?.maskedKey} · conta {pixRecipient?.accountNumber}</small></dd></div>
                      <div><dt>Valor</dt><dd><strong className="bk-amount">{money.format(parseMoneyInput(amount))}</strong></dd></div>
                    </dl>
                    <form className="bk-form" onSubmit={sendPix}>
                      <label className="bk-pin-field">Digite a senha de 4 dígitos do cartão para autorizar
                        <input type="password" value={transactionPin} onChange={(event) => setTransactionPin(event.target.value.replace(/\D/g, "").slice(0,4))} inputMode="numeric" pattern="[0-9]*" autoComplete="off" maxLength={4} placeholder="••••" aria-label="Senha de quatro dígitos do cartão" />
                      </label>
                      <div className="bk-keypad" aria-label="Teclado da senha do cartão">{["1","2","3","4","5","6","7","8","9"].map((digit) => <button key={digit} type="button" onClick={() => appendTransactionDigit(digit)}>{digit}</button>)}<span aria-hidden="true" /><button type="button" onClick={() => appendTransactionDigit("0")}>0</button><button type="button" onClick={() => setTransactionPin((current) => current.slice(0,-1))} aria-label="Apagar último dígito da senha">⌫</button></div>
                      {pixStatus === "error" && <p className="bk-error" role="alert">{pixError}</p>}
                      {pixStatus === "success" && <p className="bk-success">Transferência concluída ✓</p>}
                      <div className="bk-form-actions">
                        <button type="button" className="bk-btn bk-btn-ghost" onClick={() => { setPixStep("details"); setTransactionPin(""); setPixError(""); setPixStatus("idle"); }}>Voltar</button>
                        <button type="submit" className="bk-btn bk-btn-primary" disabled={pixStatus === "sending" || transactionPin.length !== 4}>{pixStatus === "sending" ? "Autorizando…" : pixStatus === "success" ? "Concluída ✓" : "Autorizar transferência"}</button>
                      </div>
                    </form>
                  </section>
                )}
              </div>
              <aside className="bk-pix-side" aria-label="Informações do Pix">
                <section className="bk-panel bk-pix-balance"><small className="bk-muted">Disponível para Pix</small><strong className="bk-balance">{shown(data.balance)}</strong></section>
                  <div className="bk-links">
                    <button onClick={() => setPixKeysOpen(true)}><BankIcon name="key" /> Minhas chaves Pix <BankIcon name="chevron" size={16} /></button>
                    <button onClick={() => openBanking("schedule")}><BankIcon name="schedule" /> Agendar um Pix <BankIcon name="chevron" size={16} /></button>
                  </div>
                <section className="bk-panel">
                  <h2 className="bk-panel-title">Como seu Pix é protegido</h2>
                  <ul className="bk-checks">
                    <li><span aria-hidden="true">✓</span><div><strong>Confira quem recebe</strong><small>O nome aparece antes de você confirmar.</small></div></li>
                    <li><span aria-hidden="true">✓</span><div><strong>Senha só para movimentar</strong><small>Diferente da senha de entrar no app.</small></div></li>
                    <li><span aria-hidden="true">✓</span><div><strong>Sem envio repetido</strong><small>Um clique duplo não manda o Pix duas vezes.</small></div></li>
                  </ul>
                </section>
                <section className="bk-panel">
                  <h2 className="bk-panel-title">Últimos Pix</h2>
                  {data.transactions.filter((transaction) => /pix|transfer/i.test(transaction.title)).length ? (
                    <ul className="bk-list">
                      {data.transactions.filter((transaction) => /pix|transfer/i.test(transaction.title)).slice(0, 4).map((transaction) => (
                        <li key={transaction.id}><div>
                          <span className={`bk-tx-icon ${transaction.type}`} aria-hidden="true">{transaction.type === "credit" ? "↓" : "↑"}</span>
                          <span className="bk-tx-copy"><strong>{transaction.title}</strong><small>{transactionDescription(transaction)}</small></span>
                          <b className={transaction.type}>{balanceVisible ? `${transaction.amount > 0 ? "+ " : "- "}${money.format(Math.abs(transaction.amount))}` : "••••"}</b>
                        </div></li>
                      ))}
                    </ul>
                  ) : <p className="bk-muted">Nenhum Pix ainda.</p>}
                </section>
              </aside>
            </div>
          </div>
        ) : screen === "cards" || screen === "statement" ? (
          <div className="bk-page"><header className="bk-page-head"><h1>{screen === "cards" ? "Carteira" : "Extrato"}</h1><p>{screen === "cards" ? `Escolha um cartão para ver os detalhes. Na sua conta, o liberado é o ${OWN_CARD_NAME[ownCard]}.` : "Todas as entradas e saídas da sua conta."}</p></header><CardCatalog key={ownCard} own={ownCard} enabled={screen === "cards"}><Suspense fallback={<p className="bk-muted">Carregando…</p>}><BankingSuite key={`${screen}-${raniTick}`} ownCard={ownCard} open embedded initialTab={screen === "cards" ? "card" : "statement"} onClose={() => setScreen("account")} onChanged={loadDashboard}/></Suspense></CardCatalog></div>
        ) : screen === "services" ? (
          <div className="bk-page"><header className="bk-page-head"><h1>Pagar e guardar</h1><p>Boletos, agendamentos e o seu cofrinho.</p></header><Suspense fallback={<p className="bk-muted">Carregando…</p>}><BankingSuite key={bankingTab} open embedded initialTab={bankingTab === "statement" || bankingTab === "card" ? "bill" : bankingTab} onClose={() => setScreen("account")} onChanged={loadDashboard}/></Suspense></div>
        ) : screen === "security" ? (
          <SecuritySectionPage
            transactions={data.transactions}
            onAuthentication={() => setLab("login")}
            onThreat={() => setLab("scam")}
            onDevices={() => { void loadDevices(); }}
          />
        ) : (
          <div className="bk-page bk-tech">
            <header className="bk-page-head"><h1>Como o banco funciona</h1><p>Escolha um assunto e mexa à vontade: cada resultado é calculado na hora, a partir do que você muda.</p></header>

            <section className="bk-panel bk-fraud">
              <div>
                <span className="bk-tag">Destaque</span>
                <h2>Fluxo antifraude com gatilhos</h2>
                <p>Monte uma transação, ajuste as regras e veja o fluxo decidir sozinho se aprova, pede confirmação ou bloqueia.</p>
                <button className="bk-btn bk-btn-primary" onClick={() => setScreen("security")}>Abrir o fluxo antifraude</button>
              </div>
              <ul aria-label="O que o fluxo confere">
                <li>Valor alto <b>+30</b></li>
                <li>Aparelho novo <b>+25</b></li>
                <li>Cidade diferente <b>+25</b></li>
                <li className="is-total">Você define as regras <b>0 a 100</b></li>
              </ul>
            </section>

            <h2 className="bk-section-title">Escolha um assunto</h2>
            <div className="bk-topics">
              <button onClick={() => setLab("scam")}><span><BankIcon name="shield" /></span><strong>Isso é golpe?</strong><small>Escreva uma mensagem e veja os sinais de golpe.</small></button>
              <button onClick={() => setLab("login")}><span><BankIcon name="lock" /></span><strong>Entrada suspeita?</strong><small>Monte um acesso e veja o banco decidir.</small></button>
              <button onClick={() => setLab("chain")}><span><BankIcon name="key" /></span><strong>Registro que não se altera</strong><small>Mude um registro e veja a corrente quebrar.</small></button>
              <button onClick={() => setLab("cloud")}><span><BankIcon name="cloud" /></span><strong>Banco sempre no ar</strong><small>Desligue servidores e veja o que acontece.</small></button>
              <button onClick={() => setLab("energy")}><span><BankIcon name="leaf" /></span><strong>Banco sustentável</strong><small>Ajuste as escolhas e veja energia e poluição.</small></button>
              <button onClick={() => setLab("compare")}><span><BankIcon name="brain" /></span><strong>Comparar tecnologias</strong><small>Defina prioridades e veja o ranking mudar.</small></button>
              <button onClick={openAnalytics}><span><BankIcon name="chart" /></span><strong>Análise das movimentações</strong><small>Resumo calculado com os dados da sua conta.</small></button>
              <button onClick={loadDevices}><span><BankIcon name="device" /></span><strong>Aparelhos conectados</strong><small>Bloqueie e libere aparelhos da conta.</small></button>
              <button onClick={() => openInnovation("open-finance")}><span><BankIcon name="transfer" /></span><strong>Compartilhar dados</strong><small>Conecte ou cancele outros bancos.</small></button>
            </div>

            <section className="bk-tools">
              <h2 className="bk-section-title">Ferramentas da demonstração</h2>
              <div>
                <button onClick={openFlowHistory}>Histórico de automações</button>
                {data.role === "ADMIN" && <button onClick={openAdminInsights}>Indicadores da operação</button>}
                {data.role === "ADMIN" && <button onClick={() => setAccountManagementOpen(true)}>Gerenciar contas demo</button>}
                <button disabled={resettingDemo} onClick={resetDemo}>{resettingDemo ? "Restaurando…" : "Recomeçar demonstração"}</button>
              </div>
            </section>
          </div>
        )}
      </section>

      <nav className="bk-tabbar" aria-label="Navegação rápida">
        <button className={screen === "dashboard" ? "active" : ""} onClick={() => setScreen("dashboard")}><BankIcon name="home" /><span>Início</span></button>
        <button className={screen === "pix" ? "active" : ""} onClick={openPix}><BankIcon name="pix" /><span>Pix</span></button>
        <button className={screen === "statement" ? "active" : ""} onClick={() => openBanking("statement")}><BankIcon name="statement" /><span>Extrato</span></button>
        <button className={screen === "cards" ? "active" : ""} onClick={() => setScreen("cards")}><BankIcon name="card" /><span>Carteira</span></button>
        <button className={screen === "security" || screen === "lab" ? "active" : ""} onClick={() => setScreen("security")}><BankIcon name="shield" /><span>Segurança</span></button>
      </nav>

      <RaniAssistant context="bank" userName={firstName} cardName={OWN_CARD_NAME[ownCard]} onChanged={() => { setRaniTick((tick) => tick + 1); void loadDashboard(); }} onNavigate={(target) => { if (target === "pix") openPix(); else if (target === "statement") openBanking("statement"); else if (target === "services") openBanking("savings"); else setScreen(target); }} />
      {analyticsOpen && (
        <BkSheet label="Dados" title="Análise das movimentações" onClose={() => setAnalyticsOpen(false)}>
          {analyticsLoading ? <BkLoading text="Organizando as movimentações…" /> : analytics ? <>
            <div className="bk-stats">
              <article><span>Movimentações</span><strong>{analytics.totalTransactions}</strong><small>{analytics.creditCount} entradas · {analytics.debitCount} saídas</small></article>
              <article><span>Entrou</span><strong className="is-good">{money.format(analytics.totalIn)}</strong></article>
              <article><span>Saiu</span><strong>{money.format(analytics.totalOut)}</strong></article>
              <article><span>Média por saída</span><strong>{money.format(analytics.averageOut)}</strong><small>Maior: {money.format(analytics.largestOut)}</small></article>
            </div>
            <h3 className="bk-sheet-title">Cada barra é uma movimentação</h3>
            <div className="bk-bars">{analytics.series.map((value, index) => { const max = Math.max(...analytics.series.map(Math.abs), 1); return <i key={index} className={value >= 0 ? "is-in" : "is-out"} style={{ height: `${Math.max(8, Math.abs(value) / max * 100)}%` }} title={money.format(value)} />; })}</div>
            <div className="bk-legend"><span><i className="is-in" />Entrada</span><span><i className="is-out" />Saída</span></div>
            <ol className="bk-flow"><li>Pix e compras</li><li>Banco de dados</li><li>Resumo automático</li><li>Gráfico na tela</li></ol>
            <p className="bk-note">Um banco de verdade faz isso com milhões de movimentações para achar padrões e gastos fora do normal.</p>
          </> : <BkUnavailable />}
        </BkSheet>
      )}
      {devicesOpen && (
        <BkSheet label="Acessos" title="Aparelhos conectados" onClose={() => setDevicesOpen(false)}>
          <div className="bk-stats is-three">
            <article><span>Ativos</span><strong>{devices.filter((device) => !device.blocked).length}</strong></article>
            <article><span>Confiáveis</span><strong className="is-good">{devices.filter((device) => device.trusted).length}</strong></article>
            <article><span>Bloqueados</span><strong className="is-bad">{devices.filter((device) => device.blocked).length}</strong></article>
          </div>
          {devicesLoading ? <BkLoading text="Buscando aparelhos…" /> : devices.length ? (
            <ul className="bk-rows">{devices.map((device) => (
              <li key={device.id}>
                <div><strong>{device.name} <b className={`bk-pill ${device.blocked ? "is-bad" : device.trusted ? "is-ok" : "is-warn"}`}>{device.blocked ? "Bloqueado" : device.trusted ? "Confiável" : "Revisar"}</b></strong><small>{device.type} · {device.location} · último acesso {device.lastAccess}</small></div>
                <button className="bk-mini-btn" type="button" onClick={() => toggleDevice(device.id)}>{device.blocked ? "Reativar" : "Bloquear"}</button>
              </li>
            ))}</ul>
          ) : <BkUnavailable />}
          <p className="bk-note">Quando um aparelho desconhecido tenta entrar, o banco pode pedir uma confirmação extra ou bloquear o acesso.</p>
        </BkSheet>
      )}
      {utilityPanel === "notifications" && (
        <BkSheet title="Notificações" onClose={() => setUtilityPanel(null)}>
          {notifications.length ? <ul className="bk-rows">{notifications.map((item) => <li key={item.id} className={item.read ? "" : "is-unread"}><div><strong>{item.title}</strong><small>{item.message}</small><small>{new Date(item.createdAt).toLocaleString("pt-BR")}</small></div></li>)}</ul> : <div className="bk-loading"><strong>Nenhum aviso por aqui</strong><p>Pix recebidos e alertas de segurança aparecem nesta lista.</p></div>}
          <button className="bk-btn bk-btn-ghost bk-sheet-action" onClick={markAllNotificationsRead} disabled={!notifications.some((item) => !item.read)}>{notifications.some((item) => !item.read) ? "Marcar todas como lidas" : "Tudo lido ✓"}</button>
        </BkSheet>
      )}
      {utilityPanel === "profile" && (
        <BkSheet title="Meu perfil" onClose={() => setUtilityPanel(null)}>
          <div className="bk-profile"><span>{data.customerName.split(/\s+/).map((part) => part[0]).slice(0,2).join("").toUpperCase()}</span><div><strong>{data.customerName}</strong><small>{data.role === "ADMIN" ? "Administradora da demonstração" : "Cliente RanBank"}</small></div></div>
          <dl className="bk-details">
            <div><dt>E-mail</dt><dd>{data.email || "Não informado"}</dd></div>
            <div><dt>Telefone</dt><dd>{data.phoneNumber || "Não informado"}</dd></div>
            <div><dt>CPF</dt><dd>{data.maskedDocument}</dd></div>
            <div><dt>Conta</dt><dd>Ag. 0001 · {data.account}</dd></div>
          </dl>
          <div className="bk-links">
            <button onClick={() => { setUtilityPanel(null); setScreen("account"); }}><BankIcon name="user" /> Dados da conta <BankIcon name="chevron" size={16} /></button>
            <button onClick={() => { setUtilityPanel(null); setPixKeysOpen(true); }}><BankIcon name="key" /> Gerenciar chaves Pix <BankIcon name="chevron" size={16} /></button>
            <button onClick={logout}><BankIcon name="logout" /> Sair da conta <BankIcon name="chevron" size={16} /></button>
          </div>
        </BkSheet>
      )}
      {pixReceipt && <div className="bk-modal-backdrop" role="presentation" onMouseDown={() => setPixReceipt(null)}><section className="bk-modal bk-receipt" role="dialog" aria-modal="true" aria-labelledby="pix-receipt-title" onMouseDown={(event) => event.stopPropagation()}><button className="bk-modal-close" onClick={() => setPixReceipt(null)} aria-label="Fechar comprovante">×</button><span className="bk-receipt-check" aria-hidden="true">✓</span><h2 id="pix-receipt-title">Pix enviado</h2><strong className="bk-balance">{money.format(pixReceipt.amount)}</strong><p>para <b>{pixReceipt.recipientName}</b></p><dl className="bk-details"><div><dt>Conta de destino</dt><dd>{pixReceipt.recipientAccount}</dd></div><div><dt>Chave Pix</dt><dd>{pixReceipt.maskedPixKey}</dd></div><div><dt>Data e hora</dt><dd>{new Date(pixReceipt.timestamp).toLocaleString("pt-BR")}</dd></div><div><dt>Situação</dt><dd>{pixReceipt.status === "COMPLETED" ? "Concluído" : pixReceipt.status}</dd></div><div><dt>Código da transação</dt><dd className="bk-code">{pixReceipt.transferId}</dd></div></dl><button className="bk-btn bk-btn-primary" onClick={() => setPixReceipt(null)}>Concluir</button></section></div>}
      {lab && <LabSheet id={lab} onClose={() => setLab(null)} />}
      {incomingPix && (
        <div className="bk-incoming" role="status" aria-live="polite">
          <span className="bk-incoming-icon" aria-hidden="true">↓</span>
          <div><strong>{incomingPix.title}</strong><p>{formatNoticeMoney(incomingPix.message)}</p></div>
          <button type="button" className="bk-incoming-see" onClick={() => { setIncomingPix(null); openBanking("statement"); }}>Ver</button>
          <button type="button" className="bk-incoming-close" onClick={() => setIncomingPix(null)} aria-label="Fechar aviso">×</button>
        </div>
      )}
      {flowHistoryOpen && (
        <BkSheet label="Servidor" title="Histórico de automações" onClose={() => setFlowHistoryOpen(false)}>
          {flowHistoryLoading ? <BkLoading text="Carregando…" /> : flowHistory.length ? <ul className="bk-rows">{flowHistory.map((flow) => <li key={flow.id}><div><strong>{flow.flowType === "PIX_SETTLEMENT" ? "Pix processado" : "Resposta a incidente"}</strong><small>{new Date(flow.startedAt).toLocaleString("pt-BR")} · {flow.steps.length} etapas</small></div><b className={`bk-pill ${flow.status === "COMPLETED" ? "is-ok" : "is-warn"}`}>{flow.status === "COMPLETED" ? "Concluído" : flow.status}</b></li>)}</ul> : <div className="bk-loading"><strong>Nada registrado ainda</strong><p>Faça um Pix para aparecer aqui.</p></div>}
        </BkSheet>
      )}
      {adminInsightsOpen && (
        <BkSheet label="Administração" title="Indicadores da operação" onClose={() => setAdminInsightsOpen(false)}>
          {adminInsightsLoading ? <BkLoading text="Somando os dados…" /> : adminInsights ? <>
            <div className="bk-stats">
              <article><span>Contas ativas</span><strong>{adminInsights.activeAccounts}</strong><small>{adminInsights.totalAccounts} no total</small></article>
              <article><span>Dinheiro nas contas</span><strong>{money.format(adminInsights.totalDeposits)}</strong></article>
              <article><span>Pix feitos</span><strong>{adminInsights.pixTransfers}</strong></article>
              <article><span>Movimentações</span><strong>{adminInsights.totalTransactions}</strong><small>{money.format(adminInsights.transactionVolume)}</small></article>
              <article><span>Avisos não lidos</span><strong>{adminInsights.unreadNotifications}</strong></article>
              <article><span>Automações</span><strong>{adminInsights.flowExecutions}</strong></article>
            </div>
            <p className="bk-note">Atualizado em {new Date(adminInsights.generatedAt).toLocaleString("pt-BR")}. Valores fictícios da demonstração.</p>
          </> : <BkUnavailable />}
        </BkSheet>
      )}
      {bankingOpen && <Suspense fallback={null}><BankingSuite open initialTab={bankingTab} onClose={() => setBankingOpen(false)} onChanged={loadDashboard} /></Suspense>}
      {innovationOpen && <Suspense fallback={null}><InnovationHub open initialTab={innovationTab} onClose={() => setInnovationOpen(false)} /></Suspense>}
      {accountManagementOpen && <Suspense fallback={null}><AccountManagementModal open onClose={() => setAccountManagementOpen(false)} /></Suspense>}
      {pixKeysOpen && <Suspense fallback={null}><PixKeysModal open onClose={() => setPixKeysOpen(false)} /></Suspense>}
    </main>
  );
}
