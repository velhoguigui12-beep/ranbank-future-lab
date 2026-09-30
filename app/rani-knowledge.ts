// Base de respostas da Rani, assistente do RanBank.
// As respostas são locais e escolhidas por pontuação de palavras-chave: nada é inventado.

export type RaniContext = "site" | "bank";
export type RaniScreen = "pix" | "cards" | "statement" | "services" | "security" | "lab" | "account";
export type RaniAnswer = { topic: string; text: string; link?: { label: string; href: string }; screen?: { label: string; target: RaniScreen } };

type Intent = {
  topic: string;
  keywords: string[];
  site: Omit<RaniAnswer, "topic">;
  bank?: Omit<RaniAnswer, "topic">;
};

const INTENTS: Intent[] = [
  {
    topic: "Sobre a Rani",
    keywords: ["quem e voce", "quem voce e", "rani", "assistente", "robo", "voce e real", "inteligencia artificial"],
    site: { text: "Sou a Rani, a assistente do RanBank. Respondo com uma base de respostas prontas e, quando não sei algo, eu aviso em vez de inventar." },
  },
  {
    topic: "Sobre o RanBank",
    keywords: ["o que e o ranbank", "ranbank", "sobre o banco", "sobre o projeto", "o que voces fazem", "proposta"],
    site: { text: "O RanBank é um banco digital educacional criado por jovens aprendizes. A ideia cabe em três palavras: proteger, explicar e devolver para a comunidade.", link: { label: "Ver a proposta", href: "/#proposta" } },
  },
  {
    topic: "É de verdade?",
    keywords: ["banco real", "banco de verdade", "e real", "dinheiro real", "dinheiro de verdade", "e verdade", "funciona de verdade", "autorizado", "banco central"],
    site: { text: "Não é um banco de verdade. É um projeto educacional: contas, cartões e valores são fictícios e nada movimenta dinheiro real. Mas o sistema funciona: dá para entrar e fazer um Pix de teste." },
  },
  {
    topic: "Abrir conta",
    keywords: ["abrir conta", "abrir uma conta", "abrir a conta", "criar conta", "criar uma conta", "cadastro", "cadastrar", "quero ser cliente", "nova conta", "conta de teste"],
    site: { text: "Clique em “Abrir conta”, no topo do site. Use só dados inventados: é uma conta de teste que já começa com saldo fictício.", link: { label: "Criar conta de teste", href: "/banco?modo=criar-conta" } },
    bank: { text: "Você já está dentro de uma conta. Para criar outra conta de teste, saia e escolha “Criar conta” na tela de entrada." },
  },
  {
    topic: "Entrar na conta",
    keywords: ["entrar", "login", "acessar", "esqueci", "senha de acesso", "recuperar", "pin"],
    site: { text: "Para entrar, use CPF, número da conta ou e-mail e a senha de 4 dígitos. Se esquecer, use “Esqueci meu PIN” na tela de entrada.", link: { label: "Ir para a entrada", href: "/banco" } },
    bank: { text: "Você entra com CPF, conta ou e-mail e a senha de 4 dígitos. Para trocar a senha, saia da conta e use “Esqueci meu PIN”." },
  },
  {
    topic: "Pix",
    keywords: ["pix", "transferir", "transferencia", "mandar dinheiro", "enviar dinheiro", "chave"],
    site: { text: "No RanBank o Pix passa por quatro etapas: entrar, conferir o nome de quem recebe, confirmar com uma senha de 4 dígitos só para movimentar e receber o comprovante." },
    bank: { text: "Informe a chave e o valor, confira o nome de quem vai receber e confirme com a senha de 4 dígitos, que é diferente da senha de entrar.", screen: { label: "Abrir o Pix", target: "pix" } },
  },
  {
    topic: "Bloquear cartão",
    keywords: ["bloquear", "bloquear o cartao", "bloquear cartao", "bloquear meu cartao", "perdi o cartao", "perdi meu cartao", "perdi", "perdeu", "roubado", "roubaram", "furtado", "desbloquear"],
    site: { text: "Perdeu o cartão? No app, vá em Cartão e toque em “Bloquear temporariamente”. Para liberar depois, é só tocar de novo." },
    bank: { text: "Vá em Cartão e toque em “Bloquear temporariamente”. Para liberar, toque de novo.", screen: { label: "Bloquear agora", target: "cards" } },
  },
  {
    topic: "Cartão Black",
    keywords: ["black", "cartao black", "ranbank black", "sala vip", "vip", "cartao exclusivo"],
    site: { text: "O RanBank Black é um cartão exclusivo, oferecido por convite, com limite alto e atendimento prioritário. Nesta demonstração ele fica bloqueado para todas as contas." },
  },
  {
    topic: "Cartão Originário",
    keywords: ["originario", "cartao originario", "cartao indigena"],
    site: { text: "O Originário é uma proposta em estudo: um cartão criado junto com povos indígenas, em que parte de cada compra iria para projetos escolhidos pelas próprias comunidades. A arte seria feita por artistas indígenas, com autorização e pagamento." },
  },
  {
    topic: "Cartão Jovem",
    keywords: ["cartao jovem", "ranbank jovem", "primeiro cartao", "estudante", "lista de espera"],
    site: { text: "O RanBank Jovem é para quem está começando: limite pequeno, aviso a cada compra e dicas de educação financeira. Ele ainda não está disponível. Quando abrir, quem pediu informações entra na lista de espera." },
  },
  {
    topic: "Cartão",
    keywords: ["cartao", "ecocard", "fatura", "limite", "credito", "debito"],
    site: { text: "O Ecocard é o cartão do RanBank, feito de material de origem sustentável. No app dá para ver a fatura, mudar o limite e bloquear em um toque. Também existem o Black, o Originário e o Jovem, que ainda não estão disponíveis nesta demonstração." },
    bank: { text: "Na área Cartão você vê a fatura, ajusta o limite e bloqueia o Ecocard quando quiser.", screen: { label: "Abrir o Cartão", target: "cards" } },
  },
  {
    topic: "Extrato",
    keywords: ["extrato", "movimentacao", "movimentacoes", "comprovante", "historico", "gastos"],
    site: { text: "O extrato mostra cada entrada e saída com nome, data e valor, da mais nova para a mais antiga. Dá para filtrar e exportar." },
    bank: { text: "No Extrato você vê entradas e saídas, filtra por período e exporta a lista.", screen: { label: "Abrir o Extrato", target: "statement" } },
  },
  {
    topic: "Guardar dinheiro",
    keywords: ["cofrinho", "guardar", "reserva", "poupar", "economizar", "investir meu dinheiro", "rendimento"],
    site: { text: "O cofrinho separa uma parte do saldo para um objetivo, sem misturar com o dinheiro do dia a dia." },
    bank: { text: "Em Pagar e guardar você coloca dinheiro no cofrinho ou resgata quando precisar.", screen: { label: "Abrir o cofrinho", target: "services" } },
  },
  {
    topic: "Simulação de ataque",
    keywords: ["ataque hacker", "simular ataque", "simulacao de ataque", "simulacao hacker", "como o hacker", "como o golpista", "invadir conta", "invasao", "site falso", "hackear"],
    site: { text: "No banco existe uma simulação educativa: você recebe um SMS falso, vê o site copiado, acompanha a tela do golpista capturando os dados e depois liga as defesas do RanBank para ver se o ataque passa. Tudo com dados fictícios.", link: { label: "Entrar no banco", href: "/banco" } },
    bank: { text: "Na área Segurança tem a simulação de ataque: SMS falso, site copiado, a tela do golpista e as defesas do banco que você liga e desliga. Tudo com dados fictícios.", screen: { label: "Abrir Segurança", target: "security" } },
  },
  {
    topic: "Golpes",
    keywords: ["golpe", "golpes", "golpista", "evitar golpes", "sms", "whatsapp", "mensagem estranha", "link", "codigo", "falsa central", "ligaram", "clonado", "phishing", "fraude"],
    site: { text: "O RanBank nunca pede senha ou código por mensagem. Desconfie de pressa, de links e de pedidos de Pix, mesmo de conhecidos com número novo. Na dúvida, ligue você para a pessoa ou para o banco.", link: { label: "Ver a Central de Segurança", href: "/seguranca" } },
    bank: { text: "O RanBank nunca pede senha ou código por mensagem. Quer testar uma mensagem que recebeu? Use o detector “Isso é golpe?”.", screen: { label: "Abrir o detector", target: "lab" } },
  },
  {
    topic: "Segurança",
    keywords: ["seguranca", "seguro", "protecao", "protege", "hacker", "invadir", "criptografia"],
    site: { text: "A senha fica guardada embaralhada, o Pix pede uma segunda senha, o app mostra quem vai receber antes de confirmar e o acesso vence depois de 30 minutos sem uso.", link: { label: "Ver a Central de Segurança", href: "/seguranca" } },
    bank: { text: "A sua senha fica guardada embaralhada, o Pix pede uma segunda senha e o acesso vence depois de 30 minutos sem uso.", screen: { label: "Ver Segurança", target: "security" } },
  },
  {
    topic: "Fluxo antifraude",
    keywords: ["antifraude", "fluxo", "gatilho", "n8n", "automacao", "regras", "suspeita", "suspeito"],
    site: { text: "Toda transação passa por um fluxo de gatilhos, parecido com o n8n: blocos conferem valor, aparelho, cidade e horário, somam pontos e decidem se aprovam, pedem confirmação ou bloqueiam. Dá para testar dentro do banco, na área Segurança." },
    bank: { text: "O fluxo antifraude confere valor, aparelho, cidade e horário, soma pontos e decide: aprovar, pedir confirmação ou bloquear. Você pode mudar as regras e testar.", screen: { label: "Abrir o fluxo", target: "security" } },
  },
  {
    topic: "Projetos sociais",
    keywords: ["projeto", "projetos", "social", "impacto", "comunidade", "indigena", "indigenas", "educacao financeira", "instituto", "meio ambiente", "sustentavel"],
    site: { text: "São propostas, ainda não realizadas: oficinas de educação financeira com jovens, crédito com propósito e apoio a comunidades, inclusive indígenas, sempre construído junto com elas.", link: { label: "Ver projetos e impacto", href: "/projetos" } },
  },
  {
    topic: "Parcerias",
    keywords: ["parceria", "parceiro", "agsus", "patrocinio", "empresa", "governo"],
    site: { text: "O RanBank não tem parcerias oficiais. A AgSUS aparece no site só como referência de trabalho nos territórios, sem vínculo com o projeto." },
  },
  {
    topic: "Quem fez",
    keywords: ["quem fez", "quem criou", "equipe", "time", "jovens aprendizes", "aprendiz", "senac", "guilherme", "giulianno", "organograma", "presidente"],
    site: { text: "O RanBank foi criado por 16 jovens aprendizes, com Guilherme como presidente e Giulianno como vice-presidente, em quatro áreas: tecnologia, comunicação, negócios e gestão de pessoas.", link: { label: "Ver o organograma", href: "/organograma" } },
  },
  {
    topic: "Por que apostar",
    keywords: ["investir no ranbank", "apostar", "apoiar", "por que apostar", "por que investir", "vale a pena", "proximo passo", "piloto"],
    site: { text: "O RanBank já funciona como protótipo, ataca um problema real (golpes e falta de informação sobre dinheiro) e custa pouco para testar. O próximo passo seria um piloto educativo com jovens, sem dinheiro real.", link: { label: "Ver onde estamos", href: "/#caminho" } },
  },
  {
    topic: "Missão e valores",
    keywords: ["missao", "visao", "valores", "valor da empresa", "objetivo"],
    site: { text: "A missão do RanBank é facilitar a vida financeira das pessoas com serviços simples, seguros e acessíveis. Os valores são simplicidade, segurança, inclusão e impacto positivo.", link: { label: "Ver missão e valores", href: "/#visao-valores" } },
  },
  {
    topic: "Privacidade",
    keywords: ["privacidade", "cookie", "cookies", "dados pessoais", "lgpd", "meus dados"],
    site: { text: "O RanBank guarda só o necessário para você entrar e usar a conta, e não usa cookies de propaganda. Use sempre dados inventados.", link: { label: "Ver privacidade", href: "/privacidade" } },
  },
  {
    topic: "Tecnologia",
    keywords: ["tecnologia", "como o banco funciona", "como o site funciona", "servidor", "nuvem", "cloudflare", "neon", "banco de dados", "programacao", "react", "java"],
    site: { text: "O site fica no Cloudflare, um serviço de nuvem, e as contas ficam guardadas no Neon, um banco de dados na internet. As senhas são guardadas embaralhadas." },
    bank: { text: "O site fica no Cloudflare, um serviço de nuvem, e as contas ficam guardadas no Neon, um banco de dados na internet. Em “Como o banco funciona” você testa cada parte.", screen: { label: "Como o banco funciona", target: "lab" } },
  },
  {
    topic: "Saldo e conta",
    keywords: ["saldo", "minha conta", "dados da conta", "agencia", "numero da conta"],
    site: { text: "O saldo aparece assim que você entra no banco. Lembre: é um valor fictício.", link: { label: "Entrar no banco", href: "/banco" } },
    bank: { text: "O saldo fica no início. Em Minha conta você vê agência, número da conta e seus dados.", screen: { label: "Abrir Minha conta", target: "account" } },
  },
];

