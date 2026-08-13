package br.com.ranbank.config;

import br.com.ranbank.account.BankAccount;
import br.com.ranbank.account.BankAccountRepository;
import br.com.ranbank.auth.AuthenticationService;
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
                                     ConnectedDeviceRepository deviceRepository, AuthenticationService authenticationService) {
        return args -> {
            if (!accountRepository.existsById(1L)) {
                accountRepository.save(new BankAccount(1L, "Ana Ribeiro", "1234-5", new BigDecimal("8540.75")));
            }
            if (repository.count() == 0) {
                repository.saveAll(List.of(
                    new BankTransaction("Pix recebido", "Maria Silva · hoje, 09:41", new BigDecimal("250.00"), "credit"),
                    new BankTransaction("Transferência enviada", "João Pereira · hoje, 08:15", new BigDecimal("-120.00"), "debit"),
                    new BankTransaction("Pagamento", "Supermercado Bom Preço · ontem, 19:32", new BigDecimal("-89.90"), "debit"),
                    new BankTransaction("Compra no cartão", "Livraria Cultura · ontem, 16:20", new BigDecimal("-45.60"), "debit")
                ));
            }
            if (deviceRepository.count() == 0) {
                deviceRepository.saveAll(List.of(
                    new ConnectedDevice("iPhone de Ana", "Celular", "Brasília, DF", "Agora", true),
                    new ConnectedDevice("Notebook pessoal", "Computador", "Brasília, DF", "Hoje, 20:14", true),
                    new ConnectedDevice("Galaxy S24", "Celular", "Taguatinga, DF", "Hoje, 03:18", false),
                    new ConnectedDevice("Caixa eletrônico 0842", "Terminal IoT", "Asa Sul, Brasília, DF", "Ontem, 17:42", true)
                ));
            }
            authenticationService.configureDemoCredentials();
        };
    }
}
