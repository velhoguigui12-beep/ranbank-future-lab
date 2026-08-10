package br.com.ranbank.authentication;

import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/authentication")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AuthenticationController {
    @PostMapping("/simulate")
    public AuthenticationResult simulate(@RequestParam(defaultValue = "trusted") String scenario) {
        boolean suspicious = "suspicious".equals(scenario);
        List<AuthFactor> factors = suspicious
            ? List.of(new AuthFactor("Senha", "aprovado", "Conhecimento"), new AuthFactor("Código temporário", "aprovado", "Posse"), new AuthFactor("Biometria facial", "revisar", "Inerência"), new AuthFactor("Comportamento", "bloqueado", "Risco adaptativo"))
            : List.of(new AuthFactor("Senha", "aprovado", "Conhecimento"), new AuthFactor("Código temporário", "aprovado", "Posse"), new AuthFactor("Biometria facial", "aprovado", "Inerência"), new AuthFactor("Comportamento", "aprovado", "Risco adaptativo"));
        return new AuthenticationResult(suspicious ? "Novo aparelho e localização incomum" : "Aparelho e localização reconhecidos",
            suspicious ? 82 : 14, suspicious ? "ACESSO BLOQUEADO" : "IDENTIDADE CONFIRMADA",
            suspicious ? "Uma pessoa deve revisar a tentativa antes de liberar a conta." : "Os fatores concordam e o acesso demonstrativo foi autorizado.", factors);
    }

    public record AuthFactor(String name, String status, String category) {}
    public record AuthenticationResult(String context, int risk, String decision, String explanation, List<AuthFactor> factors) {}
}
