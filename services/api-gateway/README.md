# API Gateway

Entrada central da aplicação na porta 8090. Autentica o usuário por sessão,
usa cookie HttpOnly/SameSite Strict, restringe origens e tamanho do JSON e
limita requisições e tentativas de login. Encaminha `/api` ao BFF com um token
interno. As credenciais de login ficam no `.env` do gateway.

```bash
npm ci
cp .env.example .env
# Preencha o usuário, a senha e o mesmo INTERNAL_API_TOKEN dos demais serviços.
npm start
```

O frontend não recebe o token interno nem credenciais dos bancos. O gateway
não consulta os bancos e não faz a agregação: essas responsabilidades pertencem
aos microserviços e ao BFF. A chave da Azure Function pertence somente ao BFF.

As sessões são mantidas em memória na instância local. Reiniciar o serviço
encerra as sessões. Em HTTPS, use `GATEWAY_COOKIE_SECURE=true`. `ALLOWED_ORIGINS`
configura as origens permitidas. O ambiente local usa HTTP em localhost.

Se `FRONTEND_DIR` apontar para o build do React, o gateway também serve a
interface. O Dockerfile usa o contexto da raiz do repositório e constrói essa
interface. O Compose publica apenas a porta 8090.

Testes: `npm test`. O teste confirma bloqueio sem sessão, login, cookie HttpOnly,
encaminhamento com token interno, rejeição de origens externas e logout.
