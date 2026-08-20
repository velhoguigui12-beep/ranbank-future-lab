package br.com.ranbank.automation;

import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "flow_executions")
public class FlowExecution {
    @Id
    private String id;
    private Long accountId;
    private String flowType;
    private String triggerType;
    private String referenceId;
    private String status;
    @Column(length = 4000)
    private String stepsJson;
    private Instant startedAt;
    private Instant completedAt;

    protected FlowExecution() {}

    public FlowExecution(String id, Long accountId, String flowType, String triggerType,
                         String referenceId, String status, String stepsJson,
                         Instant startedAt, Instant completedAt) {
        this.id = id;
        this.accountId = accountId;
        this.flowType = flowType;
        this.triggerType = triggerType;
        this.referenceId = referenceId;
        this.status = status;
        this.stepsJson = stepsJson;
        this.startedAt = startedAt;
        this.completedAt = completedAt;
    }

    public String getId() { return id; }
    public Long getAccountId() { return accountId; }
    public String getFlowType() { return flowType; }
    public String getTriggerType() { return triggerType; }
    public String getReferenceId() { return referenceId; }
    public String getStatus() { return status; }
    public String getStepsJson() { return stepsJson; }
    public Instant getStartedAt() { return startedAt; }
    public Instant getCompletedAt() { return completedAt; }
}
