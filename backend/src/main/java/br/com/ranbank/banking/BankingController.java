package br.com.ranbank.banking;

import br.com.ranbank.account.BankAccount;
import br.com.ranbank.account.BankAccountRepository;
import br.com.ranbank.auth.AuthenticationService;
import br.com.ranbank.transaction.BankTransaction;
import br.com.ranbank.transaction.BankTransactionRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/banking")
public class BankingController {
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final Pattern RANDOM_KEY = Pattern.compile("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$");
    private static final Pattern CPF = Pattern.compile("^\\d{11}$");
    private static final Pattern PHONE = Pattern.compile("^(?:55)?\\d{2}9\\d{8}$");

    private final BankAccountRepository accounts;
    private final BankTransactionRepository transactions;
    private final ScheduledOperationRepository schedules;
    private final AuthenticationService authentication;

    public BankingController(BankAccountRepository accounts, BankTransactionRepository transactions,
                             ScheduledOperationRepository schedules, AuthenticationService authentication) {
        this.accounts = accounts;
        this.transactions = transactions;
        this.schedules = schedules;
        this.authentication = authentication;
    }

    @GetMapping("/overview")
    public BankingOverview overview(HttpServletRequest request) {
        BankAccount account = account(request);
        return new BankingOverview(
            account.getCustomerName(), cardLastFour(account), account.getBalance(), account.getSavingsBalance(), account.getSavingsGoal(),
            new CardSummary(account.isCardBlocked(), account.getCardLimit(), account.getCardSpent(),
                account.getCardLimit().subtract(account.getCardSpent()).max(BigDecimal.ZERO)),
            transactions.findByAccountIdOrderByOccurredAtDescIdDesc(account.getId()).stream()
                .map(StatementItem::from).toList(),
            schedules.findByAccountIdOrderByScheduledDateAsc(account.getId()).stream().map(ScheduleItem::from).toList()
        );
    }

    @PostMapping("/bills")
    @Transactional
    public ResponseEntity<Receipt> payBill(@Valid @RequestBody BillRequest body, HttpServletRequest request) {
        String barcode = body.barcode().replaceAll("\\D", "");
        if (barcode.length() < 44 || barcode.length() > 48) throw new BankingException("O código de barras deve ter entre 44 e 48 dígitos.");
        BankAccount account = account(request);
        authentication.verifyTransactionPin(account.getId(), body.transactionPin());
        debit(account, body.amount());
        BankTransaction saved = transactions.save(new BankTransaction(account.getId(),
            "Boleto pago", body.payee().trim() + " · cód. " + barcode.substring(barcode.length() - 6),
            body.amount().negate(), "debit"
        ));
        accounts.save(account);
        return ResponseEntity.status(HttpStatus.CREATED).body(Receipt.from(saved, "Boleto", body.payee(), OffsetDateTime.now().toString()));
    }

    @PostMapping("/schedules")
    @Transactional
    public ResponseEntity<ScheduleItem> schedule(@Valid @RequestBody ScheduleRequest body, HttpServletRequest request) {
        if (body.scheduledDate().isBefore(LocalDate.now())) throw new BankingException("Escolha hoje ou uma data futura.");
        String pixKey = body.pixKey().trim();
        String normalizedDigits = pixKey.replaceAll("\\D", "");
        if (!isValidPixKey(pixKey, normalizedDigits)) {
            throw new BankingException("Informe uma chave Pix valida: CPF, celular, e-mail ou chave aleatoria.");
        }
        BankAccount account = account(request);
        authentication.verifyTransactionPin(account.getId(), body.transactionPin());
        if (body.amount().compareTo(account.getBalance()) > 0) throw new BankingException("O valor agendado ultrapassa o saldo atual.");
        ScheduledOperation saved = schedules.save(new ScheduledOperation(
            account.getId(), "PIX", maskPixKey(pixKey, normalizedDigits), body.amount(), body.scheduledDate()
        ));
        return ResponseEntity.status(HttpStatus.CREATED).body(ScheduleItem.from(saved));
    }

    @PostMapping("/savings/deposit")
    @Transactional
    public BankingOverview deposit(@Valid @RequestBody MoneyRequest body, HttpServletRequest request) {
        BankAccount account = account(request);
        authentication.verifyTransactionPin(account.getId(), body.transactionPin());
        try { account.depositSavings(body.amount()); } catch (IllegalArgumentException error) { throw new BankingException(error.getMessage()); }
        transactions.save(new BankTransaction(account.getId(), "Aplicação no cofrinho", "Reserva Future · agora", body.amount().negate(), "debit"));
        accounts.save(account);
        return overview(request);
    }

    @PostMapping("/savings/withdraw")
    @Transactional
    public BankingOverview withdraw(@Valid @RequestBody MoneyRequest body, HttpServletRequest request) {
        BankAccount account = account(request);
        authentication.verifyTransactionPin(account.getId(), body.transactionPin());
        try { account.withdrawSavings(body.amount()); } catch (IllegalArgumentException error) { throw new BankingException(error.getMessage()); }
        transactions.save(new BankTransaction(account.getId(), "Resgate do cofrinho", "Reserva Future · agora", body.amount(), "credit"));
        accounts.save(account);
        return overview(request);
    }

