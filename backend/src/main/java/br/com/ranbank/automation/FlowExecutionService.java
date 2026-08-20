package br.com.ranbank.automation;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class FlowExecutionService {
    private final FlowExecutionRepository repository;
    private final ObjectMapper objectMapper;

    public FlowExecutionService(FlowExecutionRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    public FlowView runIncidentResponse(Long accountId) {
        return create(accountId, "INCIDENT_RESPONSE", "MANUAL", null, List.of(
            new FlowStep(1, "Receber alerta", "Evento recebido e validado.", "AUTOMATIC", "35 ms"),
            new FlowStep(2, "Enriquecer contexto", "Conta, dispositivo e histórico correlacionados.", "AUTOMATIC", "82 ms"),
            new FlowStep(3, "Aplicar regras", "Risco e prioridade calculados.", "AUTOMATIC", "41 ms"),
            new FlowStep(4, "Revisão humana", "Caso disponibilizado para decisão do analista.", "HUMAN", "1,2 s"),
            new FlowStep(5, "Notificar e auditar", "Resultado persistido e comunicado.", "AUTOMATIC", "64 ms")
        ));
    }

    public FlowView recordPixTransfer(Long accountId, String transferId) {
        return create(accountId, "PIX_SETTLEMENT", "PIX_COMPLETED", transferId, List.of(
            new FlowStep(1, "Validar sessão e PIN", "Identidade e autorização transacional confirmadas.", "AUTOMATIC", "12 ms"),
            new FlowStep(2, "Bloquear contas", "Saldos protegidos contra alterações concorrentes.", "AUTOMATIC", "8 ms"),
            new FlowStep(3, "Liquidar transferência", "Débito e crédito gravados na mesma transação.", "AUTOMATIC", "21 ms"),
            new FlowStep(4, "Auditar", "Hashes encadeados registrados para as duas contas.", "AUTOMATIC", "9 ms"),
            new FlowStep(5, "Notificar", "Eventos em tempo real publicados após o commit.", "AUTOMATIC", "6 ms")
        ));
    }

    public List<FlowView> history(Long accountId) {
        return repository.findByAccountIdOrderByStartedAtDesc(accountId).stream().map(this::view).toList();
    }

    private FlowView create(Long accountId, String flowType, String trigger, String referenceId, List<FlowStep> steps) {
        Instant startedAt = Instant.now();
        FlowExecution saved = repository.save(new FlowExecution(UUID.randomUUID().toString(), accountId,
            flowType, trigger, referenceId, "COMPLETED", write(steps), startedAt, Instant.now()));
        return view(saved);
    }

    private FlowView view(FlowExecution execution) {
        try {
            List<FlowStep> steps = objectMapper.readValue(execution.getStepsJson(), new TypeReference<>() {});
            return new FlowView(execution.getId(), execution.getFlowType(), execution.getTriggerType(),
                execution.getReferenceId(), execution.getStatus(), execution.getStartedAt(),
                execution.getCompletedAt(), steps);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Não foi possível ler a execução do RanFlow.", exception);
        }
    }

    private String write(List<FlowStep> steps) {
        try { return objectMapper.writeValueAsString(steps); }
        catch (JsonProcessingException exception) { throw new IllegalStateException("Não foi possível gravar o RanFlow.", exception); }
    }

    public record FlowStep(int order, String title, String description, String responsibility, String duration) {}
    public record FlowView(String id, String flowType, String triggerType, String referenceId,
                           String status, Instant startedAt, Instant completedAt, List<FlowStep> steps) {}
}
