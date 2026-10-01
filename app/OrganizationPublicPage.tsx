"use client";
/* eslint-disable @next/next/no-img-element -- Vinext serves the local logo directly. */

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { PublicFooter, PublicHeader } from "./PublicSiteGate";
import RaniAssistant from "./RaniAssistant";

type OrganizationRole = {
  id: string;
  chartTitle: string;
  title: string;
  person: string;
  area: string;
  description: string;
  responsibilities: string[];
};

const leadership: OrganizationRole[] = [
  {
    id: "presidencia",
    chartTitle: "Presidente / CEO",
    title: "Presidente e CEO",
    person: "Guilherme",
    area: "Presidência",
    description: "Conduz a visão estratégica do RanBank, conecta as áreas e garante que inovação, segurança e impacto avancem na mesma direção.",
    responsibilities: ["Definir prioridades estratégicas", "Representar a visão institucional", "Acompanhar resultados e riscos do banco"],
  },
  {
    id: "ouvidoria",
    chartTitle: "Ouvidora-Geral",
    title: "Ouvidora-Geral",
    person: "Lívia",
    area: "Ouvidoria-Geral",
    description: "Atua como canal independente de escuta, acolhendo manifestações e transformando percepções dos usuários em melhorias para o RanBank.",
    responsibilities: ["Receber e analisar manifestações", "Preservar a imparcialidade da escuta", "Recomendar melhorias de atendimento"],
  },
  {
    id: "vice-presidencia",
    chartTitle: "Vice-Presidente",
    title: "Vice-Presidente",
    person: "Giulianno",
    area: "Presidência",
    description: "Apoia a Presidência na coordenação executiva e integra as diretorias para transformar a estratégia em planos de ação.",
    responsibilities: ["Integrar lideranças e projetos", "Acompanhar a execução da estratégia", "Apoiar decisões executivas"],
  },
];

