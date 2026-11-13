# Arquitetura do Backend — Vertical Slice

Este documento descreve a arquitetura atual do backend em Azure Functions Node.js. A organização é feita por **caso de uso**: cada operação do recurso `Orçamento` mantém seu adaptador HTTP e sua regra de aplicação próximos, em vez de agrupar todo o projeto apenas por camadas técnicas.

## Estrutura por feature

```text
src/
├── index.js
├── shared/
│   ├── http/response.js
│   └── infra/mongodb/client.js
└── features/
    └── orcamentos/
        ├── shared/
        │   ├── orcamento.mapper.js
        │   └── orcamento.repository.js
        ├── create/
        │   ├── create-orcamento.function.js
        │   └── create-orcamento.use-case.js
        ├── list/
        │   ├── list-orcamentos.function.js
        │   └── list-orcamentos.use-case.js
        ├── update/
        │   ├── update-orcamento.function.js
        │   └── update-orcamento.use-case.js
        └── delete/
            ├── delete-orcamento.function.js
            └── delete-orcamento.use-case.js
```

## Diagrama de classes/módulos

Embora o backend use módulos CommonJS e funções — não classes orientadas a objeto — o diagrama abaixo representa os módulos como classes UML para evidenciar suas responsabilidades e dependências.

```mermaid
classDiagram
    direction LR

    class Index {
        <<bootstrap>>
        +setupHttpStream()
        +registerCreateFunction()
        +registerListFunction()
        +registerUpdateFunction()
        +registerDeleteFunction()
    }

    class CreateOrcamentoFunction {
        <<HTTP adapter>>
        +POST /api/CreateOrcamento
        +OPTIONS /api/CreateOrcamento
    }

    class ListOrcamentosFunction {
        <<HTTP adapter>>
        +GET /api/GetOrcamentos
        +OPTIONS /api/GetOrcamentos
    }

    class UpdateOrcamentoFunction {
        <<HTTP adapter>>
        +PUT /api/UpdateOrcamento
        +OPTIONS /api/UpdateOrcamento
    }

    class DeleteOrcamentoFunction {
        <<HTTP adapter>>
        +DELETE /api/DeleteOrcamento
        +OPTIONS /api/DeleteOrcamento
    }

    class CreateOrcamentoUseCase {
        <<use case>>
        +executeCreateOrcamento(body) Orcamento
        -gerarCodigoOrcamento() string
    }

    class ListOrcamentosUseCase {
        <<use case>>
        +executeListOrcamentos() Orcamento[]
    }

    class UpdateOrcamentoUseCase {
        <<use case>>
        +executeUpdateOrcamento(id, body) Orcamento
    }

    class DeleteOrcamentoUseCase {
        <<use case>>
        +executeDeleteOrcamento(id) DeleteResult
    }

    class OrcamentoMapper {
        <<feature shared>>
        +sanitizeOrcamentoPayload(payload) Orcamento
        +serializeOrcamento(orcamento) Orcamento
    }

    class OrcamentoRepository {
        <<feature repository>>
        +createOrcamento(orcamento) Orcamento
        +listOrcamentos() Orcamento[]
        +updateOrcamento(id, payload) Orcamento
        +deleteOrcamento(id) DeleteResult
        -buildIdFilter(id) MongoFilter
    }

    class HttpResponse {
        <<shared>>
        +jsonResponse(body, status) HttpResponse
        +emptyResponse(status) HttpResponse
    }

    class MongoClientProvider {
        <<infrastructure>>
        +getCollection() MongoCollection
        -cachedClient MongoClient
    }

    class MongoDBAtlas {
        <<external system>>
        orcamentos collection
    }

    Index --> CreateOrcamentoFunction : registra
    Index --> ListOrcamentosFunction : registra
    Index --> UpdateOrcamentoFunction : registra
    Index --> DeleteOrcamentoFunction : registra

    CreateOrcamentoFunction --> CreateOrcamentoUseCase : executa
    ListOrcamentosFunction --> ListOrcamentosUseCase : executa
    UpdateOrcamentoFunction --> UpdateOrcamentoUseCase : executa
    DeleteOrcamentoFunction --> DeleteOrcamentoUseCase : executa

    CreateOrcamentoFunction --> HttpResponse : resposta HTTP
    ListOrcamentosFunction --> HttpResponse : resposta HTTP
    UpdateOrcamentoFunction --> HttpResponse : resposta HTTP
    DeleteOrcamentoFunction --> HttpResponse : resposta HTTP

    CreateOrcamentoUseCase --> OrcamentoMapper : sanitiza/serializa
    ListOrcamentosUseCase --> OrcamentoMapper : serializa
    UpdateOrcamentoUseCase --> OrcamentoMapper : sanitiza/serializa

    CreateOrcamentoUseCase --> OrcamentoRepository : cria
    ListOrcamentosUseCase --> OrcamentoRepository : lista
    UpdateOrcamentoUseCase --> OrcamentoRepository : atualiza
    DeleteOrcamentoUseCase --> OrcamentoRepository : remove

    OrcamentoRepository --> MongoClientProvider : obtém coleção
    MongoClientProvider --> MongoDBAtlas : MongoDB driver
```

