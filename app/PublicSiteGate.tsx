"use client";
/* eslint-disable @next/next/no-img-element -- Vinext serves the local RanBank brand image directly. */
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Icon } from "./SiteIcons";
import RaniAssistant, { openRani } from "./RaniAssistant";
import type { IconName } from "./SiteIcons";

function Link({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <a href={href} {...props}>{children}</a>;
}

/* ------------------------------------------------------------------ */
/* Conteúdo                                                            */
/* ------------------------------------------------------------------ */

const researchFacts = [
  {
    value: "148 milhões",
    text: "de pessoas usaram o Pix em 2025.",
    source: "Banco Central, Relatório de Gestão do Pix (2026)",
    href: "https://www.gov.br/fazenda/pt-br/composicao/orgaos/orgaos-colegiados/crsfn/acesso-a-informacao/noticias/2026/pix-consolida-lideranca-nos-pagamentos-digitais-e-projeta-novas-evolucoes-ate-2030",
  },
  {
    value: "39%",
    text: "dos brasileiros dizem já ter sofrido golpe ou tentativa de golpe na conta do banco.",
    source: "Observatório Febraban, julho de 2025",
    href: "https://febrabantech.febraban.org.br/temas/seguranca/quase-4-em-cada-10-brasileiros-ja-sofreram-golpe-aponta-pesquisa-da-febraban",
  },
  {
    value: "55%",
    text: "dizem entender pouco ou nada de educação financeira.",
    source: "Observatório Febraban, julho de 2025",
    href: "https://portal.febraban.org.br/noticia/4324/pt-br/",
  },
];

const institutionalValues = [
  { title: "Simplicidade", text: "Falar claro. Se precisa de manual, está complicado demais." },
  { title: "Segurança", text: "Proteger cada acesso e cada centavo como se fossem nossos." },
  { title: "Inclusão", text: "Funcionar bem para quem tem pouca experiência com banco." },
  { title: "Impacto positivo", text: "Medir o sucesso também pelo bem que o banco faz fora dele." },
];

const productFeatures: Array<{ icon: IconName; title: string; text: string }> = [
  { icon: "list", title: "Extrato fácil de ler", text: "Nome, data e valor de cada movimentação, da mais nova para a mais antiga." },
  { icon: "vault", title: "Cofrinho", text: "Separe dinheiro para um objetivo sem misturar com o saldo do dia a dia." },
  { icon: "calendar", title: "Agendamentos", text: "Programe pagamentos e não perca vencimentos." },
  { icon: "key", title: "Chaves Pix", text: "Cadastre ou apague CPF, e-mail, celular ou chave aleatória." },
];

const pixSteps = [
  { title: "Entrar", text: "Com CPF, conta ou e-mail e a sua senha de acesso." },
  { title: "Conferir", text: "Antes de enviar, o app mostra o nome de quem vai receber." },
  { title: "Confirmar", text: "Uma segunda senha, de 4 dígitos, usada só para movimentar dinheiro." },
  { title: "Comprovar", text: "Comprovante na hora e a movimentação aparece no extrato." },
];

const impactDestinations: Array<{ icon: IconName; title: string; text: string; status: string }> = [
  { icon: "book", title: "Educação financeira", text: "Oficinas sobre orçamento, Pix e golpes para jovens aprendizes e escolas, usando o próprio RanBank para praticar.", status: "Próximo passo" },
  { icon: "sprout", title: "Crédito com propósito", text: "Condições melhores para pequenos negócios e projetos que geram renda ou reduzem impacto ambiental.", status: "Ideia" },
  { icon: "users", title: "Comunidades e territórios", text: "Educação financeira e acesso digital em comunidades, inclusive indígenas, construídos junto com elas.", status: "Em estudo" },
];

const roadmap = [
  { status: "Pronto", tone: "done", title: "Protótipo funcionando", text: "Site, conta de teste, Pix com senha, cartão, extrato, cofrinho e a assistente Rani, rodando na internet." },
  { status: "Próximo passo", tone: "next", title: "Piloto educativo", text: "Usar o RanBank em oficinas com jovens para praticar Pix, orçamento e prevenção a golpes, sem dinheiro real." },
  { status: "Em estudo", tone: "study", title: "Comunidades", text: "Levar educação financeira a comunidades, ouvindo cada uma antes de propor qualquer coisa." },
  { status: "Futuro", tone: "future", title: "Crescer com apoio", text: "Encontrar mentores e apoiadores para transformar o piloto em um programa contínuo." },
];

const reasonsToBack: Array<{ icon: IconName; title: string; text: string }> = [
  { icon: "check", title: "Já funciona", text: "Não é só apresentação: dá para entrar, fazer um Pix de teste e ver o comprovante agora." },
  { icon: "alert", title: "Ataca um problema real", text: "Golpes e falta de informação atingem milhões de brasileiros todos os anos." },
  { icon: "cloud", title: "Custa pouco para testar", text: "Hoje roda em serviços de nuvem gratuitos. Um piloto educativo não movimenta dinheiro real." },
];

const teamHighlights = [
  { name: "Guilherme", role: "Presidente e CEO" },
  { name: "Giulianno", role: "Vice-Presidente" },
  { name: "Lívia", role: "Ouvidora-Geral" },
  { name: "Lúcio", role: "Diretor de Tecnologia" },
  { name: "Sarah", role: "Diretora de Comunicação" },
  { name: "Rangel", role: "Diretor de Negócios" },
  { name: "Pedro", role: "Diretor de RH" },
];

const frequentlyAskedQuestions = [
  { question: "O que é o RanBank?", answer: "É um projeto educacional que simula um banco digital. As contas, os cartões e os valores são fictícios e nenhuma operação movimenta dinheiro real." },
  { question: "O que dá para testar?", answer: "Entrar na conta de teste, fazer Pix entre contas de demonstração, ver o extrato, bloquear o cartão, guardar dinheiro no cofrinho e conversar com a Rani." },
  { question: "Preciso informar dados verdadeiros?", answer: "Não. Use só os dados de demonstração. Nunca digite senhas, cartões ou dados de uma conta bancária real." },
  { question: "O que a Rani pode fazer?", answer: "A Rani explica as funções da conta, orienta sobre Pix, cartão e golpes e apresenta os projetos do RanBank em palavras simples." },
  { question: "Os projetos sociais já existem?", answer: "Ainda não. São propostas em estudo. O site separa o que já funciona (o banco) do que ainda é ideia (os projetos). Não existem parcerias oficiais." },
];

const securityControls: Array<{ icon: IconName; title: string; text: string }> = [
  { icon: "lock", title: "Senha guardada embaralhada", text: "A senha é salva de um jeito que nem a equipe consegue ler (criptografia bcrypt)." },
  { icon: "key", title: "Senha só para movimentar", text: "Pix e pagamentos pedem uma senha de 4 dígitos diferente da senha de entrar." },
  { icon: "eye", title: "Nome de quem recebe", text: "Antes de confirmar o Pix, o app mostra para quem o dinheiro vai." },
  { icon: "shield", title: "Sessão com prazo", text: "O acesso vence depois de 30 minutos sem uso. Ao sair, ele é encerrado também no servidor." },
  { icon: "card", title: "Cartão bloqueado em um toque", text: "Perdeu o cartão ou desconfiou de algo? Bloqueie e desbloqueie pelo app." },
  { icon: "check", title: "Sem Pix repetido nem acima do saldo", text: "Um clique duplo não envia o Pix duas vezes, e o sistema recusa valores maiores que o saldo." },
];

const commonScams = [
  { title: "Troca ou clonagem de cartão", tip: "Não entregue o cartão a ninguém e cubra o teclado ao digitar a senha." },
  { title: "Golpe do WhatsApp", tip: "Pedido de dinheiro com número novo? Ligue para a pessoa antes de pagar." },
  { title: "Falsa central do banco", tip: "O banco não liga pedindo senha, código ou transferência. Desligue e ligue você." },
  { title: "Pix ou comprovante falso", tip: "Confira no extrato se o dinheiro entrou antes de entregar um produto." },
];

/* ------------------------------------------------------------------ */
/* Peças compartilhadas                                                */
/* ------------------------------------------------------------------ */

function BrandLogo() {
  return (
    <span className="rs-logo">
      <img src="/ranbank-logo-transparent.png" alt="RanBank" />
    </span>
  );
}

function SectionHead({ label, title, text, center = false }: { label: string; title: ReactNode; text?: ReactNode; center?: boolean }) {
  return (
    <header className={`rs-head ${center ? "is-center" : ""}`}>
      <span className="rs-label">{label}</span>
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
    </header>
  );
}

const navigation = [
  { href: "/#produto", label: "O banco" },
  { href: "/seguranca", label: "Segurança" },
  { href: "/projetos", label: "Projetos e impacto" },
  { href: "/organograma", label: "Quem somos" },
  { href: "/#duvidas", label: "Ajuda" },
];

// `dark` é aceito por compatibilidade com páginas antigas; o novo cabeçalho tem um só visual.
export function PublicHeader(props: { dark?: boolean }) {
  void props;
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="rs-notice" role="note">
        <strong>Projeto educacional.</strong> O RanBank é um banco fictício criado por jovens aprendizes. Nenhum valor é real.
      </div>
      <header className={`rs-header ${open ? "is-open" : ""}`}>
        <div className="rs-header-inner">
          <Link className="rs-brand" href="/" aria-label="Página inicial do RanBank">
            <BrandLogo />
          </Link>
          <nav className="rs-nav" aria-label="Navegação principal">
            {navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>)}
          </nav>
          <div className="rs-header-actions">
            <Link className="rs-btn rs-btn-quiet" href="/banco">Entrar</Link>
            <Link className="rs-btn rs-btn-primary" href="/banco?modo=criar-conta">Abrir conta</Link>
            <button className="rs-menu-toggle" type="button" aria-expanded={open} aria-label={open ? "Fechar menu" : "Abrir menu"} onClick={() => setOpen(!open)}>
              <Icon name={open ? "close" : "menu"} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

export function PublicFooter() {
  return (
    <footer className="rs-footer">
      <div className="rs-footer-inner">
        <div className="rs-footer-brand">
          <BrandLogo />
          <p>Banco digital demonstrativo criado em Brasília - DF para ensinar, proteger e pensar no futuro.</p>
        </div>
        <div className="rs-footer-col">
          <strong>RanBank</strong>
          <Link href="/banco">Acessar conta</Link>
          <Link href="/#visao-valores">Missão, visão e valores</Link>
          <Link href="/projetos">Projetos e impacto</Link>
          <Link href="/instituto">Instituto RanBank</Link>
          <Link href="/organograma">Nossa equipe</Link>
        </div>
        <div className="rs-footer-col">
          <strong>Proteção</strong>
          <Link href="/seguranca">Central de Segurança</Link>
          <Link href="/privacidade">Privacidade e cookies</Link>
          <Link href="/#duvidas">Dúvidas frequentes</Link>
        </div>
        <div className="rs-footer-col">
          <strong>Redes sociais</strong>
          <a href="https://www.instagram.com/ranbank.df" target="_blank" rel="noreferrer">Instagram @ranbank.df</a>
          <a href="https://www.tiktok.com/@ranbank.df" target="_blank" rel="noreferrer">TikTok @ranbank.df</a>
        </div>
      </div>
      <p className="rs-footer-legal">
        © 2026 RanBank. Projeto educacional e demonstrativo. Não é uma instituição financeira e não tem autorização do Banco Central para operar.
      </p>
    </footer>
  );
}

function CookieCenter() {
  const [visible, setVisible] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [preferences, setPreferences] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(!window.localStorage.getItem("ranbank-cookie-consent")), 0);
    return () => window.clearTimeout(timer);
  }, []);
  function save(level: "essential" | "custom" | "all") {
    const consent =
      level === "all"
        ? { preferences: true, analytics: true }
        : level === "essential"
          ? { preferences: false, analytics: false }
          : { preferences, analytics };
    window.localStorage.setItem("ranbank-cookie-consent", JSON.stringify({ ...consent, savedAt: new Date().toISOString() }));
    setVisible(false);
    setConfiguring(false);
  }
  if (!visible) return null;
  return (
    <div className="rs-cookie" role="region" aria-label="Preferências de privacidade">
      {configuring ? (
        <section role="dialog" aria-modal="true" aria-labelledby="cookie-title">
          <h2 id="cookie-title">Suas preferências</h2>
          <p>Nenhum cookie de publicidade é usado neste projeto.</p>
          <label className="rs-cookie-option">
            <span><strong>Essenciais</strong><small>Mantêm você conectado e guardam esta escolha.</small></span>
            <input aria-label="Cookies essenciais" type="checkbox" checked disabled />
          </label>
          <label className="rs-cookie-option">
            <span><strong>Preferências</strong><small>Lembram ajustes neste aparelho.</small></span>
            <input aria-label="Cookies de preferências" type="checkbox" checked={preferences} onChange={(event) => setPreferences(event.target.checked)} />
          </label>
          <label className="rs-cookie-option">
            <span><strong>Medição</strong><small>Números anônimos de uso, se um dia forem ativados.</small></span>
            <input aria-label="Cookies de medição" type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} />
          </label>
          <div className="rs-cookie-actions">
            <button className="rs-btn rs-btn-outline" onClick={() => save("essential")}>Usar só essenciais</button>
            <button className="rs-btn rs-btn-primary" onClick={() => save("custom")}>Salvar</button>
          </div>
        </section>
      ) : (
        <section>
          <p><strong>Cookies:</strong> usamos só o necessário para o site funcionar. O resto depende de você. <Link href="/privacidade">Saiba mais</Link></p>
          <div className="rs-cookie-actions">
            <button className="rs-btn rs-btn-outline" onClick={() => save("essential")}>Somente essenciais</button>
            <button className="rs-btn rs-btn-outline" onClick={() => setConfiguring(true)}>Configurar</button>
            <button className="rs-btn rs-btn-primary" onClick={() => save("all")}>Aceitar todos</button>
          </div>
        </section>
      )}
    </div>
  );
}

function PublicShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rs ${className}`}>
      <PublicHeader />
      <main>{children}</main>
      <PublicFooter />
      <CookieCenter />
      <RaniAssistant context="site" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Maquetes do aplicativo                                              */
/* ------------------------------------------------------------------ */

function PhoneMockup() {
  const actions: Array<[IconName, string]> = [["pix", "Pix"], ["bill", "Pagar"], ["calendar", "Agendar"], ["vault", "Guardar"]];
  const moves = [
    ["Pix recebido", "Bruno Lima", "+ R$ 150,00", "in"],
    ["Mercado Bom Preço", "Cartão Ecocard", "- R$ 86,40", "out"],
    ["Cofrinho", "Meta: viagem", "- R$ 200,00", "out"],
  ];
  return (
    <div className="rs-phone" aria-label="Exemplo da tela inicial do aplicativo RanBank, com valores fictícios" role="img">
      <div className="rs-phone-screen">
        <div className="rs-app-top">
          <span className="rs-app-avatar">A</span>
          <div><small>Olá,</small><strong>Ana</strong></div>
          <Icon name="eye" size={20} />
        </div>
        <div className="rs-app-balance">
          <small>Saldo disponível</small>
          <strong>R$ 4.280,50</strong>
        </div>
        <div className="rs-app-actions">
          {actions.map(([icon, label]) => (
            <span key={label}><i><Icon name={icon} size={20} /></i>{label}</span>
          ))}
        </div>
        <div className="rs-app-card">
          <img src="/images/ranbank-ecocard-nativa-frente.webp" alt="" />
          <div><strong>Ecocard</strong><small>Fatura atual R$ 312,40</small></div>
        </div>
        <div className="rs-app-moves">
          <small>Últimas movimentações</small>
          {moves.map(([title, detail, value, kind]) => (
            <div key={title}>
              <span><strong>{title}</strong><small>{detail}</small></span>
              <b className={kind === "in" ? "is-in" : ""}>{value}</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PixConfirmMockup() {
  return (
    <div className="rs-pix-mock" aria-hidden="true">
      <small>Você vai enviar</small>
      <strong>R$ 50,00</strong>
      <div className="rs-pix-to">
        <span className="rs-app-avatar is-small">B</span>
        <span><b>Bruno Lima</b><small>Chave: bruno@email.com</small></span>
      </div>
      <div className="rs-pix-pin">
        <small>Senha de 4 dígitos</small>
        <span><i /><i /><i /><i /></span>
      </div>
      <span className="rs-pix-button">Confirmar Pix</span>
    </div>
  );
}

function RanChatMockup() {
  return (
    <div className="rs-chat" role="img" aria-label="Exemplo de conversa com a assistente Rani">
      <div className="rs-chat-head">
        <img src="/images/ran-assistente-humana.png" alt="" />
        <span><strong>Rani</strong><small>Assistente RanBank</small></span>
      </div>
      <p className="rs-bubble is-user">Recebi um SMS pedindo o código do banco. O que eu faço?</p>
      <p className="rs-bubble">Não envie o código. O RanBank nunca pede senha ou código por mensagem. Apague o SMS e, se clicou no link, bloqueie o cartão no app.</p>
      <p className="rs-bubble is-user">Como eu bloqueio?</p>
      <p className="rs-bubble">Vá em <b>Cartão</b> e toque em <b>Bloquear temporariamente</b>. Para liberar, é só tocar de novo.</p>
      <small className="rs-chat-note">Exemplo de conversa</small>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Página inicial                                                      */
/* ------------------------------------------------------------------ */

export default function PublicSiteGate() {
  const pathname = usePathname();
  if (pathname !== "/") return null;
  return <PublicHome />;
}

export function PublicHome() {
  return (
    <PublicShell className="rs-home">
      {/* 1. Abertura */}
      <section className="rs-hero">
        <div className="rs-wrap rs-hero-grid">
          <div className="rs-hero-copy">
            <span className="rs-chip">Banco digital educacional</span>
            <h1>O banco que protege, explica e devolve.</h1>
            <p>
              Conta, Pix e cartão em um só lugar. Proteção contra golpes em cada passo, uma assistente que explica tudo sem complicar
              e um modelo pensado para investir em educação e comunidades.
            </p>
            <div className="rs-actions">
              <Link className="rs-btn rs-btn-primary rs-btn-lg" href="/banco">Ver o banco funcionando <Icon name="arrow" size={20} /></Link>
              <Link className="rs-btn rs-btn-outline rs-btn-lg" href="#proposta">Conhecer a proposta</Link>
            </div>
            <p className="rs-hero-proof"><Icon name="check" size={18} /> Protótipo no ar: dá para entrar e fazer um Pix de teste agora.</p>
          </div>
          <div className="rs-hero-visual">
            <PhoneMockup />
            <img className="rs-hero-card" src="/images/ranbank-ecocard-nativa-frente.webp" alt="Cartão Ecocard RanBank" />
          </div>
        </div>
      </section>

      {/* 2. O problema */}
      <section className="rs-section rs-light" id="por-que">
        <div className="rs-wrap">
          <SectionHead
            label="Por que o RanBank existe"
            title={<>O Pix chegou a quase todo mundo.<br />A proteção e a informação, ainda não.</>}
          />
          <div className="rs-facts">
            {researchFacts.map((fact) => (
              <article key={fact.value}>
                <strong>{fact.value}</strong>
                <p>{fact.text}</p>
                <a href={fact.href} target="_blank" rel="noreferrer">Fonte: {fact.source} ↗</a>
              </article>
            ))}
          </div>
          <p className="rs-statement">Usar o banco ficou fácil. Usar com <em>segurança</em> e <em>consciência</em> continua difícil. É esse espaço que o RanBank quer ocupar.</p>
        </div>
      </section>

      {/* 3. Identidade */}
      <section className="rs-section" id="visao-valores">
        <div className="rs-wrap">
          <SectionHead label="Quem somos" title="Missão, visão e valores" />
          <div className="rs-purpose">
            <article>
              <span>Missão</span>
              <p>Facilitar a vida financeira das pessoas com serviços simples, seguros e acessíveis.</p>
            </article>
            <article>
              <span>Visão</span>
              <p>Ser um banco digital reconhecido por unir tecnologia, educação financeira e responsabilidade social.</p>
            </article>
          </div>
          <div className="rs-values">
            {institutionalValues.map((value, index) => (
              <article key={value.title}>
                <b>0{index + 1}</b>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            ))}
          </div>
          <p className="rs-motto">Tecnologia para simplificar. Segurança para proteger. Responsabilidade para transformar.</p>
        </div>
      </section>

      {/* 4. Produto */}
      <section className="rs-section rs-light" id="produto">
        <div className="rs-wrap">
          <SectionHead label="O banco" title="Tudo o que uma conta precisa. Nada que confunda." />
          <div className="rs-bento">
            <article className="rs-tile rs-tile-pix">
              <div>
                <i className="rs-tile-icon"><Icon name="pix" /></i>
                <h3>Pix com confirmação</h3>
                <p>Antes de enviar, você vê o nome de quem vai receber e confirma com uma senha de 4 dígitos, diferente da senha de entrar.</p>
              </div>
              <PixConfirmMockup />
            </article>
            <article className="rs-tile rs-tile-card" id="ecocard">
              <img src="/images/ranbank-ecocard-nativa-frente.webp" alt="Cartão Ecocard RanBank" />
              <div>
                <h3>Ecocard</h3>
                <p>Cartão feito de material de origem sustentável. Bloqueie e desbloqueie pelo app em um toque.</p>
              </div>
            </article>
            {productFeatures.map((feature) => (
              <article className="rs-tile" key={feature.title}>
                <i className="rs-tile-icon"><Icon name={feature.icon} /></i>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4b. Banner com vídeo */}
      <section className="rs-banner" aria-labelledby="banner-title">
        <video className="rs-banner-video" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
          <source src="/videos/ranbank-demonstracao-04.mp4" type="video/mp4" />
        </video>
        <div className="rs-banner-shade" aria-hidden="true" />
        <div className="rs-wrap rs-banner-copy">
          <span className="rs-chip">Agência do futuro · conceito</span>
          <h2 id="banner-title">Tecnologia que orienta. Pessoas que acolhem.</h2>
          <p>Uma ideia de atendimento em que a tecnologia ajuda no caminho e sempre existe uma pessoa por perto para resolver.</p>
          <Link className="rs-btn rs-btn-light rs-btn-lg" href="/projetos">Conhecer as propostas <Icon name="arrow" size={20} /></Link>
        </div>
        <small className="rs-banner-note">Vídeo ilustrativo</small>
      </section>

      {/* 5. Rani */}
      <section className="rs-section rs-ran" id="ran">
        <div className="rs-wrap rs-split">
          <div>
            <SectionHead
              label="Assistente Rani"
              title="Dúvida de banco? Pergunte para a Rani."
              text="A Rani responde em palavras simples sobre Pix, cartão, extrato e golpes. Ela foi feita para explicar, não para vender."
            />
            <button type="button" className="rs-btn rs-btn-primary rs-btn-lg" onClick={openRani}>Falar com a Rani <Icon name="arrow" size={20} /></button>
          </div>
          <RanChatMockup />
        </div>
      </section>

      {/* 6. Segurança */}
      <section className="rs-section rs-light" id="seguranca">
        <div className="rs-wrap">
          <SectionHead
            label="Segurança"
            title="Um Pix no RanBank passa por quatro etapas."
            text="Cada etapa existe para impedir que o dinheiro vá para o lugar errado."
          />
          <ol className="rs-steps">
            {pixSteps.map((step, index) => (
              <li key={step.title}>
                <b>{index + 1}</b>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
          <Link className="rs-link" href="/seguranca">Ver a Central de Segurança <Icon name="arrow" size={18} /></Link>
        </div>
      </section>

      {/* 7. Impacto */}
      <section className="rs-section rs-impact" id="proposta">
        <div className="rs-wrap">
          <SectionHead
            label="Proposta de impacto"
            title="Um banco que cresce junto com a comunidade."
            text="Bancos ganham dinheiro com tarifas que as lojas pagam no cartão, com crédito e com investimentos. A proposta do RanBank é separar uma parte fixa desse resultado para o Instituto RanBank."
          />
          <div className="rs-destinations">
            {impactDestinations.map((item) => (
              <article key={item.title}>
                <div className="rs-destination-top">
                  <i className="rs-tile-icon"><Icon name={item.icon} /></i>
                  <span className="rs-status">{item.status}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
          <p className="rs-honest"><Icon name="alert" size={20} /> Tudo nesta parte é proposta. Nenhum projeto foi realizado e não existem parcerias oficiais.</p>
          <Link className="rs-link" href="/projetos">Ver os projetos em detalhe <Icon name="arrow" size={18} /></Link>
        </div>
      </section>

      {/* 8. Onde estamos */}
      <section className="rs-section rs-light" id="caminho">
        <div className="rs-wrap">
          <SectionHead label="Onde estamos" title="Do protótipo ao piloto." />
          <ol className="rs-roadmap">
            {roadmap.map((item) => (
              <li key={item.title} className={`is-${item.tone}`}>
                <span className="rs-status">{item.status}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 9. Por que apostar */}
      <section className="rs-section rs-back">
        <div className="rs-wrap">
          <SectionHead label="Por que apostar no RanBank" title="Uma ideia pequena para testar. Um problema grande para resolver." center />
          <div className="rs-reasons">
            {reasonsToBack.map((reason) => (
              <article key={reason.title}>
                <i className="rs-tile-icon"><Icon name={reason.icon} /></i>
                <h3>{reason.title}</h3>
                <p>{reason.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Equipe */}
      <section className="rs-section rs-light" id="equipe">
        <div className="rs-wrap">
          <SectionHead label="Quem faz" title="Feito por jovens aprendizes de Brasília." text="São 16 pessoas organizadas em presidência, ouvidoria e quatro áreas: tecnologia, comunicação, negócios e gestão de pessoas." />
          <div className="rs-team">
            {teamHighlights.map((person) => (
              <article key={person.name}>
                <span className="rs-avatar">{person.name[0]}</span>
                <strong>{person.name}</strong>
                <small>{person.role}</small>
              </article>
            ))}
            <Link className="rs-team-more" href="/organograma">
              <strong>+9</strong>
              <small>Ver o organograma completo</small>
            </Link>
          </div>
        </div>
      </section>

      {/* 11. Dúvidas */}
      <section className="rs-section" id="duvidas" aria-labelledby="faq-title">
        <div className="rs-wrap rs-faq-grid">
          <header className="rs-head">
            <span className="rs-label">Ajuda</span>
            <h2 id="faq-title">Dúvidas frequentes</h2>
            <div className="rs-ran-help">
              <img src="/images/ran-assistente-humana.png" alt="" />
              <p>Não achou a resposta? <button type="button" className="rs-inline-link" onClick={openRani}>Pergunte para a Rani</button>.</p>
            </div>
          </header>
          <div className="rs-faq">
            {frequentlyAskedQuestions.map((item, index) => (
              <details key={item.question} open={index === 0}>
                <summary>{item.question}<span aria-hidden="true">+</span></summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Chamada final */}
      <section className="rs-final">
        <div className="rs-wrap">
          <h2>Veja o RanBank funcionando.</h2>
          <p>Entre na conta de demonstração e faça um Pix de teste em menos de um minuto.</p>
          <div className="rs-actions is-center">
            <Link className="rs-btn rs-btn-light rs-btn-lg" href="/banco">Acessar o banco <Icon name="arrow" size={20} /></Link>
            <Link className="rs-btn rs-btn-outline rs-btn-lg" href="/banco?modo=criar-conta">Criar conta de teste</Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

/* ------------------------------------------------------------------ */
/* Páginas internas                                                    */
/* ------------------------------------------------------------------ */

function PageHero({ label, title, text, children, video }: { label: string; title: ReactNode; text: ReactNode; children?: ReactNode; video?: string }) {
  return (
    <section className={`rs-page-hero ${video ? "has-video" : ""}`}>
      {video && <>
        <video className="rs-banner-video" autoPlay muted loop playsInline preload="metadata" aria-hidden="true"><source src={video} type="video/mp4" /></video>
        <div className="rs-banner-shade" aria-hidden="true" />
      </>}
      <div className="rs-wrap">
        <span className="rs-chip">{label}</span>
        <h1>{title}</h1>
        <p>{text}</p>
        {children}
      </div>
    </section>
  );
}

export function SecurityPublicPage() {
  return (
    <PublicShell className="rs-page">
      <PageHero
        label="Central de Segurança RanBank"
        video="/videos/ranbank-demonstracao-01.mp4"
        title="Segurança que dá para entender."
        text="O que o RanBank faz para proteger a conta e o que você pode fazer para não cair em golpe."
      />
      <section className="rs-section rs-light">
        <div className="rs-wrap">
          <SectionHead label="Funciona no protótipo" title="O que protege a sua conta." text="Tudo desta lista está programado no RanBank de verdade, não é só desenho de tela." />
          <div className="rs-controls">
            {securityControls.map((control) => (
              <article key={control.title}>
                <i className="rs-tile-icon"><Icon name={control.icon} /></i>
                <h3>{control.title}</h3>
                <p>{control.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="rs-section">
        <div className="rs-wrap">
          <SectionHead label="Golpes mais comuns" title="Os golpes que os brasileiros mais relatam." text="Segundo o Observatório Febraban de julho de 2025. Ao lado de cada um, como se proteger." />
          <div className="rs-scams">
            {commonScams.map((scam, index) => (
              <article key={scam.title}>
                <b>0{index + 1}</b>
                <div>
                  <h3>{scam.title}</h3>
                  <p>{scam.tip}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="rs-section rs-light">
        <div className="rs-wrap rs-split">
          <div>
            <SectionHead label="Regra de ouro" title="O RanBank nunca pede sua senha por mensagem." text="Nem por SMS, WhatsApp, e-mail ou ligação. Se alguém pedir, é golpe." />
          </div>
          <div className="rs-ran-tip">
            <img src="/images/ran-assistente-humana.png" alt="" />
            <div>
              <small>Dica da Rani</small>
              <p>Digite o endereço do banco você mesmo, desconfie de pressa e nunca compartilhe códigos. Em aparelho de outra pessoa, sempre saia da conta.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="rs-final">
        <div className="rs-wrap">
          <h2>Entre pelo caminho seguro.</h2>
          <p>Use CPF, conta ou e-mail e a sua senha de acesso.</p>
          <div className="rs-actions is-center">
            <Link className="rs-btn rs-btn-light rs-btn-lg" href="/banco">Acessar o RanBank <Icon name="arrow" size={20} /></Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

export function PrivacyPublicPage() {
  const data = [
    { title: "Identificação", text: "Nome, CPF, e-mail, telefone e número da conta.", use: "Para você entrar e para falarmos com você." },
    { title: "Movimentações", text: "Valores, destinatários e horários.", use: "Para fazer e comprovar cada operação." },
    { title: "Segurança", text: "Sessões e aparelhos conectados.", use: "Para perceber acessos estranhos." },
    { title: "Preferências", text: "Sua escolha sobre cookies, guardada no aparelho.", use: "Para respeitar a sua decisão." },
  ];
  const cookies = [
    ["Sessão", "Necessário", "Mantém você conectado. É protegido e não pode ser lido por outros programas da página."],
    ["Consentimento", "Necessário", "Lembra o que você escolheu sobre cookies."],
    ["Preferências", "Opcional", "Guarda ajustes de uso neste aparelho."],
    ["Publicidade", "Não usamos", "O RanBank não usa cookies de propaganda."],
  ];
  return (
    <PublicShell className="rs-page">
      <PageHero
        label="Privacidade e cookies"
        title="Seus dados, só para o necessário."
        text="O que o RanBank guarda, por que guarda e o que você pode controlar."
      />
      <section className="rs-section rs-light">
        <div className="rs-wrap">
          <SectionHead label="O que guardamos" title="Coletar menos. Proteger melhor." />
          <div className="rs-controls">
            {data.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <small className="rs-purpose-tag">{item.use}</small>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="rs-section">
        <div className="rs-wrap">
          <SectionHead label="Cookies" title="Essencial quer dizer essencial." />
          <div className="rs-cookie-table">
            {cookies.map(([name, kind, text]) => (
              <div key={name}>
                <strong>{name}</strong>
                <span className={`rs-status ${kind === "Necessário" ? "" : "is-muted"}`}>{kind}</span>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="rs-section rs-light">
        <div className="rs-wrap">
          <SectionHead
            label="Seus direitos"
            title="Ver, corrigir e apagar."
            text={<>Na conta de demonstração você pode trocar chaves Pix, recuperar a senha e pedir a desativação da conta. Dúvidas: <a href="mailto:privacidade@ranbank.demo">privacidade@ranbank.demo</a> (endereço fictício).</>}
          />
        </div>
      </section>
    </PublicShell>
  );
}

export function InstitutePublicPage() {
  const fronts: Array<{ icon: IconName; title: string; text: string }> = [
    { icon: "book", title: "Educação financeira", text: "Orçamento, crédito, Pix e prevenção a golpes explicados com exemplos do dia a dia." },
    { icon: "access", title: "Inclusão", text: "Telas legíveis, linguagem simples e atenção a quem tem pouca experiência com banco." },
    { icon: "users", title: "Comunidades", text: "Propostas para comunidades indígenas e locais, construídas com escuta e respeito à cultura." },
    { icon: "leaf", title: "Impacto positivo", text: "Crédito e cartão ligados a escolhas que fazem bem às pessoas e ao meio ambiente." },
  ];
  return (
    <PublicShell className="rs-page">
      <PageHero
        label="Instituto RanBank · proposta"
        title="O lado social do RanBank."
        text="Uma proposta de instituto para transformar parte do resultado do banco em educação, inclusão e apoio a comunidades."
      >
        <div className="rs-actions">
          <Link className="rs-btn rs-btn-primary rs-btn-lg" href="/projetos">Ver os projetos</Link>
          <Link className="rs-btn rs-btn-outline rs-btn-lg" href="/banco">Abrir o banco</Link>
        </div>
      </PageHero>
      <section className="rs-section rs-light">
        <div className="rs-wrap">
          <SectionHead label="Quatro frentes" title="Ideias simples para problemas reais." />
          <div className="rs-controls is-four">
            {fronts.map((front) => (
              <article key={front.title}>
                <i className="rs-tile-icon"><Icon name={front.icon} /></i>
                <h3>{front.title}</h3>
                <p>{front.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="rs-section">
        <div className="rs-wrap rs-split">
          <SectionHead label="Como trabalhar" title="Primeiro ouvir. Depois construir." text="Uma boa iniciativa começa pela realidade das pessoas, respeita cada comunidade e explica seus objetivos com clareza." />
          <ul className="rs-checklist">
            {["Ouvir quem será atendido", "Falar em linguagem simples", "Decidir junto com a comunidade", "Mostrar resultados com transparência"].map((item) => (
              <li key={item}><Icon name="check" size={20} />{item}</li>
            ))}
          </ul>
        </div>
      </section>
      <section className="rs-section rs-light">
        <div className="rs-wrap">
          <p className="rs-honest"><Icon name="alert" size={20} /> O Instituto RanBank é uma proposta. Ele ainda não existe e não tem parcerias oficiais.</p>
        </div>
      </section>
    </PublicShell>
  );
}
