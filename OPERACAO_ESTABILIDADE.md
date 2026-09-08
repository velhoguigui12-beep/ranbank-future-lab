# Estabilidade e operação do RanBank

Revisão de 08/09/2026.

## Iniciar neste computador

Na raiz, execute:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/start-local.ps1
```

O script confere Node, Java 21, Maven e dependências, inicia os dois serviços em segundo plano e verifica se estão respondendo. Logs ficam em `.runtime`. Use `-CheckOnly` para conferir pré-requisitos. Se faltar `node_modules`, instale com `npm ci`. O backend local usa H2; o endereço padrão da API em desenvolvimento é `http://localhost:8080/api`.

## Acesso e recuperação

- O aquecimento do servidor é compartilhado e limitado a 60 segundos. Uma falha do health check não impede que o login tente responder.
- Requisições comuns têm prazo de 20 segundos, incluindo a leitura do corpo. Apenas leituras podem repetir uma vez em falhas temporárias; operações de escrita não são repetidas automaticamente.
- O PIN não fica armazenado no cliente para reautenticação automática.
- Respostas atrasadas de uma sessão anterior são descartadas. Dados de outra conta não são exibidos.
- Falhar uma nova tentativa de login não encerra a sessão válida que já existia.
- A sessão e seu cookie são renovados durante o uso. O banco de dados só renova o registro aproximadamente uma vez por minuto, reduzindo escritas.
- O login por número de conta usa coluna indexada, sem carregar a tabela inteira. A migration V12 é aditiva.
- `/api/health` verifica também a conexão com o banco de dados.
- Navegação guarda a aba na URL; voltar/avançar e recarregar preservam a seção principal. Pix, extrato, cartões, pagamentos e reservas usam o conteúdo da página. Confirmações e utilidades pontuais ainda podem abrir diálogos.
- Extrato inclui busca, intervalo de datas, entradas/saídas e exportação dos registros filtrados.

## Hospedagem confirmada

Frontend e API estão no Render gratuito, acompanhando a branch `codex/ranbank-platform-upgrade`. As correções recentes de `main` foram integradas antes da publicação. Cloud Run não está habilitado no projeto configurado e o Worker com o nome deste projeto não está publicado na Cloudflare.

O PostgreSQL gratuito informado pelo Render expira em **19/09/2026**. Antes disso, é necessário migrar os dados para um banco persistente ou contratar um plano adequado. Nenhum plano pago foi contratado nesta revisão. Mesmo com as correções, rede indisponível, suspensão do serviço e expiração do banco podem impedir acesso. Não há garantia técnica de disponibilidade absoluta em uma hospedagem gratuita.

## Validação

- TypeScript e build de produção.
- 21 testes frontend, incluindo indisponibilidade, cancelamento, resposta atrasada, proteção de conta, login e não repetição de pagamentos.
- 36 testes backend: 35 passaram, 1 teste PostgreSQL/Testcontainers ignorado por falta de Docker.
- Seis jornadas locais de login/sessão/dashboard/logout com concorrência 2: todas HTTP 200.
- Inicialização local dos dois serviços via script, com health checks.

A simulação continua educacional: agendamentos registram intenções, não executam liquidação futura; boletos não têm integração com compensação externa; dados impressos na arte do cartão são ilustrativos. O protocolo Pix interno permanece idempotente. Operações externas reais não são realizadas.
