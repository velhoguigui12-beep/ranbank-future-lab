"use client";
/* eslint-disable @next/next/no-img-element -- Vinext serves the local logo directly. */

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

/*
 * Simulação educativa de golpe (phishing + invasão de conta).
 * Tudo acontece só nesta tela: os dados são fictícios, os campos não aceitam digitação
 * e nada é enviado para lugar nenhum. O resultado do ataque é calculado a partir
 * dos dados que a vítima entregou e das defesas que a pessoa liga ou desliga.
 */

type Stage = "sms" | "site" | "attack" | "lessons";
type Field = "cpf" | "senha" | "cartao" | "codigo";
type FlagId = "remetente" | "endereco" | "pressa" | "erro" | "cartao" | "codigo";
type DefenseId = "rosto" | "sms" | "novo" | "noite" | "risco";
type Tone = "ok" | "bad" | "warn" | "dim";
type Line = { text: string; tone?: Tone };
type Outcome = { lines: Line[]; loss: number; blockedBy: string | null; alerts: string[] };

const FIELDS: Field[] = ["cpf", "senha", "cartao", "codigo"];
const FAKE: Record<Field, string> = { cpf: "111.111.111-11", senha: "1234", cartao: "0000", codigo: "482913" };
const LABEL: Record<Field, string> = { cpf: "CPF", senha: "Senha de acesso", cartao: "Senha do cartão", codigo: "Código recebido por SMS" };
const STOLEN: Record<Field, string> = { cpf: "CPF", senha: "senha de acesso", cartao: "senha do cartão", codigo: "código do SMS" };
const TOTAL = FIELDS.reduce((sum, field) => sum + FAKE[field].length, 0);

const FLAGS: { id: FlagId; title: string; text: string }[] = [
  { id: "remetente", title: "Número comum", text: "Banco não manda link por SMS de um celular qualquer." },
  { id: "endereco", title: "Endereço estranho", text: "O site é “ranbank-seguranca.net”, não o endereço oficial, e o navegador avisa “Não seguro”." },
  { id: "pressa", title: "Pressa e ameaça", text: "Relógio contando e ameaça de bloqueio servem para você não parar para pensar." },
  { id: "erro", title: "Erro de português", text: "“definitvo” está escrito errado. Páginas oficiais passam por revisão." },
  { id: "cartao", title: "Pede a senha do cartão", text: "O RanBank nunca pede a senha do cartão em site, mensagem ou ligação." },
  { id: "codigo", title: "Pede o código do SMS", text: "O código de confirmação é só seu. Quem pede o código quer entrar na sua conta." },
];

const DEFENSES: { id: DefenseId; title: string; text: string }[] = [
  { id: "rosto", title: "Rosto para aparelho novo", text: "Celular nunca visto só entra depois de confirmar o rosto da titular." },
  { id: "sms", title: "Código SMS para aparelho novo", text: "Celular nunca visto precisa de um código enviado por SMS." },
  { id: "novo", title: "Limite baixo no aparelho novo", text: "Nas primeiras 24 horas, Pix de no máximo R$ 200." },
  { id: "noite", title: "Limite de Pix à noite", text: "Das 20h às 6h, Pix de no máximo R$ 1.000." },
  { id: "risco", title: "Antifraude por pontos", text: "Segura o Pix quando a soma dos sinais de risco chega a 70 pontos." },
];

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

// Mostra o que já foi "digitado" em cada campo, a partir do total de letras.
function typedValues(progress: number) {
  let left = progress;
  return FIELDS.reduce((values, field) => {
    const size = Math.min(left, FAKE[field].length);
    left -= size;
    return { ...values, [field]: FAKE[field].slice(0, size) };
  }, {} as Record<Field, string>);
}

