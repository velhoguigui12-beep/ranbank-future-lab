# Ranbank Future Lab

Aplicação acadêmica que combina uma interface bancária com módulos interativos sobre segurança digital, IA, Big Data, IoT, nuvem, automação, sustentabilidade, RA/VR, robótica e autenticação.

## Arquitetura

- **Frontend:** React 19, TypeScript e Vinext.
- **Backend:** Java 21 e Spring Boot 3.5.
- **Banco:** H2 em arquivo local.
- **Chatbot:** base educacional local, sem API externa.

## Executar localmente

Backend:

```powershell
cd backend
mvn spring-boot:run
```

Frontend, em outro terminal:

```powershell
pnpm dev
```

Abra `http://localhost:3000`.

## Acesso demonstrativo

```text
CPF: 123.456.789-09
PIN de acesso: 2580
Senha de 4 dígitos para Pix: 7314
```

O login cria uma sessão temporária em cookie `HttpOnly`. O PIN de acesso e a senha
transacional são diferentes e ficam armazenados no H2 somente como hashes BCrypt.
Após cinco tentativas de login ou três tentativas da senha transacional, a respectiva
credencial é bloqueada temporariamente. Todas as credenciais são fictícias.

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

O backend contém um `Dockerfile` pronto para serviços compatíveis com contêineres Java. Depois que o backend receber uma URL HTTPS, essa URL deve ser configurada no frontend por meio de `NEXT_PUBLIC_API_URL`.

## Apresentação

Use o botão **Iniciar apresentação guiada** no Future Lab ou consulte `APRESENTACAO.md` para o roteiro de 6 a 8 minutos.
