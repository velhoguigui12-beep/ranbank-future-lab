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

    public void debit(BigDecimal amount) {
        if (amount.compareTo(balance) > 0) {
            throw new IllegalArgumentException("Saldo insuficiente para realizar este Pix.");
        }
        balance = balance.subtract(amount);
    }
}

