package br.com.ranbank.pix;

import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PixTransferRepository extends JpaRepository<PixTransfer, String> {
    Optional<PixTransfer> findBySenderAccountIdAndIdempotencyKey(Long senderAccountId, String idempotencyKey);
    List<PixTransfer> findBySenderAccountIdOrRecipientAccountId(Long senderAccountId, Long recipientAccountId);
}
