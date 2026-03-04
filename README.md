# 🚀 AWS Serverless LocalStack Ecosystem (SQS + S3 + Lambda)

Bem-vindo ao projeto **Lambda Uploader**! Esta aplicação demonstra um fluxo completo de processamento assíncrono utilizando serviços AWS emulados localmente via **LocalStack**. O projeto foi construído com foco em **Clean Architecture** no backend e **React Moderno** (Hooks) no frontend.

---

## 🛠️ Detalhes Tecnológicos

- **Backend**: Node.js 18 + TypeScript (com Path Aliases `@src`).
- **Infrastructure**: LocalStack (S3, SQS, Lambda, API Gateway).
- **Frontend**: React + Vite + Tailwind CSS 4 (com Path Aliases `@ui`).
- **Architecture**: Clean Architecture (Domain, Application, Infrastructure, Presentation).

---

## 🏗️ Arquitetura do Sistema (Fluxo de Dados)

O fluxo de processamento funciona da seguinte forma:

1.  **Frontend (React)**: O usuário aciona o botão "Simular Compra". O site faz um `POST` para o endpoint do **API Gateway**.
2.  **Producer Lambda**: O API Gateway dispara a Lambda Produtora. Ela gera um objeto de pedido (`Order`) aleatório e o envia para uma fila **SQS**.
3.  **SQS (Queue)**: A fila recebe o pedido e, através de um **Event Source Mapping**, "acorda" a Lambda Consumidora.
4.  **Consumer Lambda**: A consumidora processa a mensagem da fila e persiste o JSON do pedido dentro de um bucket **S3**.
5.  **Dashboard Online**: O frontend realiza um `GET` periódico para a Lambda Produtora (que atua como um proxy seguro) para ler métricas do SQS e S3 em tempo real, contornando limitações de CORS do LocalStack.

---

## 📦 Como as Lambdas são Geradas e Implantadas?

O processo de "nascimento" das Lambdas neste projeto segue um pipeline rigoroso de build para garantir que o TypeScript rode corretamente no ambiente Node.js da AWS:

### 1. Compilação (O Passo TypeScript)

Como as Lambdas rodam em arquivos `.js` comuns, primeiro usamos o comando:

```bash
npm run build # (tsc -p tsconfig.server.json)
```

Ele compila apenas os arquivos do backend (`src/`) usando uma configuração específica que resolve os **Path Aliases** e gera a pasta `dist/`.

### 2. Empacotamento (O Passo ZIP)

Diferente de um site, a AWS exige que o código da Lambda seja enviado em um arquivo `.zip`. Usamos o comando:

```bash
npm run build:zip
```

Ele entra na pasta `dist/` e gera um arquivo `function.zip` contendo os executáveis JavaScript.

### 3. Deploy/Update no LocalStack

O script principal (`start.sh`) verifica se a Lambda já existe:

- **Se não existe**: Cria a função (`create-function`) definindo o nome, runtime (`nodejs18.x`), o handler (ex: `src/presentation/lambda/producer.handler`) e envia o ZIP.
- **Se já existe**: Apenas atualiza o código fonte (`update-function-code`), permitindo iterações rápidas sem precisar deletar a infraestrutura.

---

## 🚀 Como Executar Absolute Tudo (O Botão Vermelho)

Para rodar o ecossistema completo (Docker, Infra AWS e Frontend), basta um único comando:

```bash
npm run server
```

Este comando executa o script `start.sh`, que:

1.  Inicia o contêiner do **Docker Compose**.
2.  Aguardat até que o **LocalStack** esteja saudável.
3.  Cria o Bucket S3 e a Fila SQS.
4.  Compila e faz o deploy das duas Lambdas.
5.  Configura as rotas e o CORS do API Gateway.
6.  Salva a URL gerada no seu arquivo `.env.local`.
7.  Inicia o servidor de desenvolvimento do **Vite (React)**.

---

## 📁 Organização de Pastas (Clean Architecture)

- `src/domain`: Entidades de negócio (onde o "Pedido" é definido).
- `src/application`: Use Cases (a lógica de _o que_ deve acontecer).
- `src/infrastructure`: Gateways AWS (a implementação técnica de _como_ o S3/SQS é acessado).
- `src/presentation`: Handlers das Lambdas (os pontos de entrada).
- `ui/components`: Partes visuais do React.
- `ui/hooks`: Toda a inteligência reativa (ex: `useAwsStats`).

---

**Desenvolvido com 🚀 e Antigravity.**
