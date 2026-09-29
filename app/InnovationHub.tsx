"use client";

import { useEffect, useMemo, useState } from "react";
import { BkLoading, BkSheet } from "./bank/BkSheet";

// Open Finance: conectar ou cancelar outros bancos (dados guardados no servidor).
export type InnovationTab = "open-finance";
type Institution = { name: string; scope: string; balance: number; connected: boolean };
type OpenFinance = { customer: string; consentExpires: string; institutions: Institution[] };

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function InnovationHub({ open, onClose }: { open: boolean; initialTab: InnovationTab; onClose: () => void }) {
  const [openFinance, setOpenFinance] = useState<OpenFinance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const request = async (init?: RequestInit) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/innovation/open-finance${init ? "/toggle" : ""}`, { credentials: "include", ...init });
      if (!response.ok) throw new Error(init ? "Não foi possível atualizar a autorização." : "Não foi possível carregar os bancos conectados.");
      setOpenFinance(await response.json());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Serviço indisponível.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => { void request(); });
  }, [open]);

  const connectedTotal = useMemo(() => openFinance?.institutions.filter((item) => item.connected).reduce((total, item) => total + item.balance, 0) ?? 0, [openFinance]);

  const toggleInstitution = (institution: string) => request({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ institution }),
  });

  if (!open) return null;

  return (
    <BkSheet label="Dados com autorização" title="Compartilhar dados entre bancos" onClose={onClose} wide>
      <p className="bk-lead">Com o Open Finance, a cliente escolhe quais bancos podem compartilhar os dados dela e pode cancelar quando quiser. Conecte ou cancele um banco e veja o total mudar.</p>
      {loading && !openFinance && <BkLoading text="Carregando…" />}
      {error && <p className="bk-error" role="alert">{error}</p>}
      {openFinance && <>
        <div className="bk-stats is-two">
          <article><span>Dinheiro nos bancos conectados</span><strong>{money.format(connectedTotal)}</strong><small>{openFinance.institutions.filter((item) => item.connected).length} de {openFinance.institutions.length} bancos</small></article>
          <article><span>Autorização válida até</span><strong>{new Date(`${openFinance.consentExpires}T12:00:00`).toLocaleDateString("pt-BR")}</strong></article>
        </div>
        <ul className="bk-rows">
          {openFinance.institutions.map((item) => (
            <li key={item.name}>
              <div><strong>{item.name} <b className={`bk-pill ${item.connected ? "is-ok" : ""}`}>{item.connected ? "Conectado" : "Pausado"}</b></strong><small>{item.scope} · {item.connected ? money.format(item.balance) : "sem compartilhamento"}</small></div>
              {item.name === "RanBank" ? <b className="bk-pill">Principal</b> : <button className="bk-mini-btn" disabled={loading} onClick={() => toggleInstitution(item.name)}>{item.connected ? "Cancelar acesso" : "Conectar"}</button>}
            </li>
          ))}
        </ul>
        <ol className="bk-flow"><li>Cliente autoriza</li><li>Bancos trocam dados</li><li>Tudo em um lugar</li><li>Pode cancelar</li></ol>
      </>}
    </BkSheet>
  );
}
