package br.com.ranbank.comparison;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/comparison")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class TechnologyComparisonController {
    private static final Map<String, Map<String, Integer>> SCORES = Map.of(
        "seguranca", Map.of("IA", 94, "Big Data", 86, "IoT", 65, "Nuvem", 82, "Automação", 90, "Sustentabilidade", 52),
        "escala", Map.of("IA", 78, "Big Data", 96, "IoT", 84, "Nuvem", 98, "Automação", 88, "Sustentabilidade", 72),
        "eficiencia", Map.of("IA", 85, "Big Data", 82, "IoT", 76, "Nuvem", 91, "Automação", 96, "Sustentabilidade", 94)
    );

    @GetMapping
    public ComparisonResponse compare(@RequestParam(defaultValue = "seguranca") String goal) {
        String selected = SCORES.containsKey(goal) ? goal : "seguranca";
        Map<String, Integer> score = SCORES.get(selected);
        List<TechnologyResult> results = List.of(
            new TechnologyResult("IA", score.get("IA"), "Alto", "Em evolução", "Reconhecimento de padrões", "Exige dados de qualidade e supervisão."),
            new TechnologyResult("Big Data", score.get("Big Data"), "Alto", "Maduro", "Análise de grandes volumes", "Infraestrutura e governança são complexas."),
            new TechnologyResult("IoT", score.get("IoT"), "Médio", "Maduro", "Telemetria de dispositivos", "Amplia a superfície de ataque."),
            new TechnologyResult("Nuvem", score.get("Nuvem"), "Médio", "Muito maduro", "Escala e disponibilidade", "Depende de configuração e conectividade."),
            new TechnologyResult("Automação", score.get("Automação"), "Baixo", "Maduro", "Orquestração de processos", "Automatizar uma regra ruim amplia o erro."),
            new TechnologyResult("Sustentabilidade", score.get("Sustentabilidade"), "Médio", "Em expansão", "Eficiência energética", "Métricas ambientais exigem contexto.")
        ).stream().sorted(Comparator.comparingInt(TechnologyResult::score).reversed()).toList();
        return new ComparisonResponse(selected, goalLabel(selected), results,
            "A maior pontuação indica aderência ao objetivo escolhido, não uma tecnologia universalmente melhor.");
    }

    private String goalLabel(String goal) {
        return switch (goal) {
            case "escala" -> "Escalabilidade";
            case "eficiencia" -> "Eficiência operacional";
            default -> "Segurança digital";
        };
    }

    public record TechnologyResult(String name, int score, String cost, String maturity, String bestUse, String limitation) {}
    public record ComparisonResponse(String goal, String goalLabel, List<TechnologyResult> results, String disclaimer) {}
}
