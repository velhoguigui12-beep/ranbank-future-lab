"use client";

import { useState } from "react";
import type { ReactNode } from "react";

/*
 * Quatro telas do app RanBank para mexer na página inicial.
 * Tudo é local e com dados inventados: nada é salvo nem enviado.
 */

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function Phone({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="cb-phone" role="group" aria-label={label}>
      <div className="cb-notch" aria-hidden="true" />
      <div className="cb-screen">{children}</div>
    </div>
  );
}

/* 1. Caí num golpe: três perguntas e um plano ------------------------- */

type Happened = "link" | "code" | "pix";
type Secret = "app" | "card" | "none";
type When = "now" | "today" | "days";

const HELP_QUESTIONS: Array<{ title: string; options: Array<{ id: string; label: string }> }> = [
  { title: "O que aconteceu?", options: [{ id: "link", label: "Cliquei num link estranho" }, { id: "code", label: "Passei um código por mensagem" }, { id: "pix", label: "Fiz um Pix para um golpista" }] },
  { title: "Você digitou ou passou alguma senha?", options: [{ id: "app", label: "Sim, a senha do app" }, { id: "card", label: "Sim, a senha do cartão" }, { id: "none", label: "Não passei nenhuma senha" }] },
  { title: "Quando foi?", options: [{ id: "now", label: "Agora há pouco" }, { id: "today", label: "Hoje, mais cedo" }, { id: "days", label: "Faz alguns dias" }] },
];

type PlanStep = { text: string; done?: boolean; action?: string };

// Monta o plano a partir das respostas: o que o banco já fez e o que falta a pessoa fazer.
function helpPlan(happened: Happened, secret: Secret, when: When): PlanStep[] {
  const steps: PlanStep[] = [];
  if (happened === "code" || secret === "app") {
    steps.push({ text: "Desconectamos todos os aparelhos da sua conta.", done: true });
    steps.push({ text: "Crie uma senha nova para o app.", action: "Trocar a senha" });
  }
  if (secret === "card" || happened === "link") steps.push({ text: "Bloqueamos o seu cartão por segurança. Um novo chega em até 7 dias.", done: true });
  if (happened === "pix") {
    steps.push({ text: "Pedimos a devolução do Pix ao banco de quem recebeu.", done: true });
    steps.push({ text: when === "now" ? "Você avisou rápido, e isso aumenta a chance de recuperar o dinheiro." : "Mesmo depois de um tempo, ainda dá para pedir a devolução." });
    steps.push({ text: "Faça um boletim de ocorrência pela internet. Ele ajuda no pedido.", action: "Já fiz" });
  }
  if (happened === "link" && secret === "none") steps.push({ text: "Se você não digitou nada no site, sua conta está protegida. Apague a mensagem e não abra o link de novo." });
  if (when === "days" && happened !== "pix") steps.push({ text: "Confira o extrato dos últimos dias. Se algo estiver estranho, conteste com um toque.", action: "Ver o extrato" });
  steps.push({ text: "Se quiser conversar, chame a gente no chat a qualquer hora." });
  return steps;
}

export function ScamHelpDemo() {
  const [answers, setAnswers] = useState<string[]>([]);
  const [checked, setChecked] = useState<number[]>([]);
  const step = answers.length;
  const done = step >= HELP_QUESTIONS.length;
  const question = HELP_QUESTIONS[Math.min(step, HELP_QUESTIONS.length - 1)];
  const plan = done ? helpPlan(answers[0] as Happened, answers[1] as Secret, answers[2] as When) : [];
  const restart = () => { setAnswers([]); setChecked([]); };

  return (
    <Phone label="Simulação: ajuda depois de um golpe no app RanBank">
      <div className="cb-top">
        {step > 0 && !done ? <button type="button" className="cb-back" onClick={() => setAnswers(answers.slice(0, -1))}>‹ Voltar</button> : <span />}
        <small>{done ? "Seu plano" : `Passo ${step + 1} de ${HELP_QUESTIONS.length}`}</small>
      </div>
      <div className="cb-progress" aria-hidden="true"><i style={{ width: `${(step / HELP_QUESTIONS.length) * 100}%` }} /></div>
      {!done ? (
        <div className="cb-question" key={step}>
          <h4>{question.title}</h4>
          <div className="cb-options">
            {question.options.map((option) => <button type="button" key={option.id} onClick={() => setAnswers([...answers, option.id])}>{option.label}</button>)}
          </div>
          <small className="cb-hint">{step === 0 ? "Respire. São só três perguntas." : "Não existe resposta errada."}</small>
        </div>
      ) : (
        <div className="cb-question cb-plan">
          <h4>Calma, dá para resolver.</h4>
          <p>Isso acontece com muita gente e não é culpa sua. Veja o que já fizemos e o que falta:</p>
          <ol>
            {plan.map((item, index) => {
              const ok = item.done || checked.includes(index);
              return (
                <li key={item.text} className={ok ? "is-done" : ""}>
                  <b aria-hidden="true">{ok ? "✓" : index + 1}</b>
                  <span>
                    {item.text}
                    {item.action && !ok && <button type="button" onClick={() => setChecked([...checked, index])}>{item.action}</button>}
                  </span>
                </li>
              );
            })}
          </ol>
          <button type="button" className="cb-ghost" onClick={restart}>Simular outro caso</button>
        </div>
      )}
    </Phone>
  );
}

