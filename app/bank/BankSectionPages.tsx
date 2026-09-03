"use client";
/* eslint-disable @next/next/no-img-element -- The Ecocard artwork is a local presentation asset. */

import { sortTransactionsNewestFirst, transactionDescription, type TransactionView } from "./transactionFormatting";

type AccountData = {
  customerName: string;
  balance: number;
  account: string;
  email: string;
  phoneNumber: string;
  maskedDocument: string;
  createdAt: string;
  transactions: TransactionView[];
};

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function AccountSectionPage({ data, onStatement }: { data: AccountData; onStatement: () => void }) {
  const transactions = sortTransactionsNewestFirst(data.transactions).slice(0, 8);
  return (
    <div className="bank-section-page account-section-page">
      <header className="bank-section-heading"><span>CONTA DIGITAL</span><h1>Minha conta</h1><p>Dados, saldo e movimentações da conta autenticada.</p></header>
      <section className="account-page-summary">
        <div><span>Saldo disponível</span><strong>{money.format(data.balance)}</strong><small>Conta corrente · Agência 0001</small></div>
        <b>Conta {data.account}</b>
      </section>
      <section className="account-page-details" aria-label="Dados da conta">
        <article><span>Titular</span><strong>{data.customerName}</strong></article>
        <article><span>CPF</span><strong>{data.maskedDocument}</strong></article>
        <article><span>E-mail</span><strong>{data.email || "Não informado"}</strong></article>
        <article><span>Telefone</span><strong>{data.phoneNumber || "Não informado"}</strong></article>
        <article><span>Cliente desde</span><strong>{data.createdAt ? new Date(data.createdAt).toLocaleDateString("pt-BR") : "Hoje"}</strong></article>
        <article><span>Status</span><strong className="account-page-safe">Ativa e protegida</strong></article>
      </section>
      <section className="account-page-transactions">
        <header><div><span>MOVIMENTAÇÕES</span><h2>Mais recentes</h2></div><button onClick={onStatement}>Ver extrato completo</button></header>
        <div>{transactions.map((transaction) => <article key={transaction.id}><i className={transaction.type}>{transaction.type === "credit" ? "↓" : "↑"}</i><div><strong>{transaction.title}</strong><small>{transactionDescription(transaction)}</small></div><b className={transaction.type}>{transaction.type === "credit" ? "+ " : "- "}{money.format(Math.abs(transaction.amount))}</b></article>)}</div>
      </section>
    </div>
  );
}

export function CardsSectionPage() {
  return (
    <div className="bank-section-page cards-section-page">
      <header className="bank-section-heading"><span>ECOCARD RANBANK</span><h1>Meu cartão</h1><p>Cartão sustentável desenvolvido com materiais de origem consciente.</p></header>
      <figure className="ecocard-page-art"><img src="/images/ranbank-ecocard-reference.jpeg" alt="Cartão Eco RanBank sustentável em frente à agência de Brasília" /></figure>
    </div>
  );
}

export function SecuritySectionPage({ onAuthentication, onThreat, onDevices }: {
  onAuthentication: () => void;
  onThreat: () => void;
  onDevices: () => void;
}) {
  return (
    <div className="bank-section-page security-section-page">
      <header className="bank-section-heading"><span>CENTRAL DE PROTEÇÃO</span><h1>Segurança da conta</h1><p>Acompanhe as camadas que protegem seu acesso e suas movimentações.</p></header>
      <section className="security-page-health"><div className="security-page-shield">✓</div><div><span>NÍVEL DE PROTEÇÃO</span><strong>Conta protegida</strong><p>As principais camadas de segurança estão ativas.</p></div><b>92<small>/100</small></b></section>
      <section className="security-page-grid">
        <article><span>PIN transacional</span><strong>Ativado</strong><i/></article>
        <article><span>Avisos de movimentação</span><strong>Ativados</strong><i/></article>
        <article><span>Dispositivo atual</span><strong>Confiável</strong><i/></article>
        <article><span>Biometria por passkey</span><strong className="security-page-pending">Não cadastrada</strong><i className="pending"/></article>
      </section>
      <section className="security-page-actions">
        <button onClick={onAuthentication}><b>ID</b><span><strong>Testar autenticação</strong><small>Compare um acesso habitual com um suspeito.</small></span><i>→</i></button>
        <button onClick={onThreat}><b>!</b><span><strong>Simular ameaça</strong><small>Entenda phishing, ransomware e trojan.</small></span><i>→</i></button>
        <button onClick={onDevices}><b>IoT</b><span><strong>Gerenciar dispositivos</strong><small>Confira confiança, telemetria e bloqueios.</small></span><i>→</i></button>
      </section>
    </div>
  );
}
