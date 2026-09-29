"use client";
/* eslint-disable @next/next/no-img-element -- Vinext serves the project-owned RanBank assets directly. */

import { PublicFooter, PublicHeader } from "./PublicSiteGate";

const projects = [
  {
    className: "is-featured",
    eyebrow: "EDUCAÇÃO FINANCEIRA",
    title: "Educação que transforma",
    text: "Atividades sobre orçamento, crédito, Pix, planejamento e prevenção a golpes. A conta demonstrativa ajuda a praticar o que foi aprendido.",
    audience: "Jovens e educadores",
    format: "Oficinas e prática",
    media: "image",
    source: "/images/ranbank-hero-ecocard.png",
    alt: "Cliente utilizando o Ecocard RanBank em um pequeno negócio",
  },
  {
    eyebrow: "COMUNIDADES QUE DECIDEM",
    title: "Apoio a iniciativas indígenas e comunitárias",
    text: "Uma proposta de apoio financeiro e digital construída com escuta, respeito à cultura e participação das próprias comunidades nas decisões.",
    audience: "Povos indígenas e comunidades locais",
    format: "Escuta e construção conjunta",
    media: "video",
    source: "/videos/ranbank-demonstracao-04.mp4",
    alt: "",
  },
  {
    eyebrow: "CRÉDITO COM PROPÓSITO",
    title: "Crédito para impacto positivo",
    text: "Um conceito de crédito com condições ligadas a projetos sociais, geração de renda e redução de impactos ambientais.",
    audience: "Pessoas e pequenos negócios",
    format: "Crédito demonstrativo",
    media: "image",
    source: "/images/ranbank-impact-ecocard.jpeg",
    alt: "Apresentação do Ecocard sustentável do RanBank",
  },
  {
    eyebrow: "ATENDIMENTO ACESSÍVEL",
    title: "Um banco para todas as pessoas",
    text: "Telas legíveis, linguagem simples e atendimento com a Ran para ajudar cada pessoa a encontrar o que precisa.",
    audience: "Clientes com diferentes necessidades",
    format: "Testes com participação humana",
    media: "video",
    source: "/videos/ranbank-demonstracao-02.mp4",
    alt: "",
  },
];

const selectionCriteria = [
  ["01", "Escuta da comunidade", "A solução começa pelas necessidades das pessoas que serão atendidas."],
  ["02", "Benefício claro", "A iniciativa precisa melhorar a vida financeira, social ou ambiental de forma compreensível."],
  ["03", "Inclusão", "O acesso deve considerar diferentes públicos, culturas e necessidades."],
  ["04", "Transparência", "Objetivos, responsáveis, recursos e aprendizados devem ser apresentados com clareza."],
];

const publicReferences = [
  {
    acronym: "ENEF",
    title: "Estratégia Nacional de Educação Financeira",
    text: "Referência para atividades de educação financeira, securitária, previdenciária e fiscal.",
    href: "https://www.gov.br/previdencia/pt-br/assuntos/previdencia-complementar/coletanea-de-normas/anteriores/coletaneadenormas_22-08.pdf",
  },
  {
    acronym: "BC",
    title: "Cidadania Financeira",
    text: "Educação, inclusão, proteção ao consumidor e participação cidadã como pilares complementares.",
    href: "https://www.bcb.gov.br/cidadaniafinanceira/indexcidadaniafinanceira",
  },
  {
    acronym: "AgSUS",
    title: "Agência Brasileira de Apoio à Gestão do SUS",
    text: "Referência pública de atuação com respeito aos territórios, às culturas e às necessidades locais.",
    href: "https://agenciasus.org.br/",
  },
  {
    acronym: "ODS",
    title: "Agenda 2030",
    text: "Os projetos dialogam especialmente com educação, trabalho digno, inovação, redução das desigualdades e parcerias.",
    href: "https://www.gov.br/secretariageral/pt-br/cnods",
  },
];

const impactGoals = [
  ["Ouvir", "as pessoas antes de definir uma solução"],
  ["Explicar", "como os recursos seriam utilizados"],
  ["Medir", "resultados sociais e ambientais"],
  ["Publicar", "aprendizados e próximos passos"],
];

function ProjectMedia({ project }: { project: (typeof projects)[number] }) {
  if (project.media === "video") {
    return (
      <video autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
        <source src={project.source} type="video/mp4" />
      </video>
    );
  }
  return <img src={project.source} alt={project.alt} loading="lazy" />;
}

