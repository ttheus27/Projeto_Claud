import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { getCollection, closeMongoClient } from '../services/ms-orcamentos-mongo/src/infrastructure/mongo.client.js';
import { getPool, closePool, sql } from '../services/ms-pedidos-sql/src/infrastructure/database.js';
import { calcularCustosOrcamento } from '../Projeto/src/features/orcamentos/domain/calcular-custos-orcamento.js';

const root=fileURLToPath(new URL('..',import.meta.url));
const require=createRequire(path.join(root,'services/api-gateway/package.json'));
const env=require('dotenv').parse(fs.readFileSync(path.join(root,'services/api-gateway/.env')));
const base=process.env.GATEWAY_URL || 'http://localhost:8090';
const login=await fetch(base+'/api/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:env.GATEWAY_USERNAME,password:env.GATEWAY_PASSWORD})});
assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0];
async function request(url,method='GET',body){
 const response=await fetch(base+url,{method,headers:{Cookie:cookie,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(140000)});
 return {status:response.status,payload:await response.json()};
}
const mongoBefore=await request('/api/orcamentos');const sqlBefore=await request('/api/pedidos');
assert.equal(mongoBefore.status,200);assert.equal(sqlBefore.status,200);
const mongoId=`ORC-ARC-TEST-${Date.now()}`;const sqlId=`PED-ARC-TEST-${Date.now()}`;
let mongoAttempt=false;let sqlAttempt=false;
try{
 mongoAttempt=true;
 const created=await request('/api/orcamentos','POST',{id:mongoId,descricaoPeca:'Teste temporário da arquitetura',cliente:'Validação de integração',lotePadrao:2,custoMateriaPrima:100,operacoes:[]});assert.equal(created.status,201);
 const edited=await request('/api/orcamentos/'+mongoId,'PUT',{lotePadrao:3,descricaoPeca:'Teste temporário editado'});assert.equal(edited.status,200);assert.equal(edited.payload.orcamento.lotePadrao,3);
 assert.equal((await request('/api/orcamentos/'+mongoId)).payload.lotePadrao,3);
 assert.equal((await(await getCollection()).findOne({id:mongoId})).lotePadrao,3);
 console.log('CRUD Mongo pelo gateway/BFF: criação, leitura e edição confirmadas diretamente no Atlas.');
 sqlAttempt=true;
 const order={id_pedido:sqlId,codigo_orcamento:mongoId,cliente:'Validação de integração',descricao_peca:'Pedido temporário de arquitetura',lote_producao:3,valor_total:100,status_producao:'Em Planejamento',data_entrega_prevista:'2026-12-30'};
 assert.equal((await request('/api/pedidos','POST',order)).status,201);
 assert.equal((await request('/api/pedidos/'+sqlId,'PUT',{valor_total:222.22,status_producao:'Concluído'})).status,200);
 assert.equal((await request('/api/pedidos/'+sqlId)).payload.valor_total,222.22);
 const row=await(await getPool()).request().input('id',sql.NVarChar(64),sqlId).query('SELECT valor_total FROM dbo.TB_PEDIDOS WHERE id_pedido=@id');assert.equal(row.recordset[0].valor_total,222.22);
 console.log('CRUD SQL pelo gateway/BFF: criação, leitura e edição confirmadas diretamente no Azure SQL.');
 const aggregate=await request('/api/aggregated-data');assert.equal(aggregate.status,200);assert.equal(aggregate.payload.status,'success');
 const result=aggregate.payload.data;
 const expected=calcularCustosOrcamento(result.orcamentoAtivo).precoTotalLote;
 assert.ok(Math.abs(result.enriquecimentoServerless.precoTotalLote-expected)<.00001);
 assert.equal(result.pedidosAssociados.length,1);
 console.log('BFF: JSON único com os dois domínios e cálculo real retornado pela Azure Function.');
}finally{
 try{
  const cleanup=await Promise.allSettled([
   ...(sqlAttempt?[request('/api/pedidos/'+sqlId,'DELETE')]:[]),
   ...(mongoAttempt?[request('/api/orcamentos/'+mongoId,'DELETE')]:[]),
  ]);
  for(const result of cleanup){
   assert.equal(result.status,'fulfilled','A limpeza deve conseguir alcançar o gateway.');
   assert.ok([200,404].includes(result.value.status),'Não foi possível remover um registro temporário.');
  }
  assert.equal(await(await getCollection()).countDocuments({id:mongoId}),0);
  const remaining=await(await getPool()).request().input('id',sql.NVarChar(64),sqlId).query('SELECT COUNT(*) AS total FROM dbo.TB_PEDIDOS WHERE id_pedido=@id');assert.equal(remaining.recordset[0].total,0);
  const afterMongo=await request('/api/orcamentos');const afterSql=await request('/api/pedidos');
  assert.ok(mongoBefore.payload.data.every(before=>afterMongo.payload.data.some(after=>after._id===before._id)));
  assert.ok(sqlBefore.payload.data.every(before=>afterSql.payload.data.some(after=>after.id_pedido===before.id_pedido)));
  console.log(`Exclusões confirmadas nos bancos. Originais preservados: ${afterMongo.payload.data.length} orçamentos e ${afterSql.payload.data.length} pedidos.`);
 }finally{await closeMongoClient();await closePool();}
}
