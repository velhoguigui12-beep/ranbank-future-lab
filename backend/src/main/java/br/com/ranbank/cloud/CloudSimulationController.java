package br.com.ranbank.cloud;

import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cloud")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class CloudSimulationController {
    private final AtomicBoolean primaryFailure = new AtomicBoolean(false);

    @GetMapping("/status")
    public CloudStatus status() {
        return buildStatus();
    }

    @PostMapping("/simulate-failure")
    public CloudStatus simulateFailure() {
        primaryFailure.set(true);
        return buildStatus();
    }

    @PostMapping("/restore")
    public CloudStatus restore() {
        primaryFailure.set(false);
        return buildStatus();
    }

    private CloudStatus buildStatus() {
        boolean failed = primaryFailure.get();
        List<CloudRegion> regions = failed
            ? List.of(
                new CloudRegion("BrasÃ­lia", "br-central", "INDISPONÃVEL", 0, 0),
                new CloudRegion("GoiÃ¢nia", "br-central-2", "ATIVA", 62, 24),
                new CloudRegion("Fortaleza", "br-northeast", "ATIVA", 38, 44))
            : List.of(
                new CloudRegion("BrasÃ­lia", "br-central", "ATIVA", 60, 12),
                new CloudRegion("GoiÃ¢nia", "br-central-2", "ATIVA", 25, 24),
                new CloudRegion("Fortaleza", "br-northeast", "STANDBY", 15, 44));

        List<RecoveryStep> timeline = failed
            ? List.of(
                new RecoveryStep("00 ms", "Falha detectada", "A regiÃ£o principal deixou de responder."),
                new RecoveryStep("120 ms", "Health check confirmou", "TrÃªs verificaÃ§Ãµes consecutivas falharam."),
                new RecoveryStep("240 ms", "TrÃ¡fego redirecionado", "As regiÃµes secundÃ¡rias assumiram as requisiÃ§Ãµes."),
                new RecoveryStep("380 ms", "ServiÃ§o estabilizado", "A aplicaÃ§Ã£o continuou disponÃ­vel para o usuÃ¡rio."))
            : List.of(new RecoveryStep("Agora", "OperaÃ§Ã£o normal", "As regiÃµes estÃ£o sincronizadas e monitoradas."));

        return new CloudStatus(failed ? "DEGRADADO" : "SAUDÃVEL", failed ? "99,98%" : "100%",
            failed ? "GoiÃ¢nia" : "BrasÃ­lia", failed, regions, timeline);
    }

    public record CloudRegion(String name, String code, String status, int trafficPercent, int latencyMs) {}
    public record RecoveryStep(String time, String title, String description) {}
    public record CloudStatus(String systemStatus, String availability, String activeRegion,
        boolean failureActive, List<CloudRegion> regions, List<RecoveryStep> timeline) {}
}

