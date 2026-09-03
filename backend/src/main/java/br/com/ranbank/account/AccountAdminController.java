package br.com.ranbank.account;

import br.com.ranbank.auth.AuthenticationService;
import br.com.ranbank.pix.PixKeyRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/accounts")
public class AccountAdminController {
    private final BankAccountRepository accounts;
    private final AuthenticationService authentication;
    private final PixKeyRepository pixKeys;

    public AccountAdminController(BankAccountRepository accounts, AuthenticationService authentication,
                                  PixKeyRepository pixKeys) {
        this.accounts = accounts;
        this.authentication = authentication;
        this.pixKeys = pixKeys;
    }

    @GetMapping
    public List<AccountView> list(HttpServletRequest request) {
        requireAdmin(request);
        return accounts.findAll().stream().sorted(Comparator.comparing(BankAccount::getCreatedAt))
            .map(AccountView::from).toList();
    }

    @PatchMapping("/{id}/status")
    @Transactional
    public AccountView changeStatus(@PathVariable Long id, @RequestBody StatusRequest body,
                                    HttpServletRequest request) {
        requireAdmin(request);
        protectDemoAccount(id);
        BankAccount account = accounts.findById(id).orElseThrow(() -> new AdminAccountException("Conta não encontrada."));
        if (body.active()) account.reactivate(); else account.deactivate();
        accounts.save(account);
        if (!body.active()) authentication.invalidateAccountSessions(id);
        return AccountView.from(account);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public Map<String, String> remove(@PathVariable Long id, HttpServletRequest request) {
        requireAdmin(request);
        protectDemoAccount(id);
        BankAccount account = accounts.findById(id).orElseThrow(() -> new AdminAccountException("Conta não encontrada."));
        authentication.invalidateAccountSessions(id);
        pixKeys.deleteByAccountId(id);
        account.anonymize();
        accounts.save(account);
        return Map.of("message", "Conta removida e dados pessoais anonimizados. O histórico financeiro foi preservado.");
    }

    private void requireAdmin(HttpServletRequest request) {
        Long accountId = (Long) request.getAttribute(AuthenticationService.ACCOUNT_REQUEST_ATTRIBUTE);
        BankAccount account = accounts.findById(accountId)
            .orElseThrow(() -> new AdminAccountException("Conta administradora não encontrada."));
        if (!"ADMIN".equals(account.getRole()) || !account.isActive()) {
            throw new AdminAccountException("Acesso restrito à administração.");
        }
    }

    private void protectDemoAccount(Long id) {
        if (Long.valueOf(1L).equals(id)) throw new AdminAccountException("A conta principal da apresentação é protegida.");
    }

    public record StatusRequest(boolean active) {}
    public record AccountView(Long id, String customerName, String accountNumber, String email, String phoneNumber,
                              String maskedDocument, String role, boolean active, boolean deleted,
                              BigDecimal balance, Instant createdAt) {
        static AccountView from(BankAccount account) {
            String document = account.getDocumentId();
            String masked = document == null || !document.matches("\\d{11}") ? "Não disponível"
                : "•••.•••.•••-" + document.substring(9);
            return new AccountView(account.getId(), account.getCustomerName(), account.getAccountNumber(),
                account.getEmail(), account.getPhoneNumber(), masked, account.getRole(), account.isActive(), account.getDeletedAt() != null,
                account.getBalance(), account.getCreatedAt());
        }
    }

    @ExceptionHandler(AdminAccountException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    Map<String, String> handle(AdminAccountException exception) { return Map.of("message", exception.getMessage()); }

    static class AdminAccountException extends RuntimeException {
        AdminAccountException(String message) { super(message); }
    }
}
