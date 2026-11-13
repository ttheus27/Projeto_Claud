param name string
param location string
param environmentId string
param image string
param port int
param external bool = false
@secure()
param secrets object
param env array

resource app 'Microsoft.App/containerApps@2024-03-01' = {
  name: name
  location: location
  properties: {
    managedEnvironmentId: environmentId
    workloadProfileName: 'Consumption'
    configuration: {
      activeRevisionsMode: 'Single'
      // items() perde a classificação do parâmetro @secure() no linter.
      #disable-next-line use-secure-value-for-secure-inputs
      secrets: [for item in items(secrets): { name: item.key, value: item.value }]
      ingress: {
        external: external
        targetPort: port
        transport: 'http'
        allowInsecure: false
      }
    }
    template: {
      containers: [{
        name: name
        image: image
        env: env
        resources: { cpu: json('0.25'), memory: '0.5Gi' }
        probes: [
          { type: 'Liveness', tcpSocket: { port: port }, initialDelaySeconds: 10, periodSeconds: 10 }
          { type: 'Readiness', tcpSocket: { port: port }, initialDelaySeconds: 3, periodSeconds: 5 }
        ]
      }]
      scale: {
        minReplicas: 0
        maxReplicas: 1
        rules: [{ name: 'http', http: { metadata: { concurrentRequests: '20' } } }]
      }
    }
  }
}
output fqdn string = app.properties.configuration.ingress.fqdn
