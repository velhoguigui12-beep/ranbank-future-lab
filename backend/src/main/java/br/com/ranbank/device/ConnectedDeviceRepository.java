package br.com.ranbank.device;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ConnectedDeviceRepository extends JpaRepository<ConnectedDevice, Long> {
    List<ConnectedDevice> findByAccountIdOrderByIdAsc(Long accountId);
    Optional<ConnectedDevice> findByIdAndAccountId(Long id, Long accountId);
    void deleteByAccountId(Long accountId);
}