## Diagrama de componentes

```mermaid
flowchart LR
    Frontend[Frontend React]
    AzureHost[Azure Functions Host]

    subgraph Backend[Backend Azure Functions - Vertical Slice]
        Bootstrap[src/index.js\nBootstrap e registros]

        subgraph CreateSlice[Slice: Criar orçamento]
            CreateHttp[create-orcamento.function.js\nAdaptador HTTP]
            CreateUseCase[create-orcamento.use-case.js\nCaso de uso]
        end

        subgraph ListSlice[Slice: Listar orçamentos]
            ListHttp[list-orcamentos.function.js\nAdaptador HTTP]
            ListUseCase[list-orcamentos.use-case.js\nCaso de uso]
        end

        subgraph UpdateSlice[Slice: Atualizar orçamento]
            UpdateHttp[update-orcamento.function.js\nAdaptador HTTP]
            UpdateUseCase[update-orcamento.use-case.js\nCaso de uso]
        end

        subgraph DeleteSlice[Slice: Remover orçamento]
            DeleteHttp[delete-orcamento.function.js\nAdaptador HTTP]
            DeleteUseCase[delete-orcamento.use-case.js\nCaso de uso]
        end

        subgraph FeatureShared[Compartilhado da feature Orcamentos]
            Mapper[orcamento.mapper.js\nSanitização e serialização]
            Repository[orcamento.repository.js\nCRUD e filtros]
        end

        subgraph TechnicalShared[Compartilhado técnico]
            Response[shared/http/response.js\nCORS e respostas JSON]
            MongoClient[shared/infra/mongodb/client.js\nConexão e coleção]
        end
    end

    Mongo[(MongoDB Atlas\ncoleção orcamentos)]

    Frontend -->|HTTP /api| AzureHost
    AzureHost --> Bootstrap

    Bootstrap --> CreateHttp
    Bootstrap --> ListHttp
    Bootstrap --> UpdateHttp
    Bootstrap --> DeleteHttp

    CreateHttp -->|POST CreateOrcamento| CreateUseCase
    ListHttp -->|GET GetOrcamentos| ListUseCase
    UpdateHttp -->|PUT UpdateOrcamento| UpdateUseCase
    DeleteHttp -->|DELETE DeleteOrcamento| DeleteUseCase

    CreateHttp --> Response
    ListHttp --> Response
    UpdateHttp --> Response
    DeleteHttp --> Response

    CreateUseCase --> Mapper
    ListUseCase --> Mapper
    UpdateUseCase --> Mapper

    CreateUseCase --> Repository
    ListUseCase --> Repository
    UpdateUseCase --> Repository
    DeleteUseCase --> Repository

    Repository --> MongoClient
    MongoClient -->|MongoDB Driver| Mongo
```

## Responsabilidades dos componentes

| Componente | Responsabilidade |
|---|---|
| `src/index.js` | Configura HTTP streaming e importa os adaptadores, fazendo o registro explícito das Azure Functions. |
| `*.function.js` | Atua como adaptador de entrada: define método, autenticação, leitura da requisição, logs, códigos HTTP e respostas. |
| `*.use-case.js` | Implementa o fluxo de aplicação de um único caso de uso. |
| `orcamento.mapper.js` | Remove `_id` de payloads persistíveis e converte `ObjectId` para string nas respostas. |
| `orcamento.repository.js` | Executa operações de persistência e converte o identificador recebido no filtro MongoDB apropriado. |
| `shared/http/response.js` | Padroniza JSON, CORS e a versão exposta nas respostas. |
| `shared/infra/mongodb/client.js` | Cria e reutiliza a conexão MongoDB; também seleciona banco e coleção pelas variáveis de ambiente. |

## Fluxo de uma requisição

1. O frontend chama uma rota HTTP exposta pelo Azure Functions Host.
2. O `index.js` já registrou o adaptador correspondente durante a inicialização.
3. O adaptador HTTP valida os dados mínimos da requisição e delega ao caso de uso da mesma slice.
4. O caso de uso aplica as regras necessárias e usa o mapper/repositório da feature.
5. O repositório obtém a coleção pelo cliente MongoDB e executa a operação.
6. O adaptador traduz o resultado para a resposta JSON com CORS e o contrato HTTP já existente.

## Endpoints mantidos

| Caso de uso | Azure Function | Método | Rota padrão |
|---|---|---|---|
| Criar orçamento | `CreateOrcamento` | `POST` | `/api/CreateOrcamento` |
| Listar orçamentos | `GetOrcamentos` | `GET` | `/api/GetOrcamentos` |
| Atualizar orçamento | `UpdateOrcamento` | `PUT` | `/api/UpdateOrcamento` |
| Remover orçamento | `DeleteOrcamento` | `DELETE` | `/api/DeleteOrcamento` |

Todas as operações também aceitam `OPTIONS` para o preflight CORS.
