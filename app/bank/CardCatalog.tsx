"use client";
/* eslint-disable @next/next/no-img-element -- Vinext serves the local card artwork directly. */

import { useState } from "react";
import type { ReactNode } from "react";
import { openRani } from "../RaniAssistant";

// Catálogo de cartões: só o Ecocard é da conta. Os outros são vitrines bloqueadas (nada é salvo no banco de dados).
type CardId = "ecocard" | "black" | "originario" | "jovem";
type CardInfo = { id: CardId; name: string; tag: string; summary: string; perks: string[]; locked?: { title: string; text: string }; note?: string };

const CARDS: CardInfo[] = [
  {
    id: "ecocard", name: "Ecocard", tag: "Seu cartão",
    summary: "Feito de material de origem sustentável, com cashback nas compras. Bandeira Nativa.",
    perks: ["Bloqueio e desbloqueio em um toque", "Limite que você ajusta", "Fatura no app"],
  },
  {
    id: "black", name: "RanBank Black", tag: "Exclusivo",
    summary: "Para quem tem um relacionamento mais longo com o banco.",
    perks: ["Limite alto", "Atendimento prioritário 24 horas", "Salas VIP em aeroportos"],
    locked: { title: "Você ainda não tem acesso a este cartão", text: "O RanBank Black é oferecido por convite, conforme o seu relacionamento com o banco. Fale com o nosso atendimento para saber como conseguir." },
  },
  {
    id: "originario", name: "Originário", tag: "Proposta",
    summary: "Uma proposta de cartão criada junto com povos indígenas: parte de cada compra iria para projetos escolhidos pelas próprias comunidades.",
    perks: ["Parte das compras para as comunidades", "Decisões tomadas com as comunidades", "Prestação de contas pública"],
    locked: { title: "Este cartão ainda é uma proposta", text: "O Originário está em estudo e ainda não pode ser pedido. Fale com o nosso atendimento para conhecer a ideia." },
    note: "Arte ilustrativa. A arte final seria criada por artistas indígenas, com autorização e pagamento.",
  },
  {
    id: "jovem", name: "RanBank Jovem", tag: "Em breve",
    summary: "Para quem está começando: limite pequeno, aviso a cada compra e dicas de educação financeira no app.",
    perks: ["Limite inicial pequeno", "Aviso a cada compra", "Dicas para organizar o dinheiro"],
    locked: { title: "Você ainda não tem acesso a este cartão", text: "O RanBank Jovem ainda não está disponível. Fale com o nosso atendimento para entrar na lista de espera." },
  },
];

export function CardArt({ id, small = false }: { id: CardId; small?: boolean }) {
  if (id === "ecocard") return <img className={`cc-art cc-img ${small ? "is-small" : ""}`} src="/images/ranbank-ecocard-nativa-frente.webp" alt={small ? "" : "Cartão Ecocard RanBank"} />;
  const labels: Record<Exclude<CardId, "ecocard">, string> = { black: "BLACK", originario: "ORIGINÁRIO", jovem: "JOVEM" };
  return (
    <div className={`cc-art cc-${id} ${small ? "is-small" : ""}`} role={small ? undefined : "img"} aria-label={small ? undefined : `Cartão ${labels[id]} RanBank, imagem ilustrativa`}>
      <span className="cc-logo"><img src="/ranbank-logo-transparent.png" alt="" /></span>
      <i className="cc-chip" aria-hidden="true" />
      <b>{labels[id]}</b>
      <small>CLIENTE RANBANK</small>
      <span className="cc-brand" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M11.5 20C6.5 18.5 3.5 13 4.5 5.5c5 1.5 8 6 7 14.5zM12.5 20c5-1.5 8-7 7-14.5-5 1.5-8 6-7 14.5z" /></svg><strong>NATIVA</strong></span>
    </div>
  );
}

export default function CardCatalog({ children, enabled = true }: { children: ReactNode; enabled?: boolean }) {
  const [selected, setSelected] = useState<CardId>("ecocard");
  const [open, setOpen] = useState(false);
  if (!enabled) return <>{children}</>;
  const card = CARDS.find((item) => item.id === selected) ?? CARDS[0];

  return (
    <>
      <section className="cc-picker">
        <button type="button" className="cc-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
          <CardArt id={card.id} small />
          <span><small>Cartão selecionado</small><strong>{card.name}</strong></span>
          <em className={`cc-tag ${card.locked ? "" : "is-mine"}`}>{card.tag}</em>
          <i className={`cc-chevron ${open ? "is-open" : ""}`} aria-hidden="true">⌄</i>
        </button>
        {open && (
          <ul className="cc-list" aria-label="Tipos de cartão">
            {CARDS.map((item) => (
              <li key={item.id}>
                <button type="button" className={item.id === selected ? "is-active" : ""} onClick={() => { setSelected(item.id); setOpen(false); }}>
                  <CardArt id={item.id} small />
                  <span><strong>{item.name}</strong><small>{item.summary}</small></span>
                  <em className={`cc-tag ${item.locked ? "" : "is-mine"}`}>{item.locked ? `🔒 ${item.tag}` : item.tag}</em>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {card.locked ? (
        <section className="cc-locked">
          <div className="cc-locked-art"><CardArt id={card.id} /><span className="cc-lock" aria-hidden="true">🔒</span></div>
          <div className="cc-locked-copy">
            <em className="cc-tag">{card.tag}</em>
            <h2>{card.name}</h2>
            <p>{card.summary}</p>
            <ul>{card.perks.map((perk) => <li key={perk}>{perk}</li>)}</ul>
            <div className="cc-message" role="status"><strong>{card.locked.title}</strong><p>{card.locked.text}</p></div>
            <button type="button" className="bk-btn bk-btn-primary" onClick={() => openRani(`Quero saber sobre o cartão ${card.name}`)}>Falar com o atendimento</button>
            {card.note && <small className="cc-note">{card.note}</small>}
          </div>
        </section>
      ) : children}
    </>
  );
}
