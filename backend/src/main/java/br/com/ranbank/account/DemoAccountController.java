package br.com.ranbank.account;

import br.com.ranbank.auth.AuthenticationService;
import br.com.ranbank.pix.PixKey;
import br.com.ranbank.pix.PixKeyRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Locale;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/demo-accounts")
public class DemoAccountController {
    private static final BigDecimal INITIAL_BALANCE = new BigDecimal("2500.00");
    private final BankAccountRepository accounts;
    private final PixKeyRepository pixKeys;
    private final AuthenticationService authentication;
    private final SecureRandom random = new SecureRandom();

    public DemoAccountController(BankAccountRepository accounts, PixKeyRepository pixKeys,
                                 AuthenticationService authentication) {
        this.accounts = accounts;
        this.pixKeys = pixKeys;
        this.authentication = authentication;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<AccountCreatedResponse> create(@Valid @RequestBody CreateDemoAccountRequest body,
                                                          HttpServletRequest request) {
        invalidateIncomingSession(request);

        String document = digits(body.documentId());
        String email = body.email().trim().toLowerCase(Locale.ROOT);
        String phoneNumber = digits(body.phoneNumber());
        if (accounts.existsByDocumentId(document)) throw new AccountConflict("Já existe uma conta com este CPF.");
        if (accounts.existsByEmailIgnoreCase(email) || pixKeys.existsByNormalizedKey(email)) {
            throw new AccountConflict("Este e-mail já está vinculado a uma conta.");
        }
        if (accounts.existsByPhoneNumber(phoneNumber) || pixKeys.existsByNormalizedKey(phoneNumber)) {
            throw new AccountConflict("Este telefone já está vinculado a uma conta.");
        }
        if (pixKeys.existsByNormalizedKey(document)) throw new AccountConflict("Este CPF já está vinculado a uma chave Pix.");

        long accountId = newAccountId();
        String accountNumber = accountNumber(accountId);
        BankAccount account = new BankAccount(accountId, body.customerName().trim(), accountNumber,
            document, email, INITIAL_BALANCE);
        account.updatePhoneNumber(phoneNumber);
        account.configureCredentials(authentication.hashPin(body.accessPin()),
            authentication.hashPin(body.transactionPin()));
        accounts.save(account);
        pixKeys.save(new PixKey(accountId, "EMAIL", email, email));
        pixKeys.save(new PixKey(accountId, "CPF", document, formatCpf(document)));
        pixKeys.save(new PixKey(accountId, "PHONE", phoneNumber, formatPhone(phoneNumber)));

        AuthenticationService.LoginResult session = authentication.login(document, body.accessPin());
        ResponseCookie cookie = sessionCookie(session.token(), authentication.sessionDuration(), request);
        return ResponseEntity.status(HttpStatus.CREATED).header(HttpHeaders.SET_COOKIE, cookie.toString())
            .body(new AccountCreatedResponse(accountId, account.getCustomerName(), accountNumber, email,
                INITIAL_BALANCE, session.expiresAt().toString()));
    }

    private void invalidateIncomingSession(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return;
        for (Cookie cookie : cookies) {
            if (AuthenticationService.SESSION_COOKIE.equals(cookie.getName())) {
                authentication.logout(cookie.getValue());
            }
        }
    }

    private long newAccountId() {
        long candidate;
        do candidate = random.nextLong(100_000L, 1_000_000L); while (accounts.existsById(candidate));
        return candidate;
    }

    private String accountNumber(long id) {
        long checkDigit = id % 10;
        return "%06d-%d".formatted(id, checkDigit);
    }

    private ResponseCookie sessionCookie(String value, Duration maxAge, HttpServletRequest request) {
        boolean secure = request.isSecure() || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));
        return ResponseCookie.from(AuthenticationService.SESSION_COOKIE, value)
            .httpOnly(true)
            .secure(secure)
            .sameSite(secure ? "Strict" : "Lax")
            .path("/api")
            .maxAge(maxAge)
            .build();
    }

    private static String digits(String value) { return value == null ? "" : value.replaceAll("\\D", ""); }
    private static String formatCpf(String value) {
        return "%s.%s.%s-%s".formatted(value.substring(0, 3), value.substring(3, 6),
            value.substring(6, 9), value.substring(9));
    }
    private static String formatPhone(String value) {
        int prefix = value.length() == 11 ? 7 : 6;
        return "(%s) %s-%s".formatted(value.substring(0, 2), value.substring(2, prefix), value.substring(prefix));
    }

    @ExceptionHandler(AccountConflict.class)
    ResponseEntity<Map<String, String>> handleConflict(AccountConflict exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", exception.getMessage()));
    }

    public record CreateDemoAccountRequest(
        @NotBlank(message = "Informe seu nome") String customerName,
        @NotBlank(message = "Informe o CPF")
        @Pattern(regexp = "(?:\\D*\\d){11}\\D*", message = "O CPF deve ter onze dígitos") String documentId,
        @NotBlank(message = "Informe o e-mail") @Email(message = "Informe um e-mail válido") String email,
        @NotBlank(message = "Informe o telefone")
        @Pattern(regexp = "(?:\\D*\\d){10,11}\\D*", message = "Informe um telefone com DDD") String phoneNumber,
        @NotBlank(message = "Informe o PIN de acesso")
        @Pattern(regexp = "\\d{4}", message = "O PIN de acesso deve ter quatro dígitos") String accessPin,
        @NotBlank(message = "Informe o PIN transacional")
        @Pattern(regexp = "\\d{4}", message = "O PIN transacional deve ter quatro dígitos") String transactionPin
    ) {}

    public record AccountCreatedResponse(Long accountId, String customerName, String accountNumber,
                                         String pixKey, BigDecimal balance, String expiresAt) {}

    static class AccountConflict extends RuntimeException {
        AccountConflict(String message) { super(message); }
    }
}
