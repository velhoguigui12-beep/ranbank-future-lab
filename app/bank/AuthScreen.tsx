"use client";
/* eslint-disable @next/next/no-img-element, @next/next/no-html-link-for-pages -- The local brand image is reused by the installable banking shell; the link back to the public site should reload the page. */

import type { FormEvent } from "react";
import { formatBrazilianPhone, formatCpf, formatLoginIdentification, normalizeEmailInput } from "./inputMasks";

export type AuthMode = "login" | "create" | "recover";
export type SignupData = { customerName: string; documentId: string; email: string; phoneNumber: string; accessPin: string; transactionPin: string };
export type RecoveryData = { identification: string; email: string; transactionPin: string; newAccessPin: string };

type Props = {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  identification: string;
  setIdentification: (value: string) => void;
  pin: string;
  setPin: (value: string | ((current: string) => string)) => void;
  signup: SignupData;
  setSignup: (value: SignupData) => void;
  recovery: RecoveryData;
  setRecovery: (value: RecoveryData) => void;
  loading: boolean;
  progressMessage: string;
  error: string;
  clearError: () => void;
  onLogin: (event: FormEvent<HTMLFormElement>) => void;
  onCreate: (event: FormEvent<HTMLFormElement>) => void;
  onRecover: (event: FormEvent<HTMLFormElement>) => void;
  appendDigit: (digit: string) => void;
};

