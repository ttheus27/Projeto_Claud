import { spawnSync } from 'node:child_process';

const action = process.argv[2];
if (!['build', 'push'].includes(action)) throw new Error('Use: node scripts/docker-images.mjs build|push');
const namespace = process.env.DOCKERHUB_NAMESPACE || 'nj9ouidvb2v3cno4';
const tag = process.env.IMAGE_TAG || 'v3.0.0';
if (!/^[a-z0-9][a-z0-9_-]+$/.test(namespace) || !/^[\w][\w.-]{0,127}$/.test(tag)) throw new Error('Namespace ou tag inválidos.');
const images = [
  ['schulz-ms-mongo', 'services/ms-orcamentos-mongo'],
  ['schulz-ms-sql', 'services/ms-pedidos-sql'],
  ['schulz-bff', 'services/bff'],
  ['schulz-gateway', '.'],
];
for (const [name, context] of images) {
  const image = `${namespace}/${name}:${tag}`;
  const args = action === 'push' ? ['push', image] : ['build', '--pull', '-t', image, ...(context === '.' ? ['-f', 'services/api-gateway/Dockerfile'] : []), context];
  const result = spawnSync('docker', args, { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
