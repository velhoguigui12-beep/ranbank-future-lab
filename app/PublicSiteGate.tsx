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
    title: "Reserva Future",
    text: "Organize metas e acompanhe a evolução do seu dinheiro.",
    href: "/banco",
  },
  {
    icon: "↗",
    title: "Pix RanBank",
    text: "Envie, receba, agende e gerencie suas próprias chaves.",
    href: "/banco",
  },
  {
    icon: "⌂",
    title: "Crédito e casa",
    text: "Conheça soluções demonstrativas para seus próximos projetos.",
    href: "#solucoes",
  },
  {
    icon: "♧",
    title: "Atendimento",
    text: "Canais digitais e orientação com referência em Brasília, DF.",
    href: "#brasilia",
  },
];

const services = [
  ["▥", "Pagamentos", "Boletos e contas"],
  ["◷", "Agendamentos", "Organize o mês"],
  ["▭", "Cartões", "Controle completo"],
  ["↕", "Extrato", "Movimentações"],
  ["◎", "Metas", "Reserva Future"],
  ["⌾", "Segurança", "Central de proteção"],
];

const motionStories = [
  {
    eyebrow: "RANBANK EM MOVIMENTO",
    title: "Tecnologia que participa da vida real.",
    text: "Uma experiência digital presente nos momentos que importam, com simplicidade para usar e segurança para seguir.",
    source: "/media/ranbank-historia-2026.mp4",
    href: "/banco?modo=criar-conta",
    action: "Viver essa experiência",
  },
  {
    eyebrow: "ATENDIMENTO DO FUTURO",
    title: "Pessoas no centro. Inovação ao redor.",
    text: "Um conceito de agência que combina acolhimento, inteligência e novos jeitos de cuidar da sua vida financeira.",
    source: "/media/ranbank-demonstracao-04.mp4",
    href: "/instituto",
    action: "Conhecer o Instituto RanBank",
  },
];

