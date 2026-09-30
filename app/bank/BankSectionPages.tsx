"use client";

import RanFlow from "./RanFlow";
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
  const transactions = sortTransactionsNewestFirst(data.transactions).slice(0, 5);
  const details = [
    ["Titular", data.customerName],
    ["Agência", "0001"],
    ["Conta", data.account],
    ["CPF", data.maskedDocument],
    ["E-mail", data.email || "Não informado"],
    ["Telefone", data.phoneNumber || "Não informado"],
    ["Cliente desde", data.createdAt ? new Date(data.createdAt).toLocaleDateString("pt-BR") : "Hoje"],
  ];
  return (
    <div className="bk-page account-section-page">
      <header className="bk-page-head"><h1>Minha conta</h1><p>Seus dados e o saldo da conta.</p></header>
      <section className="bk-panel">
        <small className="bk-muted">Saldo disponível</small>
        <strong className="bk-balance">{money.format(data.balance)}</strong>
      </section>
      <section className="bk-panel">
        <h2 className="bk-panel-title">Dados da conta</h2>
        <dl className="bk-details">
          {details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
      </section>
      <section className="bk-panel">
        <button className="bk-row" onClick={onStatement}><span>Movimentações recentes</span><span className="bk-row-link">Ver extrato</span></button>
        {transactions.length ? (
          <ul className="bk-list">
            {transactions.map((transaction) => (
              <li key={transaction.id}>
                <div>
                  <span className={`bk-tx-icon ${transaction.type}`} aria-hidden="true">{transaction.type === "credit" ? "↓" : "↑"}</span>
                  <span className="bk-tx-copy"><strong>{transaction.title}</strong><small>{transactionDescription(transaction)}</small></span>
                  <b className={transaction.type}>{transaction.type === "credit" ? "+ " : "- "}{money.format(Math.abs(transaction.amount))}</b>
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="bk-muted">Nenhuma movimentação ainda.</p>}
      </section>
    </div>
  );
}

const protections = [
  ["Senha guardada embaralhada", "Nem a equipe do banco consegue ler a sua senha."],
  ["Senha só para movimentar", "Pix e pagamentos pedem uma senha de 4 dígitos diferente da senha de entrar."],
  ["Nome de quem recebe", "Antes de confirmar o Pix, você vê para quem o dinheiro vai."],
  ["Acesso com prazo", "Depois de 30 minutos sem uso, é preciso entrar de novo."],
  ["Cartão bloqueado em um toque", "Perdeu o cartão ou desconfiou de algo? Bloqueie na área Cartão."],
];

export function SecuritySectionPage({ transactions, onAuthentication, onThreat, onDevices, onAttack }: {
  transactions: TransactionView[];
  onAuthentication: () => void;
  onThreat: () => void;
  onDevices: () => void;
  onAttack: () => void;
}) {
  return (
    <div className="bk-page security-section-page">
      <header className="bk-page-head"><h1>Segurança</h1><p>O que protege a sua conta e como o banco decide o que é suspeito.</p></header>
      <section className="bk-panel atk-cta">
        <div>
          <span className="bk-tag">Simulação de ataque</span>
          <h2>Veja um golpe pelos olhos do golpista</h2>
          <p>Uma mensagem falsa, um site copiado e a tela do hacker capturando tudo. Depois, ligue as defesas do banco e veja se o ataque passa.</p>
        </div>
        <button type="button" className="bk-btn bk-btn-primary" onClick={onAttack}>Começar a simulação</button>
      </section>
      <RanFlow transactions={transactions} />
      <section className="bk-panel">
        <h2 className="bk-panel-title">O que protege a sua conta</h2>
        <ul className="bk-checks">
          {protections.map(([title, text]) => <li key={title}><span aria-hidden="true">✓</span><div><strong>{title}</strong><small>{text}</small></div></li>)}
        </ul>
      </section>
      <section className="bk-panel bk-tip">
        <strong>O RanBank nunca pede sua senha por mensagem.</strong>
        <p>Nem por SMS, WhatsApp, e-mail ou ligação. Se alguém pedir, é golpe.</p>
      </section>
      <h2 className="bk-section-title">Aprenda na prática</h2>
      <div className="bk-topics">
        <button onClick={onAuthentication}><span aria-hidden="true">ID</span><strong>Entrada suspeita?</strong><small>Monte uma tentativa de acesso e veja o banco decidir.</small></button>
        <button onClick={onAttack}><span aria-hidden="true">&gt;_</span><strong>Simular um ataque</strong><small>Siga um golpe do SMS até a conta e teste as defesas.</small></button>
        <button onClick={onThreat}><span aria-hidden="true">!</span><strong>Isso é golpe?</strong><small>Escreva uma mensagem e veja os sinais de golpe.</small></button>
        <button onClick={onDevices}><span aria-hidden="true">▯</span><strong>Aparelhos conectados</strong><small>Veja quem acessa a conta e bloqueie o que não reconhecer.</small></button>
      </div>
    </div>
  );
}
