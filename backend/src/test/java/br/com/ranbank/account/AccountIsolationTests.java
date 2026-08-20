package br.com.ranbank.account;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.ranbank.device.ConnectedDevice;
import br.com.ranbank.device.ConnectedDeviceRepository;
import br.com.ranbank.transaction.BankTransaction;
import br.com.ranbank.transaction.BankTransactionRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
class AccountIsolationTests {
    @Autowired BankAccountRepository accounts;
    @Autowired BankTransactionRepository transactions;
    @Autowired ConnectedDeviceRepository devices;

    @Test
    void transactionsAndDevicesAreScopedToTheirAccount() {
        accounts.save(new BankAccount(101L, "Cliente A", "1001-0", new BigDecimal("100.00")));
        accounts.save(new BankAccount(202L, "Cliente B", "2002-0", new BigDecimal("200.00")));

        transactions.save(new BankTransaction(101L, "Crédito A", "Conta A", BigDecimal.TEN, "credit"));
        transactions.save(new BankTransaction(202L, "Crédito B", "Conta B", BigDecimal.ONE, "credit"));
        ConnectedDevice deviceA = devices.save(new ConnectedDevice(
            101L, "Celular A", "Celular", "Brasília, DF", "Agora", true
        ));
        devices.save(new ConnectedDevice(202L, "Celular B", "Celular", "Goiânia, GO", "Agora", true));

        assertThat(transactions.findByAccountIdOrderByIdAsc(101L))
            .extracting(BankTransaction::getTitle)
            .containsExactly("Crédito A");
        assertThat(devices.findByAccountIdOrderByIdAsc(101L))
            .extracting(ConnectedDevice::getName)
            .containsExactly("Celular A");
        assertThat(devices.findByIdAndAccountId(deviceA.getId(), 202L)).isEmpty();
    }
}
