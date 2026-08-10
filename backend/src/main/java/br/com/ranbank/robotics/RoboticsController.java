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
        "reception", new RobotMission("Recepção inteligente", "Orientar cliente até o atendimento correto", 87,
            List.of(new RobotStep("Sensor de presença", "Pessoa detectada a 2 metros", "sensor"), new RobotStep("Diálogo", "Motivo da visita identificado", "ia"), new RobotStep("Navegação", "Rota acessível calculada", "robotica"), new RobotStep("Encaminhamento", "Senha e guichê informados", "concluido")),
            "O robô orienta, mas um atendente assume dúvidas complexas."),
        "accessibility", new RobotMission("Apoio à acessibilidade", "Acompanhar uma pessoa com baixa visão", 94,
            List.of(new RobotStep("Comando de voz", "Preferência de assistência recebida", "sensor"), new RobotStep("Mapeamento", "Obstáculos e distância verificados", "ia"), new RobotStep("Movimento seguro", "Velocidade reduzida para acompanhamento", "robotica"), new RobotStep("Entrega humana", "Atendente avisado e disponível", "concluido")),
            "A pessoa escolhe se deseja ajuda; acessibilidade não deve retirar autonomia."),
        "security", new RobotMission("Alerta de segurança", "Responder a um objeto esquecido na agência", 72,
            List.of(new RobotStep("Visão computacional", "Objeto parado fora da área permitida", "sensor"), new RobotStep("Classificação", "Situação marcada para verificação", "ia"), new RobotStep("Isolamento", "Robô mantém distância e sinaliza o local", "robotica"), new RobotStep("Decisão humana", "Equipe de segurança assume a ocorrência", "humano")),
            "O robô não determina sozinho se existe ameaça; a decisão final é humana.")
    );

    @GetMapping("/mission")
    public RobotMission mission(@RequestParam(defaultValue = "reception") String type) {
        return MISSIONS.getOrDefault(type, MISSIONS.get("reception"));
    }

    public record RobotStep(String title, String result, String technology) {}
    public record RobotMission(String name, String objective, int autonomy, List<RobotStep> steps, String humanRole) {}
}
