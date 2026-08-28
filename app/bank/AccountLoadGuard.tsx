"use client";

import { useSyncExternalStore } from "react";
import { getAccountLoadSnapshot, subscribeAccountLoad } from "./api";

const serverSnapshot = { status: "idle", message: "" } as const;

export default function AccountLoadGuard() {
  const state = useSyncExternalStore(subscribeAccountLoad, getAccountLoadSnapshot, () => serverSnapshot);

  if (state.status !== "loading" && state.status !== "error") return null;

  return (
    <div className="account-load-guard" role={state.status === "error" ? "alert" : "status"} aria-live="polite">
      <section className="account-load-card">
        <img src="/ranbank-logo.jpeg" alt="Ranbank" />
        {state.status === "loading" ? (
          <>
            <i className="account-load-spinner" />
            <h2>Carregando sua conta…</h2>
            <p>{state.message || "Confirmando os dados da conta autenticada."}</p>
            <small>O RanBank nunca substitui sua conta por dados de outro cliente enquanto carrega.</small>
          </>
        ) : (
          <>
            <span className="account-load-warning">!</span>
            <h2>Não foi possível abrir sua conta</h2>
            <p>{state.message}</p>
            <small>Se o Render estiver iniciando o backend, aguarde alguns segundos e tente novamente.</small>
            <button type="button" onClick={() => window.location.reload()}>Tentar novamente</button>
          </>
        )}
      </section>
    </div>
  );
}