/* 2. O mês sem sustos ---------------------------------------------------- */

const BILLS = [
  { id: "aluguel", name: "Aluguel", day: 5, value: 900 },
  { id: "luz", name: "Conta de luz", day: 10, value: 120 },
  { id: "internet", name: "Internet", day: 15, value: 100 },
  { id: "academia", name: "Academia", day: 20, value: 90 },
  { id: "streaming", name: "Filmes e séries", day: 22, value: 40 },
];
const INCOME = 2400;

export function MonthDemo() {
  const [active, setActive] = useState<Record<string, boolean>>({ aluguel: true, luz: true, internet: true, academia: true, streaming: true });
  const [daily, setDaily] = useState(800);
  const bills = BILLS.filter((bill) => active[bill.id]).reduce((sum, bill) => sum + bill.value, 0);
  const left = INCOME - bills - daily;
  const mood = left >= 300
    ? { tone: "is-calm", title: "Tudo sob controle", text: "Dá até para guardar um pouco no cofrinho." }
    : left >= 0
      ? { tone: "is-tight", title: "Vai ficar apertado", text: "Que tal tirar algum gasto que dá para esperar?" }
      : { tone: "is-short", title: "Ainda dá tempo de ajustar", text: "Avisamos agora, e não no dia da conta." };

  return (
    <Phone label="Simulação: previsão do mês no app RanBank">
      <div className="cb-top"><small>Previsão de outubro</small><small>Salário: {money.format(INCOME)}</small></div>
      <div className={`cb-forecast ${mood.tone}`}>
        <small>{left >= 0 ? "Deve sobrar no fim do mês" : "Pode faltar no fim do mês"}</small>
        <strong>{money.format(Math.abs(left))}</strong>
        <p><b>{mood.title}.</b> {mood.text}</p>
      </div>
      <ul className="cb-bills">
        {BILLS.map((bill) => (
          <li key={bill.id} className={active[bill.id] ? "" : "is-off"}>
            <label>
              <input type="checkbox" checked={active[bill.id]} onChange={() => setActive({ ...active, [bill.id]: !active[bill.id] })} aria-label={bill.name} />
              <span><strong>{bill.name}</strong><small>Dia {bill.day}</small></span>
            </label>
            <b>{money.format(bill.value)}</b>
          </li>
        ))}
      </ul>
      <label className="cb-range">
        <span>Mercado, transporte e lazer<b>{money.format(daily)}</b></span>
        <input type="range" min={200} max={1600} step={50} value={daily} onChange={(event) => setDaily(Number(event.target.value))} />
      </label>
    </Phone>
  );
}

/* 3. Quem manda é você --------------------------------------------------- */

