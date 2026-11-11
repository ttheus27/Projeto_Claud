Projeto PJBL — Arquitetura Completa
Objetivo

Desenvolver e demonstrar uma aplicação distribuída utilizando microservices, BFF, microfrontend e Azure Functions, aplicando padrões modernos como:

    Clean Architecture
    Vertical Slice
    Event-Driven Architecture
    API Gateway + BFF + Microservice + Database Service + Serverless
    Integração com múltiplos bancos

🧱 Arquitetura da Solução

A solução será composta pelos seguintes componentes:
🔹 1. Microfrontend

    Interface do usuário (SPA)
    Pode ser feito com:
        React ou Angular
    Responsável por consumir o BFF (não acessa microservices diretamente)

🔹 2. BFF (Backend for Frontend) — Node.js

    Implementado com Node.js preferncialmente (ex: Express ou NestJS)
    Responsabilidades:
        Agregação de dados
        Proxy de requisições (CRUD)
        Comunicação com:
            Microservices
            Function (HTTP Trigger)

📌 Endpoint obrigatório:

    GET /aggregated-data
        Consome:
            Microserviço 1
            Microserviço 2
            Azure Function
        Retorna tudo em um único response

🔹 3. Microserviço 1 (MongoDB)

    Banco: MongoDB Atlas (Free Tier)
    Responsável por um domínio (ex: Produtos)
    CRUD completo
    Swagger documentado

🔹 4. Microserviço 2 (Azure SQL)

    Banco: Azure SQL Database (Free 1 DTU)
    Responsável por outro domínio (ex: Pedidos)
    CRUD completo
    Swagger documentado

🔹 5. Azure Function

    Tipo: HTTP Trigger / Message Trigger
    Pode simular:
        cálculo
        enriquecimento de dados
    Exposta via endpoint HTTP

🔹 6. API Gateway (opcional, mas exigido na entrega)

    Pode usar:
        AWS Gateway
    Responsável por:
        roteamento
        segurança
        centralização de entrada

🔄 Fluxo da Aplicação

    Usuário acessa o Microfrontend
    Front chama o BFF
    BFF:
        consulta Microserviço Mongo
        consulta Microserviço SQL
        consulta Azure Function
    BFF agrega tudo
    Retorna um único JSON

🐳 Dockerização
Publicar no Docker Hub:

Para cada serviço (microservices + BFF):
docker build -t <registry>/<repo>/<imagem>:<tag> .
docker login <registry>
docker push <registry>/<repo>/<imagem>:<tag>

📌 Exemplo:
docker build -t dockerhubuser/pjbl/bff:v1 .
docker push dockerhubuser/pjbl/bff:v1
🧪 Requisitos de Código
Deve conter:
✔ Clean Architecture

    Separação em camadas:
        Domain
        Application
        Infrastructure
        API

✔ Vertical Slice

    Organização por feature (ex: CreateOrder, GetOrder)

✔ Testes

    Testes unitários
    Testes de arquitetura

📂 Repositórios (GitHub)

Publicar TUDO em repositórios públicos no GitHub:

    Microfrontend
    BFF
    Microserviço Mongo
    Microserviço SQL
    Azure Function

📄 README.md (em cada projeto)

Deve conter:

    Descrição da arquitetura
    Tecnologias utilizadas
    Como rodar localmente (apresentação video abaixo deve demonstrar URLs da internet/cloud não localhost)
    Nome dos alunos

🧾 Documentação (Entrega em PDF da Entrega 3)
📘 ARC42 deve conter:

    Links:
        GitHub (todos os projetos)
        Docker Hub (imagens)
        Swagger:
            BFF
            Microservices
            Eventos
        Frontend
        API Gateway
        Vídeo no YouTube

🧩 Outros artefatos obrigatórios:
✔ C4 Model atualizado

    Contexto
    Containers
    Componentes

✔ Canvas
✔ Prints:

    Swagger BFF
    Swagger Microservices
    Frontend funcionando
    API Gateway

🎥 Vídeo (YouTube)

    Plataforma: YouTube
    Tipo: Não listado (somente link)
    Todos do grupo devem falar, deixar explicito no video. 
     Apresentação video abaixo deve demonstrar URLs da internet/cloud não localhost.

Deve demonstrar:

    Frontend funcionando
    Chamadas passando pelo BFF
    CRUD / Regra de Negócio completo
    Integração com:
        MongoDB
        SQL Server
        Function
        Eventos
    Fluxo completo da arquitetura


"Estou trabalhando no projeto acadêmico PJBL 'Integrador de Orçamentos'
  │ (Schulz S/A e SKA Automação). O documento com todas as diretrizes, regras
  │ de negócio da usinagem, padrões arquiteturais (Clean Architecture,
  │ Vertical Slice, BFF, Microserviços Mongo e SQL, Azure Function, Gateway e
  │ Docker Hub) e o checklist de Definition of Done está detalhado no arquivo
  │ contexto/CONTEXTO_PROJETO_PJBL.md. Por favor, leia e siga estritamente
  │ essas diretrizes para a seguinte tarefa: [INSERIR TAREFA AQUI]