export default function ProjectsPublicPage() {
  return (
    <div className="rb-public-shell rb-impact-shell">
      <PublicHeader />
      <main>
        <section className="impact-hero" aria-labelledby="impact-title">
          <img
            className="impact-hero-background"
            src="/images/ranbank-hero-ecocard.png"
            alt="Cliente do RanBank utilizando o Ecocard em um pequeno negócio"
            fetchPriority="high"
          />
          <div className="impact-hero-shade" aria-hidden="true" />
          <div className="impact-hero-content">
            <img
              className="impact-hero-logo"
              src="/images/ranbank-projects-logo.jpeg"
              alt="RanBank"
            />
            <span>IMPACTO SOCIAL E AMBIENTAL</span>
            <h1 id="impact-title">Projetos com propósito</h1>
            <p>
              Ideias para usar educação, crédito e tecnologia a favor das
              pessoas, das comunidades e do meio ambiente.
            </p>
            <div className="impact-hero-actions">
              <a className="impact-button is-light" href="#projetos">
                Conhecer os projetos
              </a>
              <a className="impact-text-link" href="#metodologia">
                Como selecionamos <b>↓</b>
              </a>
            </div>
          </div>
          <div className="impact-hero-index" aria-label="Resumo do portal">
            <span><b>04</b> frentes de atuação</span>
            <span><b>04</b> projetos demonstrativos</span>
            <span><b>DF</b> ponto de partida</span>
          </div>
        </section>

        <section className="impact-intro">
          <div className="impact-section-label">CONHEÇA O PORTAL</div>
          <div className="impact-intro-copy">
            <h2>Um banco também pode ajudar a transformar realidades.</h2>
            <div>
              <p>
                O RanBank é uma simulação bancária criada para mostrar, de forma
                simples, como os serviços financeiros funcionam e como podem
                apoiar educação, inclusão e geração de oportunidades.
              </p>
              <p>
                Os projetos desta página são <strong>propostas demonstrativas</strong>.
                Eles não representam ações já realizadas, mas mostram os
                compromissos que orientariam uma implantação real.
              </p>
            </div>
          </div>
        </section>

        <section className="impact-projects" id="projetos">
          <header className="impact-section-heading">
            <span>PROJETOS EM DESTAQUE</span>
            <h2>Ideias que saem da tela e chegam à comunidade.</h2>
            <p>
              Quatro propostas simples para mostrar como um banco pode gerar
              benefícios além dos serviços financeiros.
            </p>
          </header>
          <div className="impact-project-grid">
            {projects.map((project, index) => (
              <article className={project.className ?? ""} key={project.title}>
                <div className="impact-project-media">
                  <ProjectMedia project={project} />
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className="impact-project-copy">
                  <span>{project.eyebrow}</span>
                  <h3>{project.title}</h3>
                  <p>{project.text}</p>
                  <dl>
                    <div><dt>Público</dt><dd>{project.audience}</dd></div>
                    <div><dt>Formato</dt><dd>{project.format}</dd></div>
                  </dl>
                  <small>INICIATIVA DEMONSTRATIVA</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="impact-method" id="metodologia">
          <div className="impact-method-intro">
            <span>COMO ESCOLHEMOS</span>
            <h2>Escolhas feitas com responsabilidade.</h2>
            <p>
              Cada iniciativa começa pela escuta, passa por um teste em pequena
              escala e só avança quando seus objetivos e resultados podem ser
              explicados com clareza.
            </p>
            <a href="mailto:impacto@ranbank.demo">Apresentar uma iniciativa →</a>
          </div>
          <div className="impact-criteria">
            {selectionCriteria.map(([number, title, text]) => (
              <article key={number}>
                <b>{number}</b>
                <div><h3>{title}</h3><p>{text}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="impact-frameworks" id="referencias">
          <header className="impact-section-heading">
            <span>REFERÊNCIAS PÚBLICAS</span>
            <h2>Modelos reais ajudam a construir uma simulação responsável.</h2>
            <p>
              O portfólio educacional dialoga com políticas e agendas públicas.
              Esses referenciais inspiram o desenho dos projetos; não significam
              vínculo, certificação ou parceria oficial com o RanBank.
            </p>
          </header>
          <div className="impact-reference-grid">
            {publicReferences.map((reference) => (
              <a
                href={reference.href}
                target="_blank"
                rel="noreferrer"
                key={reference.acronym}
              >
                <b>{reference.acronym}</b>
                <h3>{reference.title}</h3>
                <p>{reference.text}</p>
                <span>Consultar fonte oficial ↗</span>
              </a>
            ))}
          </div>
          <div className="impact-ods">
            <span>ODS EM DIÁLOGO</span>
            <div>
              {[
                ["04", "Educação"],
                ["08", "Trabalho digno"],
                ["09", "Inovação"],
                ["10", "Menos desigualdades"],
                ["12", "Consumo responsável"],
                ["13", "Ação climática"],
                ["17", "Parcerias"],
              ].map(([number, label]) => (
                <span key={number}><b>{number}</b>{label}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="impact-goals">
          <video autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
            <source src="/videos/ranbank-historia-2026.mp4" type="video/mp4" />
          </video>
          <div className="impact-goals-shade" aria-hidden="true" />
          <div className="impact-goals-copy">
            <span>TRANSPARÊNCIA DESDE O COMEÇO</span>
            <h2>Compromissos antes dos números.</h2>
            <p>
              Como os projetos ainda são demonstrativos, não apresentamos
              resultados inventados. Em uma implantação real, cada iniciativa
              publicaria responsáveis, investimento, metas e resultados.
            </p>
          </div>
          <div className="impact-goal-grid">
            {impactGoals.map(([value, label]) => (
              <article key={value}><strong>{value}</strong><span>{label}</span></article>
            ))}
          </div>
        </section>

        <section className="impact-cta">
          <img src="/images/ranbank-impact-ecocard.jpeg" alt="Ecocard RanBank em cenário sustentável" />
          <div>
            <span>IMPACTO RANBANK</span>
            <h2>Seu futuro. Nosso compromisso.</h2>
            <p>
              Explore o laboratório de tecnologias emergentes ou viva a
              experiência completa no banco digital demonstrativo.
            </p>
            <div>
              <a className="impact-button is-primary" href="/instituto">Conhecer o Instituto</a>
              <a className="impact-button is-outline" href="/banco">Abrir o banco</a>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
