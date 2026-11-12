#!/usr/bin/env python3
"""Deploy dos contêineres. Lê .env locais e nunca imprime valores secretos."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parent.parent
AZ = os.environ.get('AZURE_CLI') or shutil.which('az')
if not AZ:
    raise SystemExit('Instale a Azure CLI, execute az login ou configure AZURE_CLI.')
GROUP = os.environ.get('AZURE_RESOURCE_GROUP', 'cloudprojetoorcfapp')


def read_env(service):
    # Usamos o mesmo parser dotenv dos serviços, sem executar o conteúdo do arquivo.
    code = "const fs=require('node:fs');const dotenv=require('./services/api-gateway/node_modules/dotenv');process.stdout.write(JSON.stringify(dotenv.parse(fs.readFileSync(process.argv[1]))))"
    return json.loads(subprocess.check_output(['node', '-e', code, f'services/{service}/.env'], cwd=ROOT))


gateway = read_env('api-gateway')
bff = read_env('bff')
mongo = read_env('ms-orcamentos-mongo')
sql = read_env('ms-pedidos-sql')
tokens = {config.get('INTERNAL_API_TOKEN') for config in [gateway, bff, mongo, sql]}
if len(tokens) != 1 or not all(tokens):
    raise SystemExit('Configure o mesmo INTERNAL_API_TOKEN nos quatro serviços.')
params = {
    'location': os.environ.get('AZURE_LOCATION', 'canadacentral'),
    'environmentName': os.environ.get('AZURE_ENVIRONMENT', 'schulz-env'),
    'imageNamespace': os.environ.get('DOCKERHUB_NAMESPACE', 'nj9ouidvb2v3cno4'),
    'imageTag': os.environ.get('IMAGE_TAG', 'v3.0.0'),
    'mongoUri': mongo.get('MONGO_URI') or mongo.get('MONGODB_URI'),
    'mongoDatabase': mongo.get('MONGO_DB_NAME', 'schulz'),
    'mongoCollection': mongo.get('MONGO_ORCAMENTOS_COLLECTION', 'orcamentos'),
    'sqlServer': sql.get('SQL_SERVER'), 'sqlDatabase': sql.get('SQL_DATABASE'),
    'sqlUser': sql.get('SQL_USER'), 'sqlPassword': sql.get('SQL_PASSWORD'),
    'functionUrl': bff.get('AZURE_FUNCTION_URL'), 'functionKey': bff.get('AZURE_FUNCTION_KEY'),
    'internalToken': gateway.get('INTERNAL_API_TOKEN'),
    'gatewayUsername': gateway.get('GATEWAY_USERNAME'), 'gatewayPassword': gateway.get('GATEWAY_PASSWORD'),
}
if not all(params.values()):
    raise SystemExit('Preencha os .env dos quatro serviços antes de publicar.')
private_values = [params[key] for key in ['mongoUri', 'sqlPassword', 'functionKey', 'internalToken', 'gatewayPassword']]


def az(*args):
    result = subprocess.run([AZ, *args, '--only-show-errors', '-o', 'json'], cwd=ROOT, capture_output=True, text=True)
    if result.returncode:
        message = result.stderr
        for value in private_values:
            message = message.replace(value, '[redigido]')
        raise SystemExit(message)
    return json.loads(result.stdout) if result.stdout.strip() else None


with tempfile.TemporaryDirectory(prefix='schulz-deploy-') as directory:
    path = Path(directory) / 'parameters.json'
    path.touch(mode=0o600)
    path.write_text(json.dumps({'parameters': {key: {'value': value} for key, value in params.items()}}))
    print('Publicando quatro Container Apps no perfil Consumption...', flush=True)
    result = az('deployment', 'group', 'create', '-g', GROUP, '-n', 'schulz-stack', '--template-file', 'infrastructure/main.bicep', '--parameters', '@' + str(path))

# Libera somente os IPs de saída informados pelo aplicativo SQL.
app = az('containerapp', 'show', '-g', GROUP, '-n', 'schulz-ms-sql')
ips = app['properties'].get('outboundIpAddresses') or []
if not ips:
    raise SystemExit('A Azure não informou os IPs de saída. Verifique a rede antes de liberar o firewall SQL.')
server = params['sqlServer'].split('.')[0]
for ip in ips:
    az('sql', 'server', 'firewall-rule', 'create', '-g', GROUP, '-s', server,
       '-n', 'SchulzContainerApps-' + ip.replace('.', '-'), '--start-ip-address', ip, '--end-ip-address', ip)
print('Firewall SQL configurado para os IPs de saída dos contêineres.')
print('Site: ' + result['properties']['outputs']['gatewayUrl']['value'])
