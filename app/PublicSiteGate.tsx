"use client";

import { usePathname } from "next/navigation";

const products = [
  { eyebrow: "Conta", title: "Uma conta para o dia a dia.", text: "Pix, pagamentos, transferências e movimentações em uma experiência simples e segura.", icon: "R$" },
  { eyebrow: "Cartão", title: "Controle na sua mão.", text: "Acompanhe compras, limite, fatura e bloqueios sem complicação.", icon: "▭" },
  { eyebrow: "Segurança", title: "Proteção em várias camadas.", text: "Confirmações, dispositivos confiáveis e análise de movimentações ajudam a proteger sua conta.", icon: "◇" },
  { eyebrow: "Reserva Future", title: "Organize seus próximos passos.", text: "Separe dinheiro para objetivos e acompanhe sua evolução de forma visual.", icon: "◎" },
];

const tech = [
  ["IA + Dados", "Segurança e inteligência financeira a partir de padrões e contexto."],
  ["IoT + Sustentabilidade", "Infraestrutura conectada, eficiência energética e redução de desperdícios."],
  ["RA + VR", "Treinamento, acessibilidade e novas experiências de atendimento."],
  ["Computação em nuvem", "Disponibilidade, recuperação de falhas e escala dos serviços digitais."],
  ["Robótica", "Pesquisa, automação responsável e apoio a institutos de ciência robótica."],
];

export default function PublicSiteGate() {
  const pathname = usePathname();
  if (pathname !== "/") return null;
  return <PublicHome />;
}

export function PublicHome() {
  return (
    <div className="rb-public-shell">
      <header className="rb-public-header">
        <a className="rb-public-brand" href="#top" aria-label="RanBank">
          <img src="/ranbank-logo.jpeg" alt="RanBank" />
        </a>
        <nav className="rb-public-nav" aria-label="Navegação principal">
          <a href="#conta">Conta</a>
          <a href="#seguranca">Segurança</a>
          <a href="#tecnologia">Tecnologia</a>
          <a href="/instituto">Instituto RanBank</a>
        </nav>
        <a className="rb-public-login" href="/banco">Acessar minha conta <span>→</span></a>
      </header>

      <main id="top">
        <section className="rb-hero">
          <div className="rb-hero-copy">
            <span className="rb-kicker">BANCO DIGITAL · TECNOLOGIA COM PROPÓSITO</span>
            <h1>Seu futuro.<br />Nosso compromisso.</h1>
            <p>Uma experiência financeira simples, segura e conectada ao que vem pela frente.</p>
            <div className="rb-hero-actions">
              <a className="rb-btn rb-btn-primary" href="/banco">Acessar o RanBank</a>
              <a className="rb-btn rb-btn-ghost" href="#conta">Conhecer o banco</a>
            </div>
          </div>
          <div className="rb-hero-scene" aria-label="Representação do aplicativo RanBank">
            <div className="rb-card-visual">
              <span>RANBANK</span>
              <strong>Future</strong>
              <small>•••• 2048</small>
            </div>
            <div className="rb-phone">
              <div className="rb-phone-top"><b>Olá, Ana</b><span>•••</span></div>
              <small>Saldo disponível</small>
              <strong>R$ 8.540,75</strong>
              <div className="rb-phone-actions"><span>Pix</span><span>Pagar</span><span>Cartão</span></div>
              <div className="rb-phone-line"><i>↓</i><div><b>Pix recebido</b><small>Hoje, 09:41</small></div><em>+ R$ 250</em></div>
            </div>
          </div>
        </section>

        <section className="rb-section rb-products" id="conta">
          <div className="rb-section-heading">
            <span>RANBANK NO DIA A DIA</span>
            <h2>Banco de verdade na superfície.<br />Tecnologia trabalhando por trás.</h2>
          </div>
          <div className="rb-product-grid">
            {products.map((item) => (
              <article className="rb-product-card" key={item.eyebrow}>
                <div className="rb-product-icon">{item.icon}</div>
                <span>{item.eyebrow}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <a href="/banco">Ver no banco →</a>
              </article>
            ))}
          </div>
        </section>

        <section className="rb-security" id="seguranca">
          <div>
            <span className="rb-kicker rb-kicker-light">SEGURANÇA RANBANK</span>
            <h2>Seu dinheiro protegido em várias camadas.</h2>
            <p>A segurança aparece quando importa: no acesso, nas movimentações e na confirmação de operações sensíveis.</p>
          </div>
          <div className="rb-security-list">
            <span><b>01</b> Autenticação e contexto de acesso</span>
            <span><b>02</b> Confirmação de operações</span>
            <span><b>03</b> Análise de movimentações fora do padrão</span>
            <span><b>04</b> Dispositivos confiáveis e notificações</span>
          </div>
        </section>

        <section className="rb-section rb-tech" id="tecnologia">
          <div className="rb-section-heading rb-tech-heading">
            <span>TECNOLOGIA RANBANK</span>
            <h2>Tecnologia faz parte do banco.<br />Não precisa complicar a sua vida.</h2>
            <p>O RanBank aplica tecnologias emergentes nos serviços financeiros e mantém uma frente institucional para pesquisa, educação e inovação.</p>
          </div>
          <div className="rb-tech-list">
            {tech.map(([title, text], index) => (
              <article key={title}>
                <b>{String(index + 1).padStart(2, "0")}</b>
                <div><h3>{title}</h3><p>{text}</p></div>
              </article>
            ))}
          </div>
          <a className="rb-btn rb-btn-primary" href="/instituto">Conhecer o Instituto RanBank</a>
        </section>

        <section className="rb-institute-teaser">
          <span>INSTITUTO RANBANK</span>
          <h2>Tecnologia que vai além do banco.</h2>
          <p>Parcerias com universidades, institutos e centros de pesquisa para apoiar ciência, formação tecnológica e projetos com impacto social.</p>
          <div className="rb-institute-highlight"><b>RanBank Robotics Initiative</b><span>Apoio a institutos, laboratórios, bolsas e projetos relacionados à ciência robótica.</span></div>
          <a href="/instituto">Explorar iniciativas →</a>
        </section>

        <section className="rb-final-cta">
          <div><span>JÁ É CLIENTE?</span><h2>Entre no RanBank.</h2><p>Consulte saldo, faça Pix, acompanhe cartões e acesse os recursos do banco digital.</p></div>
          <a className="rb-btn rb-btn-light" href="/banco">Acessar minha conta →</a>
        </section>
      </main>

      <footer className="rb-public-footer"><img src="/ranbank-logo.jpeg" alt="RanBank" /><span>Projeto demonstrativo · Banco digital e tecnologias emergentes</span><a href="/instituto">Instituto RanBank</a></footer>
    </div>
  );
}

