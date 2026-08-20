package br.com.ranbank.audit;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {
    Optional<AuditEvent> findTopByAccountIdOrderByIdDesc(Long accountId);
    List<AuditEvent> findByAccountIdOrderByIdDesc(Long accountId);
    void deleteByAccountId(Long accountId);
    void deleteByReferenceId(String referenceId);
}
