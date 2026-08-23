package br.com.ranbank.pix;

import br.com.ranbank.auth.AuthenticationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;
import java.util.Map;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pix")
public class PixController {
    private final PixTransferService pix;
    private final PixKeyManagementService keyManagement;

    public PixController(PixTransferService pix, PixKeyManagementService keyManagement) {
        this.pix = pix;
        this.keyManagement = keyManagement;
    }

    @GetMapping("/keys")
    public List<PixKeyManagementService.KeyView> keys(HttpServletRequest request) {
        return keyManagement.list(accountId(request));
    }

    @PostMapping("/keys")
    public ResponseEntity<PixKeyManagementService.KeyView> createKey(@RequestBody CreateKeyRequest body,
                                                                      HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(keyManagement.create(accountId(request), body.type(), body.value()));
    }

    @DeleteMapping("/keys/{id}")
    public Map<String, String> deleteKey(@PathVariable Long id, HttpServletRequest request) {
        keyManagement.delete(accountId(request), id);
        return Map.of("message", "Chave Pix removida.");
    }

    @GetMapping("/recipients/resolve")
    public PixTransferService.Recipient resolve(@RequestParam String key, HttpServletRequest request) {
        return pix.resolveRecipient(accountId(request), key);
    }

    @PostMapping("/transfers")
    public ResponseEntity<PixTransferService.Receipt> transfer(@Valid @RequestBody TransferRequest body,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pix.transfer(accountId(request), body.pixKey(),
            body.amount(), body.transactionPin(), idempotencyKey));
    }

    @GetMapping("/transfers/{id}/receipt")
    public PixTransferService.Receipt receipt(@PathVariable String id, HttpServletRequest request) {
        return pix.receiptFor(accountId(request), id);
    }

    private Long accountId(HttpServletRequest request) {
        return (Long) request.getAttribute(AuthenticationService.ACCOUNT_REQUEST_ATTRIBUTE);
    }

    @ExceptionHandler(PixTransferService.PixException.class)
    ResponseEntity<Map<String, String>> handle(PixTransferService.PixException exception) {
        return ResponseEntity.unprocessableEntity().body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(PixKeyManagementService.PixKeyException.class)
    ResponseEntity<Map<String, String>> handleKey(PixKeyManagementService.PixKeyException exception) {
        return ResponseEntity.unprocessableEntity().body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(AuthenticationService.AuthException.class)
    ResponseEntity<Map<String, String>> handleAuth(AuthenticationService.AuthException exception) {
        return ResponseEntity.status(exception.status()).body(Map.of("message", exception.getMessage()));
    }

    public record TransferRequest(@NotBlank String pixKey,
        @NotNull @DecimalMin("0.01") BigDecimal amount,
        @NotBlank @Pattern(regexp = "\\d{4}") String transactionPin) {}
    public record CreateKeyRequest(String type, String value) {}
}
