package br.com.ranbank.audit;

import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "audit_events")
public class AuditEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long accountId;
    private String eventType;
    private String referenceId;
    @Column(length = 2000)
    private String payload;
    private String previousHash;
    private String eventHash;
    private Instant createdAt;

    protected AuditEvent() {}

    public AuditEvent(Long accountId, String eventType, String referenceId, String payload,
                      String previousHash, String eventHash, Instant createdAt) {
        this.accountId = accountId;
        this.eventType = eventType;
        this.referenceId = referenceId;
        this.payload = payload;
        this.previousHash = previousHash;
        this.eventHash = eventHash;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public Long getAccountId() { return accountId; }
    public String getEventType() { return eventType; }
    public String getReferenceId() { return referenceId; }
    public String getPayload() { return payload; }
    public String getPreviousHash() { return previousHash; }
    public String getEventHash() { return eventHash; }
    public Instant getCreatedAt() { return createdAt; }
}
