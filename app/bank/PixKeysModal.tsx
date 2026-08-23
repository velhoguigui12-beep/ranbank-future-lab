"use client";
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions -- The backdrop closes the modal; the dialog stops propagation. */

import { useEffect, useState } from "react";
import { apiFetch, responseMessage } from "./api";

type PixKey = { id: number; type: "EMAIL" | "CPF" | "PHONE" | "RANDOM"; value: string; createdAt: string };
type Props = { open: boolean; onClose: () => void };

const labels = { EMAIL: "E-mail", CPF: "CPF", PHONE: "Telefone", RANDOM: "Aleatória" };

export default function PixKeysModal({ open, onClose }: Props) {
  const [keys, setKeys] = useState<PixKey[]>([]);
  const [type, setType] = useState<PixKey["type"]>("EMAIL");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    const response = await apiFetch("/pix/keys");
    if (response.ok) setKeys(await response.json()); else setError(await responseMessage(response, "Não foi possível carregar as chaves."));
    setLoading(false);
  };
  useEffect(() => {
    if (!open) return;
    let active = true;
    apiFetch("/pix/keys").then(async (response) => {
      if (!active) return;
      if (!response.ok) throw new Error(await responseMessage(response, "Não foi possível carregar as chaves."));
      setKeys(await response.json());
      setError("");
    }).catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Não foi possível carregar as chaves."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open]);

  const create = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError("");
    const response = await apiFetch("/pix/keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, value }) });
    if (response.ok) { setValue(""); await load(); } else { setError(await responseMessage(response, "Não foi possível criar a chave.")); setLoading(false); }
  };
  const remove = async (key: PixKey) => {
    if (!window.confirm(`Remover a chave ${key.value}?`)) return;
    const response = await apiFetch(`/pix/keys/${key.id}`, { method: "DELETE" });
    if (response.ok) await load(); else setError(await responseMessage(response, "Não foi possível remover a chave."));
  };

  if (!open) return null;
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className="pix-keys-modal" role="dialog" aria-modal="true" aria-labelledby="pix-keys-title" onMouseDown={(event) => event.stopPropagation()}>
    <header><div><span>PIX · RECEBIMENTOS</span><h2 id="pix-keys-title">Minhas chaves Pix</h2></div><button onClick={onClose} aria-label="Fechar chaves">×</button></header>
    <div className="pix-key-list">{keys.map((key) => <article key={key.id}><span>{key.type === "EMAIL" ? "@" : key.type === "CPF" ? "ID" : key.type === "PHONE" ? "☎" : "◆"}</span><div><strong>{labels[key.type]}</strong><small>{key.value}</small></div><button onClick={() => remove(key)} disabled={keys.length <= 1} title={keys.length <= 1 ? "Mantenha pelo menos uma chave" : "Remover chave"}>×</button></article>)}</div>
    <form className="new-pix-key" onSubmit={create}><label>Tipo<select value={type} onChange={(event) => { setType(event.target.value as PixKey["type"]); setValue(""); }}><option value="EMAIL">E-mail</option><option value="CPF">CPF</option><option value="PHONE">Telefone</option><option value="RANDOM">Aleatória</option></select></label>{type !== "RANDOM" && <label>Valor<input value={value} onChange={(event) => setValue(event.target.value)} required placeholder={type === "EMAIL" ? "voce@email.com" : type === "CPF" ? "000.000.000-00" : "+55 11 99999-0000"}/></label>}<button disabled={loading}>{loading ? "Salvando…" : type === "RANDOM" ? "Gerar chave aleatória" : "Adicionar chave"}</button></form>
    {error && <p className="management-error" role="alert">{error}</p>}
  </section></div>;
}
