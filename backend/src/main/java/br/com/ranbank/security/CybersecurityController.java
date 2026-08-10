package br.com.ranbank.security;

import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/security")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class CybersecurityController {
    private static final Map<String, ThreatScenario> SCENARIOS = Map.of(
        "phishing", new ThreatScenario("Phishing", "Engenharia social", 78,
            "Um e-mail falso tenta roubar a senha e o cÃ³digo de verificaÃ§Ã£o.",
            List.of("Remetente imita uma empresa conhecida", "Link aponta para domÃ­nio diferente", "Mensagem cria senso de urgÃªncia"),
            List.of(new DefenseStep("Filtro de e-mail", "Mensagem marcada como suspeita", "automatica"), new DefenseStep("MFA", "Senha roubada nÃ£o basta para acessar", "automatica"), new DefenseStep("ConfirmaÃ§Ã£o do usuÃ¡rio", "Pessoa verifica o endereÃ§o antes de continuar", "humana"))),
        "ransomware", new ThreatScenario("Ransomware", "Malware de extorsÃ£o", 96,
            "Um arquivo malicioso tenta criptografar dados e exigir pagamento.",
            List.of("Muitas alteraÃ§Ãµes de arquivos em poucos segundos", "Processo desconhecido solicita privilÃ©gios", "Tentativa de desativar cÃ³pias de seguranÃ§a"),
            List.of(new DefenseStep("EDR / antivÃ­rus", "Processo malicioso interrompido", "automatica"), new DefenseStep("SegmentaÃ§Ã£o", "Dispositivo isolado da rede", "automatica"), new DefenseStep("Backup", "Dados restaurados sem pagar resgate", "humana"))),
        "trojan", new ThreatScenario("Trojan bancÃ¡rio", "Malware disfarÃ§ado", 88,
            "Um aplicativo aparentemente legÃ­timo tenta capturar dados bancÃ¡rios.",
            List.of("Aplicativo instalado fora da loja oficial", "PermissÃµes incompatÃ­veis com a funÃ§Ã£o", "SobreposiÃ§Ã£o detectada na tela do banco"),
            List.of(new DefenseStep("AnÃ¡lise comportamental", "Comportamento anormal identificado", "automatica"), new DefenseStep("Biometria", "OperaÃ§Ã£o exige nova validaÃ§Ã£o", "automatica"), new DefenseStep("Bloqueio preventivo", "Equipe analisa o dispositivo", "humana")))
    );

    @GetMapping("/simulate")
    public ThreatScenario simulate(@RequestParam(defaultValue = "phishing") String threat) {
        return SCENARIOS.getOrDefault(threat, SCENARIOS.get("phishing"));
    }

    public record DefenseStep(String name, String result, String responsibility) {}
    public record ThreatScenario(String name, String category, int risk, String description, List<String> indicators, List<DefenseStep> defenses) {}
}

