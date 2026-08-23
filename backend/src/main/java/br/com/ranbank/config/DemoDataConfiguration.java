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
import java.util.Locale;
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
            if (demoAccount.getEmail() == null || demoAccount.getPhoneNumber() == null) {
                demoAccount.updateProfile(demoAccount.getEmail() == null ? "ana@ranbank.demo" : demoAccount.getEmail(),
                    demoAccount.getPhoneNumber() == null ? "61999990101" : demoAccount.getPhoneNumber());
            }
            accountRepository.save(demoAccount);
            if (!accountRepository.existsById(2L)) {
                BankAccount maria = new BankAccount(2L, "Maria Silva", "4321-0", "98765432100",
                    "maria@ranbank.demo", new BigDecimal("3200.00"));
                maria.updatePhoneNumber("11988880202");
                accountRepository.save(maria);
            } else {
                BankAccount maria = accountRepository.findById(2L).orElseThrow();
                if (maria.getPhoneNumber() == null) {
                    maria.updatePhoneNumber("11988880202");
                    accountRepository.save(maria);
                }
            }
            if (!pixKeyRepository.existsByNormalizedKey("ana@ranbank.demo")) {
                pixKeyRepository.save(new PixKey(1L, "EMAIL", "ana@ranbank.demo", "ana@ranbank.demo"));
            }
            if (!pixKeyRepository.existsByNormalizedKey("maria@ranbank.demo")) {
                pixKeyRepository.save(new PixKey(2L, "EMAIL", "maria@ranbank.demo", "maria@ranbank.demo"));
            }
            if (!pixKeyRepository.existsByNormalizedKey("12345678909")) {
                pixKeyRepository.save(new PixKey(1L, "CPF", "12345678909", "123.456.789-09"));
            }
            if (!pixKeyRepository.existsByNormalizedKey("61999990101")) {
                pixKeyRepository.save(new PixKey(1L, "PHONE", "61999990101", "(61) 99999-0101"));
            }
            if (!pixKeyRepository.existsByNormalizedKey("98765432100")) {
                pixKeyRepository.save(new PixKey(2L, "CPF", "98765432100", "987.654.321-00"));
            }
            if (!pixKeyRepository.existsByNormalizedKey("11988880202")) {
                pixKeyRepository.save(new PixKey(2L, "PHONE", "11988880202", "(11) 98888-0202"));
            }
            for (BankAccount account : accountRepository.findAll()) {
                if (!account.isActive()) continue;
                String document = account.getDocumentId();
                if (document != null && document.matches("\\d{11}")
                        && !pixKeyRepository.existsByNormalizedKey(document)) {
                    pixKeyRepository.save(new PixKey(account.getId(), "CPF", document, formatCpf(document)));
                }
                String email = account.getEmail();
                String normalizedEmail = email == null ? null : email.toLowerCase(Locale.ROOT);
                if (normalizedEmail != null && !pixKeyRepository.existsByNormalizedKey(normalizedEmail)) {
                    pixKeyRepository.save(new PixKey(account.getId(), "EMAIL", normalizedEmail, normalizedEmail));
                }
                String phone = account.getPhoneNumber();
                if (phone != null && (phone.length() == 10 || phone.length() == 11)
                        && !pixKeyRepository.existsByNormalizedKey(phone)) {
                    pixKeyRepository.save(new PixKey(account.getId(), "PHONE", phone, formatPhone(phone)));
                }
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

    private static String formatCpf(String value) {
        return "%s.%s.%s-%s".formatted(value.substring(0, 3), value.substring(3, 6),
            value.substring(6, 9), value.substring(9));
    }

    private static String formatPhone(String value) {
        int prefix = value.length() == 11 ? 7 : 6;
        return "(%s) %s-%s".formatted(value.substring(0, 2), value.substring(2, prefix), value.substring(prefix));
    }
}
