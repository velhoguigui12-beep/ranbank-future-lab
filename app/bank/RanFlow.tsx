"use client";

import { useEffect, useRef, useState } from "react";
import type { TransactionView } from "./transactionFormatting";

/*
 * RanFlow: um fluxo de gatilhos no estilo do n8n.
 * Cada transação dispara o fluxo. Os blocos "Se" verificam sinais de risco,
 * o bloco "Código" soma os pontos e o bloco "Decisão" escolhe o caminho.
 * Tudo é calculado a partir dos dados informados (nada é roteiro fixo).
 */

type Channel = "pix" | "card";
type FlowEvent = { channel: Channel; amount: number; hour: number; city: string; newDevice: boolean; newRecipient: boolean };
type CheckId = "amount" | "device" | "location" | "hour" | "recipient";
type Decision = "approve" | "confirm" | "block";
type Rules = { amountLimit: number; weights: Record<CheckId, number>; enabled: Record<CheckId, boolean>; confirmAt: number; blockAt: number };
type CheckResult = { id: CheckId; state: "hit" | "pass" | "skip"; points: number; detail: string; output: Record<string, string | number | boolean> };
type Evaluation = { checks: CheckResult[]; signals: number; bonus: number; score: number; decision: Decision };
type Execution = { id: number; at: string; event: FlowEvent; score: number; decision: Decision; source: "teste" | "lote" | "conta" };

const HOME_CITY = "Brasília - DF";
const CITIES = [HOME_CITY, "São Paulo - SP", "Salvador - BA", "Manaus - AM", "Fora do Brasil"];
const CHECKS: Array<{ id: CheckId; title: string; question: string }> = [
  { id: "amount", title: "Valor alto?", question: "O valor passa do limite definido?" },
  { id: "device", title: "Aparelho novo?", question: "É a primeira vez que este aparelho acessa a conta?" },
  { id: "location", title: "Cidade diferente?", question: "A transação vem de uma cidade diferente da de costume?" },
  { id: "hour", title: "Madrugada?", question: "Acontece entre 0h e 5h59?" },
  { id: "recipient", title: "Destinatário novo?", question: "O Pix vai para alguém que nunca recebeu desta conta?" },
];
const DEFAULT_RULES: Rules = {
  amountLimit: 1000,
  weights: { amount: 30, device: 25, location: 25, hour: 15, recipient: 20 },
  enabled: { amount: true, device: true, location: true, hour: true, recipient: true },
  confirmAt: 30,
  blockAt: 70,
};
const COMBO_BONUS = 10;
const DECISIONS: Record<Decision, { label: string; action: string; detail: string }> = {
  approve: { label: "Aprovar", action: "Aprovar e registrar", detail: "Transação liberada e salva no extrato." },
  confirm: { label: "Confirmar", action: "Pedir confirmação", detail: "Cliente recebe um aviso e confirma no app." },
  block: { label: "Bloquear", action: "Bloquear e avisar a equipe", detail: "Transação parada. Uma pessoa da equipe analisa." },
};
const SCENARIOS: Array<{ label: string; event: FlowEvent }> = [
  { label: "Compra normal", event: { channel: "card", amount: 85, hour: 14, city: HOME_CITY, newDevice: false, newRecipient: false } },
  { label: "Pix alto de madrugada", event: { channel: "pix", amount: 2400, hour: 3, city: HOME_CITY, newDevice: false, newRecipient: false } },
  { label: "Celular novo", event: { channel: "pix", amount: 2950, hour: 23, city: "Manaus - AM", newDevice: true, newRecipient: true } },
];
const STEP_MS = 260;
const TOTAL_STEPS = 9; // gatilho + 5 verificações + código + decisão + ação

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const hourLabel = (hour: number) => `${String(hour).padStart(2, "0")}h`;

