package br.com.ranbank.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(0)
public class ProxySecretFilter extends OncePerRequestFilter {
    static final String HEADER_NAME = "X-Ranbank-Proxy-Secret";

    private final byte[] expectedSecret;

    public ProxySecretFilter(@Value("${ranbank.proxy.secret:}") String secret) {
        this.expectedSecret = secret == null ? new byte[0] : secret.trim().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return expectedSecret.length == 0
            || "/api/health".equals(request.getRequestURI());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String supplied = request.getHeader(HEADER_NAME);
        byte[] suppliedSecret = supplied == null
            ? new byte[0]
            : supplied.getBytes(StandardCharsets.UTF_8);

        if (!MessageDigest.isEqual(expectedSecret, suppliedSecret)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.setHeader("Cache-Control", "no-store");
            response.getWriter().write("{\"message\":\"Acesso à API não autorizado.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
