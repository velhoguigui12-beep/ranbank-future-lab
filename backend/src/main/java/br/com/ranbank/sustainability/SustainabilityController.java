package br.com.ranbank.sustainability;

import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sustainability")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class SustainabilityController {
    private final AtomicBoolean optimized = new AtomicBoolean(false);

    @GetMapping("/status")
    public SustainabilityStatus status() { return buildStatus(); }

    @PostMapping("/optimize")
    public SustainabilityStatus optimize() {
        optimized.set(!optimized.get());
        return buildStatus();
    }

    private SustainabilityStatus buildStatus() {
        boolean active = optimized.get();
        return new SustainabilityStatus(
            active, active ? 42.6 : 58.4, active ? 78 : 54, active ? 8.7 : 14.2,
            active ? 1.18 : 1.42, active ? 27 : 0,
            List.of(
                new EnergySource("Solar", active ? 46 : 32, "RENOVÁVEL"),
                new EnergySource("Eólica", active ? 32 : 22, "RENOVÁVEL"),
                new EnergySource("Rede elétrica", active ? 22 : 46, "MISTA")
            ),
            active
                ? List.of("Cargas não críticas migradas", "Servidores ociosos consolidados", "Maior uso de energia renovável")
                : List.of("Consumo acima da meta", "Capacidade ociosa identificada", "Otimização disponível")
        );
    }

    public record EnergySource(String name, int percentage, String type) {}
    public record SustainabilityStatus(boolean optimized, double powerKw, int renewablePercent,
        double carbonKgHour, double pue, int savingsPercent, List<EnergySource> sources, List<String> actions) {}
}
