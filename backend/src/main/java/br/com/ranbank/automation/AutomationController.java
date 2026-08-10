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
            "CONCLUÃDO COM REVISÃƒO HUMANA",
            List.of(
                new AutomationStep(1, "Webhook de alerta", "Recebeu uma transaÃ§Ã£o com risco elevado.", "AutomÃ¡tico", "35 ms"),
                new AutomationStep(2, "Enriquecer contexto", "Consultou dispositivo, localizaÃ§Ã£o e histÃ³rico recente.", "AutomÃ¡tico", "82 ms"),
                new AutomationStep(3, "Aplicar regras", "Classificou o incidente como prioridade alta.", "AutomÃ¡tico", "41 ms"),
                new AutomationStep(4, "Solicitar validaÃ§Ã£o", "Encaminhou o caso para confirmaÃ§Ã£o de um analista.", "Humano", "1,2 s"),
                new AutomationStep(5, "Notificar e registrar", "Gerou alerta e armazenou o resultado da execuÃ§Ã£o.", "AutomÃ¡tico", "64 ms")
            ),
            "O fluxo organiza a resposta, mas nÃ£o substitui antivÃ­rus, autenticaÃ§Ã£o, firewall ou julgamento humano."
        );
    }

    public record AutomationStep(int order, String title, String description, String responsibility, String duration) {}
    public record AutomationRun(String incidentId, String startedAt, String status,
        List<AutomationStep> steps, String limitation) {}
}

