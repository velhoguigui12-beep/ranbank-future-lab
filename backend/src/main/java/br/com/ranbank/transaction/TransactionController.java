package br.com.ranbank.transaction;

import br.com.ranbank.account.BankAccount;
import br.com.ranbank.account.BankAccountRepository;
import br.com.ranbank.auth.AuthenticationService;
import br.com.ranbank.pix.PixTransferService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Map;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.MethodArgumentNotValidException;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class TransactionController {
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final Pattern RANDOM_KEY = Pattern.compile("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$");
    private static final Pattern CPF = Pattern.compile("^\\d{11}$");
    private static final Pattern PHONE = Pattern.compile("^(?:55)?\\d{2}9\\d{8}$");

    private final BankTransactionRepository transactionRepository;
    private final BankAccountRepository accountRepository;
    private final AuthenticationService authenticationService;
    private final PixTransferService pixTransferService;

    public TransactionController(BankTransactionRepository transactionRepository, BankAccountRepository accountRepository,
                                 AuthenticationService authenticationService, PixTransferService pixTransferService) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.authenticationService = authenticationService;
        this.pixTransferService = pixTransferService;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<TransactionResponse> create(@Valid @RequestBody CreateTransactionRequest request,
                                                      HttpServletRequest servletRequest) {
        Long accountId = (Long) servletRequest.getAttribute(AuthenticationService.ACCOUNT_REQUEST_ATTRIBUTE);
        PixTransferService.Receipt receipt = pixTransferService.transfer(accountId, request.pixKey(), request.amount(),
            request.transactionPin(), servletRequest.getHeader("Idempotency-Key"));
        return ResponseEntity.status(HttpStatus.CREATED).body(new TransactionResponse(receipt.transactionId(),
            "Pix enviado", receipt.recipientName() + " · agora", receipt.amount().negate(), "debit"));
    }

    private boolean isValidPixKey(String original, String digits) {
        return EMAIL.matcher(original).matches()
            || RANDOM_KEY.matcher(original).matches()
            || PHONE.matcher(digits).matches()
            || CPF.matcher(digits).matches();
    }

    private String maskPixKey(String original, String digits) {
        if (EMAIL.matcher(original).matches()) return original;
        if (RANDOM_KEY.matcher(original).matches()) return "Chave aleatória ••••" + original.substring(original.length() - 4);
        if (PHONE.matcher(digits).matches()) return "Celular ••••" + digits.substring(digits.length() - 4);
        return "CPF •••.•••.••" + digits.substring(digits.length() - 2);
    }

    @ExceptionHandler(PixValidationException.class)
    ResponseEntity<Map<String, String>> handlePixValidation(PixValidationException exception) {
        return ResponseEntity.unprocessableEntity().body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String, String>> handleRequestValidation(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getFieldErrors().stream()
            .findFirst().map(error -> error.getDefaultMessage()).orElse("Dados inválidos.");
        return ResponseEntity.badRequest().body(Map.of("message", message));
    }

    @ExceptionHandler(PixTransferService.PixException.class)
    ResponseEntity<Map<String, String>> handlePixTransfer(PixTransferService.PixException exception) {
        return ResponseEntity.unprocessableEntity().body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(AuthenticationService.AuthException.class)
    ResponseEntity<Map<String, String>> handleAuthentication(AuthenticationService.AuthException exception) {
        return ResponseEntity.status(exception.status()).body(Map.of("message", exception.getMessage()));
    }

    public record CreateTransactionRequest(
        @NotBlank(message = "Informe a chave Pix") String pixKey,
        @NotNull(message = "Informe o valor")
        @DecimalMin(value = "0.01", message = "O valor deve ser positivo") BigDecimal amount,
        @NotBlank(message = "Informe a senha do cartão")
        @jakarta.validation.constraints.Pattern(regexp = "\\d{4}", message = "A senha do cartão deve ter quatro dígitos") String transactionPin
    ) {}

    public record TransactionResponse(Long id, String title, String detail, BigDecimal amount, String type) {
        static TransactionResponse from(BankTransaction transaction) {
            return new TransactionResponse(transaction.getId(), transaction.getTitle(), transaction.getDetail(), transaction.getAmount(), transaction.getType());
        }
    }

    static class PixValidationException extends RuntimeException {
        PixValidationException(String message) { super(message); }
    }
}
