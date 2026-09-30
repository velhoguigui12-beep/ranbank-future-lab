# Roteiro — apresentação do RanBank para a AgSUS

**Quem apresenta:** Guilherme (site) e Giulianno (banco).
**Tempo total:** cerca de 10 a 12 minutos, mais as perguntas.
**Objetivo:** mostrar que o RanBank é uma ideia séria, que já funciona como protótipo e que vale a pena apoiar o próximo passo (um piloto educativo). Sempre deixando claro que é um projeto educacional.

---

## Antes de começar (15 minutos antes)

- [ ] Abrir o site: https://ranbank-future-lab.ranbank-future-lab.workers.dev
- [ ] Clicar em "Somente essenciais" no aviso de cookies, para ele não aparecer durante a apresentação.
- [ ] Entrar uma vez na conta da Ana e sair, para confirmar que o login está funcionando.
- [ ] Deixar o site aberto em uma aba e o banco (`/banco`) em outra.
- [ ] No projetor, ajustar o zoom do navegador (Ctrl + / Ctrl -) até os textos ficarem bem legíveis no fundo da sala.
- [ ] Ter o site aberto no celular como plano B.

---

## Parte 1 — Guilherme apresenta o site (cerca de 5 minutos)

Role a página inicial de cima para baixo. Cada item abaixo é uma parte da página.

1. **Abertura** ("O banco que protege, explica e devolve.")
   Fale: "O RanBank é um banco digital que criamos como projeto educacional. A ideia cabe em três palavras: proteger, explicar e devolver."

2. **Por que o RanBank existe** (os três números)
   Fale: "148 milhões de pessoas usaram o Pix em 2025. Mas 39% dos brasileiros dizem que já sofreram golpe ou tentativa de golpe na conta, e mais da metade diz entender pouco ou nada de educação financeira. O banco ficou fácil de usar, mas usar com segurança ainda é difícil."
   *(Os números têm fonte na tela: Banco Central e Febraban.)*

3. **Missão, visão e valores**
   Leia só a missão em voz alta e cite os quatro valores pelo nome: simplicidade, segurança, inclusão e impacto positivo.

4. **O banco** (Pix, Ecocard, extrato, cofrinho)
   Fale: "É tudo o que uma conta precisa, sem nada que confunda. O Pix, por exemplo, mostra o nome de quem vai receber e pede uma senha só para movimentar dinheiro."

5. **Assistente Rani**
   Fale: "A Rani responde dúvidas em palavras simples, como esta sobre um SMS pedindo código."

6. **Segurança** (as quatro etapas do Pix)
   Fale: "Todo Pix passa por quatro etapas: entrar, conferir, confirmar e comprovar."

7. **Proposta de impacto**
   Fale: "A proposta é separar uma parte do resultado do banco para educação financeira, crédito com propósito e comunidades. É uma proposta: nenhum desses projetos foi realizado ainda."

8. **Onde estamos**
   Fale: "O protótipo está pronto. O próximo passo seria um piloto educativo com jovens. Levar o projeto a comunidades ainda está em estudo."

**Transição para o Giulianno:**
> "Mas isso não é só apresentação. O Giulianno vai mostrar o banco funcionando."

---

## Parte 2 — Giulianno apresenta o banco (cerca de 5 minutos)

1. **Entrar** — Clique em "Entrar" no topo do site e entre com a conta da Ana.
   Fale: "Dá para entrar com CPF, número da conta ou e-mail."
2. **Tela inicial** — Mostre o saldo, o cartão e as quatro ações rápidas.
   Fale: "O mais importante aparece primeiro: saldo, cartão e o que você mais usa."
3. **Fazer um Pix** — Faça um Pix pequeno para outra conta de demonstração.
   Mostre a tela que confere o nome de quem recebe e a senha de 4 dígitos.
   Fale: "O app mostra para quem o dinheiro vai e pede uma segunda senha, diferente da de entrar."
4. **Comprovante e extrato** — Mostre o comprovante e a movimentação no extrato.
5. **Bloquear o cartão** — Bloqueie e desbloqueie o Ecocard.
   Fale: "Perdeu o cartão? Um toque e ele está bloqueado."