const GREETINGS = ["oi", "ola", "opa", "bom dia", "boa tarde", "boa noite", "e ai", "hey", "salve"];
const THANKS = ["obrigado", "obrigada", "valeu", "brigado", "agradeco"];

export const RANI_WELCOME: Record<RaniContext, string> = {
  site: "Oi! Eu sou a Rani, assistente do RanBank. Posso explicar o projeto, a segurança e as propostas. O que você quer saber?",
  bank: "Oi! Eu sou a Rani. Posso ajudar com Pix, cartão, extrato e golpes, e te levar para a tela certa.",
};

export const RANI_SUGGESTIONS: Record<RaniContext, string[]> = {
  site: ["É um banco de verdade?", "Como abrir uma conta?", "Quais são os projetos?", "Como evitar golpes?"],
  bank: ["Como faço um Pix?", "Como bloquear o cartão?", "Recebi uma mensagem estranha", "O que é o fluxo antifraude?"],
};

const normalize = (message: string) => message.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

export function answerRani(message: string, context: RaniContext): RaniAnswer {
  const text = normalize(message);
  if (!text) return { topic: "Rani", text: "Pode escrever sua pergunta que eu tento ajudar." };
  const padded = ` ${text} `;
  if (GREETINGS.some((word) => text === word || text.startsWith(`${word} `)) && text.split(" ").length <= 3) return { topic: "Oi!", text: RANI_WELCOME[context] };
  if (THANKS.some((word) => padded.includes(` ${word} `))) return { topic: "De nada", text: "De nada! Se precisar de mais alguma coisa, é só chamar." };

  let best: { intent: Intent; score: number } | null = null;
  for (const intent of INTENTS) {
    // Frases com mais palavras valem mais: "banco de verdade" pesa mais que "banco".
    const score = intent.keywords.reduce((total, keyword) => total + (padded.includes(` ${keyword} `) || (keyword.length > 5 && text.includes(keyword)) ? keyword.split(" ").length + 1 : 0), 0);
    if (score > 0 && (!best || score > best.score)) best = { intent, score };
  }
  if (!best) {
    return { topic: "Ainda não sei", text: "Ainda não sei responder isso. Tente perguntar sobre Pix, cartão, golpes, segurança, projetos ou sobre o próprio RanBank." };
  }
  const answer = (context === "bank" && best.intent.bank) || best.intent.site;
  return { topic: best.intent.topic, ...answer };
}
