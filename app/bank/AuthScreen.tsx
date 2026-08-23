"use client";
/* eslint-disable @next/next/no-img-element -- The local brand image is reused by the installable banking shell. */

import type { FormEvent } from "react";

export type AuthMode = "login" | "create" | "recover";
export type SignupData = { customerName: string; documentId: string; email: string; accessPin: string; transactionPin: string };
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
  error: string;
  clearError: () => void;
  onLogin: (event: FormEvent<HTMLFormElement>) => void;
  onCreate: (event: FormEvent<HTMLFormElement>) => void;
  onRecover: (event: FormEvent<HTMLFormElement>) => void;
  appendDigit: (digit: string) => void;
};

export default function AuthScreen(props: Props) {
  const submit = props.mode === "login" ? props.onLogin : props.mode === "create" ? props.onCreate : props.onRecover;
  const title = props.mode === "login" ? "Entre na sua conta" : props.mode === "create" ? "Crie sua conta demo" : "Recupere seu PIN";
  const description = props.mode === "login"
    ? "Use seu CPF ou número da conta e o PIN de acesso."
    : props.mode === "create"
      ? "Seus dados ficam neste ambiente educacional e o e-mail vira sua chave Pix."
      : "Confirme CPF, e-mail e PIN transacional para definir um novo PIN de acesso.";

  const changeMode = (mode: AuthMode) => {
    props.setMode(mode);
    props.clearError();
  };

  return <main className="login-shell">
    <section className="login-visual" aria-hidden="true">
      <div className="login-brand"><img src="/ranbank-logo.jpeg" alt=""/><span>RANBANK<small>Future Lab · Banco Seguro</small></span></div>
      <div className="login-message"><span>SEGURANÇA EM CAMADAS</span><h1>Seu banco começa com uma identidade protegida.</h1><p>Uma experiência educacional que combina conta digital, autenticação e tecnologias emergentes.</p></div>
      <div className="login-security-points"><span><b>01</b>PIN protegido</span><span><b>02</b>Sessão temporária</span><span><b>03</b>Senha transacional</span></div>
    </section>
    <section className="login-panel">
      <form className={`login-card ${props.mode !== "login" ? "signup-card" : ""}`} onSubmit={submit}>
        <header><span>ACESSO SEGURO</span><h2>{title}</h2><p>{description}</p></header>
        <div className="auth-mode-tabs"><button type="button" className={props.mode === "login" ? "active" : ""} onClick={() => changeMode("login")}>Entrar</button><button type="button" className={props.mode === "create" ? "active" : ""} onClick={() => changeMode("create")}>Criar conta</button><button type="button" className={props.mode === "recover" ? "active" : ""} onClick={() => changeMode("recover")}>Recuperar PIN</button></div>
        {props.mode === "login" && <>
          <label>CPF ou conta<input value={props.identification} onChange={(event) => props.setIdentification(event.target.value.slice(0, 18))} autoComplete="username" inputMode="numeric" maxLength={18} placeholder="Digite seu CPF ou sua conta" aria-label="CPF ou número da conta"/></label>
          <label>PIN de acesso<input className="login-pin-input" type="password" value={props.pin} onChange={(event) => props.setPin(event.target.value.replace(/\D/g, "").slice(0,4))} autoComplete="current-password" inputMode="numeric" maxLength={4} placeholder="••••" aria-label="PIN de quatro dígitos"/></label>
          <div className="pin-dots" aria-hidden="true">{[0,1,2,3].map((index) => <i key={index} className={index < props.pin.length ? "filled" : ""}/>)}</div>
          <div className="numeric-keypad" aria-label="Teclado numérico">{[1,2,3,4,5,6,7,8,9].map((digit) => <button type="button" key={digit} onClick={() => props.appendDigit(String(digit))}>{digit}</button>)}<button type="button" className="biometric-key" disabled aria-label="Biometria indisponível">◎</button><button type="button" onClick={() => props.appendDigit("0")}>0</button><button type="button" className="erase-key" onClick={() => props.setPin((current) => current.slice(0,-1))} aria-label="Apagar último dígito">⌫</button></div>
        </>}
        {props.mode === "create" && <div className="signup-fields">
          <label>Nome completo<input value={props.signup.customerName} onChange={(event) => props.setSignup({ ...props.signup, customerName: event.target.value })} autoComplete="name" required/></label>
          <label>CPF fictício<input value={props.signup.documentId} onChange={(event) => props.setSignup({ ...props.signup, documentId: event.target.value.replace(/\D/g, "").slice(0, 11) })} inputMode="numeric" minLength={11} maxLength={11} required/></label>
          <label className="signup-wide">E-mail e chave Pix<input type="email" value={props.signup.email} onChange={(event) => props.setSignup({ ...props.signup, email: event.target.value })} autoComplete="email" required/></label>
          <label>PIN de acesso<input type="password" value={props.signup.accessPin} onChange={(event) => props.setSignup({ ...props.signup, accessPin: event.target.value.replace(/\D/g, "").slice(0, 4) })} inputMode="numeric" minLength={4} maxLength={4} required/></label>
          <label>PIN transacional<input type="password" value={props.signup.transactionPin} onChange={(event) => props.setSignup({ ...props.signup, transactionPin: event.target.value.replace(/\D/g, "").slice(0, 4) })} inputMode="numeric" minLength={4} maxLength={4} required/></label>
        </div>}
        {props.mode === "recover" && <div className="signup-fields recovery-fields">
          <label>CPF ou conta<input value={props.recovery.identification} onChange={(event) => props.setRecovery({ ...props.recovery, identification: event.target.value.slice(0, 18) })} required/></label>
          <label>E-mail cadastrado<input type="email" value={props.recovery.email} onChange={(event) => props.setRecovery({ ...props.recovery, email: event.target.value })} required/></label>
          <label>PIN transacional<input type="password" value={props.recovery.transactionPin} onChange={(event) => props.setRecovery({ ...props.recovery, transactionPin: event.target.value.replace(/\D/g, "").slice(0, 4) })} inputMode="numeric" minLength={4} maxLength={4} required/></label>
          <label>Novo PIN de acesso<input type="password" value={props.recovery.newAccessPin} onChange={(event) => props.setRecovery({ ...props.recovery, newAccessPin: event.target.value.replace(/\D/g, "").slice(0, 4) })} inputMode="numeric" minLength={4} maxLength={4} required/></label>
        </div>}
        {props.error && <p className="login-error" role="alert">{props.error}</p>}
        <button className="login-submit" disabled={props.loading || (props.mode === "login" && props.pin.length !== 4)}>{props.loading ? "Processando…" : props.mode === "login" ? "Entrar com PIN" : props.mode === "create" ? "Criar e acessar conta" : "Definir novo PIN"}</button>
        {props.mode === "login" && <><button className="biometric-login" type="button" disabled><span>◎</span><div><strong>Entrar com biometria</strong><small>Indisponível neste dispositivo</small></div></button><div className="demo-credentials"><b>ACESSO PARA APRESENTAÇÃO</b><span>CPF 123.456.789-09</span><span>PIN 2580</span></div></>}
        <footer>Conexão protegida · sessão temporária</footer>
      </form>
    </section>
  </main>;
}