6. **Segurança: o fluxo de gatilhos (RanFlow)**. Esta é a parte principal do Giulianno. Abra **Segurança** no menu.
   - Fale: "Toda transação dispara um fluxo, parecido com o n8n. Cada bloco confere um sinal de risco e soma pontos. No fim, o fluxo decide sozinho: aprovar, pedir confirmação ou bloquear."
   - Clique em **Compra normal** e depois em **Executar fluxo**. Mostre que tudo fica verde e a compra é aprovada.
   - Clique em **Celular novo em Manaus** e em **Executar fluxo**. Mostre os blocos acendendo em amarelo e o caminho **Bloquear**.
   - Clique em um bloco (por exemplo, **Valor alto?**) e mostre a **Saída do bloco**, com o que ele calculou.
   - Clique em **Simular 30 transações** e mostre o gráfico: quantas foram aprovadas, quantas pediram confirmação e quantas foram bloqueadas.
   - Em **Regras do fluxo**, diminua o limite de valor e clique em **Reprocessar com regras novas**. Fale: "Se o banco ficar mais rígido, veja como mais transações passam a ser bloqueadas."
   - Deixe claro: "É uma simulação. A lógica é de verdade, mas roda no navegador e não mexe em dinheiro."
   - **Simulação de ataque** (no topo da página Segurança, botão **Começar a simulação**):
     - Mostre o SMS falso e clique no número de quem mandou. Ele entra na lista de sinais de golpe.
     - Clique em **Abrir o link** e depois em **Preencher com dados fictícios**. Fale: "Olhem a tela do golpista: cada letra aparece para ele enquanto a pessoa digita."
     - Clique em **Regularizar agora** e em **Ver a invasão da conta**. Com só o **Código SMS** ligado, rode o ataque. O golpe passa, porque a vítima entregou o código no site falso.
     - Ligue **Rosto para aparelho novo** e rode de novo. Agora o ataque para. Fale: "Uma defesa sozinha pode falhar. Por isso o banco usa várias camadas."
7. **Rani** — Faça uma pergunta simples para a Rani (o botão com a foto dela, no canto da tela).
   *(Teste a pergunta antes, para saber a resposta que ela vai dar.)*
8. **Tecnologia** — Se sobrar tempo, abra **Como o banco funciona** no menu. Tudo ali é interativo. Boas opções:
   - **Isso é golpe?**: escolha “Parente no WhatsApp” e mostre os sinais destacados na mensagem.
   - **Registro que não se altera**: mude o valor de um Pix e mostre a corrente quebrar.
   - **Banco sempre no ar**: desligue o Servidor 1 e mostre os outros assumindo os acessos.

---

## Parte 3 — Encerramento (os dois, cerca de 1 minuto)

Volte ao site, na parte **"Por que apostar no RanBank"**.

- **Guilherme:** "O RanBank já funciona, ataca um problema real e custa pouco para testar."
- **Giulianno:** "O próximo passo é um piloto educativo, sem dinheiro real. É aí que o apoio de vocês faria diferença."
- **Guilherme:** "Lembrando que o RanBank é um projeto educacional. Obrigado!"

---

## Perguntas que podem aparecer

**É um banco de verdade?**
Não. É um projeto educacional. Não movimenta dinheiro real e não tem autorização do Banco Central.

**Os números da pesquisa são reais?**
Sim. São do Relatório de Gestão do Pix, do Banco Central, e do Observatório Febraban de julho de 2025. As fontes aparecem na tela.

**Vocês têm parceria com a AgSUS ou com alguma empresa?**
Não. A AgSUS aparece na página de projetos como referência de trabalho nos territórios. Os projetos com comunidades são uma ideia em estudo.

**Quanto custa manter o RanBank no ar?**
Hoje ele usa serviços de nuvem gratuitos: o Cloudflare, que hospeda o site, e o Neon, que guarda o banco de dados.

**As senhas estão seguras?**
Sim. As senhas são guardadas embaralhadas (criptografia bcrypt), a sessão vence depois de 30 minutos sem uso e o Pix pede uma segunda senha.

**O que seria o piloto?**
Oficinas com jovens aprendizes e escolas, usando o RanBank para praticar Pix, orçamento e prevenção a golpes, sem dinheiro real.

### Frases para evitar

- "Nossos clientes…" → prefira **"quem usar o RanBank…"**
- "Já ajudamos…" → prefira **"a proposta é ajudar…"**
- "Nossos parceiros…" → prefira **"nossas referências…"**

---

## Identidade institucional

### Missão

Facilitar a vida financeira das pessoas com serviços simples, seguros e acessíveis.

### Visão

Ser um banco digital reconhecido por unir tecnologia, educação financeira e responsabilidade social.

### Valores

- **Simplicidade** — Falar claro. Se precisa de manual, está complicado demais.
- **Segurança** — Proteger cada acesso e cada centavo como se fossem nossos.
- **Inclusão** — Funcionar bem para quem tem pouca experiência com banco.
- **Impacto positivo** — Medir o sucesso também pelo bem que o banco faz fora dele.

### Nosso compromisso

> Tecnologia para simplificar. Segurança para proteger. Responsabilidade para transformar.

---

## Plano B

- **O site não abre:** use o celular com o link do site, ou mostre as páginas pelo celular espelhado.
- **O login demora:** espere cerca de 10 segundos e tente de novo. Enquanto isso, continue falando sobre a segurança do Pix.
- **O Pix dá erro de saldo:** faça um Pix de valor menor.
