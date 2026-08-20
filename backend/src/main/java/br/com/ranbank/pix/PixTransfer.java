package br.com.ranbank.pix;

import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "pix_transfers")
public class PixTransfer {
    @Id
    private String id;
    private Long senderAccountId;
    private Long recipientAccountId;
    private String pixKey;
    @Column(precision = 19, scale = 2)
    private BigDecimal amount;
    private String idempotencyKey;
    private String status;
    private Instant createdAt;

    protected PixTransfer() {}

    public PixTransfer(String id, Long senderAccountId, Long recipientAccountId, String pixKey,
                       BigDecimal amount, String idempotencyKey) {
        this.id = id;
        this.senderAccountId = senderAccountId;
        this.recipientAccountId = recipientAccountId;
        this.pixKey = pixKey;
        this.amount = amount;
        this.idempotencyKey = idempotencyKey;
        this.status = "COMPLETED";
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public Long getSenderAccountId() { return senderAccountId; }
    public Long getRecipientAccountId() { return recipientAccountId; }
    public String getPixKey() { return pixKey; }
    public BigDecimal getAmount() { return amount; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
}
