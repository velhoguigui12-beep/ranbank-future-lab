package br.com.ranbank.chat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.text.Normalizer;
import java.time.Duration;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ChatController {
    private static final String OPENAI_URL = "https://api.openai.com/v1/responses";
    private static final String SYSTEM_PROMPT = "Você é o assistente educacional do Ranbank Future Lab. Responda em português do Brasil, de forma clara e breve. Explique tecnologias emergentes, segurança digital e os módulos demonstrativos do projeto. Não forneça orientação financeira, não afirme que a simulação é um banco real e não peça dados pessoais.";
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

    public ChatController(ObjectMapper objectMapper) { this.objectMapper = objectMapper; }

    @PostMapping
    public ChatResponse answer(@Valid @RequestBody ChatRequest request) {
        String apiKey = System.getenv("OPENAI_API_KEY");
        if (apiKey != null && !apiKey.isBlank()) {
            try { return askOpenAi(request.message(), apiKey); }
            catch (Exception error) {
                System.err.println("[Ranbank AI] Falha na OpenAI API: " + error.getMessage());
                ChatResponse fallback = localAnswer(request.message());
                return new ChatResponse(fallback.answer(), fallback.topic(), "LOCAL_FALLBACK", false);
            }
        }
        return localAnswer(request.message());
    }

    private ChatResponse askOpenAi(String message, String apiKey) throws Exception {
        Map<String, Object> body = Map.of("model", "gpt-5.6-luna", "instructions", SYSTEM_PROMPT, "input", message, "max_output_tokens", 350, "safety_identifier", "ranbank-future-lab-local", "text", Map.of("verbosity", "low"));
        HttpRequest request = HttpRequest.newBuilder(URI.create(OPENAI_URL)).timeout(Duration.ofSeconds(35)).header("Authorization", "Bearer " + apiKey).header("Content-Type", "application/json").POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body))).build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            String errorMessage = objectMapper.readTree(response.body()).path("error").path("message").asText("erro sem detalhes");
            throw new IllegalStateException("HTTP " + response.statusCode() + " - " + errorMessage);
        }
        String answer = extractOutputText(objectMapper.readTree(response.body()));
        if (answer.isBlank()) throw new IllegalStateException("Resposta vazia");
        return new ChatResponse(answer, "IA educacional", "OPENAI", true);
    }

    private String extractOutputText(JsonNode root) {
        for (JsonNode output : root.path("output")) for (JsonNode content : output.path("content")) if ("output_text".equals(content.path("type").asText())) return content.path("text").asText("");
        return "";
    }

    private ChatResponse localAnswer(String message) {
        String normalized = normalize(message);
        String topic;
        String answer;
        if (equalsAny(normalized, "oi", "ola", "opa", "bom dia", "boa tarde", "boa noite")) {
            topic = "Boas-vindas"; answer = "Olá! Eu sou o assistente educacional do Ranbank. Posso explicar o Pix simulado, segurança digital, IA, Big Data, nuvem, automação, IoT, robótica, realidade aumentada e realidade virtual. O que você quer conhecer?";
        } else if (equalsAny(normalized, "ajuda", "menu", "assuntos") || contains(normalized, "o que posso perguntar", "quais assuntos", "como usar o assistente")) {
            topic = "Ajuda"; answer = "Você pode perguntar sobre o funcionamento do Ranbank, Pix, golpes, malware, autenticação, IA, Big Data, banco de dados, nuvem, IoT, automação, energia sustentável, robótica, RA, VR ou comparação de tecnologias.";
        } else if (contains(normalized, "ranbank", "projeto", "aplicacao", "site", "banco digital")) {
            topic = "Sobre o projeto"; answer = "O Ranbank é uma aplicação educacional, não um banco real. Ela reúne frontend, backend Java, banco H2 e simulações interativas para demonstrar segurança e tecnologias emergentes.";
        } else if (contains(normalized, "phishing", "golpe", "link suspeito", "engenharia social")) {
            topic = "Segurança"; answer = "Phishing tenta enganar a pessoa para obter senhas ou dados. Verifique remetente e domínio, evite links inesperados e nunca informe códigos de autenticação.";
        } else if (contains(normalized, "malware", "virus", "ransomware", "trojan")) {
            topic = "Malware"; answer = "Malware é software malicioso. Atualizações, backups isolados, antivírus, permissões mínimas e cuidado com downloads ajudam a reduzir o risco.";
        } else if (contains(normalized, "senha", "biometria", "autenticacao", "dois fatores", "2fa", "mfa")) {
            topic = "Autenticação"; answer = "A autenticação em camadas combina senha, biometria, dispositivo confiável e segundo fator. Se o contexto parecer suspeito, o sistema pode exigir uma verificação adicional ou bloquear o acesso.";
        } else if (contains(normalized, "pix", "chave", "transferencia", "saldo")) {
            topic = "Pix"; answer = "No Ranbank, o Pix é apenas uma simulação. O backend valida CPF, telefone, e-mail ou chave aleatória, confere o saldo, registra a movimentação no H2 e atualiza o painel.";
        } else if (contains(normalized, "fraude", "risco", "transacao suspeita")) {
            topic = "Fraudes"; answer = "O simulador combina valor, dispositivo, localização e horário. Cada sinal soma pontos e produz uma recomendação explicável; não é um modelo bancário real.";
        } else if (contains(normalized, "inteligencia artificial", "machine learning", "aprendizado de maquina", "chatbot") || hasToken(normalized, "ia")) {
            topic = "Inteligência Artificial"; answer = "A IA pode reconhecer padrões, apoiar a detecção de fraude e responder perguntas. Neste chatbot, respostas conhecidas funcionam localmente; uma API de IA pode permitir perguntas livres quando configurada.";
        } else if (contains(normalized, "big data", "dados", "grafico", "analytics")) {
            topic = "Big Data"; answer = "O painel agrega movimentações para calcular entradas, saídas e padrões. Em produção, Big Data envolveria volumes muito maiores, processamento distribuído, qualidade e governança dos dados.";
        } else if (contains(normalized, "banco de dados", "h2", "java", "spring", "backend", "frontend")) {
            topic = "Arquitetura"; answer = "O frontend apresenta a interface, enquanto o backend em Java com Spring Boot aplica regras e expõe APIs. O banco H2 guarda os dados fictícios localmente para a demonstração.";
        } else if (contains(normalized, "iot", "dispositivo", "celular conectado", "internet das coisas")) {
            topic = "IoT"; answer = "IoT conecta dispositivos que enviam telemetria. Nossa demonstração mostra localização, último acesso, confiança e uma resposta de bloqueio persistida no banco.";
        } else if (contains(normalized, "nuvem", "cloud", "servidor", "redundancia", "failover")) {
            topic = "Nuvem"; answer = "A redundância mantém cópias do serviço em regiões diferentes. Se a principal falha, verificações detectam o problema e o tráfego é redirecionado para manter a disponibilidade.";
        } else if (contains(normalized, "automacao", "n8n", "workflow")) {
            topic = "Automação"; answer = "A automação recebe o alerta, reúne contexto, aplica regras, solicita validação humana e registra o incidente. Ela organiza a resposta, mas não substitui as defesas.";
        } else if (contains(normalized, "energia", "sustentavel", "sustentabilidade", "green it", "carbono")) {
            topic = "Tecnologia sustentável"; answer = "Green IT busca reduzir energia, emissões e desperdício. O laboratório simula consumo, energia renovável, PUE e ações como otimização de servidores e uso eficiente da nuvem.";
        } else if (contains(normalized, "robotica", "robo", "automato")) {
            topic = "Robótica"; answer = "Robótica combina sensores, software e atuadores para perceber, decidir e agir. No Ranbank, o robô é uma simulação de recepção, acessibilidade e apoio à segurança, sempre com supervisão humana.";
        } else if (contains(normalized, "realidade aumentada", "realidade virtual", "imersiva") || hasToken(normalized, "ra") || hasToken(normalized, "vr")) {
            topic = "Tecnologias imersivas"; answer = "A realidade aumentada adiciona informação ao ambiente real; a realidade virtual cria um ambiente digital imersivo. O laboratório compara usos, equipamentos e limitações das duas.";
        } else if (contains(normalized, "comparar", "comparacao", "melhor tecnologia", "qual tecnologia")) {
            topic = "Comparação"; answer = "Não existe uma tecnologia melhor para tudo. O comparador avalia segurança, escala ou eficiência e mostra custo, maturidade, melhor uso e limitações de cada alternativa.";
        } else if (contains(normalized, "obrigado", "obrigada", "valeu")) {
            topic = "Conversa"; answer = "Por nada! Se quiser, escolha outro tema do Future Lab e eu explico de forma rápida.";
        } else if (contains(normalized, "tchau", "ate mais")) {
            topic = "Conversa"; answer = "Até mais! Lembre-se: esta é uma demonstração educacional e todos os dados exibidos são fictícios.";
        } else {
            topic = "Modo local"; answer = "Ainda não reconheço essa pergunta no modo local. Digite ‘ajuda’ para ver os assuntos disponíveis ou pergunte sobre segurança, Pix, IA, Big Data, IoT, nuvem, automação, sustentabilidade, robótica, RA ou VR.";
        }
        return new ChatResponse(answer, topic, "LOCAL", false);
    }

    private boolean contains(String message, String... terms) { return List.of(terms).stream().anyMatch(message::contains); }
    private boolean equalsAny(String message, String... terms) { return List.of(terms).contains(message); }
    private boolean hasToken(String message, String token) { return List.of(message.split(" ")).contains(token); }
    private String normalize(String value) { return Normalizer.normalize(value, Normalizer.Form.NFD).replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9 ]", " ").replaceAll("\\s+", " ").trim(); }

    public record ChatRequest(@NotBlank(message = "Digite uma pergunta") String message) {}
    public record ChatResponse(String answer, String topic, String mode, boolean generatedByAi) {}
}
