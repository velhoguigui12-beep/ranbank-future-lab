package br.com.ranbank.auth;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Email;
import java.time.Duration;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationService authenticationService;

    public AuthController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest) {
        invalidateIncomingSessions(servletRequest);
        AuthenticationService.LoginResult result = authenticationService.login(request.identification(), request.pin());
        ResponseCookie cookie = sessionCookie(result.token(), authenticationService.sessionDuration(), servletRequest);
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString())
            .body(new LoginResponse(result.customerName(), result.accountNumber(), result.expiresAt().toString()));
    }

    @GetMapping("/session")
    public AuthenticationService.SessionView session(HttpServletRequest request) {
        return authenticationService.sessionView((Long) request.getAttribute(AuthenticationService.ACCOUNT_REQUEST_ATTRIBUTE));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request) {
        invalidateIncomingSessions(request);
        ResponseCookie cookie = sessionCookie("", Duration.ZERO, request);
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString())
            .body(Map.of("message", "Sessão encerrada."));
    }

    @PostMapping("/recover-pin")
    public Map<String, String> recoverPin(@Valid @RequestBody RecoverPinRequest request) {
        authenticationService.recoverAccessPin(request.identification(), request.email(),
            request.transactionPin(), request.newAccessPin());
        return Map.of("message", "PIN de acesso redefinido. Entre novamente com o novo PIN.");
    }

    private void invalidateIncomingSessions(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return;
        for (Cookie cookie : cookies) {
            if (AuthenticationService.SESSION_COOKIE.equals(cookie.getName())) {
                authenticationService.logout(cookie.getValue());
            }
        }
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

    @ExceptionHandler(AuthenticationService.AuthException.class)
    ResponseEntity<Map<String, String>> handleAuthentication(AuthenticationService.AuthException exception) {
        return ResponseEntity.status(exception.status()).body(Map.of("message", exception.getMessage()));
    }

    public record LoginRequest(
        @NotBlank(message = "Informe seu CPF ou sua conta") String identification,
        @NotBlank(message = "Informe seu PIN") @Pattern(regexp = "\\d{4}", message = "O PIN deve ter quatro dígitos") String pin
    ) {}
    public record LoginResponse(String customerName, String accountNumber, String expiresAt) {}
    public record RecoverPinRequest(
        @NotBlank String identification,
        @NotBlank @Email String email,
        @NotBlank @Pattern(regexp = "\\d{4}") String transactionPin,
        @NotBlank @Pattern(regexp = "\\d{4}") String newAccessPin
    ) {}
}
