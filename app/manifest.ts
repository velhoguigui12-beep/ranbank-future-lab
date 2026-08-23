import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ranbank Banco Digital",
    short_name: "Ranbank",
    description: "Conta digital educacional com Pix, segurança e Future Lab.",
    start_url: "/banco",
    scope: "/",
    display: "standalone",
    background_color: "#07152a",
    theme_color: "#07152a",
    orientation: "portrait-primary",
    categories: ["finance", "education"],
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/ranbank-logo.jpeg", sizes: "any", type: "image/jpeg", purpose: "any" },
    ],
  };
}
