package br.com.ranbank.transaction;

import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "bank_transactions")
public class BankTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long accountId;
    private String title;
    private String detail;
    @Column(precision = 19, scale = 2)
    private BigDecimal amount;
    private String type;
    private String transferId;
    private Long counterpartyAccountId;
    private Instant occurredAt = Instant.now();
    private String status = "COMPLETED";
    private String idempotencyKey;

    protected BankTransaction() {}

    public BankTransaction(Long accountId, String title, String detail, BigDecimal amount, String type) {
        this.accountId = accountId;
        this.title = title;
        this.detail = detail;
        this.amount = amount;
        this.type = type;
    }

    public BankTransaction(Long accountId, String title, String detail, BigDecimal amount, String type,
                           String transferId, Long counterpartyAccountId, String idempotencyKey) {
        this(accountId, title, detail, amount, type);
        this.transferId = transferId;
        this.counterpartyAccountId = counterpartyAccountId;
        this.idempotencyKey = idempotencyKey;
    }

    public Long getId() { return id; }
    public Long getAccountId() { return accountId; }
    public String getTitle() { return title; }
    public String getDetail() { return detail; }
    public BigDecimal getAmount() { return amount; }
    public String getType() { return type; }
    public String getTransferId() { return transferId; }
    public Long getCounterpartyAccountId() { return counterpartyAccountId; }
    public Instant getOccurredAt() { return occurredAt; }
    public String getStatus() { return status; }
    public String getIdempotencyKey() { return idempotencyKey; }

    public void assignTo(Long accountId) {
        if (this.accountId == null) this.accountId = accountId;
    }
}
