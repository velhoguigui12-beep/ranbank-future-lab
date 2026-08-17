package br.com.ranbank.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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
        authenticationService.logout(AuthenticationFilter.cookieValue(request));
        ResponseCookie cookie = sessionCookie("", Duration.ZERO, request);
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString())
            .body(Map.of("message", "Sessão encerrada."));
    }

    private ResponseCookie sessionCookie(String value, Duration maxAge, HttpServletRequest request) {
        boolean secure = request.isSecure() || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));
        return ResponseCookie.from(AuthenticationService.SESSION_COOKIE, value).httpOnly(true).secure(secure)
            .sameSite(secure ? "None" : "Lax").path("/api").maxAge(maxAge).build();
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
}

