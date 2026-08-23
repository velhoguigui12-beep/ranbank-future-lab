package br.com.ranbank.account;

import org.springframework.data.jpa.repository.JpaRepository;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {
    Optional<BankAccount> findByDocumentId(String documentId);
    Optional<BankAccount> findByAccountNumber(String accountNumber);
    Optional<BankAccount> findByEmailIgnoreCase(String email);
    boolean existsByDocumentId(String documentId);
    boolean existsByEmailIgnoreCase(String email);
    long countByActiveTrue();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select account from BankAccount account where account.id = :id")
    Optional<BankAccount> findByIdForUpdate(@Param("id") Long id);
}
