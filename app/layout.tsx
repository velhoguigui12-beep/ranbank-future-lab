import type { Metadata } from "next";
import { Geist } from "next/font/google";
import InstitutionalExperience from "./InstitutionalExperience";
import PublicSiteGate from "./PublicSiteGate";
import PwaInstaller from "./PwaInstaller";
import BackendWarmup from "./BackendWarmup";
import AccountLoadGuard from "./bank/AccountLoadGuard";
import "./globals.css";
import "./banking-suite.css";
import "./innovation-hub.css";
import "./market-ui.css";
import "./institutional-content.css";
import "./palette-refresh.css";
import "./public-site.css";
import "./account-load-guard.css";
import "./pwa-install.css";
import "./projects-impact.css";
import "./bank-theme.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RanBank | Banco digital de Brasília para o futuro",
  description: "Conta digital RanBank com segurança em camadas, Pix, cartões, serviços e tecnologia com referência em Brasília, DF.",
  icons: { icon: "/ranbank-logo.jpeg" },
  appleWebApp: { capable: true, title: "Ranbank", statusBarStyle: "black-translucent" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><head><meta name="referrer" content="strict-origin-when-cross-origin"/><meta name="theme-color" content="#061a33"/><link rel="preconnect" href="https://ranbank-api.onrender.com" crossOrigin="anonymous"/></head><body className={geist.variable}><InstitutionalExperience /><PublicSiteGate /><BackendWarmup />{children}<AccountLoadGuard /><PwaInstaller /></body></html>;
}
