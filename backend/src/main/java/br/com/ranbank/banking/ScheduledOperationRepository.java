package br.com.ranbank.banking;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduledOperationRepository extends JpaRepository<ScheduledOperation, Long> {
    List<ScheduledOperation> findByAccountIdOrderByScheduledDateAsc(Long accountId);
    void deleteByAccountId(Long accountId);
}
