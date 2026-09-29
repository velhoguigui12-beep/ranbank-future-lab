import type { Metadata } from "next";
import ProjectsPublicPage from "../ProjectsPublicPage";

export const metadata: Metadata = {
  title: "Projetos e impacto | RanBank",
  description:
    "Conheça as propostas sociais do RanBank, as referências públicas e os compromissos de transparência.",
};

export default function ProjetosPage() {
  return <ProjectsPublicPage />;
}
