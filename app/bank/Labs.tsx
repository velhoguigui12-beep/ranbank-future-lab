"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { BkSheet } from "./BkSheet";
import { sha256 } from "./sha256";

/*
 * Laboratórios interativos do RanBank.
 * Nenhum resultado é fixo: tudo é calculado a partir do que a pessoa muda na tela.
 */

export type LabId = "cloud" | "energy" | "compare" | "scam" | "login" | "chain";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const number = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const tone = (score: number, invert = false) => {
  const value = invert ? 100 - score : score;
  return value >= 70 ? "is-bad" : value >= 40 ? "is-warn" : "is-ok";
};

function Range({ label, value, min, max, step = 1, suffix = "", onChange }: { label: string; value: number; min: number; max: number; step?: number; suffix?: string; onChange: (value: number) => void }) {
  return (
    <label className="lab-range">
      <span>{label}<b>{number.format(value)}{suffix}</b></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (value: boolean) => void; hint?: string }) {
  return (
    <label className="lab-toggle">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span><strong>{label}</strong>{hint && <small>{hint}</small>}</span>
    </label>
  );
}

function Layout({ controls, children }: { controls: ReactNode; children: ReactNode }) {
  return <div className="lab-grid"><div className="lab-controls">{controls}</div><div className="lab-results">{children}</div></div>;
}

/* 1. Banco sempre no ar --------------------------------------------------- */

const SERVERS = [
  { id: "a", name: "Servidor 1", place: "Principal", capacity: 120 },
  { id: "b", name: "Servidor 2", place: "Reserva", capacity: 90 },
  { id: "c", name: "Servidor 3", place: "Reserva", capacity: 60 },
];

