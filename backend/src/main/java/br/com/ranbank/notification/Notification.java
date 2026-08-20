package br.com.ranbank.notification;

import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long accountId;
    private String notificationType;
    private String title;
    @Column(length = 1000)
    private String message;
    private String referenceId;
    private Instant createdAt;
    private Instant readAt;

    protected Notification() {}

    public Notification(Long accountId, String notificationType, String title, String message, String referenceId) {
        this.accountId = accountId;
        this.notificationType = notificationType;
        this.title = title;
        this.message = message;
        this.referenceId = referenceId;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getAccountId() { return accountId; }
    public String getNotificationType() { return notificationType; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public String getReferenceId() { return referenceId; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getReadAt() { return readAt; }
    public boolean isRead() { return readAt != null; }
    public void markRead() { if (readAt == null) readAt = Instant.now(); }
}
