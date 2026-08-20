package br.com.ranbank.audit;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import org.springframework.stereotype.Service;

@Service
public class AuditService {
    private final AuditEventRepository repository;
    public AuditService(AuditEventRepository repository) { this.repository = repository; }

    public AuditEvent record(Long accountId, String eventType, String referenceId, String payload) {
        String previous = repository.findTopByAccountIdOrderByIdDesc(accountId)
            .map(AuditEvent::getEventHash).orElse("GENESIS");
        Instant createdAt = Instant.now();
        String eventHash = sha256(previous + "|" + accountId + "|" + eventType + "|" + referenceId
            + "|" + payload + "|" + createdAt);
        return repository.save(new AuditEvent(accountId, eventType, referenceId, payload,
            previous, eventHash, createdAt));
    }

    private String sha256(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 não disponível.", exception);
        }
    }
}
