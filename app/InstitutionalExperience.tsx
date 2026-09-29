"use client";

import { useEffect } from "react";

type Initiative = {
  chapter: string;
  displayChapter: string;
  title: string;
  description: string;
  impacts: string[];
  bankApplication: string;
};

const initiatives: Initiative[] = [
  {
    chapter: "1 · IA E BIG DATA",
    displayChapter: "1 · PROTEÇÃO E DADOS",
    title: "Segurança e análise de movimentações",
    description: "Estudo de formas simples e responsáveis de reconhecer fraudes e apoiar a educação financeira.",
    impacts: ["Proteção", "Educação financeira", "Decisão humana"],
    bankApplication: "O RanBank observa padrões de movimentação e sinaliza situações incomuns para que uma pessoa possa tomar a decisão final.",
  },
  {
    chapter: "2 · IOT E SUSTENTABILIDADE",
    displayChapter: "2 · BANCO SUSTENTÁVEL",
    title: "Uso responsável de recursos",
    description: "Ideias para reduzir desperdícios de energia, materiais e equipamentos nas operações do banco.",
    impacts: ["Menos desperdício", "Energia consciente", "Responsabilidade"],
    bankApplication: "O banco pode acompanhar o consumo de energia e as condições dos equipamentos para reduzir desperdícios e prevenir falhas.",
  },
  {
    chapter: "3 · VR E RA",
    displayChapter: "3 · EXPERIÊNCIAS ACESSÍVEIS",
    title: "Atendimento para todas as pessoas",
    description: "Testes de novas formas de treinamento, inclusão digital, acessibilidade e atendimento.",
    impacts: ["Treinamento", "Acessibilidade", "Experiência"],
    bankApplication: "A realidade virtual pode treinar equipes em situações complexas, enquanto a realidade aumentada pode orientar clientes em serviços, atendimento e uso de equipamentos de forma mais intuitiva.",
  },
  {
    chapter: "4 · COMPUTAÇÃO EM NUVEM",
    displayChapter: "4 · SERVIÇOS DISPONÍVEIS",
    title: "Banco sempre disponível",
    description: "Estrutura de apoio para que os serviços continuem funcionando mesmo quando uma parte do sistema falha.",
    impacts: ["Escalabilidade", "Continuidade", "Ecossistema de inovação"],
    bankApplication: "A nuvem mantém os serviços digitais disponíveis, permite crescer a capacidade quando a demanda aumenta e ajuda o RanBank a recuperar sistemas com rapidez quando alguma região apresenta falha.",
  },
  {
    chapter: "5 · COMPARAÇÃO",
    displayChapter: "5 · ESCOLHAS RESPONSÁVEIS",
    title: "Avaliação das soluções",
    description: "O banco avalia impacto, custo, maturidade e risco para decidir onde aplicar e apoiar cada tecnologia de forma responsável.",
    impacts: ["Estratégia", "Custo x benefício", "Escolha responsável"],
    bankApplication: "O RanBank compara tecnologias conforme o problema que precisa resolver. Segurança, eficiência, escala, experiência e custo recebem pesos diferentes antes de qualquer investimento ou implantação.",
  },
  {
    chapter: "6 · ROBÓTICA",
    displayChapter: "6 · APOIO AO ATENDIMENTO",
    title: "Tecnologia a serviço das pessoas",
    description: "Apoio a projetos de automação, acessibilidade e atendimento com supervisão humana.",
    impacts: ["Pesquisa robótica", "Bolsas e laboratórios", "Impacto social"],
    bankApplication: "Dentro do banco, a robótica pode apoiar recepção, acessibilidade, inspeção e tarefas repetitivas. Decisões sensíveis continuam sob responsabilidade humana.",
  },
];

function setText(selector: string, text: string) {
  const element = document.querySelector<HTMLElement>(selector);
  if (element && element.textContent !== text) element.textContent = text;
}

function setButtonTextKeepingSpan(selector: string, text: string) {
  const button = document.querySelector<HTMLButtonElement>(selector);
  if (!button) return;
  const textNode = Array.from(button.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
  if (textNode && textNode.nodeValue?.trim() !== text.trim()) textNode.nodeValue = `${text} `;
}

export default function InstitutionalExperience() {
  useEffect(() => {
    let scheduled = false;

    const applyInstitutionalLayer = () => {
      scheduled = false;

      setText(".future-heading span", "INSTITUTO RANBANK");
      setText(".future-heading small", "Educação e impacto");
      setText(".future-card h2", "Conhecimento que melhora a vida das pessoas.");
      setText(".future-card > p", "Educação financeira, inclusão, sustentabilidade e atendimento acessível.");
      setButtonTextKeepingSpan(".future-card > button", "Conhecer projetos");

      setText(".lab-tag", "INSTITUTO RANBANK · CONHECIMENTO E IMPACTO");
      setText(".lab-intro h2", "Soluções simples para desafios reais.");

      if (document.querySelector(".lab-layout")) {
        setText(".topbar p", "Tecnologia e inovação");
        setText(".topbar h1", "Instituto RanBank");
      }

      const presentation = document.querySelector<HTMLElement>(".presentation-modal");
      if (!presentation) return;

      setText(".presentation-brand small", "INSTITUTO RANBANK DE TECNOLOGIA");

      const chapter = presentation.querySelector<HTMLElement>(".presentation-content > article > span")?.textContent?.trim() ?? "";
      const initiative = initiatives.find((item) => chapter.startsWith(item.chapter) || chapter.startsWith(item.displayChapter));
      const speakerNote = presentation.querySelector<HTMLElement>(".speaker-note");
      if (!initiative || !speakerNote) return;

      const chapterLabel = presentation.querySelector<HTMLElement>(".presentation-content > article > span");
      if (chapterLabel && chapterLabel.textContent !== initiative.displayChapter) chapterLabel.textContent = initiative.displayChapter;

      const speakerLabel = speakerNote.querySelector<HTMLElement>("b");
      const speakerText = speakerNote.querySelector<HTMLElement>("p");
      if (speakerLabel && speakerLabel.textContent !== "APLICAÇÃO NO RANBANK") speakerLabel.textContent = "APLICAÇÃO NO RANBANK";
      if (speakerText && speakerText.textContent !== initiative.bankApplication) speakerText.textContent = initiative.bankApplication;

      const connection = `${initiative.title} — ${initiative.description} ${initiative.impacts.join(" · ")}`;
      if (speakerNote.dataset.connection !== connection) speakerNote.dataset.connection = connection;
    };

    const scheduleApply = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(applyInstitutionalLayer);
    };

    scheduleApply();
    const observer = new MutationObserver(scheduleApply);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