// O ataque: cada passo depende do que foi roubado e das defesas ligadas.
function runAttack(captured: Record<Field, boolean>, on: Record<DefenseId, boolean>, target: number): Outcome {
  const lines: Line[] = [{ text: "$ conectar --aparelho novo --local \"outro estado\" --hora 02:47", tone: "dim" }];
  const alerts: string[] = [];

  if (!captured.cpf || !captured.senha) {
    lines.push({ text: "[x] Sem CPF e senha, não dá nem para tentar entrar.", tone: "bad" });
    return { lines, loss: 0, blockedBy: "A vítima não entregou os dados", alerts };
  }
  lines.push({ text: `$ entrar --cpf ${FAKE.cpf} --senha ****`, tone: "dim" });
  lines.push({ text: "[ok] Senha aceita. O banco percebe: é um aparelho nunca visto.", tone: "ok" });

  if (on.rosto) {
    lines.push({ text: "[x] O banco pediu o rosto da titular. Isso eu não consigo roubar.", tone: "bad" });
    alerts.push("Alguém tentou entrar na sua conta por um celular novo. O acesso foi bloqueado.");
    return { lines, loss: 0, blockedBy: "Rosto para aparelho novo", alerts };
  }
  if (on.sms) {
    lines.push({ text: "[!] O banco mandou um código por SMS para a titular.", tone: "warn" });
    if (!captured.codigo) {
      lines.push({ text: "[x] Não tenho o código. Acesso negado.", tone: "bad" });
      alerts.push("Seu código de acesso é 590 217. Não passe para ninguém.");
      return { lines, loss: 0, blockedBy: "Código SMS para aparelho novo", alerts };
    }
    lines.push({ text: `[ok] Usei o código ${FAKE.codigo} que a vítima digitou no site falso.`, tone: "ok" });
  } else {
    lines.push({ text: "[ok] Nenhuma confirmação pedida. Estou dentro da conta.", tone: "ok" });
  }
  alerts.push("Novo aparelho conectado à sua conta.");

  let amount = target;
  lines.push({ text: `$ pix --valor ${amount} --chave nova (conta de terceiro)`, tone: "dim" });
  if (on.novo && amount > 200) {
    lines.push({ text: "[!] Limite de aparelho novo: R$ 200. Tentando de novo com R$ 200.", tone: "warn" });
    amount = 200;
  }
  if (on.noite && amount > 1000) {
    lines.push({ text: "[!] Limite noturno: R$ 1.000. Tentando de novo com R$ 1.000.", tone: "warn" });
    amount = 1000;
  }
  if (on.risco) {
    const valuePoints = amount > 1000 ? 30 : amount > 300 ? 15 : 0;
    const points = 25 + 25 + 15 + valuePoints;
    lines.push({ text: `[!] Antifraude: aparelho novo +25, outro estado +25, madrugada +15, valor +${valuePoints} = ${points} pontos`, tone: "warn" });
    if (points >= 70) {
      lines.push({ text: "[x] Pix segurado para análise. A titular recebeu um alerta.", tone: "bad" });
      alerts.push(`Seguramos um Pix de ${money.format(amount)} feito de um celular novo. Foi você?`);
      return { lines, loss: 0, blockedBy: "Antifraude por pontos", alerts };
    }
    lines.push({ text: "[ok] Ficou abaixo de 70 pontos. O Pix passou.", tone: "ok" });
  }
  lines.push({ text: `[ok] Pix de ${money.format(amount)} enviado. Dinheiro fora da conta.`, tone: "ok" });
  alerts.push(`Pix de ${money.format(amount)} enviado. Não reconhece? Fale com o banco na hora.`);
  return { lines, loss: amount, blockedBy: null, alerts };
}

function Spot({ id, found, onFind, children, className = "" }: { id: FlagId; found: boolean; onFind: (id: FlagId) => void; children: ReactNode; className?: string }) {
  return <button type="button" className={`atk-spot ${found ? "is-found" : ""} ${className}`} onClick={() => onFind(id)} aria-pressed={found}>{children}</button>;
}

function Terminal({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="atk-term" aria-label={title}>
      <div className="atk-term-bar"><i /><i /><i /><span>{title}</span></div>
      <div className="atk-term-body" aria-live="polite">{children}</div>
    </div>
  );
}

