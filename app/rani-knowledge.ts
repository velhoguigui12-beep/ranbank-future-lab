// Base de respostas da Rani, assistente do RanBank.
// As respostas são locais e escolhidas por pontuação de palavras-chave: nada é inventado.
// Ela tolera erros de digitação, lembra o assunto anterior e, dentro do banco, consulta a conta de teste.

export type RaniContext = "site" | "bank";
export type RaniScreen = "pix" | "cards" | "statement" | "services" | "security" | "lab" | "account";
export type RaniAction = "balance" | "recent" | "blockCard" | "unblockCard" | "human";
export type RaniAnswer = {
  topic: string;
  text: string;
  link?: { label: string; href: string };
  screen?: { label: string; target: RaniScreen };
  action?: RaniAction;
  follow?: string[];
};

type Intent = {
  topic: string;
  keywords: string[];
  site: Omit<RaniAnswer, "topic">;
  bank?: Omit<RaniAnswer, "topic">;
};

const INTENTS: Intent[] = [
  {
    topic: "Seu saldo",
    keywords: ["qual meu saldo", "qual o meu saldo", "meu saldo", "quanto tenho", "quanto eu tenho", "saldo atual", "ver saldo", "ver meu saldo", "quanto dinheiro"],
    site: { text: "Para ver o saldo, entre no banco com a sua conta de teste. Lembre: o valor é fictício.", link: { label: "Entrar no banco", href: "/banco" } },
    bank: { text: "Vou consultar sua conta.", action: "balance" },
  },
  {
    topic: "Últimas movimentações",
    keywords: ["ultimos pix", "meus pix", "meus ultimos pix", "ultimas movimentacoes", "ultimas transacoes", "o que entrou", "o que saiu", "movimentacoes recentes", "ultimos lancamentos", "ultimas compras"],
    site: { text: "As movimentações aparecem no extrato, dentro do banco.", link: { label: "Entrar no banco", href: "/banco" } },
    bank: { text: "Vou buscar suas últimas movimentações.", action: "recent" },
  },
  {
    topic: "Desbloquear cartão",
    keywords: ["desbloquear", "desbloquear o cartao", "desbloquear meu cartao", "desbloqueia", "liberar o cartao", "liberar meu cartao", "liberar cartao", "achei o cartao", "achei meu cartao"],
    site: { text: "Para liberar o cartão, entre no banco, vá em Cartão e toque em “Desbloquear cartão”.", link: { label: "Entrar no banco", href: "/banco" } },
    bank: { text: "Vou conferir o seu cartão.", action: "unblockCard" },
  },
  {
    topic: "Atendimento",
    keywords: ["atendente", "atendimento humano", "falar com uma pessoa", "falar com alguem", "falar com atendente", "humano", "pessoa de verdade", "reclamacao", "ouvidoria", "sac", "central de atendimento"],
    site: { text: "Certo, vou te passar para o atendimento.", action: "human" },
  },
  {
    topic: "Sobre a Rani",
    keywords: ["quem e voce", "quem voce e", "rani", "assistente", "robo", "voce e real", "inteligencia artificial"],
    site: { text: "Sou a Rani, a assistente do RanBank. Respondo com uma base de respostas prontas e, quando não sei algo, eu aviso em vez de inventar." },
  },
  {
    topic: "Sobre o RanBank",
    keywords: ["o que e o ranbank", "ranbank", "sobre o banco", "sobre o projeto", "o que voces fazem", "proposta"],
    site: { text: "O RanBank é um banco digital educacional criado por jovens aprendizes. A ideia cabe em três palavras: proteger, explicar e devolver para a comunidade.", link: { label: "Ver a proposta", href: "/projetos" } },
  },
  {
    topic: "É de verdade?",
    keywords: ["banco real", "banco de verdade", "e real", "dinheiro real", "dinheiro de verdade", "e verdade", "funciona de verdade", "autorizado", "banco central"],
    site: { text: "Não é um banco de verdade. É um projeto educacional: contas, cartões e valores são fictícios e nada movimenta dinheiro real. Mas o sistema funciona: dá para entrar e fazer um Pix de teste." },
  },
  {
    topic: "Abrir conta",
    keywords: ["abrir conta", "abrir uma conta", "abrir a conta", "criar conta", "criar uma conta", "cadastro", "cadastrar", "quero ser cliente", "nova conta", "conta de teste"],
    site: { text: "Clique em “Abrir conta”, no topo do site. Use só dados inventados: é uma conta de teste que já começa com R$ 200,00 fictícios.", link: { label: "Criar conta de teste", href: "/banco?modo=criar-conta" } },
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
    keywords: ["bloquear", "bloquear o cartao", "bloquear cartao", "bloquear meu cartao", "perdi o cartao", "perdi meu cartao", "perdi", "perdeu", "roubado", "roubaram", "furtado", "bloqueia"],
    site: { text: "Perdeu o cartão? No app, vá em Cartão e toque em “Bloquear temporariamente”. Para liberar depois, é só tocar de novo." },
    bank: { text: "Vou conferir o seu cartão.", action: "blockCard" },
  },
  {
    topic: "Cartão Black",
    keywords: ["black", "cartao black", "ranbank black", "sala vip", "vip", "cartao exclusivo"],
    site: { text: "O RanBank Black é um cartão exclusivo, oferecido por convite, com limite alto e atendimento prioritário. Nesta demonstração ele fica bloqueado para todas as contas." },
  },
  {
    topic: "Cartão Originário",
    keywords: ["originario", "cartao originario", "cartao indigena", "indigena", "indigenas"],
    site: { text: "A ideia do Originário agora faz parte do Ecocard: parte de cada compra iria para projetos escolhidos por comunidades indígenas. É uma proposta, construída junto com as próprias comunidades." },
  },
  {
    topic: "Cartão Jovem",
    keywords: ["cartao jovem", "ranbank jovem", "primeiro cartao", "estudante", "lista de espera"],
    site: { text: "O RanBank Jovem é para quem está começando: limite pequeno, aviso a cada compra e dicas de educação financeira. Ele ainda não está disponível. Quando abrir, quem pediu informações entra na lista de espera." },
  },
  {
    topic: "Cartão",
    keywords: ["cartao", "ecocard", "fatura", "limite", "credito", "debito"],
    site: { text: "Toda conta nova vem com o cartão RanBank, azul-escuro e sem anuidade. O Ecocard é para clientes da casa: tem cashback, é feito de material sustentável e parte das compras iria para projetos de comunidades indígenas. Também existem o Black e o Jovem, que ainda não estão disponíveis." },
    bank: { text: "Na área Cartão você vê a fatura, ajusta o limite arrastando a barra e bloqueia o seu cartão quando quiser.", screen: { label: "Abrir o Cartão", target: "cards" } },
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
    topic: "Pix que não reconheço",
    keywords: ["nao reconheco", "nao reconheco um pix", "nao fui eu", "pix errado", "pix por engano", "devolucao", "devolver o pix", "contestar", "med"],
    site: { text: "Se aparecer um Pix que você não fez, avise o banco na hora. Nos bancos de verdade existe o MED, do Banco Central, que pede a devolução do dinheiro em casos de golpe. Aqui no RanBank o atendimento é uma simulação." },
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
    topic: "Fundação RanBank",
    keywords: ["fundacao", "fundacao ranbank", "curso", "cursos", "aulas", "orientacao", "orientacoes", "escola", "aprender com voces", "proximos passos do projeto"],
    site: { text: "A Fundação RanBank está em construção: vai reunir cursos e orientações feitos pela própria turma, com cada pessoa ensinando o que sabe da sua área. Ainda não tem data para abrir.", link: { label: "Ver a Fundação", href: "/fundacao" } },
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
    site: { text: "O RanBank já funciona como protótipo, ataca um problema real (golpes e falta de informação sobre dinheiro) e custa pouco para testar. O próximo passo seria um piloto educativo com jovens, sem dinheiro real.", link: { label: "Ver os projetos", href: "/projetos" } },
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

// Próximos passos sugeridos depois de cada assunto.
const FOLLOW: Record<string, Partial<Record<RaniContext, string[]>>> = {
  "Seu saldo": { bank: ["Meus últimos Pix", "Como faço um Pix?", "Como guardar dinheiro?"] },
  "Últimas movimentações": { bank: ["Qual meu saldo?", "Não reconheço um Pix", "Como faço um Pix?"] },
  "Bloquear cartão": { site: ["Recebi uma mensagem estranha", "Como abrir uma conta?"], bank: ["Desbloquear meu cartão", "Recebi uma mensagem estranha"] },
  "Desbloquear cartão": { bank: ["Bloquear meu cartão", "Qual meu saldo?"] },
  "Atendimento": { site: ["Como evitar golpes?", "Como abrir uma conta?"], bank: ["Bloquear meu cartão", "Qual meu saldo?"] },
  "Pix": { site: ["Como evitar golpes?", "Como abrir uma conta?"], bank: ["Meus últimos Pix", "Qual meu saldo?", "Recebi uma mensagem estranha"] },
  "Golpes": { site: ["Perdi meu cartão", "Não reconheço um Pix", "Falar com atendente"], bank: ["Bloquear meu cartão", "Não reconheço um Pix", "Falar com atendente"] },
  "Cartão": { site: ["E o Ecocard?", "E o cartão Black?"], bank: ["Bloquear meu cartão", "E o cartão Black?"] },
  "Cartão Black": { site: ["E o Ecocard?", "E o cartão Jovem?"], bank: ["E o Ecocard?", "Falar com atendente"] },
  "Cartão Originário": { site: ["Quais são os projetos?", "E o cartão Black?"], bank: ["E o cartão Black?", "Bloquear meu cartão"] },
  "Cartão Jovem": { site: ["E o cartão Black?", "Como abrir uma conta?"] },
  "É de verdade?": { site: ["Como abrir uma conta?", "Quem fez o RanBank?"] },
  "Sobre o RanBank": { site: ["Quais são os projetos?", "Por que apostar no RanBank?", "Quem fez o RanBank?"] },
  "Abrir conta": { site: ["Como faço um Pix?", "Como evitar golpes?"] },
  "Segurança": { site: ["Como evitar golpes?", "O que é o fluxo antifraude?"], bank: ["O que é o fluxo antifraude?", "Recebi uma mensagem estranha"] },
  "Projetos sociais": { site: ["E o Ecocard?", "Por que apostar no RanBank?"] },
  "Pix que não reconheço": { site: ["Falar com atendente", "Como evitar golpes?"], bank: ["Falar com atendente", "Bloquear meu cartão"] },
  "Ainda não sei": { site: ["Falar com atendente", "Como abrir uma conta?"], bank: ["Falar com atendente", "Qual meu saldo?"] },
};

// Erros de digitação comuns que a comparação letra a letra não pega.
const ALIASES: Record<string, string> = { pics: "pix", piks: "pix", pixe: "pix", pixi: "pix", cartaum: "cartao", katao: "cartao", golpi: "golpe", golpis: "golpes", sauldo: "saldo" };

const GREETINGS = ["oi", "ola", "opa", "bom dia", "boa tarde", "boa noite", "e ai", "hey", "salve"];
const THANKS = ["obrigado", "obrigada", "valeu", "brigado", "agradeco"];

export const RANI_WELCOME: Record<RaniContext, string> = {
  site: "Oi! Eu sou a Rani, assistente do RanBank. Posso explicar o projeto, a segurança e as propostas. O que você quer saber?",
  bank: "Oi! Eu sou a Rani. Posso consultar seu saldo, mostrar seus últimos Pix, bloquear o cartão e tirar dúvidas sobre golpes.",
};

/** Boas-vindas com o primeiro nome da pessoa, quando ela está dentro do banco. */
export const raniWelcome = (context: RaniContext, name?: string) =>
  name && context === "bank" ? `Oi, ${name}! Eu sou a Rani. Posso consultar seu saldo, mostrar seus últimos Pix, bloquear o cartão e tirar dúvidas sobre golpes.` : RANI_WELCOME[context];

export const RANI_SUGGESTIONS: Record<RaniContext, string[]> = {
  site: ["Como abrir uma conta?", "Quais são os projetos?", "Como evitar golpes?", "Perdi meu cartão"],
  bank: ["Qual meu saldo?", "Meus últimos Pix", "Bloquear meu cartão", "Recebi uma mensagem estranha"],
};

const normalize = (message: string) => message.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

// Distância entre duas palavras: quantas letras é preciso trocar, tirar ou pôr.
function distance(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 2) return 3;
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    previous = current;
  }
  return previous[b.length];
}

