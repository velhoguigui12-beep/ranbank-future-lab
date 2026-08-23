# Publicar o Ranbank na Railway sem cold start

O projeto já contém um `Dockerfile` na raiz para o frontend e outro em `backend/` para a API.
A configuração abaixo mantém os serviços ativos. Não habilite **Serverless**, pois essa opção
coloca serviços ociosos em repouso e reintroduz o atraso no primeiro acesso.

## 1. Criar o projeto e o PostgreSQL

1. Crie um projeto vazio na Railway e conecte a conta do GitHub.
2. No projeto, clique em **New > Database > PostgreSQL**.
3. Renomeie o serviço para `Postgres`.

## 2. Criar o backend

1. Adicione um serviço a partir do repositório do Ranbank.
2. Renomeie o serviço para `Backend`.
3. Defina **Root Directory** como `/backend`.
4. Confirme que o builder encontrou `backend/Dockerfile`.
5. Gere um domínio público para o serviço.
6. Mantenha **Serverless** desativado.
7. Cadastre estas variáveis:

```text
SPRING_PROFILES_ACTIVE=postgresql
DATABASE_URL=${{Postgres.DATABASE_URL}}
H2_CONSOLE_ENABLED=false
APP_CORS_ALLOWED_ORIGIN_PATTERNS=https://${{Frontend.RAILWAY_PUBLIC_DOMAIN}}
RANBANK_DEMO_LOGIN_ID=12345678909
RANBANK_DEMO_ACCESS_PIN=2580
RANBANK_DEMO_TRANSACTION_PIN=7314
RANBANK_SESSION_MINUTES=30
```

O backend lê `PORT` automaticamente; a Railway fornece essa variável. O health check é
`/api/health`.

## 3. Criar o frontend

1. Adicione o mesmo repositório como um segundo serviço e renomeie-o para `Frontend`.
2. Use a raiz `/` e o `Dockerfile` da raiz do repositório.
3. Mantenha **Serverless** desativado.
4. Cadastre as variáveis abaixo antes do build:

```text
NEXT_PUBLIC_API_URL=https://${{Backend.RAILWAY_PUBLIC_DOMAIN}}/api
RANBANK_BACKEND_URL=https://${{Backend.RAILWAY_PUBLIC_DOMAIN}}/api
```

Se o serviço da API tiver outro nome, substitua `Backend` pelo nome usado no painel. Depois
do primeiro deploy, gere o domínio público do frontend e refaça o deploy da API para que a
origem permitida seja aplicada.

## 4. Domínio próprio

Adicione o domínio na aba **Networking** do frontend e crie no provedor de DNS o registro
indicado pela Railway. Atualize `APP_CORS_ALLOWED_ORIGIN_PATTERNS` para incluir o domínio
definitivo, por exemplo:

```text
APP_CORS_ALLOWED_ORIGIN_PATTERNS=https://ranbank.com.br,https://${{Frontend.RAILWAY_PUBLIC_DOMAIN}}
```

## 5. Dados existentes

Para começar vazio, não é necessário importar nada: o Flyway executa as nove migrations no
primeiro boot. Para preservar usuários e movimentações do Render, exporte o banco antigo com
`pg_dump` e restaure no novo PostgreSQL antes de liberar o domínio. Não desligue o banco antigo
até conferir login, saldo, extrato, Pix e painel administrativo no novo ambiente.

## 6. Conferência final

- `/api/health` responde sem demora mesmo depois de mais de 15 minutos sem uso;
- criação de conta, login e recuperação do PIN funcionam;
- Pix atualiza os dois lados e gera comprovante;
- administrador consegue desativar, reativar e remover contas;
- chaves Pix podem ser criadas e removidas;
- o navegador oferece **Instalar Ranbank**;
- o domínio usa HTTPS e o cookie de sessão aparece como `Secure` e `HttpOnly`.

O plano Hobby tem cobrança mínima mensal e uso variável. Acompanhe a estimativa de CPU,
memória e PostgreSQL após a primeira semana e configure um limite de gasto no workspace.
