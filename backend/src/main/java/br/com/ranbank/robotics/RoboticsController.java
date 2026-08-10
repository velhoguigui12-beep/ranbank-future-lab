package br.com.ranbank.robotics;

import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/robotics")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class RoboticsController {
    private static final Map<String, RobotMission> MISSIONS = Map.of(
        "reception", new RobotMission("RecepÃ§Ã£o inteligente", "Orientar cliente atÃ© o atendimento correto", 87,
            List.of(new RobotStep("Sensor de presenÃ§a", "Pessoa detectada a 2 metros", "sensor"), new RobotStep("DiÃ¡logo", "Motivo da visita identificado", "ia"), new RobotStep("NavegaÃ§Ã£o", "Rota acessÃ­vel calculada", "robotica"), new RobotStep("Encaminhamento", "Senha e guichÃª informados", "concluido")),
            "O robÃ´ orienta, mas um atendente assume dÃºvidas complexas."),
        "accessibility", new RobotMission("Apoio Ã  acessibilidade", "Acompanhar uma pessoa com baixa visÃ£o", 94,
            List.of(new RobotStep("Comando de voz", "PreferÃªncia de assistÃªncia recebida", "sensor"), new RobotStep("Mapeamento", "ObstÃ¡culos e distÃ¢ncia verificados", "ia"), new RobotStep("Movimento seguro", "Velocidade reduzida para acompanhamento", "robotica"), new RobotStep("Entrega humana", "Atendente avisado e disponÃ­vel", "concluido")),
            "A pessoa escolhe se deseja ajuda; acessibilidade nÃ£o deve retirar autonomia."),
        "security", new RobotMission("Alerta de seguranÃ§a", "Responder a um objeto esquecido na agÃªncia", 72,
            List.of(new RobotStep("VisÃ£o computacional", "Objeto parado fora da Ã¡rea permitida", "sensor"), new RobotStep("ClassificaÃ§Ã£o", "SituaÃ§Ã£o marcada para verificaÃ§Ã£o", "ia"), new RobotStep("Isolamento", "RobÃ´ mantÃ©m distÃ¢ncia e sinaliza o local", "robotica"), new RobotStep("DecisÃ£o humana", "Equipe de seguranÃ§a assume a ocorrÃªncia", "humano")),
            "O robÃ´ nÃ£o determina sozinho se existe ameaÃ§a; a decisÃ£o final Ã© humana.")
    );

    @GetMapping("/mission")
    public RobotMission mission(@RequestParam(defaultValue = "reception") String type) {
        return MISSIONS.getOrDefault(type, MISSIONS.get("reception"));
    }

    public record RobotStep(String title, String result, String technology) {}
    public record RobotMission(String name, String objective, int autonomy, List<RobotStep> steps, String humanRole) {}
}

