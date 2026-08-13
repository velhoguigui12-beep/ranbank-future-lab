"use client";

import { useEffect, useMemo, useState } from "react";

export type BankingTab = "statement" | "bill" | "schedule" | "card" | "savings";

type StatementItem = { id: number; title: string; detail: string; amount: number; type: "credit" | "debit" };
type ScheduleItem = { id: number; kind: string; recipient: string; amount: number; scheduledDate: string; status: string };
type BankingOverview = {
  balance: number;
  savingsBalance: number;
  savingsGoal: number;
  card: { blocked: boolean; limit: number; spent: number; available: number };
  statement: StatementItem[];
  schedules: ScheduleItem[];
};
type Receipt = {
  transactionId: number;
  operation: string;
  recipient: string;
  amount: number;
  detail: string;
  timestamp: string;
  authentication: string;
};

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const parseMoneyInput = (value: string) => {
  const compact = value.trim().replace(/\s/g, "");
  if (compact.includes(",")) return Number(compact.replace(/\./g, "").replace(",", "."));
  if (/^\d{1,3}(\.\d{3})+$/.test(compact)) return Number(compact.replace(/\./g, ""));
  return Number(compact);
};
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";
const bankFetch = (path: string, init: RequestInit = {}) =>
  fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });

const tabLabels: Array<{ id: BankingTab; icon: string; label: string }> = [
  { id: "statement", icon: "↕", label: "Extrato" },
  { id: "bill", icon: "▤", label: "Boleto" },
  { id: "schedule", icon: "◷", label: "Agendar Pix" },
  { id: "card", icon: "▭", label: "Cartão" },
  { id: "savings", icon: "◎", label: "Cofrinho" },
];

