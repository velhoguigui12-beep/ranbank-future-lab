package br.com.ranbank.auth;

import java.time.Instant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BankSessionRepository extends JpaRepository<BankSession, String> {
    void deleteByExpiresAtBefore(Instant cutoff);
    void deleteByAccountId(Long accountId);
}
