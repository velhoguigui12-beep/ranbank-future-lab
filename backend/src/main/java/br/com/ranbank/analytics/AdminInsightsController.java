package br.com.ranbank.analytics;

import br.com.ranbank.account.BankAccount;
import br.com.ranbank.account.BankAccountRepository;
import br.com.ranbank.auth.AuthenticationService;
import br.com.ranbank.automation.FlowExecutionRepository;
import br.com.ranbank.notification.NotificationRepository;
import br.com.ranbank.pix.PixTransferRepository;
import br.com.ranbank.transaction.BankTransaction;
import br.com.ranbank.transaction.BankTransactionRepository;
import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/insights")
public class AdminInsightsController {
    private final BankAccountRepository accounts;
    private final BankTransactionRepository transactions;
    private final PixTransferRepository pixTransfers;
    private final NotificationRepository notifications;
    private final FlowExecutionRepository flows;

    public AdminInsightsController(BankAccountRepository accounts, BankTransactionRepository transactions,
                                   PixTransferRepository pixTransfers, NotificationRepository notifications,
                                   FlowExecutionRepository flows) {
        this.accounts = accounts;
        this.transactions = transactions;
        this.pixTransfers = pixTransfers;
        this.notifications = notifications;
        this.flows = flows;
    }

    @GetMapping("/summary")
    public InsightsSummary summary(HttpServletRequest request) {
        requireAdmin(request);
        BigDecimal deposits = accounts.findAll().stream().map(BankAccount::getBalance)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal transactionVolume = transactions.findAll().stream().map(BankTransaction::getAmount)
            .map(BigDecimal::abs).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new InsightsSummary(Instant.now(), accounts.count(), deposits, transactions.count(),
            transactionVolume, pixTransfers.count(), notifications.countByReadAtIsNull(), flows.count());
    }

    private void requireAdmin(HttpServletRequest request) {
        Long accountId = (Long) request.getAttribute(AuthenticationService.ACCOUNT_REQUEST_ATTRIBUTE);
        BankAccount account = accounts.findById(accountId).orElseThrow(() -> new AdminException("Conta não encontrada."));
        if (!"ADMIN".equals(account.getRole())) throw new AdminException("Acesso restrito ao Insights administrativo.");
    }

    @ExceptionHandler(AdminException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    Map<String, String> handle(AdminException exception) { return Map.of("message", exception.getMessage()); }

    public record InsightsSummary(Instant generatedAt, long totalAccounts, BigDecimal totalDeposits,
                                  long totalTransactions, BigDecimal transactionVolume, long pixTransfers,
                                  long unreadNotifications, long flowExecutions) {}

    static class AdminException extends RuntimeException { AdminException(String message) { super(message); } }
}
