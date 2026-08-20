package br.com.ranbank.pix;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PixKeyRepository extends JpaRepository<PixKey, Long> {
    Optional<PixKey> findByNormalizedKey(String normalizedKey);
    List<PixKey> findByAccountId(Long accountId);
    boolean existsByNormalizedKey(String normalizedKey);
}
