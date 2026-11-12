# Microserviço de Orçamentos — MongoDB Atlas

CRUD na coleção `schulz.orcamentos`, usando o driver oficial MongoDB. Requer
`MONGO_URI` e `INTERNAL_API_TOKEN` no `.env`. A ausência de conexão retorna erro;
a API não grava em JSON nem substitui listas vazias por exemplos locais.

```bash
npm ci
cp .env.example .env
# Preencha a URI e o token interno compartilhado com o BFF.
npm start
```

Use Node.js 22. O serviço roda na porta 3001. O BFF é o cliente desse serviço e
o gateway autentica o usuário. Depois do login, abra o Swagger em
http://localhost:3000/api/docs/mongo/ (ou porta 8090 para o frontend compilado).

Rotas: GET/POST `/api/orcamentos` e GET/PUT/DELETE `/api/orcamentos/:id`.
O `/health` faz ping no Atlas. Atualizações usam operações atômicas no banco e
preservam a data de criação; a exclusão de um ID inexistente retorna 404.

`npm run test:integration` na raiz verifica o CRUD pelo gateway e confirma a
persistência diretamente no Atlas, removendo somente os registros temporários.

## Organização interna

`domain/` valida as entidades. `features/` separa os casos de uso por operação
e recebe um repositório pelo contrato de `application/ports/`.
`composition/` conecta esse contrato à implementação em `infrastructure/`.
`presentation/` traduz HTTP sem importar drivers de banco.

As regras de dependência são verificadas na raiz por
`npm run test:architecture`. Para publicação, imagens e URLs, consulte o
[README principal](../../README.md).
