package br.com.ranbank.auth;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "bank_sessions")
public class BankSession {
    @Id
    private String tokenHash;
    private Long accountId;
    private Instant expiresAt;
    private Instant createdAt;

    protected BankSession() {}

    public BankSession(String tokenHash, Long accountId, Instant expiresAt) {
        this.tokenHash = tokenHash;
        this.accountId = accountId;
        this.expiresAt = expiresAt;
        this.createdAt = Instant.now();
    }

    public String getTokenHash() { return tokenHash; }
    public Long getAccountId() { return accountId; }
    public Instant getExpiresAt() { return expiresAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void renew(Instant expiresAt) { this.expiresAt = expiresAt; }
}
