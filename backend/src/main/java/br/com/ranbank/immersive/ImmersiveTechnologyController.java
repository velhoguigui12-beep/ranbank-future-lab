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
        "ar", new ImmersiveScenario("RA", "Realidade Aumentada", "Agência inteligente",
            "Informações digitais são sobrepostas à visão do ambiente real.",
            List.of("Câmera reconhece o caixa eletrônico", "Setas orientam onde inserir o cartão", "Alertas destacam sinais de adulteração"),
            "Celular ou óculos de RA", "Orientação contextual", "Privacidade da câmera e precisão do reconhecimento"),
        "vr", new ImmersiveScenario("VR", "Realidade Virtual", "Treinamento antifraude",
            "O usuário entra em um ambiente digital imersivo, separado do espaço real.",
            List.of("Cenário simula uma agência bancária", "Personagens apresentam tentativas de golpe", "Escolhas geram feedback sem risco real"),
            "Óculos VR e controles", "Treinamento seguro", "Custo dos equipamentos e possível desconforto")
    );

    @GetMapping
    public ImmersiveScenario scenario(@RequestParam(defaultValue = "ar") String mode) {
        return SCENARIOS.getOrDefault(mode, SCENARIOS.get("ar"));
    }

    public record ImmersiveScenario(String code, String name, String title, String definition,
                                    List<String> steps, String equipment, String strength, String limitation) {}
}
