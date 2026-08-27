"use client";

import { useEffect, useState } from "react";

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "ranbank-pwa-dismissed-until";
const DISMISS_FOR_MS = 7 * 24 * 60 * 60 * 1000;
const SHOW_DELAY_MS = 30000;
const MOBILE_MAX_WIDTH = 820;

export default function PwaInstaller() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [eligible, setEligible] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);

    const capture = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPrompt);
    };
    const complete = () => {
      setPrompt(null);
      setShow(false);
    };

    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", complete);
    return () => {
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", complete);
    };
  }, []);

  useEffect(() => {
    const evaluate = () => {
      const dismissedUntil = Number(window.localStorage.getItem(DISMISS_KEY) || "0");
      const isDismissed = dismissedUntil > Date.now();
      const isBankRoute = window.location.pathname === "/banco";
      const isAuthenticated = Boolean(document.querySelector("main.bank-shell"));
      const isMobileViewport = window.innerWidth <= MOBILE_MAX_WIDTH;
      const hasBlockingUi = Boolean(document.querySelector(".modal-backdrop, .account-load-guard, .login-shell"));
      const canShow = Boolean(prompt) && isBankRoute && isAuthenticated && isMobileViewport && !isDismissed && !hasBlockingUi;
      setEligible(canShow);
      if (!canShow) setShow(false);
    };

    evaluate();
    const observer = new MutationObserver(evaluate);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    window.addEventListener("popstate", evaluate);
    window.addEventListener("resize", evaluate);
    return () => {
      observer.disconnect();
      window.removeEventListener("popstate", evaluate);
      window.removeEventListener("resize", evaluate);
    };
  }, [prompt]);

  useEffect(() => {
    if (!eligible) return;
    const timer = window.setTimeout(() => setShow(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [eligible]);

  if (!prompt || !show || !eligible) return null;

  const install = async () => {
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "dismissed") {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_FOR_MS));
    }
    setPrompt(null);
    setShow(false);
  };

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_FOR_MS));
    setShow(false);
  };

  return (
    <aside className="pwa-install-card" aria-label="Instalar aplicativo Ranbank">
      <button className="pwa-install-main" onClick={install}>
        <span>↓</span>
        <div><strong>Instalar Ranbank</strong><small>Adicionar ao celular</small></div>
      </button>
      <button className="pwa-install-dismiss" onClick={dismiss} aria-label="Agora não">×</button>
    </aside>
  );
}