function evaluate(event: FlowEvent, rules: Rules): Evaluation {
  const checks = CHECKS.map(({ id }): CheckResult => {
    if (!rules.enabled[id]) return { id, state: "skip", points: 0, detail: "Regra desligada", output: { regraAtiva: false } };
    let hit = false;
    let detail = "";
    let output: CheckResult["output"] = {};
    if (id === "amount") {
      hit = event.amount > rules.amountLimit;
      detail = `${money.format(event.amount)} ${hit ? "passa" : "não passa"} de ${money.format(rules.amountLimit)}`;
      output = { valor: event.amount, limite: rules.amountLimit, resultado: hit };
    } else if (id === "device") {
      hit = event.newDevice;
      detail = hit ? "Primeiro acesso deste aparelho" : "Aparelho já conhecido";
      output = { aparelhoNovo: event.newDevice, resultado: hit };
    } else if (id === "location") {
      hit = event.city !== HOME_CITY;
      detail = hit ? `${event.city}, fora da cidade de costume` : "Cidade de costume";
      output = { cidade: event.city, cidadeHabitual: HOME_CITY, resultado: hit };
    } else if (id === "hour") {
      hit = event.hour < 6;
      detail = `${hourLabel(event.hour)} ${hit ? "é madrugada" : "é horário comum"}`;
      output = { hora: event.hour, madrugada: "0h a 5h59", resultado: hit };
    } else {
      if (event.channel !== "pix") return { id, state: "skip", points: 0, detail: "Só vale para Pix", output: { canal: "cartão", aplicavel: false } };
      hit = event.newRecipient;
      detail = hit ? "Nunca recebeu Pix desta conta" : "Já recebeu Pix antes";
      output = { destinatarioNovo: event.newRecipient, resultado: hit };
    }
    const points = hit ? rules.weights[id] : 0;
    return { id, state: hit ? "hit" : "pass", points, detail, output: { ...output, pontos: points } };
  });
  const signals = checks.filter((check) => check.state === "hit").length;
  const bonus = signals >= 3 ? COMBO_BONUS : 0;
  const score = Math.min(100, checks.reduce((total, check) => total + check.points, 0) + bonus);
  const decision: Decision = score >= rules.blockAt ? "block" : score >= rules.confirmAt ? "confirm" : "approve";
  return { checks, signals, bonus, score, decision };
}

function randomEvent(): FlowEvent {
  const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];
  const suspicious = Math.random() < 0.32;
  const channel: Channel = Math.random() < 0.55 ? "pix" : "card";
  if (!suspicious) {
    return { channel, amount: Math.round(15 + Math.random() * 480), hour: 7 + Math.floor(Math.random() * 16), city: Math.random() < 0.9 ? HOME_CITY : pick(CITIES), newDevice: Math.random() < 0.05, newRecipient: Math.random() < 0.25 };
  }
  return { channel, amount: Math.round(300 + Math.random() * 4200), hour: Math.random() < 0.5 ? Math.floor(Math.random() * 6) : 8 + Math.floor(Math.random() * 15), city: Math.random() < 0.65 ? pick(CITIES.slice(1)) : HOME_CITY, newDevice: Math.random() < 0.55, newRecipient: Math.random() < 0.7 };
}

function nodeState(index: number, step: number) {
  if (step < 0) return "idle";
  if (index < step) return "done";
  if (index === step) return "running";
  return "idle";
}

