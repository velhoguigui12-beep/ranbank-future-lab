package br.com.ranbank.demo;

import br.com.ranbank.account.BankAccount;
import br.com.ranbank.account.BankAccountRepository;
import br.com.ranbank.auth.AuthenticationService;
import br.com.ranbank.device.ConnectedDevice;
import br.com.ranbank.device.ConnectedDeviceRepository;
import br.com.ranbank.transaction.BankTransaction;
import br.com.ranbank.transaction.BankTransactionRepository;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/demo")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class DemoResetController {
    private final BankTransactionRepository transactionRepository;
    private final BankAccountRepository accountRepository;
    private final ConnectedDeviceRepository deviceRepository;
    private final AuthenticationService authenticationService;

    public DemoResetController(BankTransactionRepository transactionRepository, BankAccountRepository accountRepository,
                               ConnectedDeviceRepository deviceRepository, AuthenticationService authenticationService) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.deviceRepository = deviceRepository;
        this.authenticationService = authenticationService;
    }

    @PostMapping("/reset")
    @Transactional
    public Map<String, String> reset() {
        transactionRepository.deleteAll();
        deviceRepository.deleteAll();
        accountRepository.deleteAll();
        accountRepository.save(new BankAccount(1L, "Ana Ribeiro", "1234-5", new BigDecimal("8540.75")));
        transactionRepository.saveAll(List.of(
            new BankTransaction("Pix recebido", "Maria Silva · hoje, 09:41", new BigDecimal("250.00"), "credit"),
            new BankTransaction("Transferência enviada", "João Pereira · hoje, 08:15", new BigDecimal("-120.00"), "debit"),
            new BankTransaction("Pagamento", "Supermercado Bom Preço · ontem, 19:32", new BigDecimal("-89.90"), "debit"),
            new BankTransaction("Compra no cartão", "Livraria Cultura · ontem, 16:20", new BigDecimal("-45.60"), "debit")
        ));
        deviceRepository.saveAll(List.of(
            new ConnectedDevice("iPhone de Ana", "Celular", "Brasília, DF", "Agora", true),
            new ConnectedDevice("Notebook pessoal", "Computador", "Brasília, DF", "Hoje, 20:14", true),
            new ConnectedDevice("Galaxy S24", "Celular", "Taguatinga, DF", "Hoje, 03:18", false),
            new ConnectedDevice("Caixa eletrônico 0842", "Terminal IoT", "Asa Sul, Brasília, DF", "Ontem, 17:42", true)
        ));
        authenticationService.configureDemoCredentials();
        return Map.of("message", "Demonstração restaurada com sucesso.");
    }
}
