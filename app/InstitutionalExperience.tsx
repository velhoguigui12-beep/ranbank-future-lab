"use client";

import { useEffect } from "react";

type Initiative = {
  chapter: string;
  title: string;
  description: string;
  impacts: string[];
  bankApplication: string;
};

const initiatives: Initiative[] = [
  {
    chapter: "1 · IA E BIG DATA",
    title: "RanBank Intelligence & Research",
    description: "Parcerias com universidades e centros de dados para desenvolver detecção de fraudes, segurança financeira e educação orientada por dados.",
    impacts: ["Pesquisa aplicada", "Segurança financeira", "Formação de talentos"],
    bankApplication: "No RanBank, IA e Big Data analisam padrões de transações, identificam comportamentos fora do comum e ajudam equipes humanas a tomar decisões de segurança com mais contexto.",
  },
  {
    chapter: "2 · IOT E SUSTENTABILIDADE",
    title: "RanBank Smart & Green",
    description: "Apoio a projetos de cidades inteligentes, eficiência energética e sensores para reduzir desperdícios em agências, equipamentos e data centers.",
    impacts: ["Eficiência energética", "IoT aplicado", "Tecnologia sustentável"],
    bankApplication: "Sensores conectados permitem acompanhar consumo de energia, condições de equipamentos e uso das agências em tempo real, ajudando o banco a reduzir desperdícios e antecipar manutenção.",
  },
  {
    chapter: "3 · VR E RA",
    title: "RanBank Immersive Lab",
    description: "Parcerias com laboratórios de realidade aumentada e virtual para treinamento, inclusão digital, acessibilidade e novas experiências de atendimento.",
    impacts: ["Treinamento", "Acessibilidade", "Experiência"],
    bankApplication: "A realidade virtual pode treinar equipes em situações complexas, enquanto a realidade aumentada pode orientar clientes em serviços, atendimento e uso de equipamentos de forma mais intuitiva.",
  },
  {
    chapter: "4 · COMPUTAÇÃO EM NUVEM",
    title: "RanCloud Innovation Program",
    description: "Infraestrutura e apoio técnico para startups, laboratórios e projetos que precisam de disponibilidade, escala e recuperação de falhas.",
    impacts: ["Escalabilidade", "Continuidade", "Ecossistema de inovação"],
    bankApplication: "A nuvem mantém os serviços digitais disponíveis, permite crescer a capacidade quando a demanda aumenta e ajuda o RanBank a recuperar sistemas com rapidez quando alguma região apresenta falha.",
  },
  {
    chapter: "5 · COMPARAÇÃO",
    title: "Conselho de Tecnologia RanBank",
    description: "O banco avalia impacto, custo, maturidade e risco para decidir onde aplicar e apoiar cada tecnologia de forma responsável.",
    impacts: ["Estratégia", "Custo x benefício", "Escolha responsável"],
    bankApplication: "O RanBank compara tecnologias conforme o problema que precisa resolver. Segurança, eficiência, escala, experiência e custo recebem pesos diferentes antes de qualquer investimento ou implantação.",
  },
  {
    chapter: "6 · ROBÓTICA",
    title: "RanBank Robotics Initiative",
    description: "Apoio a institutos, universidades e centros de ciência robótica com bolsas, laboratórios e projetos de automação, acessibilidade e atendimento.",
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
      setText(".future-heading small", "Tecnologia e inovação");
      setText(".future-card h2", "Inovação que conecta o banco ao futuro.");
      setText(".future-card > p", "Pesquisa, parcerias e tecnologia aplicada a serviços financeiros e à sociedade.");
      setButtonTextKeepingSpan(".future-card > button", "Conhecer iniciativas");

      setText(".lab-tag", "INSTITUTO RANBANK · 6 FRENTES DE INOVAÇÃO");
      setText(".lab-intro h2", "Tecnologia aplicada no banco e apoiada além dele.");

      if (document.querySelector(".lab-layout")) {
        setText(".topbar p", "Tecnologia e inovação");
        setText(".topbar h1", "Instituto RanBank");
      }

      const presentation = document.querySelector<HTMLElement>(".presentation-modal");
      if (!presentation) return;

      setText(".presentation-brand small", "INSTITUTO RANBANK DE TECNOLOGIA");

      const chapter = presentation.querySelector<HTMLElement>(".presentation-content > article > span")?.textContent?.trim() ?? "";
      const initiative = initiatives.find((item) => chapter.startsWith(item.chapter));
      const speakerNote = presentation.querySelector<HTMLElement>(".speaker-note");
      if (!initiative || !speakerNote) return;

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
