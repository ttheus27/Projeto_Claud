# 📋 CHECKLIST OFICIAL DE ENTREGA E TRACKER DE PROGRESSO
### Projeto Integrador de Orçamentos — Schulz S/A & SKA Automação (PJBL)

> **Finalidade deste arquivo:** Servir como painel de controle (tracker de progresso) e checklist em tempo real da entrega final da disciplina. Conforme concluímos cada item, este arquivo é atualizado com `[x]`, data e detalhes técnicos.

---

## 📊 Painel de Status Geral

| Bloco | Descrição | Progresso | Status |
| :--- | :--- | :---: | :---: |
| **Bloco 1** | Frontend & Novas Telas (Microfrontend) | 90% | 🟢 Quase Pronto |
| **Bloco 2** | Backend Distribuído (MS1 Mongo, MS2 SQL, BFF, Function) | 90% | 🟢 Quase Pronto |
| **Bloco 3** | Documentação Swagger & Docker Hub | 100% | 🟢 Imagens publicadas |
| **Bloco 4** | Deploy em Nuvem & API Gateway (URLs Públicas) | 25% | 🟡 Parcial (Front no ar) |
| **Bloco 5** | Documentação Arc42 v3.0 (PDF) & Vídeo YouTube | 20% | 🟡 Parcial (v2 pronta) |

---

## 👥 Dados da Equipe e Links Oficiais

* **Alunos Integrantes:**
  * Alexandre Filho
  * Ana Julia
  * Felipe Nathan
  * Matheus Silva
