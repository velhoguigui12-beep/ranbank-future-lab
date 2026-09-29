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
import "./organization-chart.css";
import "./bank-theme.css";
import "./bank-v2.css";
import "./bank-section-pages.css";
import "./clarity-refresh.css";
import "./site.css";
import "./bank-clean.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RanBank | Banco digital educacional",
  description: "Banco digital educacional criado por jovens aprendizes: conta, Pix e cartão com proteção contra golpes e tecnologia explicada de forma simples.",
  icons: { icon: "/ranbank-logo.jpeg" },
  appleWebApp: { capable: true, title: "RanBank", statusBarStyle: "black-translucent" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><head><meta name="referrer" content="strict-origin-when-cross-origin"/><meta name="theme-color" content="#061a33"/></head><body className={geist.variable}><InstitutionalExperience /><PublicSiteGate /><BackendWarmup />{children}<AccountLoadGuard /><PwaInstaller /><aside className="rb-noncommercial-seal" role="note" aria-label="Projeto demonstrativo, sem valor comercial"><span>Projeto demonstrativo</span><strong>Sem valor comercial</strong></aside></body></html>;
}
