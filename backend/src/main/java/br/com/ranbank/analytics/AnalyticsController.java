package br.com.ranbank.analytics;

import br.com.ranbank.transaction.BankTransaction;
import br.com.ranbank.transaction.BankTransactionRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AnalyticsController {
    private final BankTransactionRepository repository;

    public AnalyticsController(BankTransactionRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/summary")
    public AnalyticsSummary summary() {
        List<BankTransaction> transactions = repository.findAll();
        List<BigDecimal> credits = transactions.stream().map(BankTransaction::getAmount)
            .filter(value -> value.signum() > 0).toList();
        List<BigDecimal> debits = transactions.stream().map(BankTransaction::getAmount)
            .filter(value -> value.signum() < 0).map(BigDecimal::abs).toList();
        BigDecimal totalIn = credits.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalOut = debits.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal averageOut = debits.isEmpty() ? BigDecimal.ZERO
            : totalOut.divide(BigDecimal.valueOf(debits.size()), 2, RoundingMode.HALF_UP);
        BigDecimal largestOut = debits.stream().max(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        return new AnalyticsSummary(transactions.size(), credits.size(), debits.size(), totalIn,
            totalOut, averageOut, largestOut, transactions.stream().map(BankTransaction::getAmount).toList());
    }

    public record AnalyticsSummary(int totalTransactions, int creditCount, int debitCount,
        BigDecimal totalIn, BigDecimal totalOut, BigDecimal averageOut, BigDecimal largestOut,
        List<BigDecimal> series) {}
}

