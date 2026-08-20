package br.com.ranbank.notification;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByAccountIdOrderByCreatedAtDesc(Long accountId);
    Optional<Notification> findByIdAndAccountId(Long id, Long accountId);
    long countByReadAtIsNull();
    void deleteByAccountId(Long accountId);
    void deleteByReferenceId(String referenceId);
}
