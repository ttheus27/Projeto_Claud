# Frontend — Integrador de Orçamentos

React/Vite com módulos de orçamentos, pedidos e visão agregada. O frontend
chama somente o API Gateway por `/api`. O gateway autentica a sessão e encaminha
as chamadas ao BFF; bancos e Azure Function são acessados pelos backends.

```bash
npm ci
npm run dev
```

Use Node.js 22 e mantenha os quatro serviços locais em execução. Para iniciar
todo o conjunto, prefira `npm run dev` na raiz do repositório.

Acesse http://localhost:3000. Entre com as credenciais locais configuradas em
`services/api-gateway/.env`. A sessão usa cookie HttpOnly; senhas, tokens
internos e credenciais de banco não são armazenados pelo frontend.

`VITE_API_BASE_URL=/api` é a configuração padrão. No desenvolvimento, o Vite
encaminha esse caminho ao gateway na porta 8090. O build é servido pelo próprio
gateway, na mesma origem da API.

- **Orçamentos:** CRUD no microserviço Mongo, com Atlas, cálculo local de edição,
  operações CNC e flag de custo zerado.
- **Pedidos:** CRUD no microserviço SQL, com persistência no Azure SQL e confirmação
  antes da exclusão.
- **Visão BFF:** resposta única com os dois domínios, cálculo da Azure Function e
  estado real dos três serviços.
- **Swagger:** links autenticados para as documentações dos microserviços e BFF.

```bash
npm run build
npm test
```

Veja o [README principal](../README.md) para arquitetura, configuração dos
serviços, testes de integração, Docker e publicação.
