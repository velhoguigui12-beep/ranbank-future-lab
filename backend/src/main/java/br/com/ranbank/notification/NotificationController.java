package br.com.ranbank.notification;

import br.com.ranbank.auth.AuthenticationService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notifications;
    public NotificationController(NotificationService notifications) { this.notifications = notifications; }

    @GetMapping
    public List<NotificationService.NotificationView> list(HttpServletRequest request) {
        return notifications.list(accountId(request));
    }

    @PatchMapping("/{id}/read")
    public NotificationService.NotificationView read(@PathVariable Long id, HttpServletRequest request) {
        return notifications.markRead(accountId(request), id);
    }

    @PatchMapping("/read-all")
    public Map<String, String> readAll(HttpServletRequest request) {
        notifications.markAllRead(accountId(request));
        return Map.of("message", "Notificações marcadas como lidas.");
    }

    /**
     * O frontend ainda abre um EventSource para este endpoint, mas no Render Free
     * conexões SSE podem reconectar repetidamente durante cold starts/instabilidade e
     * gerar rajadas de requisições. HTTP 204 instrui o EventSource a encerrar sem
     * tentar reconectar. As notificações continuam disponíveis pelo GET /api/notifications.
     */
    @GetMapping("/stream")
    public ResponseEntity<Void> stream() {
        return ResponseEntity.noContent().build();
    }

    private Long accountId(HttpServletRequest request) {
        return (Long) request.getAttribute(AuthenticationService.ACCOUNT_REQUEST_ATTRIBUTE);
    }

    @ExceptionHandler(NotificationService.NotificationException.class)
    ResponseEntity<Map<String, String>> handle(NotificationService.NotificationException exception) {
        return ResponseEntity.status(404).body(Map.of("message", exception.getMessage()));
    }
}
