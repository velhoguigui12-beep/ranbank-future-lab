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
        "seguranca", Map.of("IA", 94, "Big Data", 86, "IoT", 65, "Nuvem", 82, "AutomaÃ§Ã£o", 90, "Sustentabilidade", 52),
        "escala", Map.of("IA", 78, "Big Data", 96, "IoT", 84, "Nuvem", 98, "AutomaÃ§Ã£o", 88, "Sustentabilidade", 72),
        "eficiencia", Map.of("IA", 85, "Big Data", 82, "IoT", 76, "Nuvem", 91, "AutomaÃ§Ã£o", 96, "Sustentabilidade", 94)
    );

    @GetMapping
    public ComparisonResponse compare(@RequestParam(defaultValue = "seguranca") String goal) {
        String selected = SCORES.containsKey(goal) ? goal : "seguranca";
        Map<String, Integer> score = SCORES.get(selected);
        List<TechnologyResult> results = List.of(
            new TechnologyResult("IA", score.get("IA"), "Alto", "Em evoluÃ§Ã£o", "Reconhecimento de padrÃµes", "Exige dados de qualidade e supervisÃ£o."),
            new TechnologyResult("Big Data", score.get("Big Data"), "Alto", "Maduro", "AnÃ¡lise de grandes volumes", "Infraestrutura e governanÃ§a sÃ£o complexas."),
            new TechnologyResult("IoT", score.get("IoT"), "MÃ©dio", "Maduro", "Telemetria de dispositivos", "Amplia a superfÃ­cie de ataque."),
            new TechnologyResult("Nuvem", score.get("Nuvem"), "MÃ©dio", "Muito maduro", "Escala e disponibilidade", "Depende de configuraÃ§Ã£o e conectividade."),
            new TechnologyResult("AutomaÃ§Ã£o", score.get("AutomaÃ§Ã£o"), "Baixo", "Maduro", "OrquestraÃ§Ã£o de processos", "Automatizar uma regra ruim amplia o erro."),
            new TechnologyResult("Sustentabilidade", score.get("Sustentabilidade"), "MÃ©dio", "Em expansÃ£o", "EficiÃªncia energÃ©tica", "MÃ©tricas ambientais exigem contexto.")
        ).stream().sorted(Comparator.comparingInt(TechnologyResult::score).reversed()).toList();
        return new ComparisonResponse(selected, goalLabel(selected), results,
            "A maior pontuaÃ§Ã£o indica aderÃªncia ao objetivo escolhido, nÃ£o uma tecnologia universalmente melhor.");
    }

    private String goalLabel(String goal) {
        return switch (goal) {
            case "escala" -> "Escalabilidade";
            case "eficiencia" -> "EficiÃªncia operacional";
            default -> "SeguranÃ§a digital";
        };
    }

    public record TechnologyResult(String name, int score, String cost, String maturity, String bestUse, String limitation) {}
    public record ComparisonResponse(String goal, String goalLabel, List<TechnologyResult> results, String disclaimer) {}
}