export function InstitutePublicPage() {
  const initiatives = [
    ["01", "IA + Big Data", "RanBank Intelligence & Research", "Parcerias e pesquisa aplicada para segurança financeira, análise de padrões e educação orientada por dados."],
    ["02", "IoT + Sustentabilidade", "RanBank Smart & Green", "Sensores, eficiência energética, cidades inteligentes e projetos para reduzir desperdícios em infraestrutura."],
    ["03", "VR + RA", "RanBank Immersive Lab", "Laboratórios de realidade aumentada e virtual voltados a treinamento, acessibilidade e experiência."],
    ["04", "Computação em nuvem", "RanCloud Innovation Program", "Infraestrutura e apoio técnico para projetos que precisam de disponibilidade, escala e recuperação de falhas."],
    ["05", "Comparação", "Conselho de Tecnologia RanBank", "Avaliação de impacto, custo, maturidade e risco para orientar investimentos e escolhas responsáveis."],
    ["06", "Robótica", "RanBank Robotics Initiative", "Apoio a institutos, universidades e centros de ciência robótica com bolsas, laboratórios e projetos de automação e acessibilidade."],
  ];

  return (
    <div className="rb-public-shell rb-institute-page">
      <header className="rb-public-header rb-institute-header">
        <a className="rb-public-brand" href="/"><img src="/ranbank-logo.jpeg" alt="RanBank" /></a>
        <nav className="rb-public-nav"><a href="/">Banco</a><a href="#iniciativas">Iniciativas</a><a href="#robotica">Robótica</a></nav>
        <a className="rb-public-login" href="/banco">Acessar banco <span>→</span></a>
      </header>
      <main>
        <section className="rb-institute-hero">
          <span className="rb-kicker">INSTITUTO RANBANK DE TECNOLOGIA</span>
          <h1>Pesquisa, inovação<br />e impacto social.</h1>
          <p>Uma frente institucional que conecta o RanBank a universidades, institutos e centros de ciência para transformar tecnologias emergentes em conhecimento e aplicações responsáveis.</p>
          <div className="rb-hero-actions"><a className="rb-btn rb-btn-primary" href="#iniciativas">Conhecer iniciativas</a><a className="rb-btn rb-btn-ghost" href="/banco">Abrir o banco</a></div>
        </section>
        <section className="rb-section" id="iniciativas">
          <div className="rb-section-heading"><span>6 FRENTES DE INOVAÇÃO</span><h2>Da pesquisa à aplicação.</h2></div>
          <div className="rb-initiative-grid">
            {initiatives.map(([n, topic, title, text]) => <article key={n} id={n === "06" ? "robotica" : undefined}><b>{n}</b><span>{topic}</span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </section>
        <section className="rb-robotics-callout">
          <div><span>DESTAQUE · ROBÓTICA</span><h2>Apoio aos institutos de tecnologia e ciência robótica.</h2><p>O RanBank apoia formação, laboratórios, bolsas e projetos que aproximem ciência robótica, acessibilidade, automação responsável e sociedade.</p></div>
          <div className="rb-robotics-points"><span>Institutos e universidades</span><span>Bolsas e laboratórios</span><span>Projetos de acessibilidade</span><span>Pesquisa aplicada</span></div>
        </section>
        <section className="rb-final-cta"><div><span>AMBIENTE DEMONSTRATIVO</span><h2>Veja a tecnologia funcionando dentro do banco.</h2><p>Entre no RanBank para acessar o Future Lab, demonstrações e apresentação guiada.</p></div><a className="rb-btn rb-btn-light" href="/banco">Acessar RanBank →</a></section>
      </main>
      <footer className="rb-public-footer"><a href="/">← Voltar ao RanBank</a><span>Instituto RanBank de Tecnologia</span><a href="/banco">Acessar conta</a></footer>
    </div>
  );
}