    @PatchMapping("/card/toggle")
    @Transactional
    public CardSummary toggleCard(HttpServletRequest request) {
        BankAccount account = account(request);
        account.toggleCard();
        accounts.save(account);
        return card(account);
    }

    @PutMapping("/card/limit")
    @Transactional
    public CardSummary updateLimit(@Valid @RequestBody LimitRequest body, HttpServletRequest request) {
        BankAccount account = account(request);
        authentication.verifyTransactionPin(account.getId(), body.transactionPin());
        try { account.updateCardLimit(body.limit()); } catch (IllegalArgumentException error) { throw new BankingException(error.getMessage()); }
        accounts.save(account);
        return card(account);
    }

    private BankAccount account(HttpServletRequest request) {
        Long id = (Long) request.getAttribute(AuthenticationService.ACCOUNT_REQUEST_ATTRIBUTE);
        return accounts.findById(id).orElseThrow(() -> new BankingException("Conta não encontrada."));
    }

    private void debit(BankAccount account, BigDecimal amount) {
        try { account.debit(amount); } catch (IllegalArgumentException error) { throw new BankingException(error.getMessage()); }
    }

    private boolean isValidPixKey(String original, String digits) {
        return EMAIL.matcher(original).matches()
            || RANDOM_KEY.matcher(original).matches()
            || PHONE.matcher(digits).matches()
            || CPF.matcher(digits).matches();
    }

    private String maskPixKey(String original, String digits) {
        if (EMAIL.matcher(original).matches()) return original;
        if (RANDOM_KEY.matcher(original).matches()) return "Chave aleatoria ****" + original.substring(original.length() - 4);
        if (PHONE.matcher(digits).matches()) return "Celular ****" + digits.substring(digits.length() - 4);
        return "CPF ***.***.***-" + digits.substring(digits.length() - 2);
    }

    private CardSummary card(BankAccount account) {
        return new CardSummary(account.isCardBlocked(), account.getCardLimit(), account.getCardSpent(),
            account.getCardLimit().subtract(account.getCardSpent()).max(BigDecimal.ZERO));
    }

    private String cardLastFour(BankAccount account) {
        String digits = account.getAccountNumber().replaceAll("\\D", "");
        return digits.length() >= 4 ? digits.substring(digits.length() - 4)
            : String.format("%04d", account.getId() % 10000);
    }

    @ExceptionHandler(BankingException.class)
    ResponseEntity<Map<String, String>> handle(BankingException error) {
        return ResponseEntity.unprocessableEntity().body(Map.of("message", error.getMessage()));
    }

    @ExceptionHandler(AuthenticationService.AuthException.class)
    ResponseEntity<Map<String, String>> handleAuth(AuthenticationService.AuthException error) {
        return ResponseEntity.status(error.status()).body(Map.of("message", error.getMessage()));
    }

    public record BankingOverview(String customerName, String cardLastFour, BigDecimal balance, BigDecimal savingsBalance, BigDecimal savingsGoal,
                                  CardSummary card, List<StatementItem> statement, List<ScheduleItem> schedules) {}
    public record CardSummary(boolean blocked, BigDecimal limit, BigDecimal spent, BigDecimal available) {}
    public record StatementItem(Long id, String title, String detail, BigDecimal amount, String type,
                                java.time.Instant occurredAt) {
        static StatementItem from(BankTransaction item) {
            return new StatementItem(item.getId(), item.getTitle(), item.getDetail(), item.getAmount(),
                item.getType(), item.getOccurredAt());
        }
    }
    public record ScheduleItem(Long id, String kind, String recipient, BigDecimal amount, LocalDate scheduledDate, String status) {
        static ScheduleItem from(ScheduledOperation item) {
            return new ScheduleItem(item.getId(), item.getKind(), item.getRecipient(), item.getAmount(), item.getScheduledDate(), item.getStatus());
        }
    }
    public record Receipt(Long transactionId, String operation, String recipient, BigDecimal amount, String detail, String timestamp, String authentication) {
        static Receipt from(BankTransaction item, String operation, String recipient, String timestamp) {
            return new Receipt(item.getId(), operation, recipient, item.getAmount().abs(), item.getDetail(), timestamp, "PIN transacional + sessão protegida");
        }
    }
    public record BillRequest(@NotBlank String barcode, @NotBlank String payee,
                              @NotNull @DecimalMin("0.01") BigDecimal amount, @NotBlank String transactionPin) {}
    public record ScheduleRequest(@NotBlank String pixKey, @NotNull @DecimalMin("0.01") BigDecimal amount,
                                  @NotNull LocalDate scheduledDate, @NotBlank String transactionPin) {}
    public record MoneyRequest(@NotNull @DecimalMin("0.01") BigDecimal amount, @NotBlank String transactionPin) {}
    public record LimitRequest(@NotNull @DecimalMin("0.01") BigDecimal limit, @NotBlank String transactionPin) {}

    static class BankingException extends RuntimeException {
        BankingException(String message) { super(message); }
    }
}
