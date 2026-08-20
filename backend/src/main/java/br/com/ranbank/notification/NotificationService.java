package br.com.ranbank.notification;

import jakarta.transaction.Transactional;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
public class NotificationService {
    private final NotificationRepository repository;
    private final Map<Long, CopyOnWriteArrayList<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public NotificationService(NotificationRepository repository) { this.repository = repository; }

    public Notification create(Long accountId, String type, String title, String message, String referenceId) {
        Notification saved = repository.save(new Notification(accountId, type, title, message, referenceId));
        afterCommit(() -> publish(saved));
        return saved;
    }

    public List<NotificationView> list(Long accountId) {
        return repository.findByAccountIdOrderByCreatedAtDesc(accountId).stream().map(NotificationView::from).toList();
    }

    @Transactional
    public NotificationView markRead(Long accountId, Long id) {
        Notification notification = repository.findByIdAndAccountId(id, accountId)
            .orElseThrow(() -> new NotificationException("Notificação não encontrada."));
        notification.markRead();
        return NotificationView.from(repository.save(notification));
    }

    @Transactional
    public void markAllRead(Long accountId) {
        List<Notification> notifications = repository.findByAccountIdOrderByCreatedAtDesc(accountId);
        notifications.forEach(Notification::markRead);
        repository.saveAll(notifications);
    }

    public SseEmitter connect(Long accountId) {
        SseEmitter emitter = new SseEmitter(30L * 60L * 1000L);
        emitters.computeIfAbsent(accountId, ignored -> new CopyOnWriteArrayList<>()).add(emitter);
        Runnable cleanup = () -> remove(accountId, emitter);
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(ignored -> cleanup.run());
        try {
            emitter.send(SseEmitter.event().name("connected").data(Map.of("status", "connected")));
        } catch (IOException exception) {
            emitter.completeWithError(exception);
        }
        return emitter;
    }

    private void publish(Notification notification) {
        NotificationView view = NotificationView.from(notification);
        for (SseEmitter emitter : emitters.getOrDefault(notification.getAccountId(), new CopyOnWriteArrayList<>())) {
            try {
                emitter.send(SseEmitter.event().name("notification").id(String.valueOf(notification.getId())).data(view));
            } catch (IOException exception) {
                emitter.complete();
                remove(notification.getAccountId(), emitter);
            }
        }
    }

    private void remove(Long accountId, SseEmitter emitter) {
        List<SseEmitter> accountEmitters = emitters.get(accountId);
        if (accountEmitters != null) accountEmitters.remove(emitter);
    }

    private void afterCommit(Runnable action) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCommit() { action.run(); }
            });
        } else action.run();
    }

    public record NotificationView(Long id, String type, String title, String message, String referenceId,
                                   java.time.Instant createdAt, boolean read) {
        static NotificationView from(Notification item) {
            return new NotificationView(item.getId(), item.getNotificationType(), item.getTitle(), item.getMessage(),
                item.getReferenceId(), item.getCreatedAt(), item.isRead());
        }
    }

    public static class NotificationException extends RuntimeException {
        NotificationException(String message) { super(message); }
    }
}
