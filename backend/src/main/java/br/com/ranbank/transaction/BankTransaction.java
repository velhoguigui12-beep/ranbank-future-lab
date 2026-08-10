package br.com.ranbank.transaction;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "bank_transactions")
public class BankTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String detail;
    private BigDecimal amount;
    private String type;

    protected BankTransaction() {}

    public BankTransaction(String title, String detail, BigDecimal amount, String type) {
        this.title = title;
        this.detail = detail;
        this.amount = amount;
        this.type = type;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDetail() { return detail; }
    public BigDecimal getAmount() { return amount; }
    public String getType() { return type; }
}
