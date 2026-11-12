# BFF — Integrador Schulz

Serviço na porta 8080, acessível pelo API Gateway. `INTERNAL_API_TOKEN` é
obrigatório nas chamadas. O BFF consulta os microserviços de orçamentos e pedidos
e chama a Function `EnriquecerOrcamento` para calcular os custos.

Configure as variáveis de `.env.example` no `.env`. A chave da Function fica
somente aqui. Execute com Node.js 22:

```bash
npm ci
npm start
```

`GET /api/aggregated-data` consulta os microserviços em paralelo e envia os dados
à Function. A resposta inclui os dois conjuntos de dados, pedidos relacionados,
resumo, resultado do cálculo e status de cada serviço. Falhas resultam em
`status: partial` e erros explícitos; não são criados dados de demonstração.

As rotas `/api/orcamentos` e `/api/pedidos` encaminham os CRUDs. O Swagger é
acessível, depois do login, por `/api/docs/bff/` no gateway. As documentações dos
microserviços também são encaminhadas pelo BFF. O frontend não chama as portas
internas diretamente.

Testes: `npm test`.

## Organização interna

A agregação está em `features/aggregation/application/` e recebe três gateways
por injeção. A geração de pedido fica em `features/pedidos/application/`.
Os adaptadores HTTP pertencem a `infrastructure/http/`; `composition/` faz
a ligação, e `routes/` adapta requisições e respostas.

O alias `/aggregated-data` também está disponível, com a mesma autenticação.
Publicação e URLs estão no [README principal](../../README.md).
