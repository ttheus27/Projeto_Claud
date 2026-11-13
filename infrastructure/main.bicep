param location string = 'canadacentral'
param environmentName string = 'schulz-env'
param imageNamespace string = 'nj9ouidvb2v3cno4'
param imageTag string = 'v3.0.0'
param gatewayHostname string = 'schulz-gateway.victoriousdesert-17c3e7d9.canadacentral.azurecontainerapps.io'
param mongoDatabase string = 'schulz'
param mongoCollection string = 'orcamentos'
param sqlServer string
param sqlDatabase string
param sqlUser string
param functionUrl string
param gatewayUsername string = 'aluno'
@secure()
param mongoUri string
@secure()
param sqlPassword string
@secure()
param functionKey string
@secure()
param internalToken string
@secure()
param gatewayPassword string

resource environment 'Microsoft.App/managedEnvironments@2026-07-01' = {
  name: environmentName
  location: location
  properties: {
    environmentMode: 'WorkloadProfiles'
    appLogsConfiguration: { destination: null }
    workloadProfiles: [{ name: 'Consumption', workloadProfileType: 'Consumption' }]
  }
}
var tokenSecret = { 'internal-token': internalToken }
var tokenEnv = { name: 'INTERNAL_API_TOKEN', secretRef: 'internal-token' }

module mongo 'container-app.bicep' = {
  name: 'mongo'
  params: {
    name: 'schulz-ms-mongo'
    location: location
    environmentId: environment.id
    image: '${imageNamespace}/schulz-ms-mongo:${imageTag}'
    port: 3001
    secrets: union(tokenSecret, { 'mongo-uri': mongoUri })
    env: [tokenEnv, { name: 'PORT', value: '3001' }, { name: 'MONGO_URI', secretRef: 'mongo-uri' }, { name: 'MONGO_DB_NAME', value: mongoDatabase }, { name: 'MONGO_ORCAMENTOS_COLLECTION', value: mongoCollection }]
  }
}
module sql 'container-app.bicep' = {
  name: 'sql'
  params: {
    name: 'schulz-ms-sql'
    location: location
    environmentId: environment.id
    image: '${imageNamespace}/schulz-ms-sql:${imageTag}'
    port: 3002
    secrets: union(tokenSecret, { 'sql-password': sqlPassword })
    env: [tokenEnv, { name: 'PORT', value: '3002' }, { name: 'SQL_SERVER', value: sqlServer }, { name: 'SQL_DATABASE', value: sqlDatabase }, { name: 'SQL_USER', value: sqlUser }, { name: 'SQL_PASSWORD', secretRef: 'sql-password' }, { name: 'SQL_CONNECTION_TIMEOUT_MS', value: '60000' }]
  }
}
module bff 'container-app.bicep' = {
  name: 'bff'
  params: {
    name: 'schulz-bff'
    location: location
    environmentId: environment.id
    image: '${imageNamespace}/schulz-bff:${imageTag}'
    port: 8080
    secrets: union(tokenSecret, { 'function-key': functionKey })
    env: [tokenEnv, { name: 'PORT', value: '8080' }, { name: 'MS_MONGO_URL', value: 'https://${mongo.outputs.fqdn}/api/orcamentos' }, { name: 'MS_SQL_URL', value: 'https://${sql.outputs.fqdn}/api/pedidos' }, { name: 'AZURE_FUNCTION_URL', value: functionUrl }, { name: 'AZURE_FUNCTION_KEY', secretRef: 'function-key' }]
  }
}
module gateway 'container-app.bicep' = {
  name: 'gateway'
  params: {
    name: 'schulz-gateway'
    location: location
    environmentId: environment.id
    image: '${imageNamespace}/schulz-gateway:${imageTag}'
    port: 8090
    external: true
    secrets: union(tokenSecret, { 'gateway-password': gatewayPassword })
    env: [tokenEnv, { name: 'PORT', value: '8090' }, { name: 'BFF_URL', value: 'https://${bff.outputs.fqdn}' }, { name: 'FRONTEND_DIR', value: '/app/public' }, { name: 'GATEWAY_USERNAME', value: gatewayUsername }, { name: 'GATEWAY_PASSWORD', secretRef: 'gateway-password' }, { name: 'GATEWAY_COOKIE_SECURE', value: 'true' }, { name: 'TRUST_PROXY', value: '1' }, { name: 'CONTAINER_APP_HOSTNAME', value: gatewayHostname }, { name: 'ALLOWED_ORIGINS', value: 'https://${gatewayHostname}' }]
  }
}
output gatewayUrl string = 'https://${gateway.outputs.fqdn}'
