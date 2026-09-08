package br.com.ranbank.auth;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;
import org.springframework.http.ResponseCookie;

public final class SessionCookies {
    private SessionCookies() {}
    public static ResponseCookie create(String token, Duration duration, HttpServletRequest request) {
        boolean secure = request.isSecure() || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));
        return ResponseCookie.from(AuthenticationService.SESSION_COOKIE, token)
            .httpOnly(true).secure(secure).sameSite(secure ? "Strict" : "Lax")
            .path("/api").maxAge(duration).build();
    }
}
