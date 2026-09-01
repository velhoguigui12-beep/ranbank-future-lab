"use client";
/* eslint-disable @next/next/no-img-element -- Vinext serves the project-owned RanBank assets directly. */

import { PublicFooter, PublicHeader } from "./PublicSiteGate";

const projects = [
  {
    className: "is-featured",
    eyebrow: "EDUCAÇÃO FINANCEIRA",
    title: "RanEduca — escolhas que cabem no futuro",
    text: "Oficinas para jovens aprendizes com orçamento, crédito, prevenção a golpes, Pix e planejamento. A conta demonstrativa do RanBank transforma conceitos em uma experiência prática.",
    audience: "Jovens e educadores",
    format: "Oficinas + laboratório",
    media: "image",
    source: "/images/ranbank-hero-ecocard.png",
    alt: "Cliente utilizando o Ecocard RanBank em um pequeno negócio",
  },
  {
    eyebrow: "INCLUSÃO DIGITAL",
    title: "RanConecta",
    text: "Laboratórios itinerantes apresentam inteligência artificial, nuvem, IoT, robótica e segurança digital de forma acessível, com desafios ligados à rotina de um banco.",
    audience: "Turmas de aprendizagem",
    format: "Trilhas práticas",
    media: "video",
    source: "/media/ranbank-demonstracao-04.mp4",
    alt: "",
  },
  {
    eyebrow: "FINANÇAS SUSTENTÁVEIS",
    title: "EcoLab RanBank",
    text: "Uma frente de consumo consciente que conecta o Ecocard, descarte responsável, eficiência energética e escolhas financeiras de menor impacto.",
    audience: "Comunidade e clientes",
    format: "Campanhas + protótipos",
    media: "image",
    source: "/images/ranbank-impact-ecocard.jpeg",
    alt: "Apresentação do Ecocard sustentável do RanBank",
  },
  {
    eyebrow: "TRABALHO E RENDA",
    title: "Elas do Futuro",
    text: "Mentoria financeira e digital para mulheres que lideram pequenos negócios, da organização do caixa à presença segura nos canais digitais.",
    audience: "Mulheres empreendedoras",
    format: "Mentoria em ciclos",
    media: "video",
    source: "/media/ranbank-demonstracao-03.mp4",
    alt: "",
  },
  {
    eyebrow: "TECNOLOGIA ASSISTIVA",
    title: "TechAcesso",
    text: "Projetos de acessibilidade aplicados ao atendimento bancário, com interfaces inclusivas, protótipos de robótica e testes conduzidos com participação humana.",
    audience: "Pessoas com deficiência",
    format: "Cocriação + testes",
    media: "video",
    source: "/media/ranbank-demonstracao-02.mp4",
    alt: "",
  },
];

const selectionCriteria = [
  ["01", "Impacto local", "Prioridade para iniciativas com vínculo com Brasília e o Distrito Federal."],
  ["02", "Inclusão e diversidade", "Acesso real para públicos diferentes, com linguagem e recursos inclusivos."],
  ["03", "Educação aplicável", "Conhecimento que possa ser praticado e compartilhado depois da atividade."],
  ["04", "Tecnologia responsável", "Inovação com segurança, privacidade, acessibilidade e supervisão humana."],
  ["05", "Sustentabilidade", "Uso consciente de recursos e contribuição social ou ambiental demonstrável."],
  ["06", "Transparência", "Objetivos, responsáveis, metas e aprendizados apresentados com clareza."],
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
    acronym: "PNED",
    title: "Política Nacional de Educação Digital",
    text: "Inspira inclusão digital, educação, capacitação e pesquisa em tecnologias da informação.",
    href: "https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14533.htm",
  },
  {
    acronym: "ODS",
    title: "Agenda 2030",
    text: "Os projetos dialogam especialmente com educação, trabalho digno, inovação, redução das desigualdades e parcerias.",
    href: "https://www.gov.br/secretariageral/pt-br/cnods",
  },
];

const impactGoals = [
  ["600", "participantes em experiências educativas"],
  ["12", "oficinas e laboratórios demonstrativos"],
  ["08", "protótipos de tecnologia responsável"],
  ["75%", "de participação de públicos prioritários"],
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
            <span>SEU FUTURO. NOSSO COMPROMISSO.</span>
            <h1 id="impact-title">Portal de Impacto</h1>
            <p>
              Tecnologia financeira, educação e parcerias para abrir caminhos
              e transformar possibilidades em Brasília.
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
            <span><b>05</b> frentes de atuação</span>
            <span><b>04</b> referências públicas</span>
            <span><b>DF</b> ponto de partida</span>
          </div>
        </section>

        <section className="impact-intro">
          <div className="impact-section-label">CONHEÇA O PORTAL</div>
          <div className="impact-intro-copy">
            <h2>Um banco do futuro também investe no futuro das pessoas.</h2>
            <div>
              <p>
                O RanBank nasceu como uma simulação bancária realista para
                aproximar estudantes das tecnologias que já transformam o
                sistema financeiro. Nosso compromisso social amplia essa ideia:
                usar conhecimento, inovação e escolhas sustentáveis para gerar
                oportunidades que façam sentido na vida real.
              </p>
              <p>
                Este portal apresenta uma carteira <strong>demonstrativa</strong>
                de investimento social privado. Cada iniciativa foi desenhada
                para apoiar aprendizagem, inclusão digital, trabalho e renda,
                acessibilidade e sustentabilidade — sempre com metas claras e
                participação da comunidade.
              </p>
            </div>
          </div>
        </section>

        <section className="impact-projects" id="projetos">
          <header className="impact-section-heading">
            <span>PROJETOS EM DESTAQUE</span>
            <h2>Ideias que saem da tela e chegam à comunidade.</h2>
            <p>
              Uma carteira simulada para mostrar como um banco pode combinar
              recursos, voluntariado e tecnologia em iniciativas de impacto.
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
            <h2>Impacto com método, responsabilidade e espaço para aprender.</h2>
            <p>
              As iniciativas passam por uma jornada simples: escuta do desafio,
              desenho com parceiros, teste em pequena escala, acompanhamento de
              metas e compartilhamento dos aprendizados.
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
            <source src="/media/ranbank-historia-2026.mp4" type="video/mp4" />
          </video>
          <div className="impact-goals-shade" aria-hidden="true" />
          <div className="impact-goals-copy">
            <span>TRANSPARÊNCIA DESDE O COMEÇO</span>
            <h2>Metas para orientar. Dados para aprender.</h2>
            <p>
              Em uma implantação real, cada projeto publicaria indicadores,
              responsáveis, investimento e resultados. Para esta experiência,
              os números abaixo são metas anuais simuladas.
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
