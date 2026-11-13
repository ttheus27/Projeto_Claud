# Function de enriquecimento

`POST /api/EnriquecerOrcamento` é um HTTP Trigger com autenticação por chave.
O BFF envia o orçamento e recebe os custos e o preço calculados. A chave fica
somente na configuração do BFF.

A fatia `src/features/enriquecimento/` separa:

- `domain/`: cálculo puro, incluindo a flag de custo zerado;
- `application/`: validação da entrada e execução do cálculo;
- `presentation/`: adaptação ao HTTP Trigger do Azure Functions v4.

`src/index.js` registra somente esse endpoint. Os CRUDs pertencem aos dois
microserviços e não são registrados nesta Function App.

Com Node.js 22, execute `npm ci` e `npm test`. Para publicar, use o script de
empacotamento e o comando de build remoto descritos no
[README principal](../README.md#publicação). O pacote exclui configurações locais.
