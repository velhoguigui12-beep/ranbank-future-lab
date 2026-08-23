# Ranbank Future Lab

Aplicação acadêmica que combina uma interface bancária com módulos interativos sobre segurança digital, IA, Big Data, IoT, nuvem, automação, sustentabilidade, RA/VR, robótica, autenticação, Open Finance e auditoria encadeada.

## Recursos principais

- Conta demo criada pelo próprio usuário, login multiusuário por CPF ou conta, sessão persistente e PIN transacional separado.
- Recuperação do PIN de acesso com e-mail cadastrado e confirmação pelo PIN transacional.
- Administração de contas com listagem, desativação, reativação e remoção lógica com anonimização.
- Pix entre duas contas com resolução do destinatário, idempotência, liquidação atômica e comprovante.
- Gerenciamento de chaves Pix por e-mail, CPF, telefone ou chave aleatória.
- Extrato pesquisável, cartão virtual com controle de limite e cofrinho.
- Notificações persistentes com atualização em tempo real via SSE.
- RanFlow com execuções persistidas e trilha automática para cada Pix.
- Future Lab com IA explicável, Big Data, IoT, nuvem, automação e cibersegurança.
- Open Finance com consentimentos revogáveis e visão consolidada.
- Ledger de auditoria com hashes encadeados e jornada antifraude integrada.
- Aplicação web instalável (PWA), com atalho próprio e tela offline segura.

## Arquitetura

- **Frontend:** React 19, TypeScript e Vinext.
- **Backend:** Java 21 e Spring Boot 3.5.
- **Banco:** H2 para desenvolvimento local e PostgreSQL para ambientes persistentes, com migrations Flyway.
- **Chatbot:** base educacional local, sem API externa.

## Executar localmente

Backend:

```powershell
cd backend
mvn spring-boot:run
```

Frontend, em outro terminal:

```powershell
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Acesso demonstrativo

```text
CPF: 123.456.789-09
PIN de acesso: 2580
Senha de 4 dígitos para Pix: 7314
```

O login cria uma sessão temporária persistida e envia apenas o token em cookie `HttpOnly`. O PIN de acesso e a senha
transacional são diferentes e ficam armazenados no H2 somente como hashes BCrypt.
Após cinco tentativas de login ou três tentativas da senha transacional, a respectiva
credencial é bloqueada temporariamente. Todas as credenciais são fictícias.

Na tela de login também é possível criar uma nova conta educacional. E-mail, CPF e telefone
são cadastrados automaticamente como chaves Pix, e a conta recebe saldo inicial fictício.
Os campos de CPF e telefone aplicam a máscara brasileira durante a digitação. Para demonstrar uma
transferência a partir da conta de apresentação, use `maria@ranbank.demo` como destino.
O link **Esqueci meu PIN** exige o CPF ou número da conta, o e-mail cadastrado e o PIN
transacional. A recuperação invalida as sessões anteriores da conta.

Depois de entrar, use **Gerenciar minhas chaves** na área Pix. Contas administrativas
também exibem **Gerenciar contas** no Future Lab. A exclusão é lógica: os dados pessoais
são anonimizados, as sessões e chaves Pix são removidas e o histórico financeiro é mantido.

## Endpoints evolutivos

- `POST /api/demo-accounts`: cria e autentica uma conta educacional.
- `POST /api/auth/recover-pin`: redefine o PIN de acesso após validar e-mail e PIN transacional.
- `GET`, `POST` e `DELETE /api/pix/keys`: lista, cria e remove chaves da conta autenticada.
- `GET /api/pix/recipients/resolve`: confirma o recebedor antes do Pix.
- `POST /api/pix/transfers`: transfere com `Idempotency-Key` e PIN transacional.
- `GET /api/pix/transfers/{id}/receipt`: recupera o comprovante.
- `GET /api/notifications` e `GET /api/notifications/stream`: central e SSE.
- `GET /api/automation/executions`: histórico persistido do RanFlow.
- `GET /api/admin/insights/summary`: métricas globais restritas ao papel administrativo.
- `GET /api/admin/accounts`: lista contas para a administração.
- `PATCH /api/admin/accounts/{id}/status`: desativa ou reativa uma conta.
- `DELETE /api/admin/accounts/{id}`: remove logicamente e anonimiza uma conta.

## Qualidade e persistência

- Nove migrations Flyway criam o esquema e suas relações em H2 ou PostgreSQL.
- Testes de integração cobrem autenticação, recuperação de PIN, ciclo de vida das contas,
  chaves Pix, idempotência, reset bilateral e migrations.
- O teste PostgreSQL usa Testcontainers e é executado automaticamente quando Docker está disponível.
- O `render.yaml` provisiona um PostgreSQL gerenciado e injeta as credenciais sem gravá-las no repositório.

## Variáveis de hospedagem

Frontend:

```text
NEXT_PUBLIC_API_URL=https://endereco-do-backend/api
```

Backend:

```text
PORT=8080
H2_CONSOLE_ENABLED=false
APP_CORS_ALLOWED_ORIGIN_PATTERNS=https://endereco-do-frontend
RANBANK_DEMO_LOGIN_ID=12345678909
RANBANK_DEMO_ACCESS_PIN=2580
RANBANK_DEMO_TRANSACTION_PIN=7314
RANBANK_SESSION_MINUTES=30
```

Para PostgreSQL, ative o perfil e informe uma URL JDBC:

```text
SPRING_PROFILES_ACTIVE=postgresql
SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/ranbank
SPRING_DATASOURCE_USERNAME=ranbank
SPRING_DATASOURCE_PASSWORD=senha-segura
```

Como alternativa, o backend aceita `DATABASE_URL` no formato
`postgresql://usuario:senha@host:5432/banco`. Esse é o formato injetado pelo Blueprint
atual do Render e também pelo PostgreSQL da Railway.

O backend contém um `Dockerfile` pronto para serviços compatíveis com contêineres Java. Depois que o backend receber uma URL HTTPS, essa URL deve ser configurada no frontend por meio de `NEXT_PUBLIC_API_URL`.

## Instalar no celular

Em uma versão publicada por HTTPS, abra o Ranbank no Chrome ou Edge e use o botão
**Instalar Ranbank**. No Android, a opção também aparece em **Adicionar à tela inicial**.
No iPhone, abra no Safari, toque em **Compartilhar** e depois em **Adicionar à Tela de Início**.
O aplicativo instalado continua sendo uma aplicação web: operações bancárias exigem conexão
e a tela offline não guarda respostas da API nem dados financeiros no cache.

## Hospedagem sem tela de espera

O Blueprint atual usa instâncias gratuitas do Render, que entram em repouso. Para manter
frontend, API e PostgreSQL ativos, consulte `DEPLOY_RAILWAY.md`. A migração recomendada é
para Railway Hobby com **Serverless desativado** nos serviços. A alternativa com menor risco
é manter o Render e mudar as duas instâncias web para um plano pago.

## Apresentação

Use o botão **Iniciar apresentação guiada** no Future Lab ou consulte `APRESENTACAO.md` para o roteiro de 8 a 10 minutos.
