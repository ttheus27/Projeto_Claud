# Gestão de Pedidos — Azure SQL

CRUD de pedidos em `dbo.TB_PEDIDOS`, executado pelo microserviço Express na
porta 3002. O frontend usa o gateway na porta 8090, que encaminha ao BFF na porta 8080. Os dados ficam no Azure SQL;
falhas de conexão retornam erro, sem gravação alternativa em JSON ou no navegador.

## Configuração

Use Node.js 22. Copie `.env.example` para `.env` e configure `SQL_SERVER`,
`SQL_DATABASE`, `SQL_USER`, `SQL_PASSWORD` e `INTERNAL_API_TOKEN` no backend. A conexão usa TLS com
validação do certificado. O usuário da aplicação só precisa de SELECT, INSERT,
UPDATE e DELETE em `dbo.TB_PEDIDOS`.

O ambiente criado para este projeto usa:

| Recurso | Nome |
|---|---|
| Servidor | `sql-schulz-alex-b6fa36.database.windows.net` |
| Banco | `schulz-pedidos` |
| Tabela | `dbo.TB_PEDIDOS` |
| Grupo | `cloudprojetoorcfapp` |
| Região | Canadá Central |

O banco usa a oferta gratuita General Purpose Serverless com `useFreeLimit=true`
e `freeLimitExhaustionBehavior=AutoPause`. Também pausa após 60 minutos de
inatividade. A primeira conexão após uma pausa pode demorar; se falhar, use
**Sincronizar SQL** novamente. O firewall está limitado ao IP público do
computador usado na configuração. Se esse IP mudar, atualize a regra
`ProjetoClaudLocal` no servidor SQL antes de conectar.

## Inicializar um novo banco

```bash
npm ci
cp .env.example .env
cp .env.admin.local.example .env.admin.local
# Preencha .env com o usuário da aplicação e .env.admin.local com o administrador.
npm run db:init
```

A inicialização cria a tabela se ela não existir e concede as permissões de
CRUD ao usuário da aplicação. As credenciais administrativas ficam apenas no
arquivo local de migração. Nenhum arquivo de credenciais é versionado ou
copiado para a imagem Docker.

Para importar os dados do antigo JSON local sem substituir IDs já existentes:

```bash
npm run db:migrate-local
```

O arquivo `data/tb_pedidos.sql.json` é apenas fonte dessa importação; a API não
o utiliza como banco.

## Executar

```bash
npm start
```

| Método | Endpoint | Operação |
|---|---|---|
| GET | `/api/pedidos` | Listar |
| GET | `/api/pedidos/:id` | Consultar um pedido |
| GET | `/api/pedidos/orcamento/:codigo` | Consultar por orçamento |
| POST | `/api/pedidos` | Criar |
| PUT | `/api/pedidos/:id` | Editar campos ou somente status |
| DELETE | `/api/pedidos/:id` | Excluir |

Depois de entrar na aplicação, o Swagger está em http://localhost:3000/api/docs/sql/. O endpoint `/health` consulta
o Azure SQL e retorna 503 quando a conexão está indisponível. Todos os endpoints
de CRUD estão disponíveis pelo gateway em http://localhost:8090/api/pedidos.
Chamadas diretas ao microserviço/BFF exigem o token interno.

A tela **Ordens SQL (MS2)** permite criar pedidos com base nos orçamentos,
editar todos os campos, alterar status e confirmar a exclusão. Operações com
erro preservam o formulário e exibem a mensagem recebida do backend.

## Verificação

```bash
npm test
# Com gateway, microserviço e BFF rodando e os arquivos .env configurados:
npm run test:integration
```

O teste de integração cria um pedido temporário pelo gateway/BFF, confirma a alteração
por consulta direta ao Azure SQL e remove o registro no final. Os pedidos
anteriores são preservados.

Referências: [oferta gratuita do Azure SQL](https://learn.microsoft.com/en-us/azure/azure-sql/database/free-tier)
e [driver mssql](https://tediousjs.github.io/node-mssql/).
