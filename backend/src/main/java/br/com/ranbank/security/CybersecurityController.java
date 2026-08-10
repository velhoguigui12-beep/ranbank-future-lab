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
            "Um e-mail falso tenta roubar a senha e o código de verificação.",
            List.of("Remetente imita uma empresa conhecida", "Link aponta para domínio diferente", "Mensagem cria senso de urgência"),
            List.of(new DefenseStep("Filtro de e-mail", "Mensagem marcada como suspeita", "automatica"), new DefenseStep("MFA", "Senha roubada não basta para acessar", "automatica"), new DefenseStep("Confirmação do usuário", "Pessoa verifica o endereço antes de continuar", "humana"))),
        "ransomware", new ThreatScenario("Ransomware", "Malware de extorsão", 96,
            "Um arquivo malicioso tenta criptografar dados e exigir pagamento.",
            List.of("Muitas alterações de arquivos em poucos segundos", "Processo desconhecido solicita privilégios", "Tentativa de desativar cópias de segurança"),
            List.of(new DefenseStep("EDR / antivírus", "Processo malicioso interrompido", "automatica"), new DefenseStep("Segmentação", "Dispositivo isolado da rede", "automatica"), new DefenseStep("Backup", "Dados restaurados sem pagar resgate", "humana"))),
        "trojan", new ThreatScenario("Trojan bancário", "Malware disfarçado", 88,
            "Um aplicativo aparentemente legítimo tenta capturar dados bancários.",
            List.of("Aplicativo instalado fora da loja oficial", "Permissões incompatíveis com a função", "Sobreposição detectada na tela do banco"),
            List.of(new DefenseStep("Análise comportamental", "Comportamento anormal identificado", "automatica"), new DefenseStep("Biometria", "Operação exige nova validação", "automatica"), new DefenseStep("Bloqueio preventivo", "Equipe analisa o dispositivo", "humana")))
    );

    @GetMapping("/simulate")
    public ThreatScenario simulate(@RequestParam(defaultValue = "phishing") String threat) {
        return SCENARIOS.getOrDefault(threat, SCENARIOS.get("phishing"));
    }

    public record DefenseStep(String name, String result, String responsibility) {}
    public record ThreatScenario(String name, String category, int risk, String description, List<String> indicators, List<DefenseStep> defenses) {}
}
