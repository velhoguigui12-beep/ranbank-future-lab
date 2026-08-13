package br.com.ranbank.chat;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ChatController {
    @PostMapping
    public ChatResponse answer(@Valid @RequestBody ChatRequest request) {
        return localAnswer(request.message());
    }

    private ChatResponse localAnswer(String message) {
        String normalized = normalize(message);
        String topic;
        String answer;
        if (equalsAny(normalized, "oi", "ola", "opa", "bom dia", "boa tarde", "boa noite")) {
            topic = "Boas-vindas"; answer = "Olá! Eu sou o assistente educacional do Ranbank. Posso explicar Pix, serviços bancários, segurança digital, IA, Big Data, nuvem, Open Finance, auditoria, IoT, robótica, RA e VR. O que você quer conhecer?";
        } else if (equalsAny(normalized, "ajuda", "menu", "assuntos") || contains(normalized, "o que posso perguntar", "quais assuntos", "como usar o assistente")) {
            topic = "Ajuda"; answer = "Você pode perguntar sobre Ranbank, Pix, boleto, extrato, cartão, cofrinho, golpes, autenticação, IA, Big Data, nuvem, IoT, automação, Open Finance, auditoria, sustentabilidade, robótica, RA ou VR.";
        } else if (contains(normalized, "ranbank", "projeto", "aplicacao", "site", "banco digital")) {
            topic = "Sobre o projeto"; answer = "O Ranbank é uma aplicação acadêmica que reúne frontend React, backend Java, banco H2 e experiências interativas sobre segurança e tecnologias emergentes.";
        } else if (contains(normalized, "phishing", "golpe", "link suspeito", "engenharia social")) {
            topic = "Segurança"; answer = "Phishing tenta enganar a pessoa para obter senhas ou dados. Verifique remetente e domínio, evite links inesperados e nunca informe códigos de autenticação.";
        } else if (contains(normalized, "malware", "virus", "ransomware", "trojan")) {
            topic = "Malware"; answer = "Malware é software malicioso. Atualizações, backups isolados, antivírus, permissões mínimas e cuidado com downloads ajudam a reduzir o risco.";
        } else if (contains(normalized, "senha", "biometria", "autenticacao", "dois fatores", "2fa", "mfa")) {
            topic = "Autenticação"; answer = "A autenticação em camadas combina senha, biometria, dispositivo confiável e segundo fator. Se o contexto parecer suspeito, o sistema pode exigir uma verificação adicional ou bloquear o acesso.";
        } else if (contains(normalized, "pix", "chave", "transferencia", "saldo")) {
            topic = "Pix"; answer = "No Ranbank, o backend valida CPF, telefone, e-mail ou chave aleatória, confere o saldo, registra a movimentação no H2 e atualiza o painel.";
        } else if (contains(normalized, "boleto", "codigo de barras", "pagamento")) {
            topic = "Boletos"; answer = "A Central Financeira valida código, valor, saldo e PIN transacional antes de registrar o boleto e gerar o comprovante.";
        } else if (contains(normalized, "extrato", "movimentacoes", "comprovante")) {
            topic = "Extrato"; answer = "O extrato permite pesquisar entradas e saídas e abrir o comprovante individual de cada registro.";
        } else if (contains(normalized, "cartao", "fatura", "limite")) {
            topic = "Cartão virtual"; answer = "O cartão virtual mostra fatura e limite, aceita ajuste protegido por PIN e pode ser bloqueado temporariamente.";
        } else if (contains(normalized, "cofrinho", "reserva", "investimento")) {
            topic = "Reserva Future"; answer = "O cofrinho separa parte do saldo, acompanha uma meta e apresenta uma projeção mensal.";
        } else if (contains(normalized, "open finance", "consentimento", "banco aberto")) {
            topic = "Open Finance"; answer = "Open Finance compartilha dados por APIs padronizadas com consentimento, prazo e possibilidade de revogação.";
        } else if (contains(normalized, "blockchain", "hash", "auditoria", "ledger")) {
            topic = "Auditoria encadeada"; answer = "Cada evento recebe um hash ligado ao registro anterior. Uma alteração quebra a sequência e revela a inconsistência.";
        } else if (contains(normalized, "fraude", "risco", "transacao suspeita")) {
            topic = "Fraudes"; answer = "A análise combina valor, dispositivo, localização e horário. Cada sinal soma pontos e produz uma recomendação explicável para apoiar a decisão humana.";
        } else if (contains(normalized, "inteligencia artificial", "machine learning", "aprendizado de maquina", "chatbot") || hasToken(normalized, "ia")) {
            topic = "Inteligência Artificial"; answer = "A IA pode reconhecer padrões e apoiar a detecção de fraude. Este chatbot usa uma base local organizada por temas para responder durante a apresentação.";
        } else if (contains(normalized, "big data", "dados", "grafico", "analytics")) {
            topic = "Big Data"; answer = "O painel agrega movimentações para calcular entradas, saídas e padrões. Em produção, Big Data envolveria volumes muito maiores, processamento distribuído, qualidade e governança dos dados.";
        } else if (contains(normalized, "banco de dados", "h2", "java", "spring", "backend", "frontend")) {
            topic = "Arquitetura"; answer = "O frontend React apresenta a interface, o backend Java com Spring Boot aplica as regras e expõe APIs, e o banco H2 mantém o estado da aplicação.";
        } else if (contains(normalized, "iot", "dispositivo", "celular conectado", "internet das coisas")) {
            topic = "IoT"; answer = "IoT conecta dispositivos que enviam telemetria. O painel mostra localização, último acesso, confiança e uma resposta de bloqueio persistida no banco.";
        } else if (contains(normalized, "nuvem", "cloud", "servidor", "redundancia", "failover")) {
            topic = "Nuvem"; answer = "A redundância mantém cópias do serviço em regiões diferentes. Se a principal falha, verificações detectam o problema e o tráfego é redirecionado para manter a disponibilidade.";
        } else if (contains(normalized, "automacao", "n8n", "workflow")) {
            topic = "Automação"; answer = "A automação recebe o alerta, reúne contexto, aplica regras, solicita validação humana e registra o incidente. Ela organiza a resposta, mas não substitui as defesas.";
        } else if (contains(normalized, "energia", "sustentavel", "sustentabilidade", "green it", "carbono")) {
            topic = "Tecnologia sustentável"; answer = "Green IT busca reduzir energia, emissões e desperdício. O painel compara consumo, energia renovável, PUE e ações como otimização de servidores e uso eficiente da nuvem.";
        } else if (contains(normalized, "robotica", "robo", "automato")) {
            topic = "Robótica"; answer = "Robótica combina sensores, software e atuadores para perceber, decidir e agir. No Ranbank, o robô apoia recepção, acessibilidade e segurança com supervisão humana.";
        } else if (contains(normalized, "realidade aumentada", "realidade virtual", "imersiva") || hasToken(normalized, "ra") || hasToken(normalized, "vr")) {
            topic = "Tecnologias imersivas"; answer = "A realidade aumentada adiciona informação ao ambiente real; a realidade virtual cria um ambiente digital imersivo. O laboratório compara usos, equipamentos e limitações das duas.";
        } else if (contains(normalized, "comparar", "comparacao", "melhor tecnologia", "qual tecnologia")) {
            topic = "Comparação"; answer = "Não existe uma tecnologia melhor para tudo. O comparador avalia segurança, escala ou eficiência e mostra custo, maturidade, melhor uso e limitações de cada alternativa.";
        } else if (contains(normalized, "obrigado", "obrigada", "valeu")) {
            topic = "Conversa"; answer = "Por nada! Se quiser, escolha outro tema do Future Lab e eu explico de forma rápida.";
        } else if (contains(normalized, "tchau", "ate mais")) {
            topic = "Conversa"; answer = "Até mais! Quando quiser, volte ao Future Lab para explorar outra tecnologia.";
        } else {
            topic = "Modo local"; answer = "Ainda não reconheço essa pergunta. Digite ‘ajuda’ ou pergunte sobre serviços bancários, segurança, IA, Big Data, IoT, nuvem, Open Finance, auditoria, sustentabilidade, robótica, RA ou VR.";
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