export default function AuthScreen(props: Props) {
  const submit = props.mode === "login" ? props.onLogin : props.mode === "create" ? props.onCreate : props.onRecover;
  const title = props.mode === "login" ? "Acesse sua conta" : props.mode === "create" ? "Crie sua conta de teste" : "Recupere seu acesso";
  const description = props.mode === "login"
    ? "Use seu CPF, número da conta ou e-mail."
    : props.mode === "create"
      ? "Use dados inventados. Esta conta existe só para testar o RanBank."
      : "Confirme seus dados e a senha para movimentar para criar uma nova senha de acesso.";

  const changeMode = (mode: AuthMode) => {
    props.setMode(mode);
    props.clearError();
  };

  return <main className="bk-auth">
    <section className="bk-auth-brand">
      <a className="bk-auth-back" href="/">← Voltar ao site</a>
      <span className="bk-logo"><img src="/ranbank-logo-transparent.png" alt="RanBank"/></span>
      <div className="bk-auth-message">
        <h1>Seu banco, simples e seguro.</h1>
        <p>Pix, cartão e extrato em um só lugar, com proteção em cada passo.</p>
        <ul>
          <li><b>✓</b>Senha guardada embaralhada</li>
          <li><b>✓</b>Senha separada para movimentar dinheiro</li>
          <li><b>✓</b>Confirmação de quem recebe o Pix</li>
        </ul>
      </div>
      <p className="bk-auth-notice"><strong>Projeto educacional.</strong> Contas e valores fictícios. Nunca use dados reais.</p>
    </section>
    <section className="bk-auth-panel">
      <form className="bk-auth-card" onSubmit={submit}>
        {props.mode === "recover" && <button className="bk-auth-link is-back" type="button" onClick={() => changeMode("login")}>← Voltar para entrar</button>}
        <header><h2>{title}</h2><p>{description}</p></header>
        {props.mode !== "recover" && <div className="bk-auth-tabs"><button type="button" aria-pressed={props.mode === "login"} className={props.mode === "login" ? "active" : ""} onClick={() => changeMode("login")}>Entrar</button><button type="button" aria-pressed={props.mode === "create"} className={props.mode === "create" ? "active" : ""} onClick={() => changeMode("create")}>Criar conta</button></div>}
        {props.mode === "login" && <>
          <label>CPF, conta ou e-mail<input value={props.identification} onChange={(event) => props.setIdentification(formatLoginIdentification(event.target.value))} autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={254} placeholder="Digite seu CPF, conta ou e-mail" aria-label="CPF, número da conta ou e-mail"/></label>
          <label>Senha de acesso (PIN)<input className="bk-auth-pin" type="password" value={props.pin} onChange={(event) => props.setPin(event.target.value.replace(/\D/g, "").slice(0,4))} autoComplete="current-password" inputMode="numeric" maxLength={4} placeholder="••••" aria-label="PIN de quatro dígitos"/></label>
          <div className="bk-keypad" aria-label="Teclado numérico">{[1,2,3,4,5,6,7,8,9].map((digit) => <button type="button" key={digit} onClick={() => props.appendDigit(String(digit))}>{digit}</button>)}<span aria-hidden="true"/><button type="button" onClick={() => props.appendDigit("0")}>0</button><button type="button" onClick={() => props.setPin((current) => current.slice(0,-1))} aria-label="Apagar último dígito">⌫</button></div>
        </>}
        {props.mode === "create" && <div className="bk-auth-fields">
          <label>Nome completo<input value={props.signup.customerName} onChange={(event) => props.setSignup({ ...props.signup, customerName: event.target.value })} autoComplete="name" required/></label>
          <label>CPF fictício<input value={props.signup.documentId} onChange={(event) => props.setSignup({ ...props.signup, documentId: formatCpf(event.target.value) })} inputMode="numeric" minLength={14} maxLength={14} placeholder="000.000.000-00" required/></label>
          <label>Telefone com DDD<input value={props.signup.phoneNumber} onChange={(event) => props.setSignup({ ...props.signup, phoneNumber: formatBrazilianPhone(event.target.value) })} autoComplete="tel-national" inputMode="tel" minLength={14} maxLength={15} placeholder="(00) 00000-0000" required/></label>
          <label>E-mail<input type="email" value={props.signup.email} onChange={(event) => props.setSignup({ ...props.signup, email: normalizeEmailInput(event.target.value) })} autoComplete="email" autoCapitalize="none" spellCheck={false} required/><small>E-mail, CPF e telefone viram chaves Pix.</small></label>
          <label>Senha de acesso (4 dígitos)<input type="password" value={props.signup.accessPin} onChange={(event) => props.setSignup({ ...props.signup, accessPin: event.target.value.replace(/\D/g, "").slice(0, 4) })} inputMode="numeric" minLength={4} maxLength={4} required/></label>
          <label>Senha para movimentar (4 dígitos)<input type="password" value={props.signup.transactionPin} onChange={(event) => props.setSignup({ ...props.signup, transactionPin: event.target.value.replace(/\D/g, "").slice(0, 4) })} inputMode="numeric" minLength={4} maxLength={4} required/><small>Use uma senha diferente da de acesso.</small></label>
        </div>}
        {props.mode === "recover" && <div className="bk-auth-fields">
          <label>CPF, conta ou e-mail<input value={props.recovery.identification} onChange={(event) => props.setRecovery({ ...props.recovery, identification: formatLoginIdentification(event.target.value) })} autoCapitalize="none" spellCheck={false} maxLength={254} required/></label>
          <label>E-mail cadastrado<input type="email" value={props.recovery.email} onChange={(event) => props.setRecovery({ ...props.recovery, email: normalizeEmailInput(event.target.value) })} autoComplete="email" autoCapitalize="none" spellCheck={false} required/></label>
          <label>Senha para movimentar (4 dígitos)<input type="password" value={props.recovery.transactionPin} onChange={(event) => props.setRecovery({ ...props.recovery, transactionPin: event.target.value.replace(/\D/g, "").slice(0, 4) })} inputMode="numeric" minLength={4} maxLength={4} required/></label>
          <label>Nova senha de acesso<input type="password" value={props.recovery.newAccessPin} onChange={(event) => props.setRecovery({ ...props.recovery, newAccessPin: event.target.value.replace(/\D/g, "").slice(0, 4) })} inputMode="numeric" minLength={4} maxLength={4} required/></label>
        </div>}
        {props.error && <p className="bk-error" role="alert">{props.error}</p>}
        <button className="bk-btn bk-btn-primary login-submit" disabled={props.loading || (props.mode === "login" && props.pin.length !== 4)}>{props.loading ? "Entrando…" : props.mode === "login" ? "Entrar com PIN" : props.mode === "create" ? "Criar e acessar conta" : "Definir nova senha"}</button>
        {props.loading && props.progressMessage && <p className="bk-muted bk-auth-progress" role="status">{props.progressMessage}</p>}
        {props.mode === "login" && <><button className="bk-auth-link" type="button" onClick={() => changeMode("recover")}>Esqueci meu PIN</button><p className="bk-auth-soon biometric-login">Biometria indisponível nesta versão de demonstração.</p></>}
      </form>
    </section>
  </main>;
}
