package br.com.ranbank.dashboard;

import br.com.ranbank.account.BankAccount;
import br.com.ranbank.account.BankAccountRepository;
import br.com.ranbank.transaction.BankTransaction;
import br.com.ranbank.transaction.BankTransactionRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class DashboardController {
    private final BankTransactionRepository transactionRepository;
    private final BankAccountRepository accountRepository;

    public DashboardController(BankTransactionRepository transactionRepository, BankAccountRepository accountRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
    }

    @GetMapping
    public DashboardResponse dashboard() {
        List<TransactionResponse> transactions = transactionRepository.findAll().stream()
            .map(TransactionResponse::from)
            .toList();

        BankAccount account = accountRepository.findById(1L)
            .orElse(new BankAccount(1L, "Ana Ribeiro", "1234-5", new BigDecimal("8540.75")));
        return new DashboardResponse(account.getCustomerName(), account.getBalance(), account.getAccountNumber(), transactions);
    }

    public record DashboardResponse(String customerName, BigDecimal balance, String account, List<TransactionResponse> transactions) {}

    public record TransactionResponse(Long id, String title, String detail, BigDecimal amount, String type) {
        static TransactionResponse from(BankTransaction transaction) {
            return new TransactionResponse(
                transaction.getId(), transaction.getTitle(), transaction.getDetail(),
                transaction.getAmount(), transaction.getType()
            );
        }
    }
}
