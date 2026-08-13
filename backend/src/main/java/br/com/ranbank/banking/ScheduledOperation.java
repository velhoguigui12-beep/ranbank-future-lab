package br.com.ranbank.banking;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
public class ScheduledOperation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long accountId;
    private String kind;
    private String recipient;
    private BigDecimal amount;
    private LocalDate scheduledDate;
    private String status;

    protected ScheduledOperation() {}

    public ScheduledOperation(Long accountId, String kind, String recipient, BigDecimal amount, LocalDate scheduledDate) {
        this.accountId = accountId;
        this.kind = kind;
        this.recipient = recipient;
        this.amount = amount;
        this.scheduledDate = scheduledDate;
        this.status = "AGENDADO";
    }

    public Long getId() { return id; }
    public Long getAccountId() { return accountId; }
    public String getKind() { return kind; }
    public String getRecipient() { return recipient; }
    public BigDecimal getAmount() { return amount; }
    public LocalDate getScheduledDate() { return scheduledDate; }
    public String getStatus() { return status; }
}
