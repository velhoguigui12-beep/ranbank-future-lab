"use client";

import { useEffect, useState } from "react";
import { apiFetch, responseMessage } from "./api";
import { BkLoading, BkSheet } from "./BkSheet";
import { formatBrazilianPhone } from "./inputMasks";

type Account = { id: number; customerName: string; accountNumber: string; email: string; phoneNumber?: string; maskedDocument: string; role: string; active: boolean; deleted: boolean; balance: number; createdAt: string };
type Props = { open: boolean; onClose: () => void };

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function AccountManagementModal({ open, onClose }: Props) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const response = await apiFetch("/admin/accounts");
      if (!response.ok) throw new Error(await responseMessage(response, "Não foi possível carregar as contas."));
      setAccounts(await response.json());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível carregar as contas.");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!open) return;
    let active = true;
    apiFetch("/admin/accounts").then(async (response) => {
      if (!active) return;
      if (!response.ok) throw new Error(await responseMessage(response, "Não foi possível carregar as contas."));
      setAccounts(await response.json());
      setError("");
    }).catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Não foi possível carregar as contas."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open]);

  const changeStatus = async (account: Account) => {
    setBusyId(account.id); setError("");
    const response = await apiFetch(`/admin/accounts/${account.id}/status`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !account.active }),
    });
    if (response.ok) {
      const updated: Account = await response.json();
      setAccounts((current) => current.map((item) => item.id === updated.id ? updated : item));
    } else setError(await responseMessage(response, "Não foi possível alterar a conta."));
    setBusyId(null);
  };

  const remove = async (account: Account) => {
    if (!window.confirm(`Remover ${account.customerName}? Os dados pessoais serão anonimizados e o histórico será preservado.`)) return;
    setBusyId(account.id); setError("");
    const response = await apiFetch(`/admin/accounts/${account.id}`, { method: "DELETE" });
    if (response.ok) await load(); else setError(await responseMessage(response, "Não foi possível remover a conta."));
    setBusyId(null);
  };

  if (!open) return null;
  return <BkSheet label="Administração" title="Gerenciar contas" onClose={onClose} wide>
    <div className="bk-stats is-two"><article><span>Contas ativas</span><strong>{accounts.filter((account) => account.active).length}</strong></article><article><span>Registros</span><strong>{accounts.length}</strong></article></div>
    {error && <p className="bk-error" role="alert">{error}</p>}
    {loading ? <BkLoading text="Carregando contas…" /> : <ul className="bk-rows">{accounts.map((account) => (
      <li key={account.id}>
        <div><strong>{account.customerName} <b className={`bk-pill ${account.deleted ? "is-bad" : account.active ? "is-ok" : "is-warn"}`}>{account.deleted ? "Removida" : account.active ? "Ativa" : "Desativada"}</b>{account.role === "ADMIN" && <b className="bk-pill">Admin</b>}</strong><small>{account.email} · {account.phoneNumber ? formatBrazilianPhone(account.phoneNumber) : "sem telefone"} · conta {account.accountNumber} · {money.format(account.balance)}</small></div>
        {account.id > 2 && !account.deleted ? <span className="bk-row-actions"><button className="bk-mini-btn" disabled={busyId === account.id} onClick={() => changeStatus(account)}>{account.active ? "Desativar" : "Reativar"}</button><button className="bk-mini-btn is-danger" disabled={busyId === account.id} onClick={() => remove(account)}>Remover</button></span> : account.id <= 2 ? <small className="bk-muted">Conta da apresentação</small> : null}
      </li>
    ))}</ul>}
  </BkSheet>;
}
