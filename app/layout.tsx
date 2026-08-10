import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ranbank | Future Lab",
  description: "SimulaÃ§Ã£o educacional de banco digital, seguranÃ§a e tecnologias emergentes.",
  icons: { icon: "/ranbank-logo.jpeg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className={geist.variable}>{children}</body></html>;
}

