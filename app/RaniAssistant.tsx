"use client";
/* eslint-disable @next/next/no-img-element -- Vinext serves the local assistant portrait directly. */

import { useEffect, useRef, useState } from "react";
import { answerRani, RANI_SUGGESTIONS, RANI_WELCOME } from "./rani-knowledge";
import type { RaniAnswer, RaniContext, RaniScreen } from "./rani-knowledge";

type Message = { role: "rani" | "user"; text: string; answer?: RaniAnswer };

/** Abre a Rani de qualquer lugar da página. Se receber uma pergunta, ela já responde. */
export const openRani = (question?: unknown) => window.dispatchEvent(new CustomEvent("rani:open", { detail: typeof question === "string" ? question : undefined }));

export default function RaniAssistant({ context, onNavigate }: { context: RaniContext; onNavigate?: (target: RaniScreen) => void }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "rani", text: RANI_WELCOME[context] }]);
  const listRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const askRef = useRef<(question: string) => void>(() => undefined);

  useEffect(() => {
    const show = (event: Event) => {
      setOpen(true);
      const question = (event as CustomEvent<string | undefined>).detail;
      if (question) askRef.current(question);
    };
    window.addEventListener("rani:open", show);
    return () => { window.removeEventListener("rani:open", show); window.clearTimeout(timer.current); };
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const ask = (question: string) => {
    const text = question.trim();
    if (!text || typing) return;
    setMessages((previous) => [...previous, { role: "user", text }]);
    setInput("");
    setTyping(true);
    const answer = answerRani(text, context);
    // Pequena pausa para a conversa parecer natural.
    timer.current = window.setTimeout(() => {
      setMessages((previous) => [...previous, { role: "rani", text: answer.text, answer }]);
      setTyping(false);
    }, 450 + Math.min(900, answer.text.length * 6));
  };

  useEffect(() => { askRef.current = ask; });

  return (
    <div className={`rani rani-${context}`}>
      {open && (
        <aside className="rani-panel" aria-label="Conversa com a Rani, assistente do RanBank">
          <header>
            <img src="/images/ran-assistente-humana.png" alt="" />
            <div><strong>Rani</strong><small>Assistente do RanBank</small></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fechar conversa com a Rani">×</button>
          </header>
          <div className="rani-messages" ref={listRef} aria-live="polite">
            {messages.map((message, index) => (
              <div key={index} className={`rani-bubble ${message.role === "user" ? "is-user" : ""}`}>
                {message.answer && message.answer.topic !== "Oi!" && <small>{message.answer.topic}</small>}
                <p>{message.text}</p>
                {message.answer?.link && <a className="rani-action" href={message.answer.link.href} onClick={() => setOpen(false)}>{message.answer.link.label} →</a>}
                {message.answer?.screen && onNavigate && <button type="button" className="rani-action" onClick={() => { onNavigate(message.answer!.screen!.target); setOpen(false); }}>{message.answer.screen.label} →</button>}
              </div>
            ))}
            {typing && <div className="rani-bubble rani-typing" aria-label="Rani está digitando"><i /><i /><i /></div>}
          </div>
          <div className="rani-suggestions">
            {RANI_SUGGESTIONS[context].map((suggestion) => <button type="button" key={suggestion} onClick={() => ask(suggestion)}>{suggestion}</button>)}
          </div>
          <form className="rani-form" onSubmit={(event) => { event.preventDefault(); ask(input); }}>
            <input value={input} maxLength={300} onChange={(event) => setInput(event.target.value)} placeholder="Pergunte para a Rani…" aria-label="Pergunta para a Rani" />
            <button type="submit" disabled={typing || !input.trim()} aria-label="Enviar pergunta">→</button>
          </form>
          <footer>Respostas prontas do RanBank · projeto educacional</footer>
        </aside>
      )}
      <button type="button" className="rani-launcher" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Fechar conversa com a Rani" : "Fale com a Rani"}>
        <img src="/images/ran-assistente-humana.png" alt="" />
        <span>Fale com a Rani</span>
      </button>
    </div>
  );
}
