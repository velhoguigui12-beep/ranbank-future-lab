import type { Metadata } from "next";
import OrganizationPublicPage from "../OrganizationPublicPage";

export const metadata: Metadata = {
  title: "Organograma | RanBank",
  description: "Conheça os cargos, as pessoas e as responsabilidades que formam a estrutura organizacional demonstrativa do RanBank.",
};

export default function OrganogramaPage() {
  return <OrganizationPublicPage />;
}