/** Recebe o texto da seção para colocar os ajustes logo abaixo dele, ao lado do celular. */
export function ControlDemo({ intro }: { intro: ReactNode }) {
  const [hide, setHide] = useState(false);
  const [notify, setNotify] = useState(true);
  const [night, setNight] = useState(false);
  const [big, setBig] = useState(false);
  const options = [
    { label: "Esconder o saldo", hint: "Ninguém vê o valor por cima do seu ombro", value: hide, set: setHide },
    { label: "Aviso a cada compra", hint: "Você sabe na hora de tudo que sai", value: notify, set: setNotify },
    { label: "Pix menor à noite", hint: "Das 20h às 6h, no máximo R$ 200", value: night, set: setNight },
    { label: "Letra grande", hint: "Tudo fica mais fácil de ler", value: big, set: setBig },
  ];

  return (
    <div className="rs-split cb-control">
      <div>
        {intro}
        <div className="cb-settings" role="group" aria-label="Ajustes do app">
          {options.map((option) => (
            <label key={option.label} className="cb-switch">
              <span><strong>{option.label}</strong><small>{option.hint}</small></span>
              <input type="checkbox" role="switch" checked={option.value} onChange={() => option.set(!option.value)} aria-label={option.label} />
            </label>
          ))}
        </div>
      </div>
      <Phone label="Simulação: tela inicial do app RanBank">
        <div className={`cb-home ${big ? "is-big" : ""}`}>
          <small>Olá, Ana</small>
          <span className="cb-balance-label">Saldo disponível</span>
          <strong className="cb-balance">{hide ? "R$ ••••••" : "R$ 1.348,20"}</strong>
          <div className="cb-shortcuts"><span>Pix</span><span>Pagar</span><span>Cartão</span></div>
          {night && <p className="cb-chip">🌙 Pix à noite: até R$ 200</p>}
          {notify && <p className="cb-toast"><b>Compra aprovada</b> R$ 23,50 · Padaria Central · agora</p>}
        </div>
      </Phone>
    </div>
  );
}

/* 4. Avisos que acalmam -------------------------------------------------- */

const NOTICES = [
  { id: "salario", icon: "💰", title: "Seu salário chegou", time: "08:02", text: "R$ 2.400,00 de Empresa Exemplo. Já está disponível na sua conta.", actions: ["Guardar R$ 100 no cofrinho"], reply: { "Guardar R$ 100 no cofrinho": "Feito! R$ 100,00 foram para o cofrinho “Viagem”." } },
  { id: "compra", icon: "🛒", title: "Compra de R$ 89,90 aprovada", time: "18:42", text: "Mercado Bom Preço, hoje. Foi você?", actions: ["Fui eu", "Não fui eu"], reply: { "Fui eu": "Obrigado por confirmar. Está tudo certo.", "Não fui eu": "Seu cartão foi bloqueado por segurança. Ninguém mais consegue comprar com ele. Vamos te ajudar a contestar essa compra." } },
  { id: "luz", icon: "📅", title: "A conta de luz vence amanhã", time: "09:15", text: "R$ 120,00. Você tem saldo para pagar.", actions: ["Pagar agora", "Agendar para amanhã"], reply: { "Pagar agora": "Conta paga. O comprovante está no seu extrato.", "Agendar para amanhã": "Agendado para amanhã de manhã. Avisamos quando for pago." } },
  { id: "meta", icon: "🎉", title: "Você alcançou sua meta!", time: "ontem", text: "Você juntou R$ 500,00 para a viagem. Guardar um pouquinho todo mês funcionou.", actions: [], reply: {} },
];

export function NoticesDemo() {
  const [open, setOpen] = useState<string | null>("compra");
  const [done, setDone] = useState<Record<string, string>>({});

  return (
    <Phone label="Simulação: avisos do app RanBank">
      <div className="cb-top"><small>Avisos</small><small>Toque para abrir</small></div>
      <ul className="cb-notices">
        {NOTICES.map((notice) => {
          const expanded = open === notice.id;
          const answer = done[notice.id];
          return (
            <li key={notice.id} className={expanded ? "is-open" : ""}>
              <button type="button" className="cb-notice-head" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : notice.id)}>
                <span aria-hidden="true">{notice.icon}</span>
                <strong>{notice.title}</strong>
                <small>{notice.time}</small>
              </button>
              {expanded && (
                <div className="cb-notice-body">
                  <p>{notice.text}</p>
                  {answer
                    ? <p className="cb-reply">{answer}</p>
                    : notice.actions.length > 0 && (
                      <div className="cb-actions">
                        {notice.actions.map((action) => <button type="button" key={action} onClick={() => setDone({ ...done, [notice.id]: (notice.reply as Record<string, string>)[action] })}>{action}</button>)}
                      </div>
                    )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Phone>
  );
}
