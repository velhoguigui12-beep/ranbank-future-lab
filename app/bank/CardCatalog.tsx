"use client";
/* eslint-disable @next/next/no-img-element -- Vinext serves the local card artwork directly. */

import { useState } from "react";
import type { ReactNode } from "react";
import { openRani } from "../RaniAssistant";
import type { OwnCard } from "./cards";

// Catálogo de cartões: só o cartão da conta funciona. Os outros são vitrines bloqueadas (nada é salvo no banco de dados).
type CardId = "basic" | "ecocard" | "black" | "jovem";
type CardInfo = { id: CardId; name: string; tag: string; summary: string; perks: string[]; locked?: { title: string; text: string }; note?: string };

const CARDS: CardInfo[] = [
  {
    id: "basic", name: "RanBank", tag: "Cartão básico",
    summary: "O cartão de toda conta nova: sem anuidade, com bloqueio e limite no app. Bandeira Nativa.",
    perks: ["Sem anuidade", "Bloqueio e desbloqueio em um toque", "Limite que você ajusta"],
  },
  {
    id: "ecocard", name: "Ecocard", tag: "Clientes da casa",
    summary: "Para quem já é cliente do RanBank: cashback, material de origem sustentável e parte de cada compra para projetos de comunidades indígenas.",
    perks: ["Cashback em todas as compras", "Parte das compras para projetos indígenas", "Feito de material de origem sustentável", "Limite maior que o do cartão básico"],
    locked: { title: "O Ecocard é para clientes da casa", text: "Ele é liberado para quem já usa o RanBank há algum tempo. Fale com o nosso atendimento para saber quando a sua conta pode receber." },
    note: "A parte das compras para comunidades indígenas é uma proposta: os projetos seriam escolhidos pelas próprias comunidades.",
  },
  {
    id: "black", name: "RanBank Black", tag: "Exclusivo",
    summary: "Para quem tem um relacionamento mais longo com o banco.",
    perks: ["Limite alto", "Atendimento prioritário 24 horas", "Salas VIP em aeroportos"],
    locked: { title: "Você ainda não tem acesso a este cartão", text: "O RanBank Black é oferecido por convite, conforme o seu relacionamento com o banco. Fale com o nosso atendimento para saber como conseguir." },
  },
  {
    id: "jovem", name: "RanBank Jovem", tag: "Em breve",
    summary: "Para quem está começando: limite pequeno, aviso a cada compra e dicas de educação financeira no app.",
    perks: ["Limite inicial pequeno", "Aviso a cada compra", "Dicas para organizar o dinheiro"],
    locked: { title: "Você ainda não tem acesso a este cartão", text: "O RanBank Jovem ainda não está disponível. Fale com o nosso atendimento para entrar na lista de espera." },
  },
];

const LABELS: Record<Exclude<CardId, "ecocard">, string> = { basic: "", black: "BLACK", jovem: "JOVEM" };

export function CardArt({ id, small = false }: { id: CardId; small?: boolean }) {
  if (id === "ecocard") return <img className={`cc-art cc-img ${small ? "is-small" : ""}`} src="/images/ranbank-ecocard-nativa-frente.webp" alt={small ? "" : "Cartão Ecocard RanBank"} />;
  const name = id === "basic" ? "RanBank" : `${LABELS[id]} RanBank`;
  return (
    <div className={`cc-art cc-${id} ${small ? "is-small" : ""}`} role={small ? undefined : "img"} aria-label={small ? undefined : `Cartão ${name}, imagem ilustrativa`}>
      <span className="cc-logo"><img src="/ranbank-logo-transparent.png" alt="" /></span>
      <i className="cc-chip" aria-hidden="true" />
      {LABELS[id] && <b>{LABELS[id]}</b>}
      <small>CLIENTE RANBANK</small>
      <span className="cc-brand" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M11.5 20C6.5 18.5 3.5 13 4.5 5.5c5 1.5 8 6 7 14.5zM12.5 20c5-1.5 8-7 7-14.5-5 1.5-8 6-7 14.5z" /></svg><strong>NATIVA</strong></span>
    </div>
  );
}

export default function CardCatalog({ children, enabled = true, own = "basic" }: { children: ReactNode; enabled?: boolean; own?: OwnCard }) {
  const [selected, setSelected] = useState<CardId>(own);
  const [open, setOpen] = useState(false);
  if (!enabled) return <>{children}</>;
  const card = CARDS.find((item) => item.id === selected) ?? CARDS[0];
  const isMine = card.id === own;
  // A Ana tem o Ecocard: o básico aparece para ela só como comparação.
  const lockedView = !isMine && (card.id === "basic"
    ? { title: "Você já tem um cartão com mais benefícios", text: "O seu Ecocard inclui tudo o que o cartão básico oferece, e mais." }
    : card.locked);
  const tagOf = (item: CardInfo) => (item.id === own ? "Seu cartão" : item.tag);

  return (
    <>
      <section className="cc-picker">
        <button type="button" className="cc-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
          <CardArt id={card.id} small />
          <span><small>Cartão selecionado</small><strong>{card.name}</strong></span>
          <em className={`cc-tag ${isMine ? "is-mine" : ""}`}>{tagOf(card)}</em>
          <i className={`cc-chevron ${open ? "is-open" : ""}`} aria-hidden="true">⌄</i>
        </button>
        {open && (
          <ul className="cc-list" aria-label="Tipos de cartão">
            {CARDS.map((item) => (
              <li key={item.id}>
                <button type="button" className={item.id === selected ? "is-active" : ""} onClick={() => { setSelected(item.id); setOpen(false); }}>
                  <CardArt id={item.id} small />
                  <span><strong>{item.name}</strong><small>{item.summary}</small></span>
                  <em className={`cc-tag ${item.id === own ? "is-mine" : ""}`}>{item.id === own ? "Seu cartão" : `🔒 ${item.tag}`}</em>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {lockedView ? (
        <section className="cc-locked">
          <div className="cc-locked-art"><CardArt id={card.id} /><span className="cc-lock" aria-hidden="true">🔒</span></div>
          <div className="cc-locked-copy">
            <em className="cc-tag">{card.tag}</em>
            <h2>{card.name}</h2>
            <p>{card.summary}</p>
            <ul>{card.perks.map((perk) => <li key={perk}>{perk}</li>)}</ul>
            <div className="cc-message" role="status"><strong>{lockedView.title}</strong><p>{lockedView.text}</p></div>
            {card.id === "basic"
              ? <button type="button" className="bk-btn bk-btn-primary" onClick={() => setSelected(own)}>Ver o meu Ecocard</button>
              : <button type="button" className="bk-btn bk-btn-primary" onClick={() => openRani(`Quero saber sobre o cartão ${card.name}`)}>Falar com o atendimento</button>}
            {card.note && <small className="cc-note">{card.note}</small>}
          </div>
        </section>
      ) : (
        <>
          {card.id === "ecocard" && (
            <section className="cc-perks" aria-label="Benefícios do Ecocard">
              {card.perks.map((perk) => <span key={perk}>✓ {perk}</span>)}
            </section>
          )}
          {children}
        </>
      )}
    </>
  );
}
