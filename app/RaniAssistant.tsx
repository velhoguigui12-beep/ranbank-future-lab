"use client";
/* eslint-disable @next/next/no-img-element -- Vinext serves the local assistant portrait directly. */

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "./bank/api";
import { answerRani, RANI_SUGGESTIONS, raniWelcome } from "./rani-knowledge";
import type { RaniAnswer, RaniContext, RaniScreen } from "./rani-knowledge";

type Confirm = "block" | "unblock";
type Extra =
  | { kind: "balance"; balance: number; savings: number }
  | { kind: "recent"; items: Array<{ title: string; detail?: string; amount: number; type: string }> };
type Message = {
  id: number;
  role: "rani" | "user" | "system";
  text: string;
  time: string;
  answer?: RaniAnswer;
  extra?: Extra;
  confirm?: Confirm;
  confirmDone?: boolean;
  feedback?: "up" | "down";
  read?: boolean;
};
type Overview = { customerName: string; cardLastFour: string; balance: number; savingsBalance: number; card: { blocked: boolean }; statement: Array<{ title: string; detail?: string; amount: number; type: string }> };

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const clock = () => new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
// Número de protocolo fictício: data de hoje + 4 dígitos.
const newProtocol = () => `${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;
const NO_FEEDBACK = new Set(["Oi!", "De nada", "Rani"]);

/** Abre a Rani de qualquer lugar da página. Se receber uma pergunta, ela já responde. */
export const openRani = (question?: unknown) => window.dispatchEvent(new CustomEvent("rani:open", { detail: typeof question === "string" ? question : undefined }));

async function readOverview(): Promise<Overview | null> {
  try {
    const response = await apiFetch("/banking/overview");
    return response.ok ? await response.json() as Overview : null;
  } catch {
    return null;
  }
}

export default function RaniAssistant({ context, onNavigate, userName, onChanged, cardName = "cartão" }: {
  context: RaniContext;
  onNavigate?: (target: RaniScreen) => void;
  /** Nome do cartão da conta ("Ecocard" ou "cartão RanBank"). */
  cardName?: string;
  /** Primeiro nome de quem está no banco, para a Rani cumprimentar. */
  userName?: string;
  /** Avisa a página quando a Rani muda algo na conta (por exemplo, bloqueia o cartão). */
  onChanged?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [streaming, setStreaming] = useState<{ id: number; words: number; total: number } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [rating, setRating] = useState<"ask" | "done" | null>(null);
  const [stars, setStars] = useState(0);
  const [rated, setRated] = useState(false);
  const nextId = useRef(1);
  const lastTopic = useRef<string | undefined>(undefined);
  const listRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const askRef = useRef<(question: string) => void>(() => undefined);

  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
  const busy = typing || streaming !== null;

  // Boas-vindas na primeira vez que a conversa abre.
  useEffect(() => {
    if (open && messages.length === 0) setMessages([{ id: nextId.current++, role: "rani", text: raniWelcome(context, userName), time: clock(), answer: { topic: "Oi!", text: "", follow: RANI_SUGGESTIONS[context] } }]);
  }, [open, messages.length, context, userName]);

  useEffect(() => {
    const show = (event: Event) => {
      setOpen(true);
      setRating(null);
      const question = (event as CustomEvent<string | undefined>).detail;
      if (question) window.setTimeout(() => askRef.current(question), 50);
    };
    window.addEventListener("rani:open", show);
    const pending = timers.current;
    return () => { window.removeEventListener("rani:open", show); pending.forEach((id) => window.clearTimeout(id)); };
  }, []);

  // Texto aparecendo aos poucos, palavra por palavra.
  useEffect(() => {
    if (!streaming) return;
    const timer = window.setTimeout(() => setStreaming((current) => current && current.words < current.total ? { ...current, words: current.words + 1 } : null), 28);
    return () => window.clearTimeout(timer);
  }, [streaming]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, streaming, rating]);

  const push = (message: Omit<Message, "id" | "time">) => {
    const id = nextId.current++;
    setMessages((previous) => [...previous, { ...message, id, time: clock() }]);
    return id;
  };

  // Mostra "digitando…" e depois escreve a resposta aos poucos.
  const reply = (message: Omit<Message, "id" | "time" | "role">, delay = 500) => new Promise<void>((resolve) => {
    setTyping(true);
    later(() => {
      setTyping(false);
      const id = push({ role: "rani", ...message });
      setStreaming({ id, words: 0, total: message.text.split(" ").length });
      later(resolve, message.text.split(" ").length * 28 + 200);
    }, delay);
  });
  const system = (text: string) => push({ role: "system", text });

  const runAction = async (answer: RaniAnswer) => {
    if (answer.action === "human") {
      await reply({ text: "Certo! Vou te passar para uma pessoa do atendimento. Só um instante.", answer: { ...answer, follow: undefined } });
      later(() => system("Você é o 2º da fila · tempo estimado: 2 minutos"), 700);
      const protocol = newProtocol();
      later(() => system(`Protocolo de atendimento: ${protocol}`), 1700);
      later(() => { void reply({ text: "Aviso: esta parte é uma simulação. O RanBank é um projeto educacional e não tem atendentes. Num banco de verdade, uma pessoa entraria agora na conversa, já vendo tudo o que você me contou, sem você precisar repetir.", answer: { topic: "Atendimento", text: "", follow: answer.follow } }, 900); }, 2300);
      return;
    }

    setTyping(true);
    const overview = await readOverview();
    setTyping(false);
    if (!overview) {
      await reply({ text: "Não consegui consultar sua conta agora. Tente de novo em alguns segundos.", answer: { ...answer, follow: ["Falar com atendente"] } }, 200);
      return;
    }
    if (answer.action === "balance") {
      await reply({ text: `Seu saldo disponível é ${money.format(overview.balance)}.`, extra: { kind: "balance", balance: overview.balance, savings: overview.savingsBalance }, answer }, 200);
    } else if (answer.action === "recent") {
      const items = overview.statement.slice(0, 3);
      await reply({ text: items.length ? "Estas são suas últimas movimentações:" : "Você ainda não tem movimentações.", extra: items.length ? { kind: "recent", items } : undefined, answer: { ...answer, screen: { label: "Ver o extrato completo", target: "statement" } } }, 200);
    } else if (answer.action === "blockCard") {
      if (overview.card.blocked) await reply({ text: `Seu cartão final ${overview.cardLastFour} já está bloqueado. Quer desbloquear?`, confirm: "unblock", answer: { ...answer, follow: undefined } }, 200);
      else await reply({ text: `Quer mesmo bloquear o ${cardName} final ${overview.cardLastFour}? Ninguém vai conseguir comprar com ele, e você pode desbloquear quando quiser.`, confirm: "block", answer: { ...answer, follow: undefined } }, 200);
    } else if (answer.action === "unblockCard") {
      if (!overview.card.blocked) await reply({ text: `Seu cartão final ${overview.cardLastFour} já está liberado. Quer bloquear?`, confirm: "block", answer: { ...answer, follow: undefined } }, 200);
      else await reply({ text: `Quer desbloquear o ${cardName} final ${overview.cardLastFour}? Ele volta a funcionar na hora.`, confirm: "unblock", answer: { ...answer, follow: undefined } }, 200);
    }
  };

  const confirm = async (message: Message, yes: boolean) => {
    setMessages((previous) => previous.map((item) => item.id === message.id ? { ...item, confirmDone: true } : item));
    push({ role: "user", text: yes ? (message.confirm === "block" ? "Sim, bloquear" : "Sim, desbloquear") : "Agora não", read: true });
    if (!yes) { await reply({ text: "Tudo bem, não mexi em nada.", answer: { topic: "Cartão", text: "", follow: RANI_SUGGESTIONS[context] } }); return; }
    setTyping(true);
    let blocked: boolean | null = null;
    try {
      const response = await apiFetch("/banking/card/toggle", { method: "PATCH" });
      if (response.ok) blocked = Boolean((await response.json() as { blocked: boolean }).blocked);
    } catch { /* trata abaixo */ }
    setTyping(false);
    if (blocked === null) { await reply({ text: "Não consegui mudar o cartão agora. Tente de novo ou vá direto na área Cartão.", answer: { topic: "Cartão", text: "", screen: { label: "Abrir o Cartão", target: "cards" } } }, 200); return; }
    onChanged?.();
    await reply({
      text: blocked ? "Pronto, bloqueei o seu cartão. ✓ Se foi por perda ou roubo, fique de olho no extrato nos próximos dias." : "Pronto, desbloqueei o seu cartão. ✓ Ele já pode ser usado de novo.",
      answer: { topic: blocked ? "Cartão bloqueado" : "Cartão desbloqueado", text: "", screen: { label: "Ver o cartão", target: "cards" }, follow: blocked ? ["Desbloquear meu cartão", "Meus últimos Pix"] : ["Bloquear meu cartão", "Qual meu saldo?"] },
    }, 300);
  };

  const ask = (question: string) => {
    const text = question.trim();
    if (!text || busy) return;
    const userId = push({ role: "user", text });
    setInput("");
    const answer = answerRani(text, context, lastTopic.current);
    lastTopic.current = answer.topic;
    // A mensagem aparece como lida logo antes de a Rani começar a digitar.
    later(() => setMessages((previous) => previous.map((item) => item.id === userId ? { ...item, read: true } : item)), 350);
    later(() => {
      if (answer.action && (context === "bank" || answer.action === "human")) void runAction(answer);
      else void reply({ text: answer.text, answer }, 350 + Math.min(700, answer.text.length * 4));
    }, 400);
  };

  useEffect(() => { askRef.current = ask; });

  const close = () => {
    const talked = messages.some((message) => message.role === "user");
    if (talked && !rated && rating === null) { setRating("ask"); return; }
    setOpen(false);
    setRating(null);
  };
  const rate = (value: number) => {
    setStars(value); setRated(true); setRating("done");
    later(() => { setOpen(false); setRating(null); }, 1400);
  };
  const giveFeedback = (id: number, value: "up" | "down") => setMessages((previous) => previous.map((item) => item.id === id ? { ...item, feedback: value } : item));

  const lastRani = [...messages].reverse().find((message) => message.role === "rani");
  const chips = !busy && !lastRani?.confirm ? (lastRani?.answer?.follow?.length ? lastRani.answer.follow : RANI_SUGGESTIONS[context]) : [];

  return (
    <div className={`rani rani-${context}`}>
      {open && (
        <aside className="rani-panel" aria-label="Conversa com a Rani, assistente do RanBank">
          <header>
            <span className="rani-avatar"><img src="/images/ran-assistente-humana.png" alt="" /><i aria-hidden="true" /></span>
            <div><strong>Rani</strong><small>{busy ? "digitando…" : "Online · responde na hora"}</small></div>
            <button type="button" onClick={close} aria-label="Fechar conversa com a Rani">×</button>
          </header>

          <div className="rani-messages" ref={listRef} aria-live="polite">
            <p className="rani-day">Hoje</p>
            {messages.map((message) => {
              if (message.role === "system") return <p key={message.id} className="rani-system">{message.text}</p>;
              const isStreaming = streaming?.id === message.id;
              const text = isStreaming ? message.text.split(" ").slice(0, streaming.words).join(" ") : message.text;
              const done = !isStreaming;
              return (
                <div key={message.id} className={`rani-row ${message.role === "user" ? "is-user" : ""}`}>
                  <div className={`rani-bubble ${message.role === "user" ? "is-user" : ""}`}>
                    {message.role === "rani" && message.answer && !NO_FEEDBACK.has(message.answer.topic) && message.answer.topic !== "Ainda não sei" && <small>{message.answer.topic}</small>}
                    <p>{text}</p>
                    {done && message.extra?.kind === "balance" && (
                      <div className="rani-card">
                        <div><small>Saldo disponível</small><strong>{money.format(message.extra.balance)}</strong></div>
                        <div><small>No cofrinho</small><b>{money.format(message.extra.savings)}</b></div>
                      </div>
                    )}
                    {done && message.extra?.kind === "recent" && (
                      <ul className="rani-card rani-list">
                        {message.extra.items.map((item, index) => (
                          <li key={index}><span><strong>{item.title}</strong>{item.detail && <small>{item.detail}</small>}</span><b className={item.type === "credit" ? "is-in" : ""}>{item.type === "credit" ? "+ " : "- "}{money.format(Math.abs(item.amount))}</b></li>
                        ))}
                      </ul>
                    )}
                    {done && message.confirm && !message.confirmDone && (
                      <div className="rani-confirm">
                        <button type="button" className={message.confirm === "block" ? "is-danger" : ""} onClick={() => void confirm(message, true)}>{message.confirm === "block" ? "Sim, bloquear" : "Sim, desbloquear"}</button>
                        <button type="button" onClick={() => void confirm(message, false)}>Agora não</button>
                      </div>
                    )}
                    {done && message.answer?.link && <a className="rani-action" href={message.answer.link.href} onClick={() => setOpen(false)}>{message.answer.link.label} →</a>}
                    {done && message.answer?.screen && onNavigate && <button type="button" className="rani-action" onClick={() => { onNavigate(message.answer!.screen!.target); setOpen(false); }}>{message.answer.screen.label} →</button>}
                  </div>
                  <span className="rani-meta">
                    {message.time}
                    {message.role === "user" && <i className={message.read ? "is-read" : ""} aria-label={message.read ? "Lida" : "Enviada"}>✓✓</i>}
                    {message.role === "rani" && done && message.answer && !NO_FEEDBACK.has(message.answer.topic) && !message.confirm && message.answer.action !== "human" && (
                      message.feedback
                        ? <em>{message.feedback === "up" ? "Obrigada pelo retorno!" : "Obrigada! Vou melhorar essa resposta."}</em>
                        : <span className="rani-thumbs">Ajudou? <button type="button" onClick={() => giveFeedback(message.id, "up")} aria-label="Sim, ajudou">👍</button><button type="button" onClick={() => giveFeedback(message.id, "down")} aria-label="Não ajudou">👎</button></span>
                    )}
                  </span>
                </div>
              );
            })}
            {typing && <div className="rani-row"><div className="rani-bubble rani-typing" aria-label="Rani está digitando"><i /><i /><i /></div></div>}
            {rating && (
              <div className="rani-rating">
                {rating === "ask" ? (
                  <>
                    <strong>Como foi a conversa com a Rani?</strong>
                    <div className="rani-stars">{[1, 2, 3, 4, 5].map((value) => <button type="button" key={value} onClick={() => rate(value)} aria-label={`${value} de 5`}>★</button>)}</div>
                    <button type="button" className="rani-skip" onClick={() => { setRated(true); setOpen(false); setRating(null); }}>Pular e fechar</button>
                  </>
                ) : <strong>Obrigada pela nota {stars} de 5! Ela ajuda a melhorar a Rani.</strong>}
              </div>
            )}
          </div>

          {chips.length > 0 && !rating && (
            <div className="rani-suggestions">
              {chips.map((suggestion) => <button type="button" key={suggestion} onClick={() => ask(suggestion)}>{suggestion}</button>)}
            </div>
          )}
          <form className="rani-form" onSubmit={(event) => { event.preventDefault(); ask(input); }}>
            <input value={input} maxLength={300} onChange={(event) => setInput(event.target.value)} placeholder="Escreva sua mensagem…" aria-label="Mensagem para a Rani" />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Enviar mensagem">→</button>
          </form>
        </aside>
      )}
      <button type="button" className="rani-launcher" onClick={() => (open ? close() : setOpen(true))} aria-expanded={open} aria-label={open ? "Fechar conversa com a Rani" : "Fale com a Rani"}>
        <img src="/images/ran-assistente-humana.png" alt="" />
        <span>Fale com a Rani</span>
      </button>
    </div>
  );
}
