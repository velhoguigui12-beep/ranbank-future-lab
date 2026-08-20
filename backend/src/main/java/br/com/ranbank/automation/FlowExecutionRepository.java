package br.com.ranbank.automation;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FlowExecutionRepository extends JpaRepository<FlowExecution, String> {
    List<FlowExecution> findByAccountIdOrderByStartedAtDesc(Long accountId);
    void deleteByAccountId(Long accountId);
    void deleteByReferenceId(String referenceId);
}