export function AttackLab() {
  const [stage, setStage] = useState<Stage>("sms");
  const [ignored, setIgnored] = useState(false);
  const [found, setFound] = useState<FlagId[]>([]);
  const [progress, setProgress] = useState(0);
  const [typing, setTyping] = useState(false);
  const [sent, setSent] = useState(false);
  const [seconds, setSeconds] = useState(29 * 60 + 59);
  const [defenses, setDefenses] = useState<Record<DefenseId, boolean>>({ rosto: false, sms: true, novo: false, noite: false, risco: false });
  const [target, setTarget] = useState(4800);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [shown, setShown] = useState(0);

  const typed = typedValues(progress);
  const captured = FIELDS.reduce((all, field) => ({ ...all, [field]: sent && typed[field] === FAKE[field] }), {} as Record<Field, boolean>);
  const running = outcome !== null && shown < outcome.lines.length;
  const typingNow = typing && progress < TOTAL;

  // Relógio falso do site golpista.
  useEffect(() => {
    if (stage !== "site" || sent) return;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [stage, sent]);

  // "Digitação" dos dados fictícios, letra por letra.
  useEffect(() => {
    if (!typingNow) return;
    const timer = window.setInterval(() => setProgress((value) => Math.min(TOTAL, value + 1)), 90);
    return () => window.clearInterval(timer);
  }, [typingNow]);

  // Linhas do terminal aparecendo uma de cada vez.
  useEffect(() => {
    if (!outcome || shown >= outcome.lines.length) return;
    const timer = window.setTimeout(() => setShown((value) => value + 1), 650);
    return () => window.clearTimeout(timer);
  }, [outcome, shown]);

  const find = (id: FlagId) => setFound((list) => (list.includes(id) ? list : [...list, id]));
  const has = (id: FlagId) => found.includes(id);
  const attack = () => { setOutcome(runAttack(captured, defenses, target)); setShown(0); };
  const toggleDefense = (id: DefenseId) => { setDefenses((current) => ({ ...current, [id]: !current[id] })); setOutcome(null); };
  const restart = () => {
    setStage("sms"); setIgnored(false); setFound([]); setProgress(0); setTyping(false); setSent(false);
    setSeconds(29 * 60 + 59); setOutcome(null); setShown(0);
  };

  const steps: { id: Stage; label: string }[] = [
    { id: "sms", label: "A mensagem" },
    { id: "site", label: "O site falso" },
    { id: "attack", label: "A invasão" },
    { id: "lessons", label: "O que aprendemos" },
  ];
  const stageIndex = steps.findIndex((step) => step.id === stage);
  const clock = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  const flagCounter = (
    <div className="atk-flags">
      <div className="atk-flags-head"><strong>Sinais de golpe encontrados</strong><b>{found.length} de {FLAGS.length}</b></div>
      <p>Clique no que parecer suspeito na mensagem e no site.</p>
      {found.length > 0 && <ul>{FLAGS.filter((flag) => has(flag.id)).map((flag) => <li key={flag.id}><strong>{flag.title}.</strong> {flag.text}</li>)}</ul>}
    </div>
  );

  return (
    <div className="atk">
      <p className="atk-warning"><strong>Simulação educativa.</strong> Os dados são fictícios, os campos não aceitam digitação e nada sai desta tela.</p>
      <ol className="atk-steps">
        {steps.map((step, index) => <li key={step.id} className={index === stageIndex ? "is-current" : index < stageIndex ? "is-done" : ""}><b>{index + 1}</b>{step.label}</li>)}
      </ol>

      {stage === "sms" && (
        <div className="atk-grid">
          <div className="atk-phone">
            <div className="atk-phone-top"><span>02:41</span><span>●●●</span></div>
            <Spot id="remetente" found={has("remetente")} onFind={find} className="atk-sender">+55 (00) 90000-0000</Spot>
            <div className="atk-bubble">
              RANBANK: Detectamos um Pix de R$ 1.890,00 saindo da sua conta. Se não foi você, regularize em até 30 min: <u>ranbank-seguranca.net/regularizar</u>
            </div>
            <div className="atk-phone-actions">
              <button type="button" className="bk-btn bk-btn-primary" onClick={() => setStage("site")}>Abrir o link</button>
              <button type="button" className="bk-btn bk-btn-ghost" onClick={() => { setIgnored(true); setStage("lessons"); }}>Apagar a mensagem</button>
            </div>
          </div>
          <div className="atk-side">
            <Terminal title="tela do golpista">
              <p className="is-dim">$ copiar-site ranbank --destino ranbank-seguranca.net</p>
              <p className="is-ok">[ok] Cópia do site no ar.</p>
              <p className="is-dim">$ enviar-sms --lista 5000-numeros.txt</p>
              <p className="is-ok">[ok] 5.000 mensagens enviadas.</p>
              <p className="is-warn">[..] Esperando alguém clicar<span className="atk-caret" /></p>
            </Terminal>
            <p className="bk-note">O golpista não sabe quem é cliente do RanBank. Ele manda a mesma mensagem para milhares de números e espera alguém cair.</p>
            {flagCounter}
          </div>
        </div>
      )}

      {stage === "site" && (
        <div className="atk-grid">
          <div className="atk-browser">
            <Spot id="endereco" found={has("endereco")} onFind={find} className="atk-url"><em>⚠ Não seguro</em> ranbank-seguranca.net/regularizar</Spot>
            <div className="atk-fake">
              <span className="atk-stamp" aria-hidden="true">SIMULAÇÃO</span>
              <header><img src="/ranbank-logo-transparent.png" alt="" /><strong>Central de Regularização</strong></header>
              <Spot id="pressa" found={has("pressa")} onFind={find} className="atk-timer">Sua conta será bloqueada em {clock}</Spot>
              <p>Confirme seus dados agora para evitar o bloqueio <Spot id="erro" found={has("erro")} onFind={find} className="atk-inline">definitvo</Spot> da conta.</p>
              {FIELDS.map((field) => (
                <div className="atk-field" key={field}>
                  {field === "cartao" || field === "codigo"
                    ? <Spot id={field} found={has(field)} onFind={find} className="atk-inline">{LABEL[field]}</Spot>
                    : <span>{LABEL[field]}</span>}
                  <input readOnly value={field === "senha" || field === "cartao" ? "•".repeat(typed[field].length) : typed[field]} aria-label={`${LABEL[field]} (fictício)`} placeholder="Toque em “Preencher”" />
                </div>
              ))}
              {!sent ? (
                <div className="atk-fake-actions">
                  <button type="button" className="bk-btn bk-btn-ghost" disabled={typingNow || progress >= TOTAL} onClick={() => setTyping(true)}>Preencher com dados fictícios</button>
                  <button type="button" className="atk-fake-submit" disabled={progress < TOTAL} onClick={() => setSent(true)}>Regularizar agora</button>
                </div>
              ) : <p className="atk-fake-done">Pronto! Sua conta foi regularizada. ✓</p>}
            </div>
          </div>
          <div className="atk-side">
            <Terminal title="tela do golpista">
              <p className="is-ok">[+] Alguém abriu o link · Android · Chrome</p>
              {FIELDS.map((field) => (
                <p key={field} className={typed[field] ? "is-ok" : "is-dim"}>
                  {`${field.padEnd(7, " ")}: `}{typed[field] || "aguardando…"}{typingNow && typed[field] && typed[field] !== FAKE[field] && <span className="atk-caret" />}
                </p>
              ))}
              {sent && <>
                <p className="is-bad">[!] DADOS CAPTURADOS. A vítima acha que resolveu o problema.</p>
                <p className="is-warn">[..] Próximo passo: entrar na conta dela</p>
              </>}
            </Terminal>
            {sent
              ? <button type="button" className="bk-btn bk-btn-primary atk-next" onClick={() => setStage("attack")}>Ver a invasão da conta</button>
              : <p className="bk-note">Repare: cada letra aparece para o golpista enquanto é digitada, mesmo antes de apertar o botão.</p>}
            {flagCounter}
          </div>
        </div>
      )}

      {stage === "attack" && (
        <div className="atk-grid">
          <div className="atk-defenses">
            <h3>Defesas do RanBank</h3>
            <p>Ligue ou desligue e rode o ataque de novo. O golpista tem: {FIELDS.filter((field) => captured[field]).map((field) => STOLEN[field]).join(", ") || "nada"}.</p>
            {DEFENSES.map((defense) => (
              <label key={defense.id} className="lab-toggle">
                <input type="checkbox" checked={defenses[defense.id]} onChange={() => toggleDefense(defense.id)} disabled={running} aria-label={defense.title} />
                <span><strong>{defense.title}</strong><small>{defense.text}</small></span>
              </label>
            ))}
            <label className="lab-range">
              <span>Quanto o golpista tenta levar<b>{money.format(target)}</b></span>
              <input type="range" min={100} max={5000} step={100} value={target} disabled={running} onChange={(event) => { setTarget(Number(event.target.value)); setOutcome(null); }} />
            </label>
            <button type="button" className="bk-btn bk-btn-primary" onClick={attack} disabled={running}>{outcome ? "Rodar o ataque de novo" : "Rodar o ataque"}</button>
          </div>
          <div className="atk-side">
            <Terminal title="tela do golpista">
              {!outcome && <p className="is-dim">Escolha as defesas e aperte “Rodar o ataque”.<span className="atk-caret" /></p>}
              {outcome?.lines.slice(0, shown).map((line, index) => <p key={index} className={line.tone ? `is-${line.tone}` : ""}>{line.text}</p>)}
              {running && <p><span className="atk-caret" /></p>}
            </Terminal>
            {outcome && !running && (
              <>
                <div className={`bk-score ${outcome.loss ? "is-bad" : "is-ok"}`}>
                  <strong>{outcome.loss ? "✕" : "✓"}</strong>
                  <span>{outcome.loss ? `Prejuízo: ${money.format(outcome.loss)}` : `Parado por: ${outcome.blockedBy}`}</span>
                  <b>{outcome.loss ? "Golpe deu certo" : "Ataque bloqueado"}</b>
                </div>
                <div className="atk-alerts">
                  <strong>O que a titular viu no celular</strong>
                  <ul>{outcome.alerts.map((alert) => <li key={alert}><span aria-hidden="true">🔔</span>{alert}</li>)}</ul>
                </div>
                <button type="button" className="bk-btn bk-btn-ghost atk-next" onClick={() => setStage("lessons")}>Ver o que aprendemos</button>
              </>
            )}
          </div>
        </div>
      )}

      {stage === "lessons" && (
        <div className="atk-grid">
          <div className="atk-lessons">
            {ignored
              ? <div className="bk-score is-ok"><strong>✓</strong><span>O golpista ficou sem nada.</span><b>Você não caiu</b></div>
              : <div className={`bk-score ${outcome?.loss ? "is-bad" : "is-ok"}`}><strong>{found.length}/{FLAGS.length}</strong><span>sinais de golpe encontrados</span><b>{outcome ? (outcome.loss ? `Prejuízo de ${money.format(outcome.loss)}` : "Conta protegida") : "Ataque não testado"}</b></div>}
            <h3>Os seis sinais deste golpe</h3>
            <ul className="atk-lesson-list">
              {FLAGS.map((flag) => <li key={flag.id} className={has(flag.id) ? "is-found" : ""}><span aria-hidden="true">{has(flag.id) ? "✓" : "?"}</span><div><strong>{flag.title}</strong><small>{flag.text}</small></div></li>)}
            </ul>
          </div>
          <div className="atk-side">
            <div className="bk-panel bk-tip">
              <strong>Para não cair</strong>
              <p>Não abra link de mensagem sobre o banco. Entre sempre pelo app ou digitando o endereço você mesmo.</p>
              <p>Nunca passe senha do cartão ou código de SMS. O banco não pede.</p>
              <p>Pressa é sinal de golpe. Pare, respire e ligue para o banco pelo número do cartão.</p>
            </div>
            <p className="bk-note">A lição do ataque: uma defesa sozinha pode falhar. O código SMS, por exemplo, não adianta se a pessoa entrega o código no site falso. Por isso o banco usa várias camadas.</p>
            <div className="atk-restart">
              {ignored && <button type="button" className="bk-btn bk-btn-primary" onClick={() => { setIgnored(false); setStage("site"); }}>Ver o que aconteceria se clicasse</button>}
              <button type="button" className="bk-btn bk-btn-ghost" onClick={restart}>Começar de novo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