const securityControls = [
  [
    "SESSÃO",
    "Cookie protegido",
    "Sessão em cookie HttpOnly e Secure no ambiente hospedado, com política SameSite adequada à integração entre site e API.",
  ],
  [
    "ACESSO",
    "PIN protegido com BCrypt",
    "O PIN não é salvo em texto aberto e tentativas repetidas acionam bloqueio temporário.",
  ],
  [
    "OPERAÇÕES",
    "Confirmação independente",
    "Pix e operações sensíveis exigem um PIN transacional separado do PIN de acesso.",
  ],
  [
    "MONITORAMENTO",
    "Contexto e alertas",
    "Dispositivos, localização e comportamento fora do padrão podem gerar revisão e notificação.",
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

export function PublicHeader({ dark = false }: { dark?: boolean }) {
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
          <a href="tel:+556140042028">Brasília: (61) 4004-2028</a>
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
          <img src="/ranbank-logo.jpeg" alt="RanBank" />
        </Link>
        <nav className="rb-public-nav" aria-label="Navegação principal">
          <Link href="/#produtos">Pra você</Link>
          <Link href="/#solucoes">Produtos e serviços</Link>
          <Link href="/seguranca">Segurança</Link>
          <Link href="/#brasilia">Atendimento</Link>
          <Link href="/instituto">Instituto RanBank</Link>
          <Link href="/projetos">Impacto & Projetos</Link>
        </nav>
        <div className="rb-header-tools">
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
        <img src="/ranbank-logo.jpeg" alt="RanBank" />
        <p>
          Banco digital demonstrativo com tecnologia, segurança e atendimento
          centrado em Brasília, DF.
        </p>
      </div>
      <div>
        <strong>RanBank</strong>
        <Link href="/banco">Acessar conta</Link>
        <Link href="/#produtos">Produtos</Link>
        <Link href="/instituto">Instituto</Link>
        <Link href="/projetos">Impacto & Projetos</Link>
      </div>
      <div>
        <strong>Proteção</strong>
        <Link href="/seguranca">Segurança</Link>
        <Link href="/privacidade">Privacidade e cookies</Link>
        <Link href="/#brasilia">Canais de atendimento</Link>
      </div>
      <div>
        <strong>Brasília, DF</strong>
        <a href="tel:+556140042028">(61) 4004-2028</a>
        <span>Atendimento demonstrativo</span>
        <span>Segunda a sexta, 8h às 20h</span>
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
              <b>Contrate on-line</b>
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
            <span>CONTRATE ON-LINE</span>
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
        <section className="rb-security" id="seguranca">
          <video className="rb-security-video" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
            <source src="/media/ranbank-demonstracao-01.mp4" type="video/mp4" />
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
            <h2>Brasília em primeiro lugar. O Brasil inteiro no alcance.</h2>
            <p>
              Exemplos, contatos e experiências do RanBank usam Brasília, DF,
              como referência. Em análises de risco, acessos muito distantes da
              região podem exigir confirmação adicional.
            </p>
            <div className="rb-contact-cards">
              <a href="tel:+556140042028">
                <b>(61) 4004-2028</b>
                <span>Central demonstrativa</span>
              </a>
              <a href="mailto:atendimento@ranbank.demo">
                <b>atendimento@ranbank.demo</b>
                <span>Canal digital</span>
              </a>
            </div>
          </div>
        </section>
        <section className="rb-institute-teaser">
          <div>
            <span>INSTITUTO RANBANK</span>
            <h2>Um banco maior quando compartilha conhecimento.</h2>
            <p>
              Pesquisa, educação, robótica e tecnologia aplicada em parceria com
              universidades e centros de inovação.
            </p>
            <Link href="/instituto">Explorar o Instituto RanBank →</Link>
          </div>
          <div className="rb-institute-numbers">
            <span>
              <b>6</b>frentes de inovação
            </span>
            <span>
              <b>R2</b>robótica responsável
            </span>
            <span>
              <b>DF</b>tecnologia em Brasília
            </span>
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
            <p>Use seu CPF ou conta e o PIN de quatro dígitos.</p>
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
                reduzir fraude.
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
      "IA + Big Data",
      "RanBank Intelligence & Research",
      "Pesquisa aplicada para segurança financeira, análise de padrões e educação orientada por dados.",
    ],
    [
      "02",
      "IoT + Sustentabilidade",
      "RanBank Smart & Green",
      "Sensores, eficiência energética e projetos para reduzir desperdícios em infraestrutura.",
    ],
    [
      "03",
      "VR + RA",
      "RanBank Immersive Lab",
      "Treinamento, inclusão digital, acessibilidade e novas experiências de atendimento.",
    ],
    [
      "04",
      "Computação em nuvem",
      "RanCloud Innovation Program",
      "Disponibilidade, escala e recuperação de falhas para projetos digitais.",
    ],
    [
      "05",
      "Comparação",
      "Conselho de Tecnologia RanBank",
      "Impacto, custo, maturidade e risco orientando escolhas responsáveis.",
    ],
    [
      "06",
      "Robótica",
      "RanBank Robotics Initiative",
      "Bolsas, laboratórios e projetos de automação, acessibilidade e atendimento.",
    ],
  ];
  return (
    <div className="rb-public-shell rb-institute-page">
      <PublicHeader dark />
      <main>
        <section className="rb-institute-hero">
          <span className="rb-kicker">
            INSTITUTO RANBANK DE TECNOLOGIA · BRASÍLIA, DF
          </span>
          <h1>
            Pesquisa, inovação
            <br />e impacto social.
          </h1>
          <p>
            Uma frente institucional que conecta o RanBank a universidades,
            institutos e centros de ciência.
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
            <span>6 FRENTES DE INOVAÇÃO</span>
            <h2>Da pesquisa à aplicação.</h2>
          </div>
          <div className="rb-initiative-grid">
            {initiatives.map(([n, topic, title, text]) => (
              <article key={n} id={n === "06" ? "robotica" : undefined}>
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
            <span>DESTAQUE · ROBÓTICA</span>
            <h2>Tecnologia que amplia possibilidades.</h2>
            <p>
              Formação, laboratórios e projetos que aproximam ciência robótica,
              acessibilidade, automação responsável e sociedade.
            </p>
          </div>
          <div className="rb-robotics-points">
            <span>Institutos e universidades</span>
            <span>Bolsas e laboratórios</span>
            <span>Projetos de acessibilidade</span>
            <span>Pesquisa aplicada</span>
          </div>
        </section>
        <section className="rb-final-cta">
          <div>
            <span>AMBIENTE DEMONSTRATIVO</span>
            <h2>Veja a tecnologia dentro do banco.</h2>
            <p>Entre no RanBank e acesse o Future Lab.</p>
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
