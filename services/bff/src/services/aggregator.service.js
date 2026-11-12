export async function fetchWithTimeout(url, options = {}, timeoutMs = 20000, httpFetch = fetch) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await httpFetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally { clearTimeout(timer); }
}

function collection(payload) {
  const data = payload?.data || payload?.orcamentos || payload;
  if (!Array.isArray(data)) throw new Error('Resposta de coleção inválida.');
  return data;
}
export async function getAggregatedData({ httpFetch = fetch } = {}) {
  const mongoUrl = process.env.MS_MONGO_URL || 'http://localhost:3001/api/orcamentos';
  const sqlUrl = process.env.MS_SQL_URL || 'http://localhost:3002/api/pedidos';
  const functionUrl = process.env.AZURE_FUNCTION_URL || 'https://cloud-projeto-orc-f-app.azurewebsites.net/api/EnriquecerOrcamento';
  const headers = { 'x-internal-api-token': process.env.INTERNAL_API_TOKEN };
  const started = Date.now();
  const [mongo, sql] = await Promise.allSettled([
    fetchWithTimeout(mongoUrl, { headers }, 20000, httpFetch).then(collection),
    fetchWithTimeout(sqlUrl, { headers }, 100000, httpFetch).then(collection),
  ]);
  const orcamentos = mongo.status === 'fulfilled' ? mongo.value : [];
  const pedidos = sql.status === 'fulfilled' ? sql.value : [];
  const orcamento = orcamentos[0] || null;
  const valorTotalPedidos = pedidos.reduce((sum, item) => sum + Number(item.valor_total || 0), 0);
  let enriquecimento = null;
  const errors = [];
  if (mongo.status === 'rejected') errors.push({ servico: 'mongo', error: 'Microserviço de orçamentos indisponível.' });
  if (sql.status === 'rejected') errors.push({ servico: 'sql', error: 'Microserviço de pedidos indisponível.' });
  try {
    const payload = await fetchWithTimeout(functionUrl, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(process.env.AZURE_FUNCTION_KEY ? { 'x-functions-key': process.env.AZURE_FUNCTION_KEY } : {}) },
      body: JSON.stringify({ orcamento, totalPedidos: pedidos.length, valorTotalPedidos }),
    }, 20000, httpFetch);
    if (!payload.enriquecimento || typeof payload.enriquecimento !== 'object') throw new Error('Resposta de cálculo inválida.');
    enriquecimento = payload.enriquecimento;
  } catch { errors.push({ servico: 'function', error: 'Cálculo serverless indisponível.' }); }
  const id = orcamento?.id || orcamento?._id;
  return {
    timestamp: new Date().toISOString(), status: errors.length ? 'partial' : 'success',
    latenciaTotalMs: Date.now() - started,
    nosIntegrados: {
      microservico1Mongo: { status: mongo.status === 'fulfilled' ? 'online' : 'offline', endpoint: mongoUrl, banco: 'MongoDB Atlas' },
      microservico2Sql: { status: sql.status === 'fulfilled' ? 'online' : 'offline', endpoint: sqlUrl, banco: 'Azure SQL Database' },
      azureFunctionServerless: { status: enriquecimento ? 'online' : 'offline', endpoint: functionUrl, tipo: 'HTTP Trigger — cálculo de custos' },
    },
    data: {
      orcamentos, pedidos,
      orcamentoAtivo: orcamento && enriquecimento?.custos ? { ...orcamento, operacoes: enriquecimento.custos.operacoesDetalhadas } : orcamento,
      pedidosAssociados: pedidos.filter(item => item.codigo_orcamento === id),
      enriquecimentoServerless: enriquecimento,
      resumoGeral: { totalOrcamentosCadastrados: orcamentos.length, totalOrdensProducaoSQL: pedidos.length, valorTotalOrdensSQL: valorTotalPedidos },
    },
    errors,
  };
}
