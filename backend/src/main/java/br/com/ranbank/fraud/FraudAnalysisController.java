package br.com.ranbank.fraud;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/fraud")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class FraudAnalysisController {

    @PostMapping("/analyze")
    public FraudAnalysisResponse analyze(@Valid @RequestBody FraudAnalysisRequest request) {
        int score = 5;
        List<RiskSignal> signals = new ArrayList<>();

        if (request.amount().compareTo(new BigDecimal("2000")) >= 0) {
            score += 30;
            signals.add(new RiskSignal("Valor fora do padrão", "+30", "A compra supera o limite habitual da conta demonstrativa."));
        }
        if (request.newDevice()) {
            score += 25;
            signals.add(new RiskSignal("Dispositivo não reconhecido", "+25", "A transação veio de um aparelho ainda não autorizado."));
        }
        if (request.unusualLocation()) {
            score += 20;
            signals.add(new RiskSignal("Localização incomum", "+20", "A região difere dos acessos recentes da conta."));
        }
        if (request.unusualTime()) {
            score += 15;
            signals.add(new RiskSignal("Horário incomum", "+15", "A operação ocorreu fora do padrão de uso observado."));
        }

        score = Math.min(score, 100);
        String level = score >= 70 ? "ALTO" : score >= 40 ? "MÉDIO" : "BAIXO";
        String recommendation = score >= 70
            ? "Bloquear temporariamente e solicitar confirmação adicional."
            : score >= 40
                ? "Solicitar autenticação adicional antes de aprovar."
                : "Aprovar e manter o monitoramento da conta.";

        return new FraudAnalysisResponse(score, level, recommendation, signals, "SIMULAÇÃO POR REGRAS");
    }

    public record FraudAnalysisRequest(
        @NotNull @DecimalMin("0.01") BigDecimal amount,
        boolean newDevice,
        boolean unusualLocation,
        boolean unusualTime
    ) {}

    public record RiskSignal(String name, String weight, String explanation) {}
    public record FraudAnalysisResponse(int score, String level, String recommendation, List<RiskSignal> signals, String method) {}
}
