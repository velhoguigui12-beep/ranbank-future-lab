package br.com.ranbank.auth;

import br.com.ranbank.account.BankAccount;
import br.com.ranbank.account.BankAccountRepository;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {
    public static final String SESSION_COOKIE = "RANBANK_SESSION";
    public static final String ACCOUNT_REQUEST_ATTRIBUTE = "ranbank.accountId";
    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final int MAX_TRANSACTION_ATTEMPTS = 3;
    private static final Duration LOCK_DURATION = Duration.ofSeconds(30);

    private final BankAccountRepository accountRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);
    private final SecureRandom secureRandom = new SecureRandom();
    private final Map<String, Session> sessions = new ConcurrentHashMap<>();
    private final Map<Long, AttemptState> loginAttempts = new ConcurrentHashMap<>();
    private final Map<Long, AttemptState> transactionAttempts = new ConcurrentHashMap<>();
    private final String demoLoginId;
    private final String demoAccessPin;
    private final String demoTransactionPin;
    private final Duration sessionDuration;

    public AuthenticationService(BankAccountRepository accountRepository,
            @Value("${ranbank.demo.login-id}") String demoLoginId,
            @Value("${ranbank.demo.access-pin}") String demoAccessPin,
            @Value("${ranbank.demo.transaction-pin}") String demoTransactionPin,
            @Value("${ranbank.session.minutes:30}") long sessionMinutes) {
        this.accountRepository = accountRepository;
        this.demoLoginId = digits(demoLoginId);
        this.demoAccessPin = demoAccessPin;
        this.demoTransactionPin = demoTransactionPin;
        this.sessionDuration = Duration.ofMinutes(Math.max(5, sessionMinutes));
    }

    public void configureDemoCredentials() {
        BankAccount account = accountRepository.findById(1L)
            .orElseThrow(() -> new IllegalStateException("Conta demonstrativa não encontrada."));
        boolean currentAccessPin = account.getAccessPinHash() != null
            && passwordEncoder.matches(demoAccessPin, account.getAccessPinHash());
        boolean currentTransactionPin = account.getTransactionPinHash() != null
            && passwordEncoder.matches(demoTransactionPin, account.getTransactionPinHash());
        if (!demoLoginId.equals(account.getDocumentId()) || !currentAccessPin || !currentTransactionPin) {
            account.configureDemoCredentials(demoLoginId, passwordEncoder.encode(demoAccessPin),
                passwordEncoder.encode(demoTransactionPin));
            accountRepository.save(account);
        }
    }

    public LoginResult login(String identification, String pin) {
        BankAccount account = accountRepository.findById(1L)
            .orElseThrow(() -> invalidCredentials(null));
        assertNotLocked(loginAttempts, account.getId(), "Muitas tentativas. Aguarde antes de tentar novamente.");
        String normalized = digits(identification);
        boolean validIdentity = normalized.equals(digits(account.getDocumentId()))
            || normalized.equals(digits(account.getAccountNumber()));
        boolean validPin = pin != null && account.getAccessPinHash() != null
            && passwordEncoder.matches(pin, account.getAccessPinHash());
        if (!validIdentity || !validPin) {
            recordFailure(loginAttempts, account.getId(), MAX_LOGIN_ATTEMPTS);
            throw invalidCredentials(account.getId());
        }
        loginAttempts.remove(account.getId());
        String token = newToken();
        Instant expiresAt = Instant.now().plus(sessionDuration);
        sessions.put(token, new Session(account.getId(), expiresAt));
        return new LoginResult(token, expiresAt, account.getCustomerName(), account.getAccountNumber());
    }

    public Long resolveSession(String token) {
        if (token == null || token.isBlank()) return null;
        Session session = sessions.get(token);
        if (session == null) return null;
        if (session.expiresAt().isBefore(Instant.now())) {
            sessions.remove(token);
            return null;
        }
        sessions.put(token, new Session(session.accountId(), Instant.now().plus(sessionDuration)));
        return session.accountId();
    }

    public SessionView sessionView(Long accountId) {
        BankAccount account = accountRepository.findById(accountId)
            .orElseThrow(() -> new AuthException(HttpStatus.UNAUTHORIZED, "Sessão inválida."));
        return new SessionView(account.getCustomerName(), account.getAccountNumber());
    }

    public void logout(String token) {
        if (token != null) sessions.remove(token);
    }

    public void verifyTransactionPin(Long accountId, String pin) {
        assertNotLocked(transactionAttempts, accountId,
            "Senha transacional bloqueada temporariamente após três tentativas.");
        BankAccount account = accountRepository.findById(accountId)
            .orElseThrow(() -> new AuthException(HttpStatus.UNAUTHORIZED, "Conta não encontrada."));
        boolean valid = pin != null && account.getTransactionPinHash() != null
            && passwordEncoder.matches(pin, account.getTransactionPinHash());
        if (!valid) {
            recordFailure(transactionAttempts, accountId, MAX_TRANSACTION_ATTEMPTS);
            throw new AuthException(HttpStatus.UNAUTHORIZED, "Senha de quatro dígitos incorreta.");
        }
        transactionAttempts.remove(accountId);
    }

    public Duration sessionDuration() { return sessionDuration; }

    private AuthException invalidCredentials(Long accountId) {
        AttemptState state = accountId == null ? null : loginAttempts.get(accountId);
        if (state != null && state.lockedUntil() != null && state.lockedUntil().isAfter(Instant.now())) {
            return new AuthException(HttpStatus.LOCKED, "Acesso bloqueado por 30 segundos após cinco tentativas.");
        }
        return new AuthException(HttpStatus.UNAUTHORIZED, "CPF, conta ou PIN inválido.");
    }

    private void assertNotLocked(Map<Long, AttemptState> attempts, Long accountId, String message) {
        AttemptState state = attempts.get(accountId);
        if (state == null || state.lockedUntil() == null) return;
        if (state.lockedUntil().isAfter(Instant.now())) throw new AuthException(HttpStatus.LOCKED, message);
        attempts.remove(accountId);
    }

    private void recordFailure(Map<Long, AttemptState> attempts, Long accountId, int maximum) {
        attempts.compute(accountId, (key, current) -> {
            int failures = current == null ? 1 : current.failures() + 1;
            return failures >= maximum
                ? new AttemptState(failures, Instant.now().plus(LOCK_DURATION))
                : new AttemptState(failures, null);
        });
    }

    private String newToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String digits(String value) { return value == null ? "" : value.replaceAll("\\D", ""); }

    private record Session(Long accountId, Instant expiresAt) {}
    private record AttemptState(int failures, Instant lockedUntil) {}
    public record LoginResult(String token, Instant expiresAt, String customerName, String accountNumber) {}
    public record SessionView(String customerName, String accountNumber) {}

    public static class AuthException extends RuntimeException {
        private final HttpStatus status;
        public AuthException(HttpStatus status, String message) { super(message); this.status = status; }
        public HttpStatus status() { return status; }
    }
}
