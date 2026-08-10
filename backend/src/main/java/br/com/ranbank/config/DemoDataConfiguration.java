package br.com.ranbank.config;

import br.com.ranbank.account.BankAccount;
import br.com.ranbank.account.BankAccountRepository;
import br.com.ranbank.device.ConnectedDevice;
import br.com.ranbank.device.ConnectedDeviceRepository;
import br.com.ranbank.transaction.BankTransaction;
import br.com.ranbank.transaction.BankTransactionRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DemoDataConfiguration {
    @Bean
    CommandLineRunner insertDemoData(BankTransactionRepository repository, BankAccountRepository accountRepository,
                                     ConnectedDeviceRepository deviceRepository) {
        return args -> {
            if (!accountRepository.existsById(1L)) {
                accountRepository.save(new BankAccount(1L, "Ana Ribeiro", "1234-5", new BigDecimal("8540.75")));
            }
            if (repository.count() == 0) {
                repository.saveAll(List.of(
                    new BankTransaction("Pix recebido", "Maria Silva Â· hoje, 09:41", new BigDecimal("250.00"), "credit"),
                    new BankTransaction("TransferÃªncia enviada", "JoÃ£o Pereira Â· hoje, 08:15", new BigDecimal("-120.00"), "debit"),
                    new BankTransaction("Pagamento", "Supermercado Bom PreÃ§o Â· ontem, 19:32", new BigDecimal("-89.90"), "debit"),
                    new BankTransaction("Compra no cartÃ£o", "Livraria Cultura Â· ontem, 16:20", new BigDecimal("-45.60"), "debit")
                ));
            }
            if (deviceRepository.count() == 0) {
                deviceRepository.saveAll(List.of(
                    new ConnectedDevice("iPhone de Ana", "Celular", "BrasÃ­lia, DF", "Agora", true),
                    new ConnectedDevice("Notebook pessoal", "Computador", "BrasÃ­lia, DF", "Hoje, 20:14", true),
                    new ConnectedDevice("Galaxy S24", "Celular", "Taguatinga, DF", "Hoje, 03:18", false),
                    new ConnectedDevice("Caixa eletrÃ´nico 0842", "Terminal IoT", "Asa Sul, BrasÃ­lia, DF", "Ontem, 17:42", true)
                ));
            }
        };
    }
}

