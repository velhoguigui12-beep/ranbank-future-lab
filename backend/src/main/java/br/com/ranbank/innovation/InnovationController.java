package br.com.ranbank.innovation;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/innovation")
public class InnovationController {
    private final Set<String> connectedInstitutions = new LinkedHashSet<>(Set.of("Banco Horizonte"));

    @GetMapping("/open-finance")
    public OpenFinanceOverview openFinance() {
        List<Institution> institutions = List.of(
            institution("Ranbank", "Conta principal", "8540.75", true),
            institution("Banco Horizonte", "Conta e cartão", "3260.40", connectedInstitutions.contains("Banco Horizonte")),
            institution("Cooperativa Cerrado", "Investimentos", "4180.00", connectedInstitutions.contains("Cooperativa Cerrado"))
        );
        return new OpenFinanceOverview("Ana Ribeiro", LocalDate.now().plusDays(90), institutions);
    }

    @PostMapping("/open-finance/toggle")
    public OpenFinanceOverview toggleConsent(@RequestBody ConsentRequest request) {
        if ("Banco Horizonte".equals(request.institution()) || "Cooperativa Cerrado".equals(request.institution())) {
            if (!connectedInstitutions.add(request.institution())) connectedInstitutions.remove(request.institution());
        }
        return openFinance();
    }

    @GetMapping("/audit")
    public AuditLedger audit() {
        List<String> events = List.of(
            "Sessão autenticada com PIN e dispositivo confiável",
            "Consentimento Open Finance consultado",
            "Chave Pix e saldo validados pelo backend",
            "Motor antifraude calculou risco 68/100",
            "Decisão humana registrada no fluxo"
        );
        List<AuditEntry> entries = new ArrayList<>();
        String previous = "GENESIS-RANBANK";
        for (int index = 0; index < events.size(); index++) {
            String hash = digest(previous + "|" + events.get(index) + "|" + index);
            entries.add(new AuditEntry(index + 1, events.get(index), shortHash(previous), shortHash(hash), "ÍNTEGRO"));
            previous = hash;
        }
        return new AuditLedger("SHA-256", true, entries);
    }

    @GetMapping("/fraud-journey")
    public FraudJourney fraudJourney() {
        return new FraudJourney("Compra de R$ 2.950,00 em novo dispositivo", 68, "REVISÃO NECESSÁRIA", List.of(
            new JourneyStep(1, "IoT", "Coleta de contexto", "Dispositivo, localização e horário são enviados como sinais.", "CONCLUÍDO"),
            new JourneyStep(2, "Big Data", "Comparação histórica", "O evento é comparado ao padrão de movimentações da conta.", "CONCLUÍDO"),
            new JourneyStep(3, "IA explicável", "Cálculo de risco", "Os sinais elevam a pontuação para 68 de 100.", "CONCLUÍDO"),
            new JourneyStep(4, "Automação", "Orquestração da resposta", "O workflow pausa a operação e reúne evidências.", "CONCLUÍDO"),
            new JourneyStep(5, "Nuvem", "Continuidade e registro", "A análise permanece disponível e o evento entra na auditoria.", "CONCLUÍDO"),
            new JourneyStep(6, "Pessoa", "Decisão responsável", "Um analista confirma ou bloqueia a operação com base no contexto.", "AGUARDANDO")
        ));
    }

    private Institution institution(String name, String scope, String balance, boolean connected) {
        return new Institution(name, scope, new java.math.BigDecimal(balance), connected);
    }

    private String digest(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException error) {
            throw new IllegalStateException("SHA-256 indisponível", error);
        }
    }

    private String shortHash(String value) {
        return value.length() <= 16 ? value : value.substring(0, 8) + "…" + value.substring(value.length() - 6);
    }

    public record OpenFinanceOverview(String customer, LocalDate consentExpires, List<Institution> institutions) {}
    public record Institution(String name, String scope, java.math.BigDecimal balance, boolean connected) {}
    public record ConsentRequest(String institution) {}
    public record AuditLedger(String algorithm, boolean integrityVerified, List<AuditEntry> entries) {}
    public record AuditEntry(int block, String event, String previousHash, String hash, String status) {}
    public record FraudJourney(String scenario, int riskScore, String decision, List<JourneyStep> steps) {}
    public record JourneyStep(int order, String technology, String title, String explanation, String status) {}
}