export default function RanFlow({ transactions }: { transactions: TransactionView[] }) {
  const [event, setEvent] = useState<FlowEvent>(SCENARIOS[2].event);
  const [rules, setRules] = useState<Rules>(DEFAULT_RULES);
  const [current, setCurrent] = useState<{ event: FlowEvent; result: Evaluation } | null>(null);
  const [step, setStep] = useState(-1);
  const [selected, setSelected] = useState<string>("switch");
  const [history, setHistory] = useState<Execution[]>([]);
  const [nextId, setNextId] = useState(1);
  const timers = useRef<number[]>([]);

  useEffect(() => () => { timers.current.forEach((timer) => window.clearTimeout(timer)); }, []);

  const record = (items: Array<{ event: FlowEvent; source: Execution["source"] }>, activeRules: Rules) => {
    const now = new Date();
    const created = items.map((item, index) => {
      const result = evaluate(item.event, activeRules);
      return { id: nextId + index, at: new Date(now.getTime() + index).toISOString(), event: item.event, score: result.score, decision: result.decision, source: item.source };
    });
    setNextId(nextId + items.length);
    setHistory((previous) => [...created.reverse(), ...previous].slice(0, 60));
  };

  const run = (flowEvent: FlowEvent) => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    const result = evaluate(flowEvent, rules);
    setCurrent({ event: flowEvent, result });
    setSelected("switch");
    setStep(0);
    for (let index = 1; index <= TOTAL_STEPS; index += 1) {
      timers.current.push(window.setTimeout(() => setStep(index), index * STEP_MS));
    }
    record([{ event: flowEvent, source: "teste" }], rules);
  };

  const runBatch = () => record(Array.from({ length: 30 }, () => ({ event: randomEvent(), source: "lote" as const })), rules);

  const runAccount = () => {
    const debits = transactions.filter((transaction) => transaction.amount < 0).slice(0, 20);
    if (!debits.length) return;
    record(debits.map((transaction) => ({
      source: "conta" as const,
      event: {
        channel: /pix|transfer/i.test(transaction.title) ? "pix" : "card",
        amount: Math.abs(transaction.amount),
        hour: transaction.occurredAt ? new Date(transaction.occurredAt).getHours() : 12,
        city: HOME_CITY,
        newDevice: false,
        newRecipient: false,
      } satisfies FlowEvent,
    })), rules);
  };

  const reprocess = () => setHistory((previous) => previous.map((item) => {
    const result = evaluate(item.event, rules);
    return { ...item, score: result.score, decision: result.decision };
  }));

  const updateEvent = <K extends keyof FlowEvent>(key: K, value: FlowEvent[K]) => setEvent((previous) => ({ ...previous, [key]: value }));
  const updateWeight = (id: CheckId, value: number) => setRules((previous) => ({ ...previous, weights: { ...previous.weights, [id]: value } }));
  const toggleRule = (id: CheckId) => setRules((previous) => ({ ...previous, enabled: { ...previous.enabled, [id]: !previous.enabled[id] } }));

  const result = current?.result;
  const counts = { approve: 0, confirm: 0, block: 0 } as Record<Decision, number>;
  history.forEach((item) => { counts[item.decision] += 1; });
  const total = history.length;
  const percent = (value: number) => (total ? Math.round((value / total) * 100) : 0);
  const approveEnd = percent(counts.approve);
  const confirmEnd = approveEnd + percent(counts.confirm);
  const bars = history.slice(0, 24).reverse();

  const selectedOutput: Record<string, string | number | boolean> | null = !current || !result ? null
    : selected === "trigger" ? { canal: current.event.channel === "pix" ? "Pix" : "Cartão", valor: current.event.amount, hora: current.event.hour, cidade: current.event.city, aparelhoNovo: current.event.newDevice, destinatarioNovo: current.event.newRecipient }
    : selected === "code" ? { sinaisEncontrados: result.signals, pontosDosSinais: result.score - result.bonus, bonusCombinacao: result.bonus, risco: result.score }
    : selected === "switch" ? { risco: result.score, confirmarAPartirDe: rules.confirmAt, bloquearAPartirDe: rules.blockAt, caminho: DECISIONS[result.decision].label }
    : selected.startsWith("action-") ? { acao: DECISIONS[selected.slice(7) as Decision].action, executada: result.decision === selected.slice(7) }
    : result.checks.find((check) => check.id === selected)?.output ?? null;

  const checkBadge = (check: CheckResult) => check.state === "hit" ? `+${check.points} pontos` : check.state === "pass" ? "Tudo certo" : "Pulado";

  return (
    <section className="rf" aria-labelledby="ranflow-title">
      <header className="rf-head">
        <span className="bk-tag">Central antifraude</span>
        <h2 id="ranflow-title">Fluxo de gatilhos RanFlow</h2>
        <p>Toda transação dispara este fluxo. Os blocos verificam sinais de risco, somam pontos e decidem sozinhos: aprovar, pedir confirmação ou bloquear.</p>
      </header>

      <div className="rf-top">
        <form className="rf-panel rf-event" onSubmit={(formEvent) => { formEvent.preventDefault(); run(event); }}>
          <h3>Transação de teste</h3>
          <div className="rf-scenarios">
            {SCENARIOS.map((scenario) => <button type="button" key={scenario.label} onClick={() => setEvent(scenario.event)}>{scenario.label}</button>)}
          </div>
          <div className="rf-seg" role="group" aria-label="Tipo de transação">
            <button type="button" className={event.channel === "pix" ? "active" : ""} onClick={() => updateEvent("channel", "pix")}>Pix</button>
            <button type="button" className={event.channel === "card" ? "active" : ""} onClick={() => updateEvent("channel", "card")}>Cartão</button>
          </div>
          <label>Valor<input value={money.format(event.amount)} inputMode="numeric" onChange={(input) => updateEvent("amount", Math.min(100000, Number(input.target.value.replace(/D/g, "").slice(0, 9) || "0") / 100))} /></label>
          <label>Horário: <b>{hourLabel(event.hour)}</b><input type="range" min={0} max={23} value={event.hour} onChange={(input) => updateEvent("hour", Number(input.target.value))} /></label>
          <label>Cidade<select value={event.city} onChange={(input) => updateEvent("city", input.target.value)}>{CITIES.map((city) => <option key={city}>{city}</option>)}</select></label>
          <label className="rf-check"><input type="checkbox" checked={event.newDevice} onChange={(input) => updateEvent("newDevice", input.target.checked)} />Aparelho novo</label>
          <label className="rf-check"><input type="checkbox" checked={event.newRecipient} disabled={event.channel !== "pix"} onChange={(input) => updateEvent("newRecipient", input.target.checked)} />Destinatário novo (Pix)</label>
          <button className="bk-btn bk-btn-primary" type="submit">▶ Executar fluxo</button>
        </form>

        <div className="rf-panel rf-canvas-panel">
          <div className="rf-canvas" aria-label="Blocos do fluxo">
            <div className="rf-col">
              <button type="button" className={`rf-node is-trigger is-${nodeState(0, step)} ${selected === "trigger" ? "is-selected" : ""}`} onClick={() => setSelected("trigger")}>
                <i>⚡</i><span><small>Gatilho</small><strong>Nova transação</strong><em>{current ? `${current.event.channel === "pix" ? "Pix" : "Cartão"} · ${money.format(current.event.amount)}` : "Aguardando"}</em></span>
              </button>
            </div>
            <div className="rf-col rf-checks">
              {CHECKS.map((check, index) => {
                const checkResult = result?.checks[index];
                const state = nodeState(index + 1, step);
                const outcome = state === "done" && checkResult ? `is-${checkResult.state}` : "";
                return (
                  <button type="button" key={check.id} title={check.question} className={`rf-node is-${state} ${outcome} ${selected === check.id ? "is-selected" : ""}`} onClick={() => setSelected(check.id)}>
                    <i>?</i><span><small>Se</small><strong>{check.title}</strong><em>{state === "done" && checkResult ? checkBadge(checkResult) : rules.enabled[check.id] ? `vale ${rules.weights[check.id]} pontos` : "desligado"}</em></span>
                  </button>
                );
              })}
            </div>
            <div className="rf-col">
              <button type="button" className={`rf-node is-${nodeState(6, step)} ${selected === "code" ? "is-selected" : ""}`} onClick={() => setSelected("code")}>
                <i>{"{}"}</i><span><small>Código</small><strong>Somar risco</strong><em>{result && step > 6 ? `${result.score} de 100` : "Soma os pontos"}</em></span>
              </button>
              <button type="button" className={`rf-node is-${nodeState(7, step)} ${selected === "switch" ? "is-selected" : ""}`} onClick={() => setSelected("switch")}>
                <i>⑂</i><span><small>Decisão</small><strong>Qual caminho?</strong><em>{result && step > 7 ? DECISIONS[result.decision].label : `${rules.confirmAt} / ${rules.blockAt} pontos`}</em></span>
              </button>
            </div>
            <div className="rf-col rf-outs">
              {(Object.keys(DECISIONS) as Decision[]).map((decision) => {
                const reached = result && step >= 8;
                const chosen = reached && result.decision === decision;
                return (
                  <button type="button" key={decision} className={`rf-node is-out-${decision} ${chosen ? (step > 8 ? "is-done is-chosen" : "is-running") : reached ? "is-dim" : "is-idle"} ${selected === `action-${decision}` ? "is-selected" : ""}`} onClick={() => setSelected(`action-${decision}`)}>
                    <i>{decision === "approve" ? "✓" : decision === "confirm" ? "!" : "×"}</i><span><small>Ação</small><strong>{DECISIONS[decision].action}</strong><em>{chosen && step > 8 ? "Executada" : DECISIONS[decision].detail}</em></span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rf-output">
            <div className="rf-output-head"><strong>Saída do bloco</strong><small>Clique em um bloco para ver o que ele calculou</small></div>
            {selectedOutput ? (
              <pre>{JSON.stringify(selectedOutput, null, 2)}</pre>
            ) : <p className="bk-muted">Execute o fluxo para ver os dados passando pelos blocos.</p>}
          </div>
        </div>
      </div>

      <div className="rf-bottom">
        <div className="rf-panel rf-rules">
          <div className="rf-panel-head"><h3>Regras do fluxo</h3><button type="button" onClick={() => setRules(DEFAULT_RULES)}>Restaurar</button></div>
          <label>Limite de valor: <b>{money.format(rules.amountLimit)}</b><input type="range" min={100} max={5000} step={100} value={rules.amountLimit} onChange={(input) => setRules({ ...rules, amountLimit: Number(input.target.value) })} /></label>
          {CHECKS.map((check) => (
            <div className="rf-rule" key={check.id}>
              <label className="rf-check"><input type="checkbox" checked={rules.enabled[check.id]} onChange={() => toggleRule(check.id)} />{check.title}</label>
              <input type="range" min={0} max={50} step={5} value={rules.weights[check.id]} disabled={!rules.enabled[check.id]} onChange={(input) => updateWeight(check.id, Number(input.target.value))} aria-label={`Pontos de ${check.title}`} />
              <b>{rules.weights[check.id]}</b>
            </div>
          ))}
          <label>Pedir confirmação a partir de: <b>{rules.confirmAt} pontos</b><input type="range" min={10} max={90} step={5} value={rules.confirmAt} onChange={(input) => { const value = Number(input.target.value); setRules({ ...rules, confirmAt: value, blockAt: Math.max(rules.blockAt, value + 10) }); }} /></label>
          <label>Bloquear a partir de: <b>{rules.blockAt} pontos</b><input type="range" min={20} max={100} step={5} value={rules.blockAt} onChange={(input) => { const value = Number(input.target.value); setRules({ ...rules, blockAt: value, confirmAt: Math.min(rules.confirmAt, value - 10) }); }} /></label>
          <small className="bk-muted">Com 3 sinais ou mais, o bloco Código soma {COMBO_BONUS} pontos extras.</small>
        </div>

        <div className="rf-panel rf-history">
          <div className="rf-panel-head">
            <h3>Execuções</h3>
            <div className="rf-actions">
              <button type="button" onClick={runBatch}>Simular 30 transações</button>
              <button type="button" onClick={runAccount}>Analisar minha conta</button>
              <button type="button" onClick={reprocess} disabled={!total}>Reprocessar com regras novas</button>
              <button type="button" onClick={() => setHistory([])} disabled={!total}>Limpar</button>
            </div>
          </div>
          {total ? (
            <>
              <div className="rf-summary">
                <div className="rf-donut" style={{ background: `conic-gradient(var(--rf-approve) 0 ${approveEnd}%, var(--rf-confirm) ${approveEnd}% ${confirmEnd}%, var(--rf-block) ${confirmEnd}% 100%)` }} aria-hidden="true"><span>{total}</span></div>
                <ul>
                  <li><i className="is-approve" />Aprovadas <b>{counts.approve}</b><small>{percent(counts.approve)}%</small></li>
                  <li><i className="is-confirm" />Confirmação <b>{counts.confirm}</b><small>{percent(counts.confirm)}%</small></li>
                  <li><i className="is-block" />Bloqueadas <b>{counts.block}</b><small>{percent(counts.block)}%</small></li>
                </ul>
              </div>
              <div className="rf-chart" aria-label="Risco das últimas execuções">
                <span className="rf-line is-block" style={{ bottom: `${rules.blockAt}%` }}><small>Bloquear {rules.blockAt}</small></span>
                <span className="rf-line is-confirm" style={{ bottom: `${rules.confirmAt}%` }}><small>Confirmar {rules.confirmAt}</small></span>
                {bars.map((item) => <i key={item.id} className={`is-${item.decision}`} style={{ height: `${Math.max(3, item.score)}%` }} title={`${money.format(item.event.amount)} · risco ${item.score}`} />)}
              </div>
              <div className="rf-table" role="table" aria-label="Últimas execuções">
                <div role="row" className="rf-table-head"><span>Origem</span><span>Transação</span><span>Onde e quando</span><span>Risco</span><span>Caminho</span></div>
                {history.slice(0, 7).map((item) => (
                  <div role="row" key={item.id}>
                    <span>{item.source === "teste" ? "Teste" : item.source === "lote" ? "Simulação" : "Minha conta"}</span>
                    <span>{item.event.channel === "pix" ? "Pix" : "Cartão"} · {money.format(item.event.amount)}</span>
                    <span>{item.event.city.replace(" - ", "/")} · {hourLabel(item.event.hour)}</span>
                    <b>{item.score}</b>
                    <em className={`is-${item.decision}`}>{DECISIONS[item.decision].label}</em>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="bk-muted rf-empty">Execute o fluxo ou clique em “Simular 30 transações” para ver os gráficos.</p>}
        </div>
      </div>

      <p className="rf-note">Simulação educacional: a lógica roda no seu navegador e não movimenta dinheiro. Em um banco de verdade, este fluxo rodaria no servidor, com muito mais sinais.</p>
    </section>
  );
}
