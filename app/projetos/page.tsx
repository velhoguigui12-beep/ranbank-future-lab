import type { Metadata } from "next";
import ProjectsPublicPage from "../ProjectsPublicPage";

export const metadata: Metadata = {
  title: "Portal de Impacto | RanBank",
  description:
    "Conheça os projetos sociais simulados, as referências públicas e os compromissos de impacto do RanBank.",
};

export default function ProjetosPage() {
  return <ProjectsPublicPage />;
}