const departments: Array<{ id: string; title: string; accent: string; roles: OrganizationRole[] }> = [
  {
    id: "tecnologia",
    title: "Tecnologia",
    accent: "01",
    roles: [
      { id: "diretor-tecnologia", chartTitle: "Diretor de Tecnologia", title: "Diretor de Tecnologia", person: "Lúcio", area: "Tecnologia", description: "Lidera a estratégia tecnológica e orienta a construção de soluções digitais confiáveis, escaláveis e alinhadas à experiência bancária.", responsibilities: ["Definir arquitetura e prioridades técnicas", "Orientar segurança e evolução dos sistemas", "Conectar tecnologia à estratégia do banco"] },
      { id: "gerente-tecnologia", chartTitle: "Gerente de Tecnologia", title: "Gerente de Tecnologia", person: "Davi", area: "Tecnologia", description: "Coordena entregas, pessoas e rotinas técnicas, garantindo qualidade e continuidade no desenvolvimento dos produtos.", responsibilities: ["Planejar entregas técnicas", "Acompanhar qualidade e desempenho", "Organizar o trabalho da equipe"] },
      { id: "analista-ti", chartTitle: "Desenvolvedor / Analista de TI", title: "Desenvolvedor e Analista de TI", person: "Jordan", area: "Tecnologia", description: "Desenvolve, testa e mantém as funcionalidades que conectam a interface do RanBank aos seus serviços e dados.", responsibilities: ["Implementar novas funcionalidades", "Investigar e corrigir problemas", "Documentar e testar soluções"] },
    ],
  },
  {
    id: "comunicacao",
    title: "Comunicação, Marketing e Relacionamento",
    accent: "02",
    roles: [
      { id: "diretora-comunicacao", chartTitle: "Diretora", title: "Diretora de Comunicação, Marketing e Relacionamento", person: "Sarah", area: "Comunicação, Marketing e Relacionamento", description: "Define a identidade da marca e conduz a forma como o RanBank conversa, cria vínculos e apresenta seu propósito ao público.", responsibilities: ["Definir estratégia de marca", "Integrar comunicação e relacionamento", "Aprovar campanhas e posicionamentos"] },
      { id: "gerente-comunicacao", chartTitle: "Gerente", title: "Gerente de Comunicação e Marketing", person: "Isabela", area: "Comunicação, Marketing e Relacionamento", description: "Transforma a estratégia da área em campanhas, conteúdos e experiências consistentes nos diferentes canais do RanBank.", responsibilities: ["Planejar campanhas e conteúdos", "Coordenar canais de comunicação", "Acompanhar percepção e engajamento"] },
      { id: "analista-marketing", chartTitle: "Analista de Marketing", title: "Analista de Marketing", person: "Natanny", area: "Comunicação, Marketing e Relacionamento", description: "Cria conteúdos, apoia campanhas e analisa resultados para aproximar a marca das pessoas com clareza e criatividade.", responsibilities: ["Produzir conteúdos de marca", "Apoiar campanhas digitais", "Monitorar indicadores de comunicação"] },
    ],
  },
  {
    id: "negocios",
    title: "Negócios e Operações",
    accent: "03",
    roles: [
      { id: "diretor-negocios", chartTitle: "Diretor de Negócios", title: "Diretor de Negócios", person: "Rangel", area: "Negócios e Operações", description: "Direciona produtos e operações para que a proposta do RanBank seja sustentável, relevante e coerente com as necessidades dos usuários.", responsibilities: ["Definir estratégia de negócios", "Orientar portfólio de produtos", "Acompanhar desempenho operacional"] },
      { id: "analista-produtos", chartTitle: "Analista de Produtos Bancários", title: "Analista de Produtos Bancários", person: "Gustavo", area: "Negócios e Operações", description: "Pesquisa necessidades, desenha jornadas e acompanha a evolução dos produtos bancários apresentados no projeto.", responsibilities: ["Mapear necessidades dos usuários", "Desenhar regras e jornadas de produto", "Acompanhar indicadores e melhorias"] },
      { id: "analista-financeiro", chartTitle: "Analista Financeiro", title: "Analista Financeiro", person: "Marcos", area: "Negócios e Operações", description: "Organiza informações financeiras e produz análises que apoiam planejamento, controle e decisões responsáveis.", responsibilities: ["Consolidar dados financeiros", "Apoiar orçamento e planejamento", "Produzir análises gerenciais"] },
    ],
  },
  {
    id: "rh",
    title: "RH / Gestão de Pessoas",
    accent: "04",
    roles: [
      { id: "diretor-rh", chartTitle: "Diretor de RH", title: "Diretor de Recursos Humanos", person: "Pedro", area: "RH / Gestão de Pessoas", description: "Conduz a estratégia de pessoas e promove uma cultura de colaboração, desenvolvimento e respeito dentro do RanBank.", responsibilities: ["Definir estratégia de pessoas", "Fortalecer cultura e valores", "Orientar desenvolvimento organizacional"] },
      { id: "gerente-rh", chartTitle: "Gerente de RH", title: "Gerente de Recursos Humanos", person: "Yasminn", area: "RH / Gestão de Pessoas", description: "Coordena processos de gestão de pessoas e acompanha a experiência das equipes ao longo de sua jornada na organização.", responsibilities: ["Coordenar rotinas de RH", "Apoiar lideranças e equipes", "Planejar ações de desenvolvimento"] },
      { id: "analista-rh-sahy", chartTitle: "Assistente / Analista de RH", title: "Assistente e Analista de RH", person: "Sahy", area: "RH / Gestão de Pessoas", description: "Apoia processos de pessoas, comunicação interna e organização de iniciativas voltadas ao desenvolvimento das equipes.", responsibilities: ["Apoiar processos de RH", "Organizar ações internas", "Atender equipes e lideranças"] },
      { id: "analista-rh-luiddy", chartTitle: "Assistente / Analista de RH", title: "Assistente e Analista de RH", person: "Luiddy", area: "RH / Gestão de Pessoas", description: "Contribui para as rotinas administrativas da área e para uma experiência interna organizada, acolhedora e eficiente.", responsibilities: ["Apoiar rotinas administrativas", "Manter registros organizados", "Contribuir com ações de clima e cultura"] },
    ],
  },
];

const allRoles = [...leadership, ...departments.flatMap((department) => department.roles)];

