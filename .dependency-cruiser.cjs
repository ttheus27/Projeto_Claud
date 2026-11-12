const services = ['api-gateway', 'bff', 'ms-orcamentos-mongo', 'ms-pedidos-sql'];
const application = '(?:/application/|\\.use-case\\.js$)';
const presentation = '(?:/presentation/|/routes/)';
module.exports = {
  forbidden: [
    { name: 'no-circular-dependencies', severity: 'error', from: {}, to: { circular: true } },
    { name: 'inner-layers-have-no-io', severity: 'error', from: { path: '(?:/domain/|/application/|\\.use-case\\.js$)' }, to: { path: '^(?:node:)?(?:fs|http|https|net|tls|child_process)(?:/|$)' } },
    { name: 'no-unresolved-imports', severity: 'error', from: {}, to: { couldNotResolve: true } },
    { name: 'domain-is-independent', severity: 'error', from: { path: '/domain/' }, to: { path: '(?:/(?:application|infrastructure|presentation|composition|routes|features)/|(?:^|/)node_modules/)', pathNot: '/domain/' } },
    { name: 'application-depends-only-inward', severity: 'error', from: { path: application }, to: { path: '(?:/(?:infrastructure|presentation|composition|routes)/|node_modules/)' } },
    { name: 'http-adapters-do-not-wire-drivers', severity: 'error', from: { path: '^(?:services|functions)/.*' + presentation }, to: { path: '/(?:infrastructure|composition)/' } },
    { name: 'infrastructure-does-not-call-http-adapters', severity: 'error', from: { path: '/infrastructure/' }, to: { path: '/(?:presentation|composition|routes)/' } },
    { name: 'frontend-cannot-import-backends-or-db-drivers', severity: 'error', from: { path: '^Projeto/src/' }, to: { path: '^(?:services/|functions/)|node_modules/(?:mongodb|mssql|tedious)/' } },
    ...services.map(service => ({ name: `isolated-${service}`, severity: 'error', from: { path: `^services/${service}/src/` }, to: { path: '^services/', pathNot: `^services/${service}/` } })),
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '(?:^|/)(?:test|tests)/|\\.test\\.' },
    enhancedResolveOptions: { extensions: ['.js', '.jsx', '.mjs', '.cjs', '.json', '.css'] },
  },
};
