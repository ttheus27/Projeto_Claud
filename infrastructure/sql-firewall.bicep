param serverName string
param outboundIps array

resource rules 'Microsoft.Sql/servers/firewallRules@2023-08-01' = [for ip in outboundIps: {
  name: '${serverName}/SchulzContainerApps-${replace(ip, '.', '-')}'
  properties: {
    startIpAddress: ip
    endIpAddress: ip
  }
}]
