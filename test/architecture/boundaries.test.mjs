import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parse } from 'acorn';
import { simple } from 'acorn-walk';

const root=fileURLToPath(new URL('../..',import.meta.url));
const cli=path.join(root,'node_modules/dependency-cruiser/bin/dependency-cruiser.mjs');
const config=path.join(root,'.dependency-cruiser.cjs');
const services=['api-gateway','bff','ms-orcamentos-mongo','ms-pedidos-sql'];
const sources=[...services.map(name=>`services/${name}/src`),'functions/src','Projeto/src'];
function cruise(cwd,inputs,rules=config) { return spawnSync(process.execPath,[cli,'--config',rules,'--output-type','json',...inputs],{cwd,encoding:'utf8',maxBuffer:16*1024*1024}); }
function files(dir) { return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(path.join(dir,entry.name)):[path.join(dir,entry.name)]); }
test('grafo real respeita limites das camadas, isolamento dos serviços e ausência de ciclos',()=>{
 const result=cruise(root,sources);
 assert.equal(result.status,0,result.stderr+'\n'+result.stdout);
 const output=JSON.parse(result.stdout);assert.ok(output.modules.length>40,'A análise deve percorrer os módulos reais.');
 assert.equal(output.summary.error,0,JSON.stringify(output.summary.violations,null,2));
});
test('casos de uso não acessam fetch global nem variáveis de ambiente',()=>{
 const targets=sources.flatMap(source=>files(path.join(root,source))).filter(file=>file.endsWith('.js')&&(file.includes('/application/')||file.endsWith('.use-case.js')));
 assert.ok(targets.length>=15);
 for(const file of targets) {
  const ast=parse(fs.readFileSync(file,'utf8'),{ecmaVersion:'latest',sourceType:'module'});
  simple(ast,{
   CallExpression(node){assert.ok(!(node.callee.type==='Identifier'&&node.callee.name==='fetch'),`${file}: fetch deve ser injetado por um adaptador.`);},
   MemberExpression(node){assert.ok(!(node.object.type==='Identifier'&&node.object.name==='process'&&node.property.name==='env'),`${file}: configuração pertence à composição.`);},
  });
 }
});
test('a regra falha quando um domínio tenta importar o driver ou a infraestrutura',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'schulz-architecture-'));
 try {
  fs.mkdirSync(path.join(tmp,'services/example/src/domain'),{recursive:true});fs.mkdirSync(path.join(tmp,'services/example/src/infrastructure'));
  fs.writeFileSync(path.join(tmp,'services/example/src/domain/entity.js'),"import { repository } from '../infrastructure/repository.js'; export const save = repository;\n");
  fs.writeFileSync(path.join(tmp,'services/example/src/infrastructure/repository.js'),'export const repository = {};\n');
  const localConfig=path.join(tmp,'.dependency-cruiser.cjs');fs.copyFileSync(config,localConfig);
  const result=cruise(tmp,['services/example/src'],localConfig);assert.ok(JSON.parse(result.stdout).summary.error>0);
  assert.ok(JSON.parse(result.stdout).summary.violations.some(item=>item.rule.name==='domain-is-independent'));
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
