# Prompt Utilizado para Geração do Frontend (IAG)

Este documento registra o **prompt de Inteligência Artificial Generativa (IAG)** elaborado e aplicado para orientar o design, arquitetura e desenvolvimento completo do frontend do **Integrador de Orçamentos (Schulz S/A & SKA Automação)**.

---

## 📋 Prompt de Engenharia de Software & Frontend

```text
Atue como um Engenheiro de Software Frontend Sênior e Especialista em UX/UI Industrial. 

Desenvolva uma aplicação web completa e profissional em React (com Tailwind CSS, Vite e Lucide Icons) baseada na especificação do sistema "Integrador de Orçamentos", originalmente desenvolvido pela SKA Automação de Engenharias Ltda para o cliente Schulz S/A.

### 1. CONTEXTO DE NEGÓCIO & ENGENHARIA
O sistema gerencia e automatiza a orçamentação de peças usinadas industriais e compressores (virabrequins, pinças de freio, carcaças de compressores, pistões de alta pressão), integrando cálculo de tempos de usinagem CNC, centros de custo, folhas de processo, visualização de desenhos técnicos e emissão de propostas formais.

### 2. INTEGRAÇÃO BACKEND & MOCK SERVERLESS
- Implemente uma camada de serviço que consuma dados de um endpoint GET simulando uma Azure Function Serverless:
  GET https://func-integrador-schulz.azurewebsites.net/api/GetOrcamentos
- Integre mocks para serviços complementares (Apidog / Mock local resiliente com persistência em LocalStorage):
  POST/GET https://mock.apidog.com/m1/498210-492100-default/api/v1/orcamentos/{id}/custos
  GET https://mock.apidog.com/m1/498210-492100-default/api/v1/relatorios/integrador-reports
- Adicione um banner no topo da aplicação demonstrando o status de conexão com a Azure Function, latência em milissegundos, código HTTP 200 OK e botão de sincronização manual.

### 3. TELAS E FUNCIONALIDADES OBRIGATÓRIAS
1. **Dashboard de Gestão & Consulta de Orçamentos (RF02)**:
   - Indicadores KPIs em tempo real (Total Orçado em R$, Quantidade de Peças, Operações CNC Mapeadas, Taxa de Aprovação Comercial).
   - Filtros dinâmicos multicritério (busca por código da peça, descrição, cliente e status: Pendente, Em Análise, Aprovado).
   - Listagem em tabela corporativa com ações rápidas para detalhar, visualizar desenhos e gerar relatórios.

2. **Detalhes do Orçamento, Operações e Motor de Cálculo de Custos (RF03, RF06)**:
   - Edição de metadados da peça, centros de custo (CC-310, CC-220, CC-340, CC-210), lotes de fabricação e margens de lucro.
   - Folha de processo com detalhamento de operações de usinagem (Torneamento, Fresamento 5 eixos, Retífica, Tratamentos).
   - Cálculo automático por operação: Tempo de Setup amortizado no lote, Tempo de Ciclo Máquina, Custo Homem-Hora e Ferramental.
   - **Funcionalidade Central (RF03): Flag "Zerar Custo" por operação** (comutador visual que zera o custo efetivo de operações bonificadas ou retrabalho interno, recalculando o orçamento instantaneamente).
   - Adição, edição e remoção dinâmica de operações com persistência no LocalStorage e disparo de notificações Toast.

3. **Visualizador de Desenhos Técnicos & Tolerâncias Dimensionais (RF04)**:
   - Modal com renderização gráfica SVG de peças industriais (virabrequins com cotas, suportes de freio, carcaças), tolerâncias gerais (ISO 2768-mK), rugosidade (Ra) e certificações de qualidade.

4. **Gerador de Relatórios Consolidados — Módulo Integrador_Reports (RF05, RF10)**:
   - Visualização de proposta comercial formalizada com cabeçalho corporativo da Schulz S/A e SKA.
   - Demonstrativo detalhado de composição de custos, impostos e precificação de lote.
   - Botão para impressão/geração de PDF formatado para A4.
   - Botão de exportação de dados estruturados em JSON para integração com outros sistemas (RF10).

5. **Importação de Planilhas e Validação de Integridade (RF01, RF07)**:
   - Modal de simulação de upload de planilhas de clientes Schulz (.xlsx, .ods) com motor de validação de consistência antes da gravação.

6. **Trilha de Auditoria e Histórico (RF09)**:
   - Log rastreável de todas as modificações, flags acionadas e recálculos efetuados no sistema.

### 4. REQUISITOS DE DESIGN & DEPLOY
- Interface industrial moderna e responsiva utilizando a paleta de cores corporativa da Schulz (tons de azul marinho, slate e ciano) e SKA (toques em laranja).
- Configuração do Vite com `base: './'` para compatibilidade universal com GitHub Pages e Azure Static Web Apps.
- Código modular e desacoplado em componentes React funcionais limpos.
```

---

## 🎯 Resultados Obtidos com a Execução do Prompt
1. **100% dos Requisitos Funcionais (RF01 a RF10)** contemplados na aplicação React.
2. **Integração resiliente com Azure Functions GET mockada** e serviço Apidog.
3. **Cálculo de Custos em Tempo Real com Flag de Zeramento de Custo** conforme a regra de negócio da Schulz.
4. **Deploy simplificado e compatível com GitHub Pages e Azure Static Web Apps**.
