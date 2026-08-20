package br.com.ranbank.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(1)
public class AuthenticationFilter extends OncePerRequestFilter {
    private final AuthenticationService authenticationService;
    private final ObjectMapper objectMapper;

    public AuthenticationFilter(AuthenticationService authenticationService, ObjectMapper objectMapper) {
        this.authenticationService = authenticationService;
        this.objectMapper = objectMapper;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;
        return path.equals("/api/health") || path.equals("/api/auth/login") || path.equals("/api/auth/logout")
            || path.equals("/api/demo-accounts")
            || path.startsWith("/api/chat") || path.startsWith("/api/fraud")
            || path.startsWith("/api/cloud")
            || path.startsWith("/api/sustainability") || path.startsWith("/api/comparison")
            || path.startsWith("/api/security") || path.startsWith("/api/immersive")
            || path.startsWith("/api/robotics") || path.startsWith("/api/authentication")
            || !path.startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        Long accountId = authenticationService.resolveSession(cookieValue(request));
        if (accountId == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            objectMapper.writeValue(response.getWriter(), Map.of("message", "Entre no Ranbank para continuar."));
            return;
        }
        request.setAttribute(AuthenticationService.ACCOUNT_REQUEST_ATTRIBUTE, accountId);
        filterChain.doFilter(request, response);
    }

    public static String cookieValue(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if (AuthenticationService.SESSION_COOKIE.equals(cookie.getName())) return cookie.getValue();
        }
        return null;
    }
}
