"use client";

import { useEffect, useState } from "react";
import { apiFetch, responseMessage } from "./api";
import { BkSheet } from "./BkSheet";
import { formatBrazilianPhone, formatCpf, normalizeEmailInput } from "./inputMasks";

type PixKey = { id: number; type: "EMAIL" | "CPF" | "PHONE" | "RANDOM"; value: string; createdAt: string };
type Props = { open: boolean; onClose: () => void };

const labels = { EMAIL: "E-mail", CPF: "CPF", PHONE: "Telefone", RANDOM: "Aleatória" };

export default function PixKeysModal({ open, onClose }: Props) {
  const [keys, setKeys] = useState<PixKey[]>([]);
  const [type, setType] = useState<PixKey["type"]>("EMAIL");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const formatValue = (nextValue: string) => type === "CPF" ? formatCpf(nextValue)
    : type === "PHONE" ? formatBrazilianPhone(nextValue) : normalizeEmailInput(nextValue);

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
  return <BkSheet label="Pix" title="Minhas chaves Pix" onClose={onClose}>
    <p className="bk-lead">As chaves são o jeito de outras pessoas enviarem Pix para você.</p>
    <ul className="bk-rows">{keys.map((key) => <li key={key.id}><div><strong>{labels[key.type]}</strong><small>{key.value}</small></div><button className="bk-mini-btn" onClick={() => remove(key)} disabled={keys.length <= 1} title={keys.length <= 1 ? "Mantenha pelo menos uma chave" : "Remover chave"}>Remover</button></li>)}</ul>
    <form className="bk-form" onSubmit={create}>
      <h3 className="bk-sheet-title">Nova chave</h3>
      <label>Tipo<select className="bk-select" value={type} onChange={(event) => { setType(event.target.value as PixKey["type"]); setValue(""); }}><option value="EMAIL">E-mail</option><option value="CPF">CPF</option><option value="PHONE">Telefone</option><option value="RANDOM">Aleatória</option></select></label>
      {type !== "RANDOM" && <label>Valor<input value={value} onChange={(event) => setValue(formatValue(event.target.value))} inputMode={type === "EMAIL" ? "email" : "numeric"} autoCapitalize="none" spellCheck={false} maxLength={type === "CPF" ? 14 : type === "PHONE" ? 15 : 255} required placeholder={type === "EMAIL" ? "voce@email.com" : type === "CPF" ? "000.000.000-00" : "(00) 00000-0000"}/></label>}
      <button className="bk-btn bk-btn-primary" disabled={loading}>{loading ? "Salvando…" : type === "RANDOM" ? "Gerar chave aleatória" : "Adicionar chave"}</button>
    </form>
    {error && <p className="bk-error" role="alert">{error}</p>}
  </BkSheet>;
}
