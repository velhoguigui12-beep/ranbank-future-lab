"use client";

import { useEffect } from "react";

type Initiative = {
  chapter: string;
  title: string;
  description: string;
  impacts: string[];
};

const initiatives: Initiative[] = [
  {
    chapter: "1 · IA E BIG DATA",
    title: "RanBank Intelligence & Research",
    description: "Parcerias com universidades e centros de dados para desenvolver detecção de fraudes, segurança financeira e educação orientada por dados.",
    impacts: ["Pesquisa aplicada", "Segurança financeira", "Formação de talentos"],
  },
  {
    chapter: "2 · IOT E SUSTENTABILIDADE",
    title: "RanBank Smart & Green",
    description: "Apoio a projetos de cidades inteligentes, eficiência energética e sensores para reduzir desperdícios em agências, equipamentos e data centers.",
    impacts: ["Eficiência energética", "IoT aplicado", "Tecnologia sustentável"],
  },
  {
    chapter: "3 · VR E RA",
    title: "RanBank Immersive Lab",
    description: "Parcerias com laboratórios de realidade aumentada e virtual para treinamento, inclusão digital, acessibilidade e novas experiências de atendimento.",
    impacts: ["Treinamento", "Acessibilidade", "Experiência"],
  },
  {
    chapter: "4 · COMPUTAÇÃO EM NUVEM",
    title: "RanCloud Innovation Program",
    description: "Infraestrutura e apoio técnico para startups, laboratórios e projetos que precisam de disponibilidade, escala e recuperação de falhas.",
    impacts: ["Escalabilidade", "Continuidade", "Ecossistema de inovação"],
  },
  {
    chapter: "5 · COMPARAÇÃO",
    title: "Conselho de Tecnologia RanBank",
    description: "O banco avalia impacto, custo, maturidade e risco para decidir onde aplicar e apoiar cada tecnologia de forma responsável.",
    impacts: ["Estratégia", "Custo x benefício", "Escolha responsável"],
  },
  {
    chapter: "6 · ROBÓTICA",
    title: "RanBank Robotics Initiative",
    description: "Apoio a institutos, universidades e centros de ciência robótica com bolsas, laboratórios e projetos de automação, acessibilidade e atendimento.",
    impacts: ["Pesquisa robótica", "Bolsas e laboratórios", "Impacto social"],
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
    let applying = false;

    const applyInstitutionalLayer = () => {
      if (applying) return;
      applying = true;

      try {
        setText(".future-heading span", "INSTITUTO RANBANK");
        setText(".future-heading small", "Tecnologia e inovação");
        setText(".future-card h2", "Inovação que conecta o banco ao futuro.");
        setText(".future-card > p", "Pesquisa, parcerias e tecnologia aplicada a serviços financeiros e à sociedade.");
        setButtonTextKeepingSpan(".future-card > button", "Conhecer iniciativas");

        setText(".lab-tag", "INSTITUTO RANBANK · 6 FRENTES DE INOVAÇÃO");
        setText(".lab-intro h2", "Tecnologia aplicada no banco e apoiada além dele.");

        const labIntroHeading = document.querySelector<HTMLElement>(".lab-intro h2");
        if (labIntroHeading && !document.querySelector(".lab-institute-copy")) {
          const paragraph = document.createElement("p");
          paragraph.className = "lab-institute-copy";
          paragraph.textContent = "O RanBank mantém conexões com universidades, institutos e centros de pesquisa para transformar tecnologias emergentes em serviços, pesquisa e impacto social.";
          labIntroHeading.insertAdjacentElement("afterend", paragraph);
        }

        if (document.querySelector(".lab-layout")) {
          setText(".topbar p", "Tecnologia e inovação");
          setText(".topbar h1", "Instituto RanBank");
        }

        const presentation = document.querySelector<HTMLElement>(".presentation-modal");
        if (presentation) {
          setText(".presentation-brand small", "INSTITUTO RANBANK DE TECNOLOGIA");
          setText(".speaker-note > b", "COMO APRESENTAR");

          const chapter = presentation.querySelector<HTMLElement>(".presentation-content > article > span")?.textContent?.trim() ?? "";
          const initiative = initiatives.find((item) => chapter.startsWith(item.chapter));
          const article = presentation.querySelector<HTMLElement>(".presentation-content > article");
          const speakerNote = article?.querySelector<HTMLElement>(".speaker-note");

          if (initiative && article && speakerNote) {
            let note = article.querySelector<HTMLElement>(".institution-note");
            if (!note) {
              note = document.createElement("div");
              note.className = "institution-note";
              speakerNote.insertAdjacentElement("beforebegin", note);
            }

            if (note.dataset.chapter !== initiative.chapter) {
              note.dataset.chapter = initiative.chapter;
              note.replaceChildren();

              const label = document.createElement("b");
              label.textContent = "CONEXÃO RANBANK";
              const title = document.createElement("strong");
              title.textContent = initiative.title;
              const description = document.createElement("p");
              description.textContent = initiative.description;
              const impacts = document.createElement("div");
              impacts.className = "presentation-impact";

              initiative.impacts.forEach((impact) => {
                const chip = document.createElement("span");
                chip.textContent = impact;
                impacts.appendChild(chip);
              });

              note.append(label, title, description, impacts);
            }
          }
        }
      } finally {
        applying = false;
      }
    };

    applyInstitutionalLayer();
    const observer = new MutationObserver(applyInstitutionalLayer);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
