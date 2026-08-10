# Ranbank Future Lab

AplicaÃ§Ã£o acadÃªmica que combina uma interface bancÃ¡ria com mÃ³dulos interativos sobre seguranÃ§a digital, IA, Big Data, IoT, nuvem, automaÃ§Ã£o, sustentabilidade, RA/VR, robÃ³tica e autenticaÃ§Ã£o.

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

## VariÃ¡veis de hospedagem

Frontend:

```text
NEXT_PUBLIC_API_URL=https://endereco-do-backend/api
```

Backend:

```text
PORT=8080
H2_CONSOLE_ENABLED=false
APP_CORS_ALLOWED_ORIGIN_PATTERNS=https://endereco-do-frontend
```

O backend contÃ©m um `Dockerfile` pronto para serviÃ§os compatÃ­veis com contÃªineres Java. Depois que o backend receber uma URL HTTPS, essa URL deve ser configurada no frontend por meio de `NEXT_PUBLIC_API_URL`.

## ApresentaÃ§Ã£o

Use o botÃ£o **Iniciar apresentaÃ§Ã£o guiada** no Future Lab ou consulte `APRESENTACAO.md` para o roteiro de 6 a 8 minutos.

