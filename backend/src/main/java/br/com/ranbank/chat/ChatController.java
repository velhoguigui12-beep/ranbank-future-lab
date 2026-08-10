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
    private static final String SYSTEM_PROMPT = "VocÃª Ã© o assistente educacional do Ranbank Future Lab. Responda em portuguÃªs do Brasil, de forma clara e breve. Explique tecnologias emergentes, seguranÃ§a digital e os mÃ³dulos demonstrativos do projeto. NÃ£o forneÃ§a orientaÃ§Ã£o financeira, nÃ£o afirme que a simulaÃ§Ã£o Ã© um banco real e nÃ£o peÃ§a dados pessoais.";
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
            topic = "Boas-vindas"; answer = "OlÃ¡! Eu sou o assistente educacional do Ranbank. Posso explicar o Pix simulado, seguranÃ§a digital, IA, Big Data, nuvem, automaÃ§Ã£o, IoT, robÃ³tica, realidade aumentada e realidade virtual. O que vocÃª quer conhecer?";
        } else if (equalsAny(normalized, "ajuda", "menu", "assuntos") || contains(normalized, "o que posso perguntar", "quais assuntos", "como usar o assistente")) {
            topic = "Ajuda"; answer = "VocÃª pode perguntar sobre o funcionamento do Ranbank, Pix, golpes, malware, autenticaÃ§Ã£o, IA, Big Data, banco de dados, nuvem, IoT, automaÃ§Ã£o, energia sustentÃ¡vel, robÃ³tica, RA, VR ou comparaÃ§Ã£o de tecnologias.";
        } else if (contains(normalized, "ranbank", "projeto", "aplicacao", "site", "banco digital")) {
            topic = "Sobre o projeto"; answer = "O Ranbank Ã© uma aplicaÃ§Ã£o educacional, nÃ£o um banco real. Ela reÃºne frontend, backend Java, banco H2 e simulaÃ§Ãµes interativas para demonstrar seguranÃ§a e tecnologias emergentes.";
        } else if (contains(normalized, "phishing", "golpe", "link suspeito", "engenharia social")) {
            topic = "SeguranÃ§a"; answer = "Phishing tenta enganar a pessoa para obter senhas ou dados. Verifique remetente e domÃ­nio, evite links inesperados e nunca informe cÃ³digos de autenticaÃ§Ã£o.";
        } else if (contains(normalized, "malware", "virus", "ransomware", "trojan")) {
            topic = "Malware"; answer = "Malware Ã© software malicioso. AtualizaÃ§Ãµes, backups isolados, antivÃ­rus, permissÃµes mÃ­nimas e cuidado com downloads ajudam a reduzir o risco.";
        } else if (contains(normalized, "senha", "biometria", "autenticacao", "dois fatores", "2fa", "mfa")) {
            topic = "AutenticaÃ§Ã£o"; answer = "A autenticaÃ§Ã£o em camadas combina senha, biometria, dispositivo confiÃ¡vel e segundo fator. Se o contexto parecer suspeito, o sistema pode exigir uma verificaÃ§Ã£o adicional ou bloquear o acesso.";
        } else if (contains(normalized, "pix", "chave", "transferencia", "saldo")) {
            topic = "Pix"; answer = "No Ranbank, o Pix Ã© apenas uma simulaÃ§Ã£o. O backend valida CPF, telefone, e-mail ou chave aleatÃ³ria, confere o saldo, registra a movimentaÃ§Ã£o no H2 e atualiza o painel.";
        } else if (contains(normalized, "fraude", "risco", "transacao suspeita")) {
            topic = "Fraudes"; answer = "O simulador combina valor, dispositivo, localizaÃ§Ã£o e horÃ¡rio. Cada sinal soma pontos e produz uma recomendaÃ§Ã£o explicÃ¡vel; nÃ£o Ã© um modelo bancÃ¡rio real.";
        } else if (contains(normalized, "inteligencia artificial", "machine learning", "aprendizado de maquina", "chatbot") || hasToken(normalized, "ia")) {
            topic = "InteligÃªncia Artificial"; answer = "A IA pode reconhecer padrÃµes, apoiar a detecÃ§Ã£o de fraude e responder perguntas. Neste chatbot, respostas conhecidas funcionam localmente; uma API de IA pode permitir perguntas livres quando configurada.";
        } else if (contains(normalized, "big data", "dados", "grafico", "analytics")) {
            topic = "Big Data"; answer = "O painel agrega movimentaÃ§Ãµes para calcular entradas, saÃ­das e padrÃµes. Em produÃ§Ã£o, Big Data envolveria volumes muito maiores, processamento distribuÃ­do, qualidade e governanÃ§a dos dados.";
        } else if (contains(normalized, "banco de dados", "h2", "java", "spring", "backend", "frontend")) {
            topic = "Arquitetura"; answer = "O frontend apresenta a interface, enquanto o backend em Java com Spring Boot aplica regras e expÃµe APIs. O banco H2 guarda os dados fictÃ­cios localmente para a demonstraÃ§Ã£o.";
        } else if (contains(normalized, "iot", "dispositivo", "celular conectado", "internet das coisas")) {
            topic = "IoT"; answer = "IoT conecta dispositivos que enviam telemetria. Nossa demonstraÃ§Ã£o mostra localizaÃ§Ã£o, Ãºltimo acesso, confianÃ§a e uma resposta de bloqueio persistida no banco.";
        } else if (contains(normalized, "nuvem", "cloud", "servidor", "redundancia", "failover")) {
            topic = "Nuvem"; answer = "A redundÃ¢ncia mantÃ©m cÃ³pias do serviÃ§o em regiÃµes diferentes. Se a principal falha, verificaÃ§Ãµes detectam o problema e o trÃ¡fego Ã© redirecionado para manter a disponibilidade.";
        } else if (contains(normalized, "automacao", "n8n", "workflow")) {
            topic = "AutomaÃ§Ã£o"; answer = "A automaÃ§Ã£o recebe o alerta, reÃºne contexto, aplica regras, solicita validaÃ§Ã£o humana e registra o incidente. Ela organiza a resposta, mas nÃ£o substitui as defesas.";
        } else if (contains(normalized, "energia", "sustentavel", "sustentabilidade", "green it", "carbono")) {
            topic = "Tecnologia sustentÃ¡vel"; answer = "Green IT busca reduzir energia, emissÃµes e desperdÃ­cio. O laboratÃ³rio simula consumo, energia renovÃ¡vel, PUE e aÃ§Ãµes como otimizaÃ§Ã£o de servidores e uso eficiente da nuvem.";
        } else if (contains(normalized, "robotica", "robo", "automato")) {
            topic = "RobÃ³tica"; answer = "RobÃ³tica combina sensores, software e atuadores para perceber, decidir e agir. No Ranbank, o robÃ´ Ã© uma simulaÃ§Ã£o de recepÃ§Ã£o, acessibilidade e apoio Ã  seguranÃ§a, sempre com supervisÃ£o humana.";
        } else if (contains(normalized, "realidade aumentada", "realidade virtual", "imersiva") || hasToken(normalized, "ra") || hasToken(normalized, "vr")) {
            topic = "Tecnologias imersivas"; answer = "A realidade aumentada adiciona informaÃ§Ã£o ao ambiente real; a realidade virtual cria um ambiente digital imersivo. O laboratÃ³rio compara usos, equipamentos e limitaÃ§Ãµes das duas.";
        } else if (contains(normalized, "comparar", "comparacao", "melhor tecnologia", "qual tecnologia")) {
            topic = "ComparaÃ§Ã£o"; answer = "NÃ£o existe uma tecnologia melhor para tudo. O comparador avalia seguranÃ§a, escala ou eficiÃªncia e mostra custo, maturidade, melhor uso e limitaÃ§Ãµes de cada alternativa.";
        } else if (contains(normalized, "obrigado", "obrigada", "valeu")) {
            topic = "Conversa"; answer = "Por nada! Se quiser, escolha outro tema do Future Lab e eu explico de forma rÃ¡pida.";
        } else if (contains(normalized, "tchau", "ate mais")) {
            topic = "Conversa"; answer = "AtÃ© mais! Lembre-se: esta Ã© uma demonstraÃ§Ã£o educacional e todos os dados exibidos sÃ£o fictÃ­cios.";
        } else {
            topic = "Modo local"; answer = "Ainda nÃ£o reconheÃ§o essa pergunta no modo local. Digite â€˜ajudaâ€™ para ver os assuntos disponÃ­veis ou pergunte sobre seguranÃ§a, Pix, IA, Big Data, IoT, nuvem, automaÃ§Ã£o, sustentabilidade, robÃ³tica, RA ou VR.";
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

