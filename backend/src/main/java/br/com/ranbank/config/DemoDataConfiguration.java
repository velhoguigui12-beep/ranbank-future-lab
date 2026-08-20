package br.com.ranbank.config;

import br.com.ranbank.account.BankAccount;
import br.com.ranbank.account.BankAccountRepository;
import br.com.ranbank.auth.AuthenticationService;
import br.com.ranbank.device.ConnectedDevice;
import br.com.ranbank.device.ConnectedDeviceRepository;
import br.com.ranbank.transaction.BankTransaction;
import br.com.ranbank.transaction.BankTransactionRepository;
import br.com.ranbank.pix.PixKey;
import br.com.ranbank.pix.PixKeyRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DemoDataConfiguration {
    @Bean
    CommandLineRunner insertDemoData(BankTransactionRepository repository, BankAccountRepository accountRepository,
                                     ConnectedDeviceRepository deviceRepository, AuthenticationService authenticationService,
                                     PixKeyRepository pixKeyRepository) {
        return args -> {
            if (!accountRepository.existsById(1L)) {
                BankAccount admin = new BankAccount(1L, "Ana Ribeiro", "1234-5", "12345678909",
                    "ana@ranbank.demo", new BigDecimal("8540.75"));
                admin.grantAdminRole();
                accountRepository.save(admin);
            }
            BankAccount demoAccount = accountRepository.findById(1L).orElseThrow();
            if (!"ADMIN".equals(demoAccount.getRole())) demoAccount.grantAdminRole();
            if (demoAccount.getEmail() == null) {
                demoAccount.updateProfile("ana@ranbank.demo");
            }
            accountRepository.save(demoAccount);
            if (!accountRepository.existsById(2L)) {
                accountRepository.save(new BankAccount(2L, "Maria Silva", "4321-0", "98765432100",
                    "maria@ranbank.demo", new BigDecimal("3200.00")));
            }
            if (!pixKeyRepository.existsByNormalizedKey("ana@ranbank.demo")) {
                pixKeyRepository.save(new PixKey(1L, "EMAIL", "ana@ranbank.demo", "ana@ranbank.demo"));
            }
            if (!pixKeyRepository.existsByNormalizedKey("maria@ranbank.demo")) {
                pixKeyRepository.save(new PixKey(2L, "EMAIL", "maria@ranbank.demo", "maria@ranbank.demo"));
            }
            if (repository.count() == 0) {
                repository.saveAll(List.of(
                    new BankTransaction(1L, "Pix recebido", "Maria Silva · hoje, 09:41", new BigDecimal("250.00"), "credit"),
                    new BankTransaction(1L, "Transferência enviada", "João Pereira · hoje, 08:15", new BigDecimal("-120.00"), "debit"),
                    new BankTransaction(1L, "Pagamento", "Supermercado Bom Preço · ontem, 19:32", new BigDecimal("-89.90"), "debit"),
                    new BankTransaction(1L, "Compra no cartão", "Livraria Cultura · ontem, 16:20", new BigDecimal("-45.60"), "debit")
                ));
            }
            if (deviceRepository.count() == 0) {
                deviceRepository.saveAll(List.of(
                    new ConnectedDevice(1L, "iPhone de Ana", "Celular", "Brasília, DF", "Agora", true),
                    new ConnectedDevice(1L, "Notebook pessoal", "Computador", "Brasília, DF", "Hoje, 20:14", true),
                    new ConnectedDevice(1L, "Galaxy S24", "Celular", "Taguatinga, DF", "Hoje, 03:18", false),
                    new ConnectedDevice(1L, "Caixa eletrônico 0842", "Terminal IoT", "Asa Sul, Brasília, DF", "Ontem, 17:42", true)
                ));
            }
            List<BankTransaction> legacyTransactions = repository.findAll().stream()
                .filter(item -> item.getAccountId() == null).toList();
            legacyTransactions.forEach(item -> item.assignTo(1L));
            repository.saveAll(legacyTransactions);
            List<ConnectedDevice> legacyDevices = deviceRepository.findAll().stream()
                .filter(item -> item.getAccountId() == null).toList();
            legacyDevices.forEach(item -> item.assignTo(1L));
            deviceRepository.saveAll(legacyDevices);
            authenticationService.configureDemoCredentials();
        };
    }
}
