"use client";

import { PublicFooter, PublicHeader } from "./PublicSiteGate";
import RaniAssistant from "./RaniAssistant";
import { Icon } from "./SiteIcons";
import type { IconName } from "./SiteIcons";

const projects: Array<{ icon: IconName; status: string; tone: string; title: string; text: string; audience: string; format: string }> = [
  {
    icon: "book",
    status: "Próximo passo",
    tone: "next",
    title: "Educação que transforma",
    text: "Oficinas sobre orçamento, crédito, Pix e golpes. A conta de demonstração do RanBank serve para praticar sem risco, com dinheiro de mentira.",
    audience: "Jovens aprendizes, escolas e educadores",
    format: "Oficinas com prática no app",
  },
  {
    icon: "users",
    status: "Em estudo",
    tone: "study",
    title: "Apoio a iniciativas indígenas e comunitárias",
    text: "Educação financeira e acesso digital construídos junto com as comunidades, respeitando a cultura e deixando as decisões com elas.",
    audience: "Povos indígenas e comunidades locais",
    format: "Escuta primeiro, proposta depois",
  },
  {
    icon: "sprout",
    status: "Ideia",
    tone: "idea",
    title: "Crédito com propósito",
    text: "Condições melhores de crédito para projetos que geram renda na comunidade ou reduzem impacto ambiental.",
    audience: "Pessoas e pequenos negócios",
    format: "Crédito demonstrativo",
  },
  {
    icon: "access",
    status: "Parte no protótipo",
    tone: "done",
    title: "Um banco para todas as pessoas",
    text: "Letras grandes, palavras simples e a assistente Rani já estão no protótipo. Testes com pessoas de diferentes necessidades são o próximo passo.",
    audience: "Clientes com diferentes necessidades",
    format: "Testes com participação das pessoas",
  },
];

const selectionCriteria = [
  ["Escuta", "A solução começa pelas necessidades de quem será atendido."],
  ["Benefício claro", "Precisa melhorar a vida financeira, social ou ambiental de um jeito fácil de explicar."],
  ["Inclusão", "Considera diferentes públicos, culturas e necessidades."],
  ["Transparência", "Objetivos, responsáveis, dinheiro usado e resultados ficam públicos."],
];

const publicReferences = [
  {
    acronym: "ENEF",
    title: "Estratégia Nacional de Educação Financeira",
    text: "Referência para ações de educação financeira no Brasil.",
    href: "https://www.gov.br/previdencia/pt-br/assuntos/previdencia-complementar/coletanea-de-normas/anteriores/coletaneadenormas_22-08.pdf",
  },
  {
    acronym: "BC",
    title: "Cidadania Financeira",
    text: "Programa do Banco Central que une educação, inclusão e proteção do consumidor.",
    href: "https://www.bcb.gov.br/cidadaniafinanceira/indexcidadaniafinanceira",
  },
  {
    acronym: "AgSUS",
    title: "Agência Brasileira de Apoio à Gestão do SUS",
    text: "Referência de atuação nos territórios, com respeito às culturas e às necessidades locais.",
    href: "https://agenciasus.org.br/",
  },
  {
    acronym: "ODS",
    title: "Agenda 2030 da ONU",
    text: "Metas globais de educação, trabalho digno, inovação e redução das desigualdades.",
    href: "https://www.gov.br/secretariageral/pt-br/cnods",
  },
];

const commitments = [
  ["Ouvir", "as pessoas antes de definir uma solução"],
  ["Explicar", "como o dinheiro seria usado"],
  ["Medir", "resultados sociais e ambientais"],
  ["Publicar", "aprendizados e próximos passos"],
];

export default function ProjectsPublicPage() {
  return (
    <div className="rs rs-page">
      <PublicHeader />
      <main>
        <section className="rs-page-hero">
          <div className="rs-wrap">
            <span className="rs-chip">Projetos e impacto</span>
            <h1>Projetos com propósito</h1>
            <p>Ideias para usar educação, crédito e tecnologia a favor das pessoas, das comunidades e do meio ambiente.</p>
          </div>
        </section>

        <section className="rs-section rs-light">
          <div className="rs-wrap">
            <p className="rs-honest is-large">
              <Icon name="alert" size={22} />
              <span>Os projetos desta página são <strong>propostas demonstrativas</strong>. Eles não representam ações já realizadas e não existem parcerias oficiais. Cada um mostra em que fase está.</span>
            </p>
            <div className="rs-projects" id="projetos">
              {projects.map((project) => (
                <article key={project.title}>
                  <div className="rs-destination-top">
                    <i className="rs-tile-icon"><Icon name={project.icon} /></i>
                    <span className={`rs-status is-${project.tone}`}>{project.status}</span>
                  </div>
                  <h3>{project.title}</h3>
                  <p>{project.text}</p>
                  <dl>
                    <div><dt>Para quem</dt><dd>{project.audience}</dd></div>
                    <div><dt>Como</dt><dd>{project.format}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="rs-section" id="metodologia">
          <div className="rs-wrap rs-split">
            <header className="rs-head">
              <span className="rs-label">Como escolhemos</span>
              <h2>Um projeto só avança se passar por quatro perguntas.</h2>
              <p>Cada iniciativa começa pela escuta, é testada em pequena escala e só cresce quando o resultado pode ser explicado com clareza.</p>
            </header>
            <ol className="rs-criteria">
              {selectionCriteria.map(([title, text], index) => (
                <li key={title}>
                  <b>{index + 1}</b>
                  <div><h3>{title}</h3><p>{text}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="rs-section rs-light" id="referencias">
          <div className="rs-wrap">
            <header className="rs-head">
              <span className="rs-label">Referências públicas</span>
              <h2>Referências que inspiram o projeto.</h2>
              <p>
                Estas referências inspiram o desenho dos projetos. Elas não significam
                vínculo, certificação ou parceria oficial com o RanBank.
              </p>
            </header>
            <div className="rs-references">
              {publicReferences.map((reference) => (
                <a href={reference.href} target="_blank" rel="noreferrer" key={reference.acronym}>
                  <b>{reference.acronym}</b>
                  <h3>{reference.title}</h3>
                  <p>{reference.text}</p>
                  <span>Ver fonte oficial ↗</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="rs-section rs-impact">
          <div className="rs-wrap">
            <header className="rs-head">
              <span className="rs-label">Transparência</span>
              <h2>Compromissos antes dos números.</h2>
              <p>
                Como os projetos ainda são propostas, não apresentamos
                resultados inventados. Em um projeto real, cada iniciativa publicaria responsáveis, investimento, metas e resultados.
              </p>
            </header>
            <div className="rs-commitments">
              {commitments.map(([value, label]) => (
                <article key={value}><strong>{value}</strong><span>{label}</span></article>
              ))}
            </div>
          </div>
        </section>

        <section className="rs-final">
          <div className="rs-wrap">
            <h2>Seu futuro. Nosso compromisso.</h2>
            <p>Veja como o banco funciona por dentro ou conheça a proposta do Instituto RanBank.</p>
            <div className="rs-actions is-center">
              <a className="rs-btn rs-btn-light rs-btn-lg" href="/banco">Abrir o banco</a>
              <a className="rs-btn rs-btn-outline rs-btn-lg" href="/instituto">Conhecer o Instituto</a>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
      <RaniAssistant context="site" />
    </div>
  );
}
