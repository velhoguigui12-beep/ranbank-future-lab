package br.com.ranbank.immersive;

import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/immersive")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ImmersiveTechnologyController {
    private static final Map<String, ImmersiveScenario> SCENARIOS = Map.of(
        "ar", new ImmersiveScenario("RA", "Realidade Aumentada", "AgÃªncia inteligente",
            "InformaÃ§Ãµes digitais sÃ£o sobrepostas Ã  visÃ£o do ambiente real.",
            List.of("CÃ¢mera reconhece o caixa eletrÃ´nico", "Setas orientam onde inserir o cartÃ£o", "Alertas destacam sinais de adulteraÃ§Ã£o"),
            "Celular ou Ã³culos de RA", "OrientaÃ§Ã£o contextual", "Privacidade da cÃ¢mera e precisÃ£o do reconhecimento"),
        "vr", new ImmersiveScenario("VR", "Realidade Virtual", "Treinamento antifraude",
            "O usuÃ¡rio entra em um ambiente digital imersivo, separado do espaÃ§o real.",
            List.of("CenÃ¡rio simula uma agÃªncia bancÃ¡ria", "Personagens apresentam tentativas de golpe", "Escolhas geram feedback sem risco real"),
            "Ã“culos VR e controles", "Treinamento seguro", "Custo dos equipamentos e possÃ­vel desconforto")
    );

    @GetMapping
    public ImmersiveScenario scenario(@RequestParam(defaultValue = "ar") String mode) {
        return SCENARIOS.getOrDefault(mode, SCENARIOS.get("ar"));
    }

    public record ImmersiveScenario(String code, String name, String title, String definition,
                                    List<String> steps, String equipment, String strength, String limitation) {}
}