* **Repositório GitHub:** [https://github.com/ttheus27/Projeto_Claud](https://github.com/ttheus27/Projeto_Claud)
* **Frontend em Produção:** [https://ttheus27.github.io/Projeto_Claud/](https://ttheus27.github.io/Projeto_Claud/)
* **Documento de Contexto Geral:** [`contexto/CONTEXTO_PROJETO_PJBL.md`](CONTEXTO_PROJETO_PJBL.md)

---

## 📝 Lista de Tarefas Detalhada

### 🟢 BLOCO 1: Frontend & Novas Telas (Microfrontend)
- [x] **Limpeza do repositório:** remoção da pasta duplicada acidental `Projeto/Projeto/` *(Concluído em 05/11/2026)*.
- [x] **Testes unitários automatizados:** suíte Vitest com 12 testes passando em `Projeto/` (`npm test`) *(Concluído em 05/11/2026)*.
- [x] **Build de produção verificado:** `npm run build` gerando bundle estático em 3.8s *(Concluído em 05/11/2026)*.
- [x] **Aba "Pedidos & Ordens de Fabricação":** tela visual para listar e gerenciar pedidos do banco relacional (Azure SQL / MS2).
- [x] **Ação "Gerar Pedido Industrial":** botão no orçamento aprovado que cria a ordem no banco relacional.
- [x] **Aba "Visão Integrada (BFF Aggregated Data)":** tela de monitoramento que consome `GET /aggregated-data` e exibe os 3 nós integrados (MongoDB, Azure SQL e Azure Function) com latência.
- [ ] **Painel de Eventos em Tempo Real:** feed na interface demonstrando a publicação e consumo de eventos de negócio (*Event-Driven Architecture*).
- [ ] **Publicação da nova versão do Frontend:** deploy automático via GitHub Actions no GitHub Pages.

---

### ⚙️ BLOCO 2: Backend Distribuído (Microsserviços & BFF)
- [x] **Azure Functions v4:** HTTP Trigger de cálculo registrado em `functions/`; CRUD Mongo separado no microserviço.
- [x] **Microserviço 1 (MongoDB — Orçamentos e Peças):**
  - [x] API Node.js/Express isolada em `services/ms-orcamentos-mongo/`.
  - [x] CRUD completo (`GET`, `POST`, `PUT`, `DELETE`).
  - [x] Conexão com MongoDB Atlas real; indisponibilidade retorna erro, sem persistência alternativa local.
- [x] **Microserviço 2 (Azure SQL — Pedidos e Ordens):**
  - [x] API Node.js/Express isolada em `services/ms-pedidos-sql/`.
  - [x] CRUD completo de Pedidos (`id_pedido`, `codigo_orcamento`, `cliente`, `lote_producao`, `valor_total`, `status_producao`, `data_entrega_prevista`).
  - [x] Banco Azure SQL real com inicialização explícita do schema (`npm run db:init`, tabela `TB_PEDIDOS`).
- [x] **BFF (Backend for Frontend):**
  - [x] API Node.js/Express isolada em `services/bff/`.
  - [x] **Endpoint Mandatório do PJBL:** `GET /aggregated-data` (orquestra MS1 + MS2 + Function e devolve JSON único).
  - [x] Endpoints de proxy para o Frontend realizar as operações sem acessar bancos diretamente.
  - [x] Ação de negócio `/api/pedidos/gerar-de-orcamento`.
- [x] **Azure Function (Cálculo & Enriquecimento Serverless):**
  - [x] Endpoint dedicado para custos industriais, impostos, margem e flag *Zerar Custo*, publicado com chave utilizada apenas pelo BFF.

---

### 🐳 BLOCO 3: Documentação Swagger & Docker Hub
- [x] **Swagger / OpenAPI nos 3 serviços:**
  - [x] Interface interativa em `/api-docs` no **BFF** (porta 8080).
  - [x] Interface interativa em `/api-docs` no **Microserviço 1 (Mongo)** (porta 3001).
  - [x] Interface interativa em `/api-docs` no **Microserviço 2 (SQL)** (porta 3002).
- [x] **Dockerização Completa:**
  - [x] `Dockerfile` otimizado para o **BFF**.
  - [x] `Dockerfile` otimizado para o **Microserviço 1**.
  - [x] `Dockerfile` otimizado para o **Microserviço 2**.
  - [x] Arquivo `docker-compose.yml` para rodar todo o ecossistema localmente com 1 comando:
    ```bash
    docker compose up --build
    ```
- [x] **Publicação no Docker Hub (12/11/2026):**
  - [x] Quatro repositórios públicos em [nj9ouidvb2v3cno4](https://hub.docker.com/u/nj9ouidvb2v3cno4).
  - [x] Tag `v3.0.0` em `schulz-gateway`, `schulz-bff`, `schulz-ms-mongo` e `schulz-ms-sql`.
  - [x] Build local e pelo GitHub Actions; integração dos contêineres com os bancos reais e a Function.

---

### 🧱 Regras de código e arquitetura
- [x] Casos de uso separados em fatias por operação nos backends.
- [x] Domínio e aplicação independentes dos drivers; composição injeta os adaptadores.
- [x] Testes de dependência sobre o grafo real, isolamento dos serviços e ciclos.
- [x] Fixture com importação proibida comprova que a regra falha.
- [x] Suíte completa: 26 testes aprovados, incluindo 3 de arquitetura.

### ☁️ BLOCO 4: Deploy em Nuvem & Gateway (URLs Públicas)
- [x] **Frontend na nuvem:** ativo no GitHub Pages em HTTPS.
- [ ] **Deploy dos Contêineres na Nuvem:**
  - [ ] Publicação do BFF e Microsserviços em serviço gratuito (Render.com, Koyeb ou Azure Container Apps).
  - [ ] URLs públicas ativas com certificado SSL/HTTPS.
- [ ] **Configuração do API Gateway:**
  - [ ] Rota centralizada no Gateway (AWS API Gateway, Azure APIM ou Gateway reverso) roteando para o BFF.
- [ ] **Validação E2E em Produção:**
  - [ ] Frontend na web consumindo o BFF na web sem bloqueios de CORS.

---

### 📄 BLOCO 5: Documentação Arc42 (PDF) & Vídeo no YouTube
- [ ] **Atualização do PDF de Arquitetura Arc42 (Versão 3.0):**
  - [ ] Atualização de ADRs (tornar BFF, Microsserviços múltiplos, SQL e Gateway decisões **adotadas**).
  - [ ] Diagramas C4 atualizados (Nível 1 - Contexto, Nível 2 - Contêineres com todos os nós distribuídos, Nível 3 - Componentes).
  - [ ] Diagrama de Sequência do endpoint `/aggregated-data`.
  - [ ] Inserção de prints obrigatórios de comprovação:
    - [ ] Print do Swagger do BFF.
    - [ ] Prints do Swagger dos Microserviços 1 e 2.
    - [ ] Print do painel do API Gateway.
    - [ ] Print do Frontend rodando em produção.
    - [ ] Print das imagens publicadas no Docker Hub.
  - [ ] Tabela com todos os links públicos e identificação obrigatória nominal de todos os 4 alunos.
- [ ] **Gravação do Vídeo no YouTube:**
  - [ ] Roteiro estruturado cobrindo todo o fluxo da arquitetura.
  - [ ] **Participação obrigatória de todos:** Alexandre, Ana Julia, Felipe e Matheus devem falar no vídeo.
  - [ ] **Demonstração em URLs da nuvem (proibido localhost):**
    - [ ] Mostrar o Frontend no GitHub Pages.
    - [ ] Mostrar chamadas pelo BFF/Gateway.
    - [ ] Demonstrar a flag *Zerar Custo* recalculando.
    - [ ] Mostrar o endpoint `/aggregated-data` unindo MongoDB + Azure SQL + Azure Function.
  - [ ] Upload como vídeo **Não Listado** no YouTube e inserção do link no PDF.
- [ ] **Submissão Final:** envio do arquivo único em PDF no AVA dentro do prazo.

---

## 🛠️ Log de Atualizações do Checklist

* **05/11/2026:**
  - Criado o documento de contexto executivo [`contexto/CONTEXTO_PROJETO_PJBL.md`](CONTEXTO_PROJETO_PJBL.md).
  - Limpeza da estrutura acidental duplicada `Projeto/Projeto/`.
  - Configuração oficial do Vitest e validação com 6 testes automatizados passando 100%.
  - Criação deste arquivo oficial de controle de entrega ([`contexto/CHECKLIST_ENTREGA_PJBL.md`](CHECKLIST_ENTREGA_PJBL.md)).

* **12/11/2026:** separação das camadas dos backends, 26 testes aprovados, integração em Docker com Atlas/SQL/Function e publicação das quatro imagens `v3.0.0`. Deploy público em validação no PR #2.
