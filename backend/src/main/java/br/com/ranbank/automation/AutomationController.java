package br.com.ranbank.automation;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/automation")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AutomationController {

    @PostMapping("/run")
    public AutomationRun run() {
        return new AutomationRun(
            "INC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
            Instant.now().toString(),
            "CONCLUÍDO COM REVISÃO HUMANA",
            List.of(
                new AutomationStep(1, "Webhook de alerta", "Recebeu uma transação com risco elevado.", "Automático", "35 ms"),
                new AutomationStep(2, "Enriquecer contexto", "Consultou dispositivo, localização e histórico recente.", "Automático", "82 ms"),
                new AutomationStep(3, "Aplicar regras", "Classificou o incidente como prioridade alta.", "Automático", "41 ms"),
                new AutomationStep(4, "Solicitar validação", "Encaminhou o caso para confirmação de um analista.", "Humano", "1,2 s"),
                new AutomationStep(5, "Notificar e registrar", "Gerou alerta e armazenou o resultado da execução.", "Automático", "64 ms")
            ),
            "O fluxo organiza a resposta, mas não substitui antivírus, autenticação, firewall ou julgamento humano."
        );
    }

    public record AutomationStep(int order, String title, String description, String responsibility, String duration) {}
    public record AutomationRun(String incidentId, String startedAt, String status,
        List<AutomationStep> steps, String limitation) {}
}
