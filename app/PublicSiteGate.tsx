"use client";
/* eslint-disable @next/next/no-img-element -- Vinext serves the local RanBank brand image directly. */
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { AnchorHTMLAttributes } from "react";

function Link({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <a href={href} {...props}>{children}</a>;
}

const products = [
  {
    icon: "◇",
    title: "Conta digital",
    text: "Pix, pagamentos e transferências com controle em tempo real.",
    href: "/banco",
  },
  {
    icon: "▭",
    title: "Ecocard RanBank",
    text: "Seu cartão sustentável, com controle físico e virtual em um só lugar.",
    href: "#ecocard",
  },
  {
    icon: "◎",
    title: "Reserva para objetivos",
    text: "Organize metas e acompanhe a evolução do seu dinheiro.",
    href: "/banco",
  },
  {
    icon: "↗",
    title: "Pix RanBank",
    text: "Envie, receba, agende e gerencie suas próprias chaves.",
    href: "/banco",
  },
];

const services = [
  ["▥", "Pagamentos", "Boletos e contas"],
  ["◷", "Agendamentos", "Organize o mês"],
  ["▭", "Cartões", "Controle completo"],
  ["↕", "Extrato", "Movimentações"],
  ["◎", "Metas", "Guarde para seus planos"],
  ["⌾", "Segurança", "Proteção da conta"],
];

const motionStories = [
  {
    eyebrow: "RANBANK EM MOVIMENTO",
    title: "Tecnologia que participa da vida real.",
    text: "Uma experiência digital presente nos momentos que importam, com simplicidade para usar e segurança para seguir.",
    source: "/videos/ranbank-historia-2026.mp4",
    href: "/banco?modo=criar-conta",
    action: "Viver essa experiência",
  },
  {
    eyebrow: "ATENDIMENTO DO FUTURO",
    title: "Pessoas no centro. Inovação ao redor.",
    text: "Um conceito de agência que combina acolhimento, inteligência e novos jeitos de cuidar da sua vida financeira.",
    source: "/videos/ranbank-demonstracao-04.mp4",
    href: "/instituto",
    action: "Conhecer o Instituto RanBank",
  },
];

const securityControls = [
  [
    "SESSÃO",
    "Acesso protegido",
    "A sessão é protegida e encerrada com segurança quando você sai da conta.",
  ],
  [
    "ACESSO",
    "Senha protegida",
    "A senha não fica visível e tentativas repetidas causam bloqueio temporário.",
  ],
  [
    "OPERAÇÕES",
    "Segunda confirmação",
    "Pix e operações importantes exigem uma senha diferente da usada para entrar.",
  ],
  [
    "MONITORAMENTO",
    "Avisos de segurança",
    "Acessos e movimentações fora do padrão podem exigir uma nova confirmação.",
  ],
  [
    "PRIVACIDADE",
    "Dados sob controle",
    "Coleta limitada ao necessário, sessões revogáveis e preferências de cookies transparentes.",
  ],
  [
    "CONTINUIDADE",
    "Proteção ponta a ponta",
    "CORS restrito, respostas sem cache e movimentações registradas de forma consistente.",
  ],
];

const institutionalValues = [
  { number: "01", title: "Simplicidade", text: "Falamos de forma clara e tornamos as escolhas financeiras mais fáceis de entender." },
  { number: "02", title: "Segurança", text: "Protegemos cada acesso e cada movimentação com responsabilidade." },
  { number: "03", title: "Inclusão", text: "Criamos experiências acessíveis e respeitamos as diferentes realidades das pessoas." },
  { number: "04", title: "Impacto positivo", text: "Pensamos no efeito social e ambiental de cada decisão do banco." },
];

const frequentlyAskedQuestions = [
  { question: "O que é o RanBank?", answer: "O RanBank é um projeto educacional que simula um banco digital. Ele foi criado para demonstrar serviços bancários, segurança, educação financeira e propostas de impacto social e ambiental." },
  { question: "Posso testar Pix, cartão e pagamentos?", answer: "Sim. Você pode explorar a conta, fazer transferências entre contas demonstrativas, consultar o extrato, organizar uma reserva e controlar um cartão fictício. Nenhuma operação movimenta dinheiro real." },
  { question: "Preciso informar dados bancários verdadeiros?", answer: "Não. Use somente os dados fictícios fornecidos na demonstração. Nunca informe senhas, cartões ou dados de uma conta bancária real." },
  { question: "Como o RanBank protege a conta?", answer: "O projeto usa senha de acesso, confirmação separada para operações importantes, bloqueio após tentativas repetidas e avisos para atividades fora do padrão." },
  { question: "O que a Ran pode fazer?", answer: "A Ran explica as funções da conta, orienta sobre Pix, cartão e segurança e apresenta os projetos do RanBank usando linguagem simples." },
  { question: "Como o projeto trata privacidade e cookies?", answer: "O site utiliza apenas o necessário para manter a sessão e lembrar suas preferências. Na página de Privacidade você pode entender e controlar o uso de cookies." },
];

type PublicTheme = "light" | "dark";

export function PublicHeader({ dark = false }: { dark?: boolean }) {
  const [theme, setTheme] = useState<PublicTheme>("light");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("ranbank-theme");
    const initialTheme: PublicTheme = savedTheme === "dark" ? "dark" : "light";
    document.documentElement.dataset.bankTheme = initialTheme;
    const syncTheme = window.setTimeout(() => setTheme(initialTheme), 0);
    return () => window.clearTimeout(syncTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme: PublicTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem("ranbank-theme", nextTheme);
    document.documentElement.dataset.bankTheme = nextTheme;
  };

  return (
    <>
      <div className="rb-access-strip">
        <div>
          <span className="rb-lock">▣</span>
          <strong>Ambiente seguro RanBank</strong>
        </div>
        <div className="rb-access-links">
          <Link href="/seguranca">Como acessar com segurança</Link>
          <span>•</span>
          <span>Projeto criado em Brasília - DF</span>
        </div>
        <Link className="rb-access-account" href="/banco">
          Acessar sua conta <b>→</b>
        </Link>
      </div>
      <header className={`rb-public-header ${dark ? "is-dark" : ""}`}>
        <Link
          className="rb-public-brand"
          href="/"
          aria-label="Página inicial do RanBank"
        >
          <img src="/ranbank-logo-transparent.png" alt="RanBank" />
        </Link>
        <nav className="rb-public-nav" aria-label="Navegação principal">
          <Link href="/#visao-valores">Quem somos</Link>
          <Link href="/#produtos">Soluções</Link>
          <Link href="/projetos">Projetos</Link>
          <Link href="/seguranca">Segurança</Link>
          <Link href="/instituto">Instituto RanBank</Link>
          <Link href="/#duvidas">Ajuda</Link>
        </nav>
        <div className="rb-header-tools">
          <button className="rb-public-theme-toggle" type="button" onClick={toggleTheme} aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"} aria-pressed={theme === "dark"} title={theme === "dark" ? "Modo claro" : "Modo escuro"}><span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span></button>
          <Link href="/privacidade">Privacidade</Link>
          <Link className="rb-open-account" href="/banco?modo=criar-conta">
            Abra sua conta
          </Link>
        </div>
      </header>
    </>
  );
}

export function PublicFooter() {
  return (
    <footer className="rb-public-footer">
      <div className="rb-footer-brand">
        <img src="/ranbank-logo-transparent.png" alt="RanBank" />
        <p>
          Banco digital demonstrativo com tecnologia, segurança e atendimento
          centrado em Brasília - DF.
        </p>
      </div>
      <div>
        <strong>RanBank</strong>
        <Link href="/banco">Acessar conta</Link>
        <Link href="/#visao-valores">Quem somos</Link>
        <Link href="/instituto">Instituto</Link>
        <Link href="/organograma">Nossa equipe</Link>
        <Link href="/projetos">Projetos e impacto</Link>
        <Link href="/#duvidas">Ajuda</Link>
      </div>
      <div>
        <strong>Proteção</strong>
        <Link href="/seguranca">Segurança</Link>
        <Link href="/privacidade">Privacidade e cookies</Link>
        <Link href="/#brasilia">Canais de atendimento</Link>
      </div>
      <div>
        <strong>Acompanhe o RanBank</strong>
        <a href="https://www.instagram.com/ranbank.df" target="_blank" rel="noreferrer">Instagram ↗</a>
        <a href="https://www.tiktok.com/@ranbank.df" target="_blank" rel="noreferrer">TikTok ↗</a>
        <span>Projeto criado em Brasília - DF</span>
      </div>
      <small>
        © 2026 RanBank. Projeto demonstrativo — não representa uma instituição
        financeira autorizada.
      </small>
    </footer>
  );
}

function CookieCenter() {
  const [visible, setVisible] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [preferences, setPreferences] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(
      () => setVisible(!window.localStorage.getItem("ranbank-cookie-consent")),
      0,
    );
    return () => window.clearTimeout(timer);
  }, []);
  function save(level: "essential" | "custom" | "all") {
    const consent =
      level === "all"
        ? { preferences: true, analytics: true }
        : level === "essential"
          ? { preferences: false, analytics: false }
          : { preferences, analytics };
    window.localStorage.setItem(
      "ranbank-cookie-consent",
      JSON.stringify({ ...consent, savedAt: new Date().toISOString() }),
    );
    setVisible(false);
    setConfiguring(false);
  }
  if (!visible) return null;
  return (
    <div
      className="rb-cookie-layer"
      role="region"
      aria-label="Preferências de privacidade"
    >
      {configuring ? (
        <section
          className="rb-cookie-settings"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-title"
        >
          <header>
            <div>
              <span>PRIVACIDADE RANBANK</span>
              <h2 id="cookie-title">Controle suas preferências</h2>
            </div>
            <button onClick={() => setConfiguring(false)} aria-label="Voltar">
              ×
            </button>
          </header>
          <p>
            O RanBank usa armazenamento essencial para manter a sessão e suas
            escolhas. Nenhum cookie de publicidade é utilizado neste projeto.
          </p>
          <div className="rb-cookie-option">
            <span>
              <strong>Essenciais</strong>
              <small>Sessão, segurança e preferência de consentimento.</small>
            </span>
            <input
              aria-label="Cookies essenciais"
              type="checkbox"
              checked
              disabled
            />
          </div>
          <div className="rb-cookie-option">
            <span>
              <strong>Preferências</strong>
              <small>Memoriza ajustes de experiência neste dispositivo.</small>
            </span>
            <input
              aria-label="Cookies de preferências"
              type="checkbox"
              checked={preferences}
              onChange={(event) => setPreferences(event.target.checked)}
            />
          </div>
          <div className="rb-cookie-option">
            <span>
              <strong>Medição de experiência</strong>
              <small>
                Autoriza métricas anônimas caso esse recurso seja ativado
                futuramente.
              </small>
            </span>
            <input
              aria-label="Cookies de medição"
              type="checkbox"
              checked={analytics}
              onChange={(event) => setAnalytics(event.target.checked)}
            />
          </div>
          <div>
            <button
              className="rb-cookie-outline"
              onClick={() => save("essential")}
            >
              Usar só essenciais
            </button>
            <button
              className="rb-cookie-primary"
              onClick={() => save("custom")}
            >
              Salvar preferências
            </button>
          </div>
        </section>
      ) : (
        <section className="rb-cookie-banner">
          <div>
            <span>PRIVACIDADE E COOKIES</span>
            <strong>
              Você decide como seus dados de navegação são usados.
            </strong>
            <p>
              Usamos recursos essenciais para segurança e funcionamento.
              Preferências adicionais só são ativadas com a sua escolha.{" "}
              <Link href="/privacidade">Entenda nossa política</Link>.
            </p>
          </div>
          <div>
            <button
              className="rb-cookie-outline"
              onClick={() => save("essential")}
            >
              Somente essenciais
            </button>
            <button
              className="rb-cookie-outline"
              onClick={() => setConfiguring(true)}
            >
              Configurar
            </button>
            <button className="rb-cookie-primary" onClick={() => save("all")}>
              Aceitar todos
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default function PublicSiteGate() {
  const pathname = usePathname();
  if (pathname !== "/") return null;
  return <PublicHome />;
}

export function PublicHome() {
  return (
    <div className="rb-public-shell">
      <PublicHeader />
      <main id="top">
        <section className="rb-hero">
          <div className="rb-hero-photo" aria-hidden="true">
            <img
              src="/images/ranbank-hero-ecocard.png"
              alt=""
              fetchPriority="high"
            />
          </div>
          <aside className="rb-hero-menu" aria-label="Atalhos RanBank">
            <Link className="primary" href="/banco?modo=criar-conta">
              <b>Abra sua conta</b>
              <span>→</span>
            </Link>
            <a className="secondary" href="#produtos">
              <b>Contrate online</b>
              <span>→</span>
            </a>
            <a href="#solucoes">
              <i>◇</i>
              <span>Produtos e serviços</span>
            </a>
            <Link href="/seguranca">
              <i>⌾</i>
              <span>Segurança</span>
            </Link>
            <a href="#brasilia">
              <i>♧</i>
              <span>Atendimento</span>
            </a>
            <Link href="/instituto">
              <i>R2</i>
              <span>Tecnologia e inovação</span>
            </Link>
          </aside>
          <div className="rb-hero-copy">
            <span className="rb-kicker">
              RANBANK · FEITO EM BRASÍLIA PARA O FUTURO
            </span>
            <h1>Seu banco faz parte da sua vida.</h1>
            <p>
              Conta digital, Ecocard sustentável e proteção em várias camadas
              para transformar escolhas em um futuro melhor.
            </p>
            <div className="rb-hero-actions">
              <Link
                className="rb-btn rb-btn-primary"
                href="/banco?modo=criar-conta"
              >
                Quero ser cliente
              </Link>
              <Link className="rb-btn rb-btn-ghost" href="/seguranca">
                Conheça nossa segurança
              </Link>
            </div>
            <div className="rb-hero-trust">
              <span>
                <b>30 min</b>Sessão protegida
              </span>
              <span>
                <b>24h</b>Banco com você
              </span>
              <span>
                <b>Ecocard</b>Escolha sustentável
              </span>
            </div>
          </div>
        </section>
        <section className="rb-contract-strip" id="produtos">
          <div>
            <span>CONTRATE ONLINE</span>
            <h2>Soluções para cada momento da sua vida.</h2>
          </div>
          <Link href="/banco?modo=criar-conta">
            Conheça sua conta digital <b>→</b>
          </Link>
        </section>
        <section className="rb-product-rail">
          {products.map((item) => (
            <Link href={item.href} key={item.title}>
              <i>{item.icon}</i>
              <strong>{item.title}</strong>
              <span>{item.text}</span>
              <b>Conhecer →</b>
            </Link>
          ))}
        </section>
        <section className="rb-ecocard" id="ecocard">
          <div className="rb-ecocard-copy">
            <span>ECOCARD RANBANK</span>
            <h2>Um cartão que pensa no presente e no futuro.</h2>
            <p>
              Feito com materiais de origem sustentável, o Ecocard reúne
              praticidade, segurança e escolhas que reduzem o impacto no
              planeta.
            </p>
            <div className="rb-ecocard-benefits">
              <span><b>♧</b>Material de origem sustentável</span>
              <span><b>↻</b>Cashback para você</span>
              <span><b>⌾</b>O mesmo controle no físico e no virtual</span>
            </div>
            <Link className="rb-btn rb-btn-primary" href="/banco?modo=criar-conta">
              Peça o seu Ecocard
            </Link>
          </div>
          <figure className="rb-ecocard-visual">
            <span>ESCOLHA CONSCIENTE</span>
            <div className="ecocard-asset">
              <img src="/images/ranbank-ecocard-reference.jpeg" alt="Ecocard RanBank sustentável" />
            </div>
            <figcaption>Menos impacto. Mais consciência.</figcaption>
          </figure>
        </section>
        <section className="rb-section rb-solutions" id="solucoes">
          <div className="rb-section-heading">
            <span>PRODUTOS E SERVIÇOS</span>
            <h2>
              Seu banco mais simples.
              <br />
              Seu dia mais leve.
            </h2>
            <p>
              Acesse rapidamente o que precisa e mantenha o controle de cada
              movimentação.
            </p>
          </div>
          <div className="rb-service-grid">
            {services.map(([icon, title, text]) => (
              <Link
                href={title === "Segurança" ? "/seguranca" : "/banco"}
                key={title}
              >
                <i>{icon}</i>
                <strong>{title}</strong>
                <span>{text}</span>
                <b>→</b>
              </Link>
            ))}
          </div>
        </section>
        <section className="rb-motion-stories" aria-label="RanBank em movimento">
          {motionStories.map((story, index) => (
            <article className="rb-motion-story" key={story.title}>
              <video autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
                <source src={story.source} type="video/mp4" />
              </video>
              <div className="rb-motion-shade" aria-hidden="true" />
              <div className="rb-motion-copy">
                <span>{story.eyebrow}</span>
                <h2>{story.title}</h2>
                <p>{story.text}</p>
                <Link href={story.href}>{story.action} <b>→</b></Link>
              </div>
              <small>0{index + 1} / 02</small>
            </article>
          ))}
        </section>
        <section className="rb-purpose" id="visao-valores" aria-labelledby="purpose-title">
          <div className="rb-purpose-intro">
            <span>IDENTIDADE RANBANK</span>
            <h2 id="purpose-title">Missão, visão e valores</h2>
            <div className="rb-purpose-foundations">
              <article>
                <strong>Missão</strong>
                <p>Facilitar a vida financeira das pessoas com serviços simples, seguros e acessíveis.</p>
              </article>
              <article>
                <strong>Visão</strong>
                <p>Ser um banco digital reconhecido por unir tecnologia, educação financeira e responsabilidade social.</p>
              </article>
            </div>
            <div className="rb-purpose-commitment">
              <span>NOSSO COMPROMISSO</span>
              <p>Tecnologia para simplificar. Segurança para proteger. Responsabilidade para transformar.</p>
            </div>
          </div>
          <div className="rb-values-column">
            <div className="rb-values-heading">
              <span>VALORES</span>
              <p>Os princípios que orientam nossas decisões, relações e experiências.</p>
            </div>
            <div className="rb-values-grid">
              {institutionalValues.map((value) => (
                <article key={value.title}>
                  <span>{value.number}</span>
                  <h3>{value.title}</h3>
                  <p>{value.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="rb-security" id="seguranca">
          <video className="rb-security-video" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
            <source src="/videos/ranbank-demonstracao-01.mp4" type="video/mp4" />
          </video>
          <div className="rb-security-copy">
            <span>SEGURANÇA RANBANK</span>
            <h2>Confiança não é discurso. É arquitetura.</h2>
            <p>
              Do login à confirmação de um Pix, cada etapa reduz exposição,
              limita tentativas e mantém a sessão sob controle.
            </p>
            <Link className="rb-btn rb-btn-light" href="/seguranca">
              Visitar Central de Segurança
            </Link>
          </div>
          <div className="rb-security-stack">
            {securityControls.slice(0, 4).map(([tag, title, text], index) => (
              <article key={title}>
                <b>{String(index + 1).padStart(2, "0")}</b>
                <div>
                  <span>{tag}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
                <i>✓</i>
              </article>
            ))}
          </div>
        </section>
        <section className="rb-brasilia" id="brasilia">
          <div className="rb-brasilia-map" aria-hidden="true">
            <span>BRASÍLIA</span>
            <i>DF</i>
            <b>61</b>
          </div>
          <div>
            <span>ATENDIMENTO COM REFERÊNCIA LOCAL</span>
            <h2>Nascido em Brasília. Pensado para todos.</h2>
            <p>
              O RanBank nasceu em Brasília como projeto educacional e foi pensado
              para pessoas de diferentes regiões do Brasil.
            </p>
            <div className="rb-contact-cards">
              <a href="https://www.instagram.com/ranbank.df" target="_blank" rel="noreferrer">
                <b>@ranbank.df</b>
                <span>Instagram</span>
              </a>
              <a href="https://www.tiktok.com/@ranbank.df" target="_blank" rel="noreferrer">
                <b>@ranbank.df</b>
                <span>TikTok</span>
              </a>
            </div>
          </div>
        </section>
        <section className="rb-institute-teaser">
          <div>
            <span>INSTITUTO RANBANK</span>
            <h2>Um banco maior quando compartilha conhecimento.</h2>
            <p>
              Educação financeira, inclusão e tecnologia colocadas a serviço
              das pessoas e das comunidades.
            </p>
            <Link href="/instituto">Explorar o Instituto RanBank →</Link>
          </div>
          <div className="rb-institute-numbers">
            <span>
              <b>01</b>educação financeira
            </span>
            <span>
              <b>02</b>inclusão e acesso
            </span>
            <span>
              <b>03</b>impacto socioambiental
            </span>
          </div>
        </section>
        <section className="rb-faq" id="duvidas" aria-labelledby="faq-title">
          <div className="rb-section-heading">
            <span>CENTRAL DE AJUDA</span>
            <h2 id="faq-title">Dúvidas frequentes</h2>
            <p>Respostas diretas para conhecer o projeto e navegar com segurança.</p>
          </div>
          <div className="rb-faq-list">
            {frequentlyAskedQuestions.map((item, index) => (
              <details key={item.question} open={index === 0}>
                <summary>{item.question}<span aria-hidden="true">+</span></summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
          <div className="rb-faq-help rb-ran-faq-help">
            <span className="rb-ran-public-avatar" aria-hidden="true"><img src="/images/ran-assistente-humana.png" alt="" /></span>
            <div>
              <small>CONHEÇA A RAN</small>
              <strong>Ainda precisa de ajuda?</strong>
              <p>A assistente do RanBank explica o projeto, segurança e tecnologias de forma simples.</p>
            </div>
            <Link href="/banco">Falar com a Ran →</Link>
          </div>
        </section>
        <section className="rb-final-cta">
          <div>
            <span>PRONTO PARA COMEÇAR?</span>
            <h2>Seu RanBank está a um toque.</h2>
            <p>
              Abra sua conta demonstrativa ou acesse o ambiente seguro do banco.
            </p>
          </div>
          <div>
            <Link className="rb-btn rb-btn-light" href="/banco">
              Acessar minha conta
            </Link>
            <Link
              className="rb-btn rb-btn-ghost"
              href="/banco?modo=criar-conta"
            >
              Criar conta
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
      <CookieCenter />
    </div>
  );
}

export function SecurityPublicPage() {
  return (
    <div className="rb-public-shell rb-info-page">
      <PublicHeader dark />
      <main>
        <section className="rb-info-hero">
          <span>CENTRAL DE SEGURANÇA RANBANK</span>
          <h1>Proteção que você entende.</h1>
          <p>
            Controles técnicos reais, orientação clara e decisões sensíveis
            confirmadas por você.
          </p>
          <div className="rb-security-seal">
            <i>✓</i>
            <div>
              <b>Arquitetura em camadas</b>
              <small>Prevenção, controle, detecção e resposta</small>
            </div>
          </div>
        </section>
        <section className="rb-section">
          <div className="rb-section-heading">
            <span>CONTROLES ATIVOS NO PROJETO</span>
            <h2>Da credencial à movimentação.</h2>
            <p>
              Estes mecanismos estão implementados no RanBank — não são apenas
              promessas de interface.
            </p>
          </div>
          <div className="rb-control-grid">
            {securityControls.map(([tag, title, text]) => (
              <article key={title}>
                <span>{tag}</span>
                <i>✓ ATIVO</i>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="rb-safe-guide">
          <div>
            <span>PROTEJA-SE</span>
            <h2>O RanBank nunca pede seu PIN por mensagem.</h2>
            <p>
              Antes de entrar, confira o endereço. Desconfie de urgência, links
              encurtados e contatos que pedem instalação de aplicativos.
            </p>
            <aside className="rb-ran-security-guide">
              <span className="rb-ran-public-avatar" aria-hidden="true"><img src="/images/ran-assistente-humana.png" alt="" /></span>
              <div><small>CONSELHO DA RAN</small><strong>Segurança começa antes do login.</strong><p>Digite o endereço diretamente e nunca compartilhe códigos de acesso.</p></div>
            </aside>
          </div>
          <div>
            <article>
              <b>01</b>
              <span>
                <strong>Confira o endereço</strong>
                <small>Acesse diretamente o domínio oficial.</small>
              </span>
            </article>
            <article>
              <b>02</b>
              <span>
                <strong>Não compartilhe códigos</strong>
                <small>PIN e confirmação são pessoais.</small>
              </span>
            </article>
            <article>
              <b>03</b>
              <span>
                <strong>Revise local e valor</strong>
                <small>
                  Uma compra distante de Brasília pode exigir validação.
                </small>
              </span>
            </article>
            <article>
              <b>04</b>
              <span>
                <strong>Encerre a sessão</strong>
                <small>Principalmente em dispositivos compartilhados.</small>
              </span>
            </article>
          </div>
        </section>
        <section className="rb-final-cta">
          <div>
            <span>ACESSO PROTEGIDO</span>
            <h2>Entre pelo ambiente seguro.</h2>
            <p>Use seu CPF, conta ou e-mail e o PIN de quatro dígitos.</p>
          </div>
          <Link className="rb-btn rb-btn-light" href="/banco">
            Acessar RanBank →
          </Link>
        </section>
      </main>
      <PublicFooter />
      <CookieCenter />
    </div>
  );
}

export function PrivacyPublicPage() {
  return (
    <div className="rb-public-shell rb-info-page">
      <PublicHeader dark />
      <main>
        <section className="rb-info-hero rb-privacy-hero">
          <span>PRIVACIDADE E CONTROLE DE DADOS</span>
          <h1>Seus dados, com propósito definido.</h1>
          <p>
            Transparência sobre o que é usado, por que é necessário e quais
            escolhas ficam no seu dispositivo.
          </p>
        </section>
        <section className="rb-section">
          <div className="rb-section-heading">
            <span>MAPA DE DADOS</span>
            <h2>Coletar menos. Proteger melhor.</h2>
          </div>
          <div className="rb-data-grid">
            <article>
              <b>Identificação</b>
              <p>
                Nome, CPF, e-mail, telefone e conta para cadastro, acesso e
                comunicação.
              </p>
              <span>Finalidade: autenticação e relacionamento</span>
            </article>
            <article>
              <b>Movimentações</b>
              <p>
                Valores, destinatários, horários e identificadores para executar
                e comprovar operações.
              </p>
              <span>Finalidade: serviço financeiro demonstrativo</span>
            </article>
            <article>
              <b>Segurança</b>
              <p>
                Sessões, tentativas, dispositivos e contexto de localização para
                reduzir fraudes.
              </p>
              <span>Finalidade: prevenção e controle</span>
            </article>
            <article>
              <b>Preferências</b>
              <p>
                Escolhas de cookies guardadas localmente para respeitar sua
                decisão.
              </p>
              <span>Finalidade: experiência e consentimento</span>
            </article>
          </div>
        </section>
        <section className="rb-cookie-policy">
          <div>
            <span>COOKIES NO RANBANK</span>
            <h2>Essencial significa essencial.</h2>
            <p>
              A sessão autenticada usa cookie HttpOnly e não pode ser lida pelo
              JavaScript. O site público não utiliza publicidade comportamental.
              Preferências opcionais dependem do seu consentimento.
            </p>
          </div>
          <div>
            <span>
              <b>Sessão</b>Necessário · protegido
            </span>
            <span>
              <b>Consentimento</b>Necessário · local
            </span>
            <span>
              <b>Preferências</b>Opcional
            </span>
            <span>
              <b>Publicidade</b>Não utilizado
            </span>
          </div>
        </section>
        <section className="rb-rights">
          <span>SEUS CONTROLES</span>
          <h2>Acesso, correção e exclusão.</h2>
          <p>
            No ambiente demonstrativo, você pode atualizar chaves Pix, recuperar
            o PIN e solicitar desativação da conta por meio do gerenciamento
            administrativo. Para dúvidas:{" "}
            <a href="mailto:privacidade@ranbank.demo">
              privacidade@ranbank.demo
            </a>
            .
          </p>
        </section>
      </main>
      <PublicFooter />
      <CookieCenter />
    </div>
  );
}

export function InstitutePublicPage() {
  const initiatives = [
    [
      "01",
      "EDUCAÇÃO FINANCEIRA",
      "Conhecimento para escolher melhor",
      "Atividades simples sobre orçamento, crédito, Pix, planejamento e prevenção a golpes.",
    ],
    [
      "02",
      "INCLUSÃO",
      "Banco acessível para todos",
      "Linguagem clara, telas legíveis e soluções pensadas para diferentes necessidades.",
    ],
    [
      "03",
      "COMUNIDADES",
      "Decisões construídas em conjunto",
      "Propostas de apoio a iniciativas indígenas e comunitárias com escuta e respeito cultural.",
    ],
    [
      "04",
      "IMPACTO POSITIVO",
      "Crédito social e ambiental",
      "Conceitos de crédito e cartões ligados a escolhas que beneficiam pessoas e o meio ambiente.",
    ],
  ];
  return (
    <div className="rb-public-shell rb-institute-page">
      <PublicHeader dark />
      <main>
        <section className="rb-institute-hero">
          <span className="rb-kicker">
            INSTITUTO RANBANK · BRASÍLIA - DF
          </span>
          <h1>
            Conhecimento, inclusão
            <br />e impacto positivo.
          </h1>
          <p>
            Um espaço para transformar educação financeira e responsabilidade
            social em propostas que fazem sentido para as pessoas.
          </p>
          <div className="rb-hero-actions">
            <a className="rb-btn rb-btn-primary" href="#iniciativas">
              Conhecer iniciativas
            </a>
            <Link className="rb-btn rb-btn-ghost" href="/banco">
              Abrir o banco
            </Link>
          </div>
        </section>
        <section className="rb-section" id="iniciativas">
          <div className="rb-section-heading">
            <span>4 FRENTES DE ATUAÇÃO</span>
            <h2>Ideias simples para desafios reais.</h2>
          </div>
          <div className="rb-initiative-grid">
            {initiatives.map(([n, topic, title, text]) => (
              <article key={n}>
                <b>{n}</b>
                <span>{topic}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="rb-robotics-callout">
          <div>
            <span>NOSSO JEITO DE TRABALHAR</span>
            <h2>Primeiro ouvimos. Depois construímos.</h2>
            <p>
              Uma boa iniciativa começa pela realidade das pessoas, respeita
              cada comunidade e apresenta seus objetivos com clareza.
            </p>
          </div>
          <div className="rb-robotics-points">
            <span>Escuta das comunidades</span>
            <span>Linguagem simples</span>
            <span>Participação nas decisões</span>
            <span>Resultados transparentes</span>
          </div>
        </section>
        <section className="rb-final-cta">
          <div>
            <span>AMBIENTE DEMONSTRATIVO</span>
            <h2>Veja a tecnologia dentro do banco.</h2>
            <p>Entre no RanBank e conheça como o banco funciona por dentro.</p>
          </div>
          <Link className="rb-btn rb-btn-light" href="/banco">
            Acessar RanBank →
          </Link>
        </section>
      </main>
      <PublicFooter />
      <CookieCenter />
    </div>
  );
}