function CloudLab() {
  const [online, setOnline] = useState<Record<string, boolean>>({ a: true, b: true, c: true });
  const [demand, setDemand] = useState(150);
  const [log, setLog] = useState<string[]>(["Todos os servidores ligados."]);

  const active = SERVERS.filter((server) => online[server.id]);
  const capacity = active.reduce((total, server) => total + server.capacity, 0);
  const served = Math.min(demand, capacity);
  const lost = demand - served;
  const availability = demand ? (served / demand) * 100 : 100;
  const load = capacity ? served / capacity : 0;
  const latency = active.length ? Math.round(35 * (1 + 3 * load ** 3)) : 0;

  const toggle = (id: string) => {
    const server = SERVERS.find((item) => item.id === id);
    if (!server) return;
    const next = { ...online, [id]: !online[id] };
    const others = SERVERS.filter((item) => item.id !== id && next[item.id]).map((item) => item.name);
    const message = next[id]
      ? `${server.name} voltou e divide os acessos de novo.`
      : others.length ? `${server.name} caiu. Os acessos foram para ${others.join(" e ")}.` : `${server.name} caiu. Não sobrou nenhum servidor: o banco saiu do ar.`;
    setOnline(next);
    setLog((previous) => [message, ...previous].slice(0, 5));
  };

  return (
    <Layout controls={<>
      <p className="bk-lead">Desligue servidores e aumente os acessos. O sistema redistribui tudo sozinho.</p>
      {SERVERS.map((server) => <Toggle key={server.id} label={`${server.name} ligado`} hint={`${server.place} · aguenta ${server.capacity} acessos por minuto`} checked={online[server.id]} onChange={() => toggle(server.id)} />)}
      <Range label="Acessos por minuto" value={demand} min={0} max={300} step={10} onChange={setDemand} />
    </>}>
      <div className="bk-stats is-three">
        <article><span>Disponibilidade</span><strong className={availability >= 99.9 ? "is-good" : availability >= 80 ? "is-warn" : "is-bad"}>{number.format(availability)}%</strong></article>
        <article><span>Acessos atendidos</span><strong>{served}</strong><small>{lost ? `${lost} sem resposta` : "Nenhum perdido"}</small></article>
        <article><span>Tempo de resposta</span><strong>{active.length ? `${latency} ms` : "—"}</strong><small>{load > 0.85 ? "Servidores no limite" : "Normal"}</small></article>
      </div>
      <ul className="bk-rows">
        {SERVERS.map((server) => {
          const share = online[server.id] && capacity ? (server.capacity / capacity) * served : 0;
          const percent = online[server.id] ? (share / server.capacity) * 100 : 0;
          return (
            <li key={server.id}>
              <div>
                <strong>{server.name} <b className={`bk-pill ${!online[server.id] ? "is-bad" : percent > 85 ? "is-warn" : "is-ok"}`}>{!online[server.id] ? "Desligado" : percent > 85 ? "No limite" : "Normal"}</b></strong>
                <small>{online[server.id] ? `${Math.round(share)} acessos por minuto · ${Math.round(percent)}% da capacidade` : "Sem receber acessos"}</small>
                <span className="bk-meter-line"><i style={{ width: `${percent}%` }} /></span>
              </div>
            </li>
          );
        })}
      </ul>
      <h3 className="bk-sheet-title">O que aconteceu</h3>
      <ol className="lab-log">{log.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ol>
    </Layout>
  );
}

/* 2. Banco sustentável ---------------------------------------------------- */

function EnergyLab() {
  const [renewable, setRenewable] = useState(40);
  const [idleOff, setIdleOff] = useState(0);
  const [efficientCloud, setEfficientCloud] = useState(false);
  const [recycledCards, setRecycledCards] = useState(20);

  const BASE_KW = 60;
  const EMISSION_KG_PER_KWH = 0.08;
  const PRICE_PER_KWH = 0.8;
  const CARDS_PER_YEAR = 50000;
  const GRAMS_PER_CARD = 5;

  const calc = (r: number, idle: number, cloud: boolean, cards: number) => {
    const kw = BASE_KW * (1 - 0.3 * (idle / 100)) * (cloud ? 0.85 : 1);
    const monthKwh = kw * 24 * 30;
    const co2 = monthKwh * (1 - r / 100) * EMISSION_KG_PER_KWH;
    const cost = monthKwh * PRICE_PER_KWH;
    const plastic = (CARDS_PER_YEAR * GRAMS_PER_CARD * (1 - cards / 100)) / 1000;
    return { kw, co2, cost, plastic };
  };
  const start = calc(40, 0, false, 20);
  const now = calc(renewable, idleOff, efficientCloud, recycledCards);
  const saving = (value: number, base: number) => (base ? Math.round((1 - value / base) * 100) : 0);
  const rows = [
    { label: "Energia usada", now: `${number.format(now.kw)} kW`, before: `${number.format(start.kw)} kW`, change: saving(now.kw, start.kw) },
    { label: "Poluição por mês", now: `${number.format(now.co2)} kg de CO₂`, before: `${number.format(start.co2)} kg`, change: saving(now.co2, start.co2) },
    { label: "Conta de luz por mês", now: money.format(now.cost), before: money.format(start.cost), change: saving(now.cost, start.cost) },
    { label: "Plástico novo em cartões por ano", now: `${number.format(now.plastic)} kg`, before: `${number.format(start.plastic)} kg`, change: saving(now.plastic, start.plastic) },
  ];
  const greenScore = Math.round(clamp(renewable * 0.4 + idleOff * 0.25 + (efficientCloud ? 15 : 0) + recycledCards * 0.2, 0, 100));

  return (
    <Layout controls={<>
      <p className="bk-lead">Mexa nas escolhas do banco e veja o efeito na energia, na conta de luz e na poluição.</p>
      <Range label="Energia de fonte limpa" value={renewable} min={0} max={100} step={5} suffix="%" onChange={setRenewable} />
      <Range label="Servidores parados desligados" value={idleOff} min={0} max={100} step={5} suffix="%" onChange={setIdleOff} />
      <Range label="Cartões de plástico reciclado" value={recycledCards} min={0} max={100} step={5} suffix="%" onChange={setRecycledCards} />
      <Toggle label="Nuvem mais eficiente" hint="Junta serviços em menos máquinas (−15% de energia)" checked={efficientCloud} onChange={setEfficientCloud} />
    </>}>
      <div className={`bk-score ${tone(greenScore, true)}`}><strong>{greenScore}</strong><span>Nota verde do banco (de 100)</span><b>{greenScore >= 70 ? "Ótimo" : greenScore >= 40 ? "Melhorando" : "Pode melhorar"}</b></div>
      <ul className="bk-rows">
        {rows.map((row) => (
          <li key={row.label}>
            <div><strong>{row.label}</strong><small>Ponto de partida: {row.before}</small></div>
            <span className="lab-value"><b>{row.now}</b>{row.change !== 0 && <em className={row.change > 0 ? "is-good" : "is-bad"}>{row.change > 0 ? `−${row.change}%` : `+${Math.abs(row.change)}%`}</em>}</span>
          </li>
        ))}
      </ul>
      <p className="bk-note">Cálculo com números de exemplo: {BASE_KW} kW de consumo inicial, {EMISSION_KG_PER_KWH} kg de CO₂ por kWh, {money.format(PRICE_PER_KWH)} por kWh e {CARDS_PER_YEAR.toLocaleString("pt-BR")} cartões por ano.</p>
    </Layout>
  );
}

/* 3. Comparar tecnologias ------------------------------------------------- */

const CRITERIA = [
  { id: "security", label: "Segurança" },
  { id: "cost", label: "Custo baixo" },
  { id: "growth", label: "Aguentar crescimento" },
  { id: "ease", label: "Facilidade de implantar" },
  { id: "green", label: "Impacto ambiental" },
] as const;
type Criterion = (typeof CRITERIA)[number]["id"];
const TECHNOLOGIES: Array<{ name: string; use: string; limit: string; rating: Record<Criterion, number> }> = [
  { name: "Inteligência artificial", use: "Reconhecer padrões de fraude e atender clientes.", limit: "Precisa de bons dados e supervisão.", rating: { security: 9, cost: 4, growth: 7, ease: 4, green: 4 } },
  { name: "Análise de dados", use: "Achar gastos fora do normal em muitas movimentações.", limit: "Exige organização e cuidado com privacidade.", rating: { security: 8, cost: 5, growth: 9, ease: 5, green: 5 } },
  { name: "Nuvem", use: "Manter o banco no ar e crescer rápido.", limit: "Depende de internet e de boa configuração.", rating: { security: 7, cost: 7, growth: 10, ease: 8, green: 7 } },
  { name: "Automação", use: "Fazer tarefas repetidas sem erro humano.", limit: "Uma regra ruim automatizada espalha o erro.", rating: { security: 7, cost: 8, growth: 7, ease: 7, green: 6 } },
  { name: "Internet das Coisas", use: "Acompanhar caixas eletrônicos e aparelhos.", limit: "Mais aparelhos conectados, mais pontos de ataque.", rating: { security: 5, cost: 6, growth: 7, ease: 5, green: 6 } },
  { name: "Tecnologia verde", use: "Gastar menos energia e material.", limit: "O retorno financeiro costuma demorar.", rating: { security: 4, cost: 6, growth: 5, ease: 6, green: 10 } },
];

function CompareLab() {
  const [weights, setWeights] = useState<Record<Criterion, number>>({ security: 5, cost: 3, growth: 3, ease: 2, green: 2 });
  const totalWeight = CRITERIA.reduce((total, criterion) => total + weights[criterion.id], 0);
  const ranking = TECHNOLOGIES.map((technology) => {
    const points = CRITERIA.reduce((total, criterion) => total + weights[criterion.id] * technology.rating[criterion.id], 0);
    return { ...technology, score: totalWeight ? Math.round((points / (totalWeight * 10)) * 100) : 0 };
  }).sort((a, b) => b.score - a.score);
  const setWeight = (id: Criterion, value: number) => setWeights((previous) => ({ ...previous, [id]: value }));

  return (
    <Layout controls={<>
      <p className="bk-lead">Diga o que é mais importante para o banco agora. O ranking muda com as suas escolhas.</p>
      {CRITERIA.map((criterion) => <Range key={criterion.id} label={criterion.label} value={weights[criterion.id]} min={0} max={5} onChange={(value) => setWeight(criterion.id, value)} suffix={weights[criterion.id] === 1 ? " ponto" : " pontos"} />)}
    </>}>
      {totalWeight === 0 ? <p className="bk-note">Dê pelo menos um ponto a algum critério.</p> : (
        <ol className="bk-rank">{ranking.map((technology, index) => (
          <li key={technology.name}>
            <b>{index + 1}</b>
            <div><strong>{technology.name}</strong><small>{technology.use}</small><span className="bk-meter-line"><i style={{ width: `${technology.score}%` }} /></span><small className="is-warn">Atenção: {technology.limit}</small></div>
            <em>{technology.score}</em>
          </li>
        ))}</ol>
      )}
      <p className="bk-note">A nota vai de 0 a 100 e mostra o quanto cada tecnologia combina com as prioridades escolhidas. Não existe tecnologia melhor para tudo.</p>
    </Layout>
  );
}

/* 4. Detector de golpe ---------------------------------------------------- */

// Procura palavras inteiras, entendendo letras acentuadas (o \b do JavaScript não entende "ú", por exemplo).
const words = (source: string) => new RegExp(`(?<![\\p{L}\\p{N}])(?:${source})(?![\\p{L}\\p{N}])`, "giu");
const SCAM_RULES: Array<{ id: string; label: string; advice: string; points: number; pattern: RegExp }> = [
  { id: "code", label: "Pede senha ou código", advice: "O banco nunca pede senha, token ou código por mensagem.", points: 35, pattern: words("senha|c[oó]digo|token|pin|cvv") },
  { id: "urgency", label: "Cria pressa", advice: "Golpistas querem que você aja sem pensar.", points: 20, pattern: words("urgente|imediatamente|agora mesmo|[uú]ltimo aviso|em 24 ?h(?:oras)?|hoje ainda|r[aá]pido") },
  { id: "threat", label: "Ameaça bloquear a conta", advice: "Bancos avisam pelo aplicativo oficial, não com ameaças.", points: 15, pattern: words("bloquead[ao]|suspens[ao]|cancelad[ao]|desativad[ao]") },
  { id: "link", label: "Tem link para clicar", advice: "Não clique. Digite o endereço do banco você mesmo.", points: 20, pattern: /https?:\/\/\S+|www\.\S+|bit\.ly\/?\S*|(?<![\p{L}])(?:clique|acesse o link)(?![\p{L}])/giu },
  { id: "money", label: "Pede dinheiro ou Pix", advice: "Confirme por ligação antes de enviar qualquer valor.", points: 20, pattern: words("fa[zç]a um pix|faz um pix|manda um pix|me empresta|transfere|deposita") },
  { id: "number", label: "Diz que trocou de número", advice: "Ligue para o número antigo da pessoa para confirmar.", points: 20, pattern: words("n[uú]mero novo|troquei de n[uú]mero|celular novo|meu novo n[uú]mero") },
  { id: "prize", label: "Promete prêmio ou dinheiro fácil", advice: "Ninguém dá prêmio pedindo pagamento antes.", points: 15, pattern: words("pr[eê]mio|ganhou|sorteio|sorteado|resgate seu|b[oô]nus") },
];
const SCAM_EXAMPLES = [
  { label: "SMS do “banco”", text: "RANBANK: sua conta foi bloqueada. Para liberar, acesse o link bit.ly/rb-libera e informe sua senha e o código recebido. Último aviso!" },
  { label: "Parente no WhatsApp", text: "Oi, mãe! Troquei de número, esse é meu celular novo. Faz um Pix de R$ 900 pra mim agora mesmo? É urgente, depois te explico." },
  { label: "Mensagem normal", text: "Olá! Sua fatura do cartão fecha dia 10. Você pode conferir os detalhes no aplicativo do RanBank quando quiser." },
];

function highlight(text: string) {
  const parts: ReactNode[] = [];
  const combined = new RegExp(SCAM_RULES.map((rule) => rule.pattern.source).join("|"), "giu");
  let last = 0;
  for (const match of text.matchAll(combined)) {
    const index = match.index ?? 0;
    if (index > last) parts.push(text.slice(last, index));
    parts.push(<mark key={index}>{match[0]}</mark>);
    last = index + match[0].length;
  }
  parts.push(text.slice(last));
  return parts;
}

function ScamLab() {
  const [text, setText] = useState(SCAM_EXAMPLES[0].text);
  const found = SCAM_RULES.filter((rule) => new RegExp(rule.pattern.source, "iu").test(text));
  const score = Math.min(100, found.reduce((total, rule) => total + rule.points, 0));
  const verdict = score >= 60 ? "Golpe provável" : score >= 30 ? "Suspeita" : "Parece segura";

  return (
    <Layout controls={<>
      <p className="bk-lead">Escolha um exemplo ou escreva uma mensagem. As regras procuram os sinais mais comuns de golpe.</p>
      <div className="lab-chips">{SCAM_EXAMPLES.map((example) => <button type="button" key={example.label} onClick={() => setText(example.text)}>{example.label}</button>)}</div>
      <label className="lab-textarea">Mensagem recebida<textarea value={text} maxLength={500} onChange={(event) => setText(event.target.value)} rows={7} /></label>
    </>}>
      <div className={`bk-score ${tone(score)}`}><strong>{score}</strong><span>pontos de risco (de 100)</span><b>{verdict}</b></div>
      <p className="lab-message">{text ? highlight(text) : <span className="bk-muted">Escreva uma mensagem para analisar.</span>}</p>
      {found.length ? (
        <ul className="bk-rows">{found.map((rule) => <li key={rule.id}><div><strong>{rule.label}</strong><small>{rule.advice}</small></div><b className="bk-pill is-warn">+{rule.points}</b></li>)}</ul>
      ) : <p className="bk-note">Nenhum sinal de golpe encontrado. Mesmo assim, desconfie de mensagens inesperadas.</p>}
    </Layout>
  );
}

/* 5. Entrada na conta ----------------------------------------------------- */

function LoginLab() {
  const [passwordOk, setPasswordOk] = useState(true);
  const [failures, setFailures] = useState(0);
  const [newDevice, setNewDevice] = useState(false);
  const [place, setPlace] = useState<"same" | "city" | "country">("same");
  const [hour, setHour] = useState(14);
  const [biometrics, setBiometrics] = useState(false);

  const factors = [
    { label: "Senha", detail: passwordOk ? "Correta" : "Errada", points: 0, status: passwordOk ? "ok" : "bad" },
    { label: "Tentativas erradas antes", detail: `${failures} tentativa${failures === 1 ? "" : "s"}`, points: failures * 10, status: failures >= 3 ? "bad" : failures ? "warn" : "ok" },
    { label: "Aparelho", detail: newDevice ? "Nunca usado nesta conta" : "Já conhecido", points: newDevice ? 35 : 0, status: newDevice ? "warn" : "ok" },
    { label: "Local", detail: place === "same" ? "Cidade de costume" : place === "city" ? "Outra cidade" : "Outro país", points: place === "same" ? 0 : place === "city" ? 20 : 40, status: place === "same" ? "ok" : "warn" },
    { label: "Horário", detail: `${String(hour).padStart(2, "0")}h${hour < 6 ? " (madrugada)" : ""}`, points: hour < 6 ? 15 : 0, status: hour < 6 ? "warn" : "ok" },
    { label: "Biometria", detail: biometrics ? "Rosto confirmado" : "Não usada", points: biometrics ? -30 : 0, status: biometrics ? "ok" : "neutral" },
  ];
  const risk = clamp(factors.reduce((total, factor) => total + factor.points, 0), 0, 100);
  const decision = !passwordOk ? { label: "Acesso negado", text: "A senha está errada. Depois de várias tentativas, o acesso deve travar por um tempo." , tone: "is-bad" }
    : failures >= 3 ? { label: "Acesso travado", text: "Muitas tentativas erradas seguidas. O banco trava o acesso por alguns minutos.", tone: "is-bad" }
      : risk >= 60 ? { label: "Bloquear e avisar", text: "Risco alto. O banco bloqueia e avisa a pessoa pelo aparelho de costume.", tone: "is-bad" }
        : risk >= 30 ? { label: "Pedir um código", text: "Risco médio. O banco pede um código extra antes de liberar.", tone: "is-warn" }
          : { label: "Liberar", text: "Tudo confere. O acesso é liberado normalmente.", tone: "is-ok" };

  return (
    <Layout controls={<>
      <p className="bk-lead">Monte uma tentativa de entrada. O banco soma os sinais e decide o que fazer.</p>
      <Toggle label="Senha correta" checked={passwordOk} onChange={setPasswordOk} />
      <Range label="Tentativas erradas antes" value={failures} min={0} max={5} onChange={setFailures} />
      <Toggle label="Aparelho novo" checked={newDevice} onChange={setNewDevice} />
      <div className="bk-seg" role="group" aria-label="Local do acesso">
        <button type="button" className={place === "same" ? "active" : ""} onClick={() => setPlace("same")}>Cidade de costume</button>
        <button type="button" className={place === "city" ? "active" : ""} onClick={() => setPlace("city")}>Outra cidade</button>
        <button type="button" className={place === "country" ? "active" : ""} onClick={() => setPlace("country")}>Outro país</button>
      </div>
      <Range label="Horário" value={hour} min={0} max={23} suffix="h" onChange={setHour} />
      <Toggle label="Confirmou com biometria" hint="Tira 30 pontos de risco" checked={biometrics} onChange={setBiometrics} />
    </>}>
      <div className={`bk-score ${decision.tone}`}><strong>{risk}</strong><span>pontos de risco (de 100)</span><b>{decision.label}</b></div>
      <ul className="bk-rows">{factors.map((factor) => <li key={factor.label}><div><strong>{factor.label}</strong><small>{factor.detail}</small></div><b className={`bk-pill ${factor.status === "bad" ? "is-bad" : factor.status === "warn" ? "is-warn" : factor.status === "ok" ? "is-ok" : ""}`}>{factor.points > 0 ? `+${factor.points}` : factor.points < 0 ? factor.points : "0"}</b></li>)}</ul>
      <p className="bk-note"><strong>{decision.label}.</strong> {decision.text}</p>
    </Layout>
  );
}

/* 6. Registro seguro (corrente de hashes) -------------------------------- */

const INITIAL_EVENTS = ["Conta criada para Ana", "Pix enviado · R$ 50,00 para Bruno", "Pix recebido · R$ 120,00 de Maria", "Cartão bloqueado pela cliente", "Senha de acesso alterada"];
const short = (hash: string) => `${hash.slice(0, 10)}…${hash.slice(-6)}`;
const chainOf = (events: string[]) => events.reduce<string[]>((hashes, event, index) => [...hashes, sha256(`${index}|${event}|${index ? hashes[index - 1] : "inicio"}`)], []);

function ChainLab() {
  const [saved, setSaved] = useState(() => ({ events: INITIAL_EVENTS, hashes: chainOf(INITIAL_EVENTS) }));
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [draft, setDraft] = useState("");
  const current = useMemo(() => chainOf(events), [events]);
  const firstBroken = current.findIndex((hash, index) => hash !== saved.hashes[index]);

  const add = () => {
    const text = draft.trim();
    if (!text || firstBroken >= 0) return;
    const nextEvents = [...events, text];
    setEvents(nextEvents);
    setSaved({ events: nextEvents, hashes: chainOf(nextEvents) });
    setDraft("");
  };

  return (
    <Layout controls={<>
      <p className="bk-lead">Cada registro guarda um código (hash SHA-256) calculado com o texto dele e com o código do registro anterior.</p>
      <p className="bk-lead"><strong>Teste:</strong> mude o texto de um registro, por exemplo o valor do Pix, e veja a corrente quebrar dali em diante.</p>
      <label className="lab-textarea">Novo registro<input value={draft} maxLength={80} onChange={(event) => setDraft(event.target.value)} placeholder="Ex.: Pix enviado · R$ 30,00 para Carla" /></label>
      <button type="button" className="bk-btn bk-btn-primary" onClick={add} disabled={!draft.trim() || firstBroken >= 0}>Adicionar à corrente</button>
      <button type="button" className="bk-btn bk-btn-ghost" onClick={() => setEvents(saved.events)} disabled={firstBroken < 0}>Desfazer alterações</button>
    </>}>
      <div className={`bk-score ${firstBroken >= 0 ? "is-bad" : "is-ok"}`}><strong>{firstBroken >= 0 ? "✕" : "✓"}</strong><span>{firstBroken >= 0 ? `Alteração encontrada no registro ${firstBroken + 1}` : `${events.length} registros conferidos`}</span><b>{firstBroken >= 0 ? "Corrente quebrada" : "Corrente íntegra"}</b></div>
      <ol className="lab-chain">
        {events.map((event, index) => {
          const broken = firstBroken >= 0 && index >= firstBroken;
          return (
            <li key={index} className={broken ? (index === firstBroken ? "is-edited" : "is-broken") : ""}>
              <b>{index + 1}</b>
              <div>
                <input value={event} maxLength={80} onChange={(input) => setEvents(events.map((item, position) => position === index ? input.target.value : item))} aria-label={`Texto do registro ${index + 1}`} />
                <small className="bk-hash">Código guardado: {short(saved.hashes[index])}</small>
                <small className="bk-hash">Código calculado agora: {short(current[index])}</small>
                {broken && <em className="bk-pill is-bad">{index === firstBroken ? "Texto alterado" : "Depende do registro alterado"}</em>}
              </div>
            </li>
          );
        })}
      </ol>
      <p className="bk-note">É a mesma ideia usada em blockchain: mudar um registro antigo muda todos os códigos seguintes, e a fraude aparece.</p>
    </Layout>
  );
}

/* Janela ----------------------------------------------------------------- */

const LABS: Record<LabId, { label: string; title: string; view: () => ReactNode }> = {
  cloud: { label: "Disponibilidade", title: "Banco sempre no ar", view: () => <CloudLab /> },
  energy: { label: "Meio ambiente", title: "Banco sustentável", view: () => <EnergyLab /> },
  compare: { label: "Decisão", title: "Qual tecnologia usar?", view: () => <CompareLab /> },
  scam: { label: "Segurança", title: "Isso é golpe?", view: () => <ScamLab /> },
  login: { label: "Segurança", title: "Entrada normal ou suspeita?", view: () => <LoginLab /> },
  chain: { label: "Registros", title: "Registro que não pode ser alterado", view: () => <ChainLab /> },
};

export function LabSheet({ id, onClose }: { id: LabId; onClose: () => void }) {
  const lab = LABS[id];
  return <BkSheet label={lab.label} title={lab.title} onClose={onClose} wide>{lab.view()}</BkSheet>;
}
