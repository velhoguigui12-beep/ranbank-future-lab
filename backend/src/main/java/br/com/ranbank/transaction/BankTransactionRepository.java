package br.com.ranbank.transaction;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BankTransactionRepository extends JpaRepository<BankTransaction, Long> {
    List<BankTransaction> findByAccountIdOrderByIdAsc(Long accountId);
    Optional<BankTransaction> findFirstByAccountIdAndTransferId(Long accountId, String transferId);
    void deleteByTransferId(String transferId);
    void deleteByAccountId(Long accountId);
}
