"use client";
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions -- The backdrop closes the modal; the dialog stops propagation. */

import { useEffect, useState } from "react";
import { apiFetch, responseMessage } from "./api";
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
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className="admin-accounts-modal" role="dialog" aria-modal="true" aria-labelledby="accounts-title" onMouseDown={(event) => event.stopPropagation()}>
    <header><div><span>ADMINISTRAÇÃO · CONTAS E ACESSOS</span><h2 id="accounts-title">Gerenciar contas</h2></div><button onClick={onClose} aria-label="Fechar contas">×</button></header>
    <div className="management-summary"><strong>{accounts.filter((account) => account.active).length}</strong><span>contas ativas</span><b>{accounts.length} registros</b></div>
    {error && <p className="management-error" role="alert">{error}</p>}
    {loading ? <div className="analysis-loading"><i/><p>Carregando contas…</p></div> : <div className="account-management-list">{accounts.map((account) => <article key={account.id} className={`${!account.active ? "inactive" : ""} ${account.deleted ? "deleted" : ""}`}>
      <div className="account-identity"><span>{account.customerName.split(/\s+/).map((part) => part[0]).slice(0,2).join("")}</span><div><strong>{account.customerName}</strong><small>{account.email} · {account.phoneNumber ? formatBrazilianPhone(account.phoneNumber) : "sem telefone"} · {account.accountNumber}</small></div></div>
      <div className="account-admin-meta"><span>{account.role}</span><b>{money.format(account.balance)}</b><em>{account.deleted ? "REMOVIDA" : account.active ? "ATIVA" : "DESATIVADA"}</em></div>
      <div className="account-admin-actions">{account.id > 2 && !account.deleted && <><button disabled={busyId === account.id} onClick={() => changeStatus(account)}>{account.active ? "Desativar" : "Reativar"}</button><button className="danger" disabled={busyId === account.id} onClick={() => remove(account)}>Remover</button></>} {account.id <= 2 && <small>Conta protegida da apresentação</small>}</div>
    </article>)}</div>}
  </section></div>;
}
