"use client";

import type { ReactNode } from "react";

// Janela padrão do banco (usada pelas demonstrações de tecnologia e segurança).
export function BkSheet({ title, label, onClose, children, wide = false }: { title: string; label?: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="bk-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={`bk-sheet ${wide ? "is-wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="bk-sheet-head">
          <div>{label && <span className="bk-tag">{label}</span>}<h2>{title}</h2></div>
          <button className="bk-modal-close" type="button" onClick={onClose} aria-label="Fechar">×</button>
        </header>
        <div className="bk-sheet-body">{children}</div>
      </section>
    </div>
  );
}

export function BkLoading({ text }: { text: string }) {
  return <div className="bk-loading"><i className="bk-spinner" /><p>{text}</p></div>;
}

export function BkUnavailable() {
  return <div className="bk-loading"><strong>Não foi possível carregar agora.</strong><p>Tente de novo em alguns segundos.</p></div>;
}

export function riskTone(score: number) {
  return score >= 70 ? "is-bad" : score >= 40 ? "is-warn" : "is-ok";
}
