import type { Metadata } from "next";
import { Geist } from "next/font/google";
import InstitutionalExperience from "./InstitutionalExperience";
import "./globals.css";
import "./banking-suite.css";
import "./innovation-hub.css";
import "./market-ui.css";
import "./institutional-content.css";
import "./palette-refresh.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ranbank | Banco Digital",
  description: "Conta digital Ranbank com segurança, serviços financeiros e iniciativas de tecnologia e inovação.",
  icons: { icon: "/ranbank-logo.jpeg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className={geist.variable}><InstitutionalExperience />{children}</body></html>;
}
