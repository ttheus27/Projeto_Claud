import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('..', import.meta.url));
if (Number(process.versions.node.split('.')[0]) < 22) {
  console.error('Use Node.js 22 para executar os serviços (consulte .nvmrc e README).');process.exit(1);
}
const processes = [
  ['MongoDB', 'services/ms-orcamentos-mongo', 'src/server.js'],
  ['Azure SQL', 'services/ms-pedidos-sql', 'src/server.js'],
  ['BFF', 'services/bff', 'src/server.js'],
  ['API Gateway', 'services/api-gateway', 'src/server.js'],
  ['Frontend', 'Projeto', 'node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--strictPort'],
];
let stopping = false;
const children = [];
function stop(code = 0) {
  if (stopping) return;stopping = true;
  for (const child of children) child.kill('SIGTERM');
  setTimeout(() => { for (const child of children) child.kill('SIGKILL');process.exit(code); }, 5000).unref();
  Promise.all(children.map(child => child.exitCode !== null ? Promise.resolve() : new Promise(resolve => child.once('exit', resolve)))).then(() => process.exit(code));
}
for (const [name, dir, entry, ...args] of processes) {
  const child = spawn(process.execPath, [entry, ...args], { cwd: path.join(root, dir), stdio: 'inherit' });
  children.push(child);
  child.on('error', () => { console.error(`Não foi possível iniciar ${name}.`);stop(1); });
  child.on('exit', code => { if (!stopping) { console.error(`${name} encerrou (código ${code}).`);stop(code || 1); } });
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => stop());
