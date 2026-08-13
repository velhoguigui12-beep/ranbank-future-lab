"use client";

import { useEffect, useMemo, useState } from "react";

export type InnovationTab = "open-finance" | "audit" | "journey";
type Institution = { name: string; scope: string; balance: number; connected: boolean };
type OpenFinance = { customer: string; consentExpires: string; institutions: Institution[] };
type Audit = { algorithm: string; integrityVerified: boolean; entries: Array<{ block: number; event: string; previousHash: string; hash: string; status: string }> };
type Journey = { scenario: string; riskScore: number; decision: string; steps: Array<{ order: number; technology: string; title: string; explanation: string; status: string }> };

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const labels: Array<{ id: InnovationTab; icon: string; label: string }> = [
  { id: "open-finance", icon: "OF", label: "Open Finance" },
  { id: "audit", icon: "#", label: "Auditoria" },
  { id: "journey", icon: "IA", label: "Jornada antifraude" },
];

export default function InnovationHub({ open, initialTab, onClose }: { open: boolean; initialTab: InnovationTab; onClose: () => void }) {
  const [tab, setTab] = useState<InnovationTab>(initialTab);
  const [openFinance, setOpenFinance] = useState<OpenFinance | null>(null);
  const [audit, setAudit] = useState<Audit | null>(null);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async (nextTab: InnovationTab) => {
    setLoading(true);
    setError("");
    try {
      const endpoint = nextTab === "open-finance" ? "/innovation/open-finance" : nextTab === "audit" ? "/innovation/audit" : "/innovation/fraud-journey";
      const response = await fetch(`${API_BASE}${endpoint}`, { credentials: "include" });
      if (!response.ok) throw new Error("Não foi possível carregar este módulo.");
      const payload = await response.json();
      if (nextTab === "open-finance") setOpenFinance(payload);
      else if (nextTab === "audit") setAudit(payload);
      else setJourney(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Módulo indisponível.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setTab(initialTab);
    load(initialTab);
  }, [open, initialTab]);

  const connectedTotal = useMemo(() => openFinance?.institutions.filter((item) => item.connected).reduce((total, item) => total + item.balance, 0) ?? 0, [openFinance]);

  const selectTab = (next: InnovationTab) => {
    setTab(next);
    load(next);
  };

  const toggleInstitution = async (institution: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/innovation/open-finance/toggle`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ institution }),
      });
      if (!response.ok) throw new Error("Não foi possível atualizar o consentimento.");
      setOpenFinance(await response.json());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Consentimento indisponível.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="innovation-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="innovation-hub" role="dialog" aria-modal="true" aria-labelledby="innovation-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="innovation-header">
          <div><span>RANBANK FUTURE LAB</span><h2 id="innovation-title">Ecossistema conectado</h2></div>
          <p>Veja tecnologias diferentes atuando sobre a mesma experiência bancária.</p>
          <button onClick={onClose} aria-label="Fechar ecossistema conectado">×</button>
        </header>
        <nav className="innovation-tabs" aria-label="Módulos de inovação">
          {labels.map((item) => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => selectTab(item.id)}><b>{item.icon}</b><span>{item.label}</span></button>)}
        </nav>
        <div className="innovation-body">
          {loading && <div className="innovation-loading"><i/><span>Conectando tecnologias…</span></div>}
          {error && <p className="innovation-error" role="alert">{error}</p>}

          {tab === "open-finance" && openFinance && (
            <div className="open-finance-view">
              <div className="innovation-lead"><span>CONSENTIMENTO E PORTABILIDADE DE DADOS</span><h3>Uma visão financeira, várias instituições.</h3><p>A cliente escolhe quais instituições podem compartilhar informações e pode revogar o acesso quando quiser.</p></div>
              <div className="finance-total"><span>Patrimônio conectado</span><strong>{money.format(connectedTotal)}</strong><small>Consentimentos válidos até {new Date(`${openFinance.consentExpires}T12:00:00`).toLocaleDateString("pt-BR")}</small></div>
              <div className="institution-list">
                {openFinance.institutions.map((item) => <article key={item.name} className={item.connected ? "connected" : ""}><b>{item.name.slice(0, 2).toUpperCase()}</b><div><strong>{item.name}</strong><small>{item.scope}</small></div><span><strong>{item.connected ? money.format(item.balance) : "Acesso pausado"}</strong><small>{item.connected ? "Dados sincronizados" : "Sem compartilhamento"}</small></span>{item.name === "Ranbank" ? <em>PRINCIPAL</em> : <button disabled={loading} onClick={() => toggleInstitution(item.name)}>{item.connected ? "Revogar" : "Conectar"}</button>}</article>)}
              </div>
              <div className="consent-flow"><span>Cliente autoriza</span><i>→</i><span>APIs padronizadas</span><i>→</i><span>Dados consolidados</span><i>→</i><span>Consentimento revogável</span></div>
            </div>
          )}

          {tab === "audit" && audit && (
            <div className="audit-view">
              <div className="innovation-lead"><span>REGISTRO ENCADEADO · {audit.algorithm}</span><h3>Cada evento protege o próximo.</h3><p>Alterar um registro mudaria seu hash e quebraria a ligação com toda a sequência posterior.</p></div>
              <div className="audit-status"><b>✓</b><div><span>INTEGRIDADE VERIFICADA</span><strong>{audit.entries.length} eventos consistentes</strong></div><em>CADEIA ÍNTEGRA</em></div>
              <div className="ledger-chain">
                {audit.entries.map((entry, index) => <article key={entry.block}><div><span>BLOCO {String(entry.block).padStart(2, "0")}</span><b>{entry.status}</b></div><h4>{entry.event}</h4><dl><div><dt>Hash anterior</dt><dd>{entry.previousHash}</dd></div><div><dt>Hash atual</dt><dd>{entry.hash}</dd></div></dl>{index < audit.entries.length - 1 && <i>↓</i>}</article>)}
              </div>
              <p className="audit-note"><b>Conceito:</b> o Ranbank usa um ledger encadeado para explicar imutabilidade e rastreabilidade, princípios também usados em soluções blockchain.</p>
            </div>
          )}

          {tab === "journey" && journey && (
            <div className="journey-view">
              <div className="journey-summary"><div><span>CENÁRIO ANALISADO</span><h3>{journey.scenario}</h3><strong>{journey.decision}</strong></div><div className="journey-score"><b>{journey.riskScore}</b><small>/100<br/>RISCO</small></div></div>
              <div className="journey-timeline">
                {journey.steps.map((step) => <article key={step.order} className={step.status === "AGUARDANDO" ? "waiting" : "done"}><div><b>{step.order}</b><i/></div><section><span>{step.technology}</span><h4>{step.title}</h4><p>{step.explanation}</p></section><em>{step.status}</em></article>)}
              </div>
              <div className="human-decision"><b>H</b><div><span>HUMANO NO CONTROLE</span><strong>A tecnologia reúne evidências; a pessoa assume a decisão crítica.</strong></div></div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
