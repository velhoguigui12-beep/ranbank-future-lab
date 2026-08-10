package br.com.ranbank.transaction;

import br.com.ranbank.account.BankAccount;
import br.com.ranbank.account.BankAccountRepository;
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

    public TransactionController(BankTransactionRepository transactionRepository, BankAccountRepository accountRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<TransactionResponse> create(@Valid @RequestBody CreateTransactionRequest request) {
        String pixKey = request.pixKey().trim();
        String normalizedDigits = pixKey.replaceAll("\\D", "");
        if (!isValidPixKey(pixKey, normalizedDigits)) {
            throw new PixValidationException("Informe uma chave Pix válida: CPF, celular, e-mail ou chave aleatória.");
        }

        BankAccount account = accountRepository.findById(1L)
            .orElseThrow(() -> new PixValidationException("Conta demonstrativa não encontrada."));
        try {
            account.debit(request.amount());
        } catch (IllegalArgumentException exception) {
            throw new PixValidationException(exception.getMessage());
        }

        BankTransaction transaction = transactionRepository.save(new BankTransaction(
            "Pix enviado", maskPixKey(pixKey, normalizedDigits) + " · agora",
            request.amount().negate(), "debit"
        ));
        accountRepository.save(account);
        return ResponseEntity.status(HttpStatus.CREATED).body(TransactionResponse.from(transaction));
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

    public record CreateTransactionRequest(
        @NotBlank(message = "Informe a chave Pix") String pixKey,
        @NotNull(message = "Informe o valor")
        @DecimalMin(value = "0.01", message = "O valor deve ser positivo") BigDecimal amount
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
