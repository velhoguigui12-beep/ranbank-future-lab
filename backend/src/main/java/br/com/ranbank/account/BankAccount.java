package br.com.ranbank.account;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "bank_accounts")
public class BankAccount {
    @Id
    private Long id;
    private String customerName;
    private String accountNumber;
    private BigDecimal balance;
    private String documentId;
    private String accessPinHash;
    private String transactionPinHash;
    private BigDecimal savingsBalance = BigDecimal.ZERO;
    private BigDecimal savingsGoal = new BigDecimal("5000.00");
    private BigDecimal cardLimit = new BigDecimal("6000.00");
    private BigDecimal cardSpent = new BigDecimal("1248.90");
    private boolean cardBlocked;

    protected BankAccount() {}

    public BankAccount(Long id, String customerName, String accountNumber, BigDecimal balance) {
        this.id = id;
        this.customerName = customerName;
        this.accountNumber = accountNumber;
        this.balance = balance;
    }

    public Long getId() { return id; }
    public String getCustomerName() { return customerName; }
    public String getAccountNumber() { return accountNumber; }
    public BigDecimal getBalance() { return balance; }
    public String getDocumentId() { return documentId; }
    public String getAccessPinHash() { return accessPinHash; }
    public String getTransactionPinHash() { return transactionPinHash; }
    public BigDecimal getSavingsBalance() { return savingsBalance == null ? BigDecimal.ZERO : savingsBalance; }
    public BigDecimal getSavingsGoal() { return savingsGoal == null ? new BigDecimal("5000.00") : savingsGoal; }
    public BigDecimal getCardLimit() { return cardLimit == null ? new BigDecimal("6000.00") : cardLimit; }
    public BigDecimal getCardSpent() { return cardSpent == null ? new BigDecimal("1248.90") : cardSpent; }
    public boolean isCardBlocked() { return cardBlocked; }

    public void configureDemoCredentials(String documentId, String accessPinHash, String transactionPinHash) {
        this.documentId = documentId;
        this.accessPinHash = accessPinHash;
        this.transactionPinHash = transactionPinHash;
    }

    public void debit(BigDecimal amount) {
        if (amount.compareTo(balance) > 0) {
            throw new IllegalArgumentException("Saldo insuficiente para realizar este Pix.");
        }
        balance = balance.subtract(amount);
    }

    public void credit(BigDecimal amount) {
        if (amount == null || amount.signum() <= 0) throw new IllegalArgumentException("Informe um valor positivo.");
        balance = balance.add(amount);
    }

    public void depositSavings(BigDecimal amount) {
        debit(amount);
        savingsBalance = getSavingsBalance().add(amount);
    }

    public void withdrawSavings(BigDecimal amount) {
        if (amount == null || amount.signum() <= 0 || amount.compareTo(getSavingsBalance()) > 0) {
            throw new IllegalArgumentException("Saldo insuficiente no cofrinho.");
        }
        savingsBalance = getSavingsBalance().subtract(amount);
        credit(amount);
    }

    public void setSavingsGoal(BigDecimal goal) {
        if (goal == null || goal.signum() <= 0) throw new IllegalArgumentException("A meta deve ser positiva.");
        savingsGoal = goal;
    }

    public void toggleCard() { cardBlocked = !cardBlocked; }

    public void updateCardLimit(BigDecimal newLimit) {
        if (newLimit == null || newLimit.compareTo(getCardSpent()) < 0 || newLimit.compareTo(new BigDecimal("20000")) > 0) {
            throw new IllegalArgumentException("O limite deve cobrir a fatura atual e não pode ultrapassar R$ 20.000,00.");
        }
        cardLimit = newLimit;
    }
}