export default function BankingSuite({
  open,
  initialTab,
  onClose,
  onChanged,
}: {
  open: boolean;
  initialTab: BankingTab;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [tab, setTab] = useState<BankingTab>(initialTab);
  const [overview, setOverview] = useState<BankingOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [receipt, setReceipt] = useState<Receipt | StatementItem | null>(null);
  const [search, setSearch] = useState("");
  const [statementType, setStatementType] = useState<"all" | "credit" | "debit">("all");
  const [bill, setBill] = useState({ barcode: "", payee: "", amount: "", pin: "" });
  const [schedule, setSchedule] = useState({ pixKey: "", amount: "", date: "", pin: "" });
  const [savings, setSavings] = useState({ amount: "", pin: "" });
  const [limit, setLimit] = useState({ value: "", pin: "" });

  const loadOverview = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await bankFetch("/banking/overview");
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.message ?? "Não foi possível carregar os serviços.");
      setOverview(await response.json());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Serviço temporariamente indisponível.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setTab(initialTab);
    setSuccess("");
    setError("");
    loadOverview();
  }, [open, initialTab]);

  const statement = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return (overview?.statement ?? []).filter((item) => {
      const matchesType = statementType === "all" || item.type === statementType;
      const matchesTerm = !term || `${item.title} ${item.detail}`.toLocaleLowerCase("pt-BR").includes(term);
      return matchesType && matchesTerm;
    });
  }, [overview, search, statementType]);

  const perform = async (path: string, method: string, body?: unknown, message?: string) => {
    setWorking(true);
    setError("");
    setSuccess("");
    try {
      const response = await bankFetch(path, { method, body: body ? JSON.stringify(body) : undefined });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.message ?? "Não foi possível concluir a operação.");
      if (payload?.transactionId) setReceipt(payload);
      setSuccess(message ?? "Operação concluída.");
      await loadOverview();
      onChanged();
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível concluir a operação.");
      return false;
    } finally {
      setWorking(false);
    }
  };

  if (!open) return null;

  const submitBill = async (event: React.FormEvent) => {
    event.preventDefault();
    const ok = await perform("/banking/bills", "POST", {
      barcode: bill.barcode,
      payee: bill.payee,
      amount: parseMoneyInput(bill.amount),
      transactionPin: bill.pin,
    }, "Boleto pago e comprovante gerado.");
    if (ok) setBill({ barcode: "", payee: "", amount: "", pin: "" });
  };

  const submitSchedule = async (event: React.FormEvent) => {
    event.preventDefault();
    const ok = await perform("/banking/schedules", "POST", {
      pixKey: schedule.pixKey,
      amount: parseMoneyInput(schedule.amount),
      scheduledDate: schedule.date,
      transactionPin: schedule.pin,
    }, "Pix agendado com sucesso.");
    if (ok) setSchedule({ pixKey: "", amount: "", date: "", pin: "" });
  };

  const moveSavings = async (direction: "deposit" | "withdraw") => {
    const ok = await perform(`/banking/savings/${direction}`, "POST", {
      amount: parseMoneyInput(savings.amount),
      transactionPin: savings.pin,
    }, direction === "deposit" ? "Valor guardado no cofrinho." : "Valor resgatado para a conta.");
    if (ok) setSavings({ amount: "", pin: "" });
  };

  return (
    <div className="banking-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="banking-suite" role="dialog" aria-modal="true" aria-labelledby="banking-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="banking-header">
          <div><span>SERVIÇOS BANCÁRIOS</span><h2 id="banking-title">Central financeira</h2></div>
          <div className="banking-balance"><small>Disponível</small><strong>{money.format(overview?.balance ?? 0)}</strong></div>
          <button onClick={onClose} aria-label="Fechar central financeira">×</button>
        </header>

        <nav className="banking-tabs" aria-label="Serviços bancários">
          {tabLabels.map((item) => (
            <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => { setTab(item.id); setError(""); setSuccess(""); }}>
              <b>{item.icon}</b><span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="banking-content">
          {loading && !overview ? <div className="banking-loading"><i/><p>Carregando sua central financeira…</p></div> : null}
          {error && <p className="banking-message error" role="alert">{error}</p>}
          {success && <p className="banking-message success">{success}</p>}

          {tab === "statement" && overview && (
            <div className="statement-view">
              <div className="banking-section-heading"><div><span>MOVIMENTAÇÕES</span><h3>Extrato completo</h3></div><b>{overview.statement.length} lançamentos</b></div>
              <div className="statement-tools">
                <label><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome ou descrição" /></label>
                <div>{(["all", "credit", "debit"] as const).map((type) => <button key={type} className={statementType === type ? "active" : ""} onClick={() => setStatementType(type)}>{type === "all" ? "Todos" : type === "credit" ? "Entradas" : "Saídas"}</button>)}</div>
              </div>
              <div className="statement-summary">
                <article><span>Entradas</span><strong className="positive">{money.format(overview.statement.filter((item) => item.type === "credit").reduce((sum, item) => sum + Math.abs(item.amount), 0))}</strong></article>
                <article><span>Saídas</span><strong>{money.format(overview.statement.filter((item) => item.type === "debit").reduce((sum, item) => sum + Math.abs(item.amount), 0))}</strong></article>
                <article><span>Saldo atual</span><strong>{money.format(overview.balance)}</strong></article>
              </div>
              <div className="statement-list">
                {statement.map((item) => <button key={item.id} onClick={() => setReceipt(item)}><i className={item.type}>{item.type === "credit" ? "↓" : "↑"}</i><div><strong>{item.title}</strong><small>{item.detail}</small></div><b className={item.type}>{item.type === "credit" ? "+ " : "- "}{money.format(Math.abs(item.amount))}</b><span>›</span></button>)}
                {!statement.length && <p className="empty-banking">Nenhuma movimentação corresponde aos filtros.</p>}
              </div>
            </div>
          )}

          {tab === "bill" && (
            <div className="banking-operation">
              <div className="operation-copy"><span>BOLETO BANCÁRIO</span><h3>Pague com validação em duas etapas.</h3><p>O código, o beneficiário, o saldo e o PIN transacional são conferidos antes do registro.</p><div className="operation-flow"><b>1</b><i/><b>2</b><i/><b>3</b><span>Leitura</span><span>Validação</span><span>Comprovante</span></div></div>
              <form onSubmit={submitBill}>
                <label>Código de barras<input value={bill.barcode} onChange={(event) => setBill({ ...bill, barcode: event.target.value.replace(/\D/g, "").slice(0, 48) })} inputMode="numeric" placeholder="44 a 48 dígitos" required /></label>
                <label>Beneficiário<input value={bill.payee} onChange={(event) => setBill({ ...bill, payee: event.target.value })} placeholder="Ex.: Energia Brasília" required /></label>
                <div className="split-fields"><label>Valor<input value={bill.amount} onChange={(event) => setBill({ ...bill, amount: event.target.value })} inputMode="decimal" placeholder="0,00" required /></label><label>PIN do cartão<input type="password" value={bill.pin} onChange={(event) => setBill({ ...bill, pin: event.target.value.replace(/\D/g, "").slice(0, 4) })} inputMode="numeric" placeholder="••••" required /></label></div>
                <button disabled={working || bill.pin.length !== 4}>{working ? "Validando…" : "Pagar boleto"}</button>
                <small>PIN demonstrativo: 7314</small>
              </form>
            </div>
          )}

          {tab === "schedule" && (
            <div className="schedule-view">
              <div className="banking-operation compact">
                <div className="operation-copy"><span>AGENDA FINANCEIRA</span><h3>Programe um Pix.</h3><p>O valor não é descontado agora. A agenda registra a intenção e permite demonstrar automação bancária.</p></div>
                <form onSubmit={submitSchedule}>
                  <label>Chave Pix<input value={schedule.pixKey} onChange={(event) => setSchedule({ ...schedule, pixKey: event.target.value })} placeholder="CPF, telefone ou e-mail" required /></label>
                  <div className="split-fields"><label>Valor<input value={schedule.amount} onChange={(event) => setSchedule({ ...schedule, amount: event.target.value })} inputMode="decimal" placeholder="0,00" required /></label><label>Data<input type="date" value={schedule.date} min={new Date().toISOString().slice(0, 10)} onChange={(event) => setSchedule({ ...schedule, date: event.target.value })} required /></label></div>
                  <label>PIN do cartão<input type="password" value={schedule.pin} onChange={(event) => setSchedule({ ...schedule, pin: event.target.value.replace(/\D/g, "").slice(0, 4) })} inputMode="numeric" placeholder="••••" required /></label>
                  <button disabled={working || schedule.pin.length !== 4}>{working ? "Agendando…" : "Confirmar agendamento"}</button>
                </form>
              </div>
              <div className="scheduled-list"><div className="banking-section-heading"><div><span>PRÓXIMOS</span><h3>Agendamentos</h3></div></div>{overview?.schedules.map((item) => <article key={item.id}><b>◷</b><div><strong>{item.kind} para {item.recipient}</strong><small>{new Date(`${item.scheduledDate}T12:00:00`).toLocaleDateString("pt-BR", { dateStyle: "long" })}</small></div><span>{money.format(item.amount)}<small>{item.status}</small></span></article>)}{!overview?.schedules.length && <p className="empty-banking">Nenhum pagamento agendado.</p>}</div>
            </div>
          )}

          {tab === "card" && overview && (
            <div className="card-center">
              <div className={`suite-card ${overview.card.blocked ? "blocked" : ""}`}><header><img src="/ranbank-logo.jpeg" alt=""/><span>PLATINUM VIRTUAL</span></header><strong>•••• &nbsp;•••• &nbsp;•••• &nbsp;4821</strong><footer><span>ANA RIBEIRO</span><b>08/31</b></footer>{overview.card.blocked && <em>CARTÃO BLOQUEADO</em>}</div>
              <div className="card-control-panel">
                <div className="card-numbers"><article><span>Fatura atual</span><strong>{money.format(overview.card.spent)}</strong></article><article><span>Limite disponível</span><strong>{money.format(overview.card.available)}</strong></article></div>
                <div className="limit-meter"><span><i style={{ width: `${Math.min(100, overview.card.spent / overview.card.limit * 100)}%` }}/></span><small>{money.format(overview.card.spent)} usados de {money.format(overview.card.limit)}</small></div>
                <button className={overview.card.blocked ? "card-unblock" : "card-block"} disabled={working} onClick={() => perform("/banking/card/toggle", "PATCH", undefined, overview.card.blocked ? "Cartão desbloqueado." : "Cartão bloqueado temporariamente.")}>{overview.card.blocked ? "Desbloquear cartão" : "Bloquear temporariamente"}</button>
                <form onSubmit={async (event) => { event.preventDefault(); const ok = await perform("/banking/card/limit", "PUT", { limit: parseMoneyInput(limit.value), transactionPin: limit.pin }, "Novo limite definido."); if (ok) setLimit({ value: "", pin: "" }); }}>
                  <h4>Ajustar limite</h4>
                  <div className="split-fields"><label>Novo limite<input value={limit.value} onChange={(event) => setLimit({ ...limit, value: event.target.value })} inputMode="decimal" placeholder="6.000,00" required /></label><label>PIN<input type="password" value={limit.pin} onChange={(event) => setLimit({ ...limit, pin: event.target.value.replace(/\D/g, "").slice(0, 4) })} inputMode="numeric" placeholder="••••" required /></label></div>
                  <button disabled={working || limit.pin.length !== 4}>Atualizar limite</button>
                </form>
              </div>
            </div>
          )}

          {tab === "savings" && overview && (
            <div className="savings-center">
              <div className="savings-hero"><div><span>RESERVA FUTURE</span><strong>{money.format(overview.savingsBalance)}</strong><small>Meta: {money.format(overview.savingsGoal)}</small></div><div className="savings-ring" style={{ "--progress": `${Math.min(100, overview.savingsBalance / overview.savingsGoal * 100)}%` } as React.CSSProperties}><b>{Math.round(Math.min(100, overview.savingsBalance / overview.savingsGoal * 100))}%</b></div></div>
              <div className="savings-grid"><article><span>Rendimento projetado</span><strong>{money.format(overview.savingsBalance * 0.0105)}</strong><small>Simulação mensal a 1,05%</small></article><article><span>Disponível na conta</span><strong>{money.format(overview.balance)}</strong><small>Para transferir ao cofrinho</small></article></div>
              <div className="savings-form"><div><span>MOVIMENTAR RESERVA</span><h3>Guardar ou resgatar</h3><p>Acompanhe a evolução da sua reserva e a projeção mensal no mesmo painel.</p></div><form onSubmit={(event) => event.preventDefault()}><div className="split-fields"><label>Valor<input value={savings.amount} onChange={(event) => setSavings({ ...savings, amount: event.target.value })} inputMode="decimal" placeholder="0,00" /></label><label>PIN<input type="password" value={savings.pin} onChange={(event) => setSavings({ ...savings, pin: event.target.value.replace(/\D/g, "").slice(0, 4) })} inputMode="numeric" placeholder="••••" /></label></div><div><button disabled={working || savings.pin.length !== 4} onClick={() => moveSavings("deposit")}>Guardar</button><button className="secondary" disabled={working || savings.pin.length !== 4} onClick={() => moveSavings("withdraw")}>Resgatar</button></div></form></div>
            </div>
          )}
        </div>
      </section>

      {receipt && <div className="receipt-backdrop" onMouseDown={() => setReceipt(null)}><article className="bank-receipt" onMouseDown={(event) => event.stopPropagation()}><header><img src="/ranbank-logo.jpeg" alt="Ranbank"/><div><span>COMPROVANTE</span><strong>Operação concluída</strong></div><button onClick={() => setReceipt(null)}>×</button></header><div className="receipt-check">✓</div><h3>{("operation" in receipt) ? receipt.operation : receipt.title}</h3><strong>{money.format(Math.abs(receipt.amount))}</strong><dl><div><dt>Identificador</dt><dd>RB-{("transactionId" in receipt ? receipt.transactionId : receipt.id).toString().padStart(6, "0")}</dd></div><div><dt>Descrição</dt><dd>{"recipient" in receipt ? receipt.recipient : receipt.detail}</dd></div><div><dt>Data</dt><dd>{"timestamp" in receipt ? new Date(receipt.timestamp).toLocaleString("pt-BR") : "Registrado no extrato"}</dd></div><div><dt>Segurança</dt><dd>{"authentication" in receipt ? receipt.authentication : "Registro verificado"}</dd></div></dl><button className="receipt-done" onClick={() => setReceipt(null)}>Concluir</button></article></div>}
    </div>
  );
}