// Cor do crachá por área.
const AREA_COLOR: Record<string, string> = {
  "Presidência": "#f5b301",
  "Ouvidoria-Geral": "#22c3ee",
  "Tecnologia": "#3b82f6",
  "Comunicação, Marketing e Relacionamento": "#ec4899",
  "Negócios e Operações": "#22c55e",
  "RH / Gestão de Pessoas": "#f97316",
};

/** Crachá que aparece ao passar o mouse (ou tocar) em um cargo. */
function RoleBadge({ role, serial }: { role: OrganizationRole; serial: number }) {
  return (
    <div className="org-badge" id={`cracha-${role.id}`} role="tooltip">
      <span className="org-badge-strap" aria-hidden="true" />
      <div className="org-badge-top">
        <img src="/ranbank-logo-transparent.png" alt="" />
        <span>{role.area}</span>
      </div>
      <small>Quem ocupa o cargo</small>
      <strong className="org-badge-name">{role.person}</strong>
      <svg className="org-badge-sign" viewBox="0 0 160 14" aria-hidden="true"><path d="M2 9c18-8 26 6 44 0s22-8 38-1 30 6 46-2 20-3 28 0" /></svg>
      <span className="org-badge-role">{role.title}</span>
      <p>{role.description}</p>
      <ul>{role.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul>
      <div className="org-badge-foot" aria-hidden="true"><i /><b>RB-{String(serial).padStart(3, "0")}</b></div>
    </div>
  );
}

export default function OrganizationPublicPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  // Fecha o crachá ao tocar fora dele ou apertar Esc.
  useEffect(() => {
    if (!openId) return;
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !(event.target as Element).closest?.(".org-slot")) setOpenId(null);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", close); };
  }, [openId]);

  const slot = (role: OrganizationRole, button: { className?: string; label?: string; title: string }, slotClass = "") => {
    const serial = allRoles.findIndex((item) => item.id === role.id) + 1;
    const open = openId === role.id;
    return (
      <div className={`org-slot ${slotClass} ${open ? "is-open" : ""}`} key={role.id} style={{ "--badge": AREA_COLOR[role.area] ?? "#3b82f6" } as CSSProperties}>
        <button className={`org-node ${button.className ?? ""}`} type="button" aria-expanded={open} aria-describedby={`cracha-${role.id}`} onClick={() => setOpenId(open ? null : role.id)}>
          {button.label && <small>{button.label}</small>}
          <strong>{button.title}</strong>
          <span>Ver quem é →</span>
        </button>
        <RoleBadge role={role} serial={serial} />
      </div>
    );
  };
  const [president, ombudsman, vice] = leadership;

  return (
    <div className="rs rb-public-shell rb-org-page">
      <PublicHeader />
      <main>
        <section className="org-hero" aria-labelledby="org-title">
          <span>ESTRUTURA ORGANIZACIONAL</span>
          <h1 id="org-title">Quem faz o RanBank.</h1>
          <p>Presidência, ouvidoria e quatro áreas de trabalho. Passe o mouse (ou toque) em um cargo para ver o crachá de quem está à frente.</p>
          <div><b>16</b><span>pessoas</span><i/><b>4</b><span>áreas</span></div>
        </section>
        <section className="org-chart-section" aria-label="Organograma do RanBank">
          <div className="org-chart-instruction"><span>ORGANOGRAMA INTERATIVO</span><p>Passe o mouse ou toque em um cargo para ver o crachá.</p></div>
          <div className="org-leadership">
            {slot(president, { className: "org-president", label: "PRESIDÊNCIA", title: "Presidente / CEO" }, "is-president")}
            {slot(ombudsman, { className: "org-ombudsman", label: "OUVIDORIA-GERAL", title: "Ouvidora-Geral" }, "is-ombudsman")}
            {slot(vice, { className: "org-vice", label: "LIDERANÇA EXECUTIVA", title: "Vice-Presidente" }, "is-vice")}
          </div>
          <div className="org-branches" aria-hidden="true" />
          <div className="org-departments">
            {departments.map((department) => (
              <article className="org-department" key={department.id}>
                <header><span>{department.accent}</span><h2>{department.title}</h2></header>
                <div>{department.roles.map((role) => slot(role, { title: role.chartTitle }))}</div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <PublicFooter />
      <RaniAssistant context="site" />
    </div>
  );
}
