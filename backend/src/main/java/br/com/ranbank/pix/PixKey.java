package br.com.ranbank.pix;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "pix_keys")
public class PixKey {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long accountId;
    private String keyType;
    private String normalizedKey;
    private String displayKey;
    private Instant createdAt;

    protected PixKey() {}

    public PixKey(Long accountId, String keyType, String normalizedKey, String displayKey) {
        this.accountId = accountId;
        this.keyType = keyType;
        this.normalizedKey = normalizedKey;
        this.displayKey = displayKey;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getAccountId() { return accountId; }
    public String getKeyType() { return keyType; }
    public String getNormalizedKey() { return normalizedKey; }
    public String getDisplayKey() { return displayKey; }
    public Instant getCreatedAt() { return createdAt; }
}
