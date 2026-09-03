package br.com.ranbank.dashboard;

import br.com.ranbank.account.BankAccount;
import br.com.ranbank.account.BankAccountRepository;
import br.com.ranbank.transaction.BankTransaction;
import br.com.ranbank.transaction.BankTransactionRepository;
import br.com.ranbank.auth.AuthenticationService;
import jakarta.servlet.http.HttpServletRequest;
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
    public DashboardResponse dashboard(HttpServletRequest request) {
        Long accountId = (Long) request.getAttribute(AuthenticationService.ACCOUNT_REQUEST_ATTRIBUTE);
        List<TransactionResponse> transactions = transactionRepository
            .findByAccountIdOrderByOccurredAtDescIdDesc(accountId).stream()
            .map(TransactionResponse::from)
            .toList();

        BankAccount account = accountRepository.findById(accountId)
            .orElseThrow(() -> new IllegalStateException("Conta autenticada não encontrada."));
        String document = account.getDocumentId();
        String maskedDocument = document == null || document.length() < 4 ? "Não informado"
            : "•••.•••.•••-" + document.substring(document.length() - 2);
        String digits = account.getAccountNumber().replaceAll("\\D", "");
        String cardLastFour = digits.length() >= 4 ? digits.substring(digits.length() - 4)
            : String.format("%04d", account.getId() % 10000);
        CardResponse card = new CardResponse(cardLastFour, account.isCardBlocked(), account.getCardLimit(),
            account.getCardSpent(), account.getCardLimit().subtract(account.getCardSpent()).max(BigDecimal.ZERO));
        return new DashboardResponse(account.getCustomerName(), account.getBalance(), account.getAccountNumber(),
            account.getEmail(), formatPhone(account.getPhoneNumber()), maskedDocument, account.getRole(),
            account.getCreatedAt(), card, transactions);
    }

    private static String formatPhone(String phone) {
        if (phone == null || !(phone.length() == 10 || phone.length() == 11)) return null;
        int prefix = phone.length() == 11 ? 7 : 6;
        return "(%s) %s-%s".formatted(phone.substring(0, 2), phone.substring(2, prefix), phone.substring(prefix));
    }

    public record DashboardResponse(String customerName, BigDecimal balance, String account, String email,
                                    String phoneNumber, String maskedDocument, String role, java.time.Instant createdAt,
                                    CardResponse card, List<TransactionResponse> transactions) {}
    public record CardResponse(String lastFour, boolean blocked, BigDecimal limit, BigDecimal spent, BigDecimal available) {}

    public record TransactionResponse(Long id, String title, String detail, BigDecimal amount, String type,
                                      java.time.Instant occurredAt) {
        static TransactionResponse from(BankTransaction transaction) {
            return new TransactionResponse(
                transaction.getId(), transaction.getTitle(), transaction.getDetail(),
                transaction.getAmount(), transaction.getType(), transaction.getOccurredAt()
            );
        }
    }
}
