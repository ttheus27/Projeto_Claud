import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const root=fileURLToPath(new URL('..',import.meta.url)).replace(/\/$/,'');
const base=process.env.GATEWAY_URL || 'http://localhost:8090';
const require=createRequire(root+'/services/api-gateway/package.json');
const credentials=require('dotenv').parse(fs.readFileSync(root+'/services/api-gateway/.env'));
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'schulz-sql-ui-'));
const chrome=spawn('google-chrome',['--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-port=9231','--window-size=1600,1100','--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
let socket;let idPedido;let database;
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
try {
 let target;
 for(let i=0;i<30;i++){try{target=(await(await fetch('http://127.0.0.1:9231/json')).json()).find(t=>t.type==='page');if(target)break;}catch{}await pause(300);}
 assert.ok(target);socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
 let id=0;const calls=new Map();const apiUrls=[];let navigation=0;
 socket.onmessage=event=>{const m=JSON.parse(event.data);if(m.method==='Page.frameNavigated'&&!m.params.frame.parentId)navigation++;if(m.method==='Network.requestWillBeSent'&&m.params.request.url.includes('/api/'))apiUrls.push(m.params.request.url);if(m.id){const call=calls.get(m.id);if(call){calls.delete(m.id);m.error?call.reject(new Error(m.error.message)):call.resolve(m.result);}}};
 const rpc=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;calls.set(key,{resolve,reject});socket.send(JSON.stringify({id:key,method,params}));});
 const evaluate=async expression=>{const result=await rpc('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw new Error(JSON.stringify(result.exceptionDetails));return result.result.value;};
 const wait=async(expression,timeout=180000)=>{const start=Date.now();while(Date.now()-start<timeout){const value=await evaluate(expression);if(value)return value;await pause(250);}throw new Error('Timeout: '+expression);};
 const clickButton=async text=>evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(text)});if(!b)throw Error('Botão ausente');b.click();return true;})()`);
 const fill=async values=>evaluate(`(()=>{const values=${JSON.stringify(values)};for(const [name,value] of Object.entries(values)){const input=document.querySelector('input[name="'+name+'"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,String(value));input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));}return true;})()`);
 await rpc('Network.enable');await rpc('Page.enable');await rpc('Page.navigate',{url:base});
 await wait(`!!document.querySelector('input[type="password"]')`);
 await evaluate(`(()=>{const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;const user=document.querySelector('input[autocomplete="username"]');const pass=document.querySelector('input[type="password"]');setter.call(user,${JSON.stringify(credentials.GATEWAY_USERNAME)});user.dispatchEvent(new Event('input',{bubbles:true}));setter.call(pass,${JSON.stringify(credentials.GATEWAY_PASSWORD)});pass.dispatchEvent(new Event('input',{bubbles:true}));return true;})()`);
 await clickButton('Entrar');
 await wait(`!![...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Ordens SQL (MS2)')`);
 assert.equal(await evaluate(`document.cookie.includes('schulz_session')`),false);
 console.log('Interface: login por sessão HttpOnly confirmado.');
 await clickButton('Ordens SQL (MS2)');
 await wait(`!![...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Novo pedido'&&!b.disabled)`);
 assert.equal(await evaluate(`document.body.innerText.includes('Azure SQL Database')`),true);
 await clickButton('Novo pedido');await wait(`!!document.querySelector('[role="dialog"]')`);
 const marker='Cliente UI SQL '+Date.now();
 await fill({codigo_orcamento:'ORC-UI-SQL',cliente:marker,descricao_peca:'Peça de validação pela interface',lote_producao:7,valor_total:123.45,data_entrega_prevista:'2026-12-30'});
 await clickButton('Salvar pedido');
 const rowExpression=`[...document.querySelectorAll('tbody tr')].find(row=>row.cells[3]?.textContent.trim()===${JSON.stringify(marker)})`;
 idPedido=await wait(`(()=>{const row=${rowExpression};return !document.querySelector('[role="dialog"]')&&row?.cells[0].textContent.trim()})()`);
 console.log('Interface CREATE: pedido '+idPedido+' gravado.');
 await evaluate(`document.querySelector('button[aria-label="Editar pedido ${idPedido}"]').click()`);await wait(`!!document.querySelector('[role="dialog"]')`);
 await fill({cliente:marker+' editado',valor_total:222.22});await clickButton('Salvar pedido');
 await wait(`!document.querySelector('[role="dialog"]')&&document.body.innerText.includes(${JSON.stringify(marker+' editado')})`);
 database=await import(pathToFileURL(root+'/services/ms-pedidos-sql/src/infrastructure/database.js'));
 let persisted=await(await database.getPool()).request().input('id',database.sql.NVarChar(64),idPedido).query('SELECT cliente, valor_total FROM dbo.TB_PEDIDOS WHERE id_pedido=@id');
 assert.equal(persisted.recordset[0].cliente,marker+' editado');assert.equal(persisted.recordset[0].valor_total,222.22);
 console.log('Interface UPDATE: alteração confirmada diretamente no Azure SQL.');
 const previousNavigation=navigation;await rpc('Page.reload');for(let i=0;i<100&&navigation===previousNavigation;i++)await pause(100);assert.ok(navigation>previousNavigation);await wait(`!![...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Ordens SQL (MS2)')`);await clickButton('Ordens SQL (MS2)');
 await wait(`document.body.innerText.includes(${JSON.stringify(marker+' editado')})`);
 console.log('Interface READ: pedido persistiu após recarregar a página.');
 await evaluate(`document.querySelector('button[aria-label="Excluir pedido ${idPedido}"]').click()`);await wait(`!!document.querySelector('[role="alertdialog"]')`);await clickButton('Confirmar exclusão');
 await wait(`!document.querySelector('[role="alertdialog"]')&&!document.body.innerText.includes(${JSON.stringify(marker+' editado')})`);
 persisted=await(await database.getPool()).request().input('id',database.sql.NVarChar(64),idPedido).query('SELECT COUNT(*) AS total FROM dbo.TB_PEDIDOS WHERE id_pedido=@id');assert.equal(persisted.recordset[0].total,0);
 console.log('Interface DELETE: exclusão confirmada no Azure SQL.');idPedido=undefined;
 await clickButton('Visão BFF (Agregada)');
 await wait(`!![...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Requisitar BFF'&&!b.disabled)`);
 await clickButton('Ver JSON Bruto');
 const aggregate=JSON.parse(await evaluate(`document.querySelector('pre').textContent`));assert.equal(aggregate.status,'success');
 assert.ok(Object.values(aggregate.nosIntegrados).every(node=>node.status==='online'));
 assert.ok(apiUrls.every(url=>new URL(url).origin===new URL(base).origin));
 console.log('Interface BFF: três serviços online e chamadas do frontend centralizadas em /api, pelo gateway.');
 const screenshot=await rpc('Page.captureScreenshot',{format:'png'});fs.mkdirSync(root+'/dist',{recursive:true});fs.writeFileSync(root+'/dist/arquitetura-gateway-bff-publico.png',Buffer.from(screenshot.data,'base64'));
} finally {
 if(idPedido){const login=await fetch(base+'/api/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:credentials.GATEWAY_USERNAME,password:credentials.GATEWAY_PASSWORD})});const cookie=login.headers.get('set-cookie')?.split(';')[0];if(cookie)await fetch(base+'/api/pedidos/'+encodeURIComponent(idPedido),{method:'DELETE',headers:{Cookie:cookie}}).catch(()=>{});}
 if(database)await database.closePool();socket?.close();chrome.kill('SIGTERM');await new Promise(resolve=>chrome.once('exit',resolve));try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:10,retryDelay:100});}catch{}
}
