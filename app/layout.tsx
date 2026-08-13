import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import "./banking-suite.css";
import "./innovation-hub.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ranbank | Future Lab",
  description: "Experiência de banco digital, segurança e tecnologias emergentes.",
  icons: { icon: "/ranbank-logo.jpeg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className={geist.variable}>{children}</body></html>;
}
