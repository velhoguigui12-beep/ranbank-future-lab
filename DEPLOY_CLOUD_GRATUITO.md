# Migração do RanBank: Cloudflare + Cloud Run + Neon

Esta é a arquitetura recomendada para o pico de acessos do projeto:

- Cloudflare Workers serve o frontend e mantém `/api` na mesma origem do navegador;
- Google Cloud Run executa a API Spring Boot em São Paulo e escala horizontalmente;
- Neon hospeda o PostgreSQL em São Paulo com conexão agrupada;
- Render permanece ativo até todos os testes de corte serem concluídos.

O Cloud Run e o Neon podem permanecer dentro das cotas gratuitas em uso acadêmico baixo ou
moderado, mas isso não é uma garantia de custo zero. Ative orçamento e alertas no Google Cloud.

## 1. Segredo entre o frontend e a API

Gere um segredo aleatório de pelo menos 32 bytes e não o grave no Git:

```powershell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[Convert]::ToBase64String($bytes)
```

O mesmo valor será configurado como `RANBANK_PROXY_SECRET` no Cloud Run e no Cloudflare.
A rota `/api/health` permanece pública para os health checks.

## 2. Criar o PostgreSQL no Neon

1. Crie um projeto chamado `ranbank` na região AWS São Paulo (`sa-east-1`).
2. Copie a conexão **pooled**, cujo hostname contém `-pooler`.
3. Guarde a URL completa como `DATABASE_URL`; `sslmode=require` e
   `channel_binding=require` são aceitos pelo backend.
4. Não execute migrations manualmente: o Flyway aplica as dez migrations no primeiro boot.

Para começar com banco vazio, avance para o Cloud Run. Para preservar as contas do Render,
faça o procedimento de corte da seção 6 antes de liberar o novo endereço.

## 3. Publicar o backend no Cloud Run

Crie o serviço a partir do repositório GitHub, usando:

```text
Nome: ranbank-api
Região: southamerica-east1 (São Paulo)
Diretório: /backend
Dockerfile: /backend/Dockerfile
Autenticação: permitir acesso público
CPU: 1
Memória: 512 MiB (subir para 1 GiB se o boot exceder o limite)
Concorrência: 4
Mínimo de instâncias durante o evento: 1
Máximo de instâncias: 10
Porta: variável PORT fornecida pelo Cloud Run
```

Variáveis:

```text
SPRING_PROFILES_ACTIVE=postgresql
DATABASE_URL=<URL POOLED DO NEON>
H2_CONSOLE_ENABLED=false
RANBANK_PROXY_SECRET=<SEGREDO GERADO>
RANBANK_DEMO_LOGIN_ID=12345678909
RANBANK_DEMO_ACCESS_PIN=2580
RANBANK_DEMO_TRANSACTION_PIN=7314
RANBANK_SESSION_MINUTES=30
SPRING_DATASOURCE_MAXIMUM_POOL_SIZE=5
SPRING_DATASOURCE_MINIMUM_IDLE=0
```

Depois do evento, altere o mínimo de instâncias para `0` para permitir scale-to-zero.
Mantenha o máximo em `10` para limitar custo e conexões simultâneas ao banco.

## 4. Publicar o frontend no Cloudflare Workers

Instale as dependências com `npm ci`, autentique o Wrangler e configure:

```powershell
npx wrangler login
npx wrangler secret put RANBANK_BACKEND_URL
npx wrangler secret put RANBANK_PROXY_SECRET
npm run deploy:cloudflare
```

Valores:

```text
RANBANK_BACKEND_URL=https://<SERVICO-CLOUD-RUN>/api
RANBANK_PROXY_SECRET=<MESMO SEGREDO DO CLOUD RUN>
```

`NEXT_PUBLIC_API_URL` deve continuar como `/api`. Não aponte o navegador diretamente ao
Cloud Run, pois isso separaria o cookie de sessão do domínio do frontend.

## 5. Validação antes do corte

No endereço `*.workers.dev`, confira:

- home, instituto, projetos, segurança e privacidade;
- criação de uma conta nova;
- login e restauração da sessão após recarregar;
- saldo, extrato, cofrinho e cartão;
- Pix entre duas contas e emissão do comprovante;
- chaves Pix, notificações e painel administrativo;
- `GET /api/health` retornando HTTP 200;
- `npm run test:load -- https://<ENDERECO-WORKERS.DEV> 40 8` sem 429.

## 6. Preservar dados existentes

Para evitar perder contas criadas durante a migração, faça um corte curto de escrita:

1. Avise sobre manutenção de aproximadamente cinco minutos.
2. Impeça novas criações e transferências no endereço antigo.
3. Exporte o Render com `pg_dump --format=custom --no-owner`.
4. Restaure no Neon com `pg_restore --no-owner --clean --if-exists`.
5. Inicie o Cloud Run e confira as contagens das tabelas `bank_accounts`,
   `bank_transactions`, `pix_transfers` e `bank_sessions`.
6. Só então altere o domínio para o Cloudflare.

Se os dados atuais forem descartáveis, pule a exportação: o Flyway cria o banco e a conta
demonstrativa automaticamente.

## 7. Reversão

Não exclua os recursos do Render no dia do evento. Se a validação falhar, volte o domínio ao
frontend antigo e remova temporariamente o segredo do backend antigo. Exclua os recursos do
Render apenas depois de ao menos 48 horas estáveis e de um backup lógico conferido.
