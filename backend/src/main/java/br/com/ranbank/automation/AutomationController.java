package br.com.ranbank.automation;

import br.com.ranbank.auth.AuthenticationService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/automation")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AutomationController {
    private final FlowExecutionService flows;

    public AutomationController(FlowExecutionService flows) { this.flows = flows; }

    @PostMapping("/run")
    public AutomationRun run(HttpServletRequest request) {
        FlowExecutionService.FlowView execution = flows.runIncidentResponse(accountId(request));
        return new AutomationRun(
            "INC-" + execution.id().substring(0, 8).toUpperCase(),
            execution.startedAt().toString(),
            "CONCLUÍDO COM REVISÃO HUMANA",
            execution.steps().stream().map(step -> new AutomationStep(step.order(), step.title(),
                step.description(), "HUMAN".equals(step.responsibility()) ? "Humano" : "Automático",
                step.duration())).toList(),
            "O fluxo organiza a resposta, mas não substitui antivírus, autenticação, firewall ou julgamento humano."
        );
    }

    @GetMapping("/executions")
    public List<FlowExecutionService.FlowView> history(HttpServletRequest request) {
        return flows.history(accountId(request));
    }

    private Long accountId(HttpServletRequest request) {
        return (Long) request.getAttribute(AuthenticationService.ACCOUNT_REQUEST_ATTRIBUTE);
    }

    public record AutomationStep(int order, String title, String description, String responsibility, String duration) {}
    public record AutomationRun(String incidentId, String startedAt, String status,
        List<AutomationStep> steps, String limitation) {}
}