// A palavra digitada "parece" a palavra-chave? Palavras maiores aceitam mais erros.
const close = (typed: string, word: string) => typed === word || (word.length >= 5 && distance(typed, word) <= (word.length >= 7 ? 2 : 1));

function score(intent: Intent, text: string, words: string[]) {
  const padded = ` ${text} `;
  return intent.keywords.reduce((total, keyword) => {
    const parts = keyword.split(" ");
    // Frase exata vale mais; com erro de digitação vale um pouco menos.
    if (padded.includes(` ${keyword} `) || (keyword.length > 5 && text.includes(keyword))) return total + parts.length + 1;
    if (parts.every((part) => words.some((word) => close(word, part)))) return total + parts.length + 0.5;
    return total;
  }, 0);
}

function withFollow(answer: RaniAnswer, context: RaniContext): RaniAnswer {
  return { ...answer, follow: answer.follow ?? FOLLOW[answer.topic]?.[context] ?? FOLLOW[answer.topic]?.site };
}

/** Responde uma mensagem. `lastTopic` é o assunto anterior, para entender perguntas curtas como "e como faço isso?". */
export function answerRani(message: string, context: RaniContext, lastTopic?: string): RaniAnswer {
  const text = normalize(message);
  if (!text) return { topic: "Rani", text: "Pode escrever sua pergunta que eu tento ajudar." };
  const words = text.split(" ").map((word) => ALIASES[word] ?? word);
  const fixed = words.join(" ");
  const padded = ` ${fixed} `;
  if (GREETINGS.some((word) => fixed === word || fixed.startsWith(`${word} `)) && words.length <= 3) return { topic: "Oi!", text: RANI_WELCOME[context], follow: RANI_SUGGESTIONS[context] };
  if (THANKS.some((word) => padded.includes(` ${word} `))) return { topic: "De nada", text: "De nada! Se precisar de mais alguma coisa, é só chamar.", follow: RANI_SUGGESTIONS[context] };

  let best: { intent: Intent; score: number } | null = null;
  for (const intent of INTENTS) {
    const points = score(intent, fixed, words);
    if (points > 0 && (!best || points > best.score)) best = { intent, score: points };
  }

  if (!best) {
    // Pergunta curta sem assunto ("e como faço isso?"): continua o assunto anterior.
    const previous = lastTopic ? INTENTS.find((intent) => intent.topic === lastTopic) : undefined;
    if (previous && words.length <= 7) {
      const answer = (context === "bank" && previous.bank) || previous.site;
      return withFollow({ topic: previous.topic, ...answer, text: answer.action ? answer.text : `Ainda sobre ${previous.topic.toLowerCase()}: ${answer.text}` }, context);
    }
    return withFollow({ topic: "Ainda não sei", text: "Ainda não sei responder isso. Tente perguntar sobre Pix, cartão, golpes, segurança ou sobre o próprio RanBank. Se preferir, posso te passar para o atendimento." }, context);
  }
  const answer = (context === "bank" && best.intent.bank) || best.intent.site;
  return withFollow({ topic: best.intent.topic, ...answer }, context);
}
