const { app } = require('@azure/functions');
const { jsonResponse } = require('../../shared/http/response');
const { enriquecerOrcamento } = require('./enriquecimento.use-case');

app.http('EnriquecerOrcamento', {
  methods: ['POST'],
  authLevel: 'function',
  handler: async (request, context) => {
    let input;
    try { input = await request.json(); }
    catch { return jsonResponse({ error: 'Envie um JSON válido.' }, 400); }
    if (!input || typeof input !== 'object' || Array.isArray(input)) return jsonResponse({ error: 'Envie um objeto JSON.' }, 400);
    try { return jsonResponse({ enriquecimento: enriquecerOrcamento(input) }); }
    catch (error) {
      if (error.statusCode === 400) return jsonResponse({ error: error.message }, 400);
      context.error('Falha no cálculo serverless.');
      return jsonResponse({ error: 'Não foi possível calcular o orçamento.' }, 500);
    }
  },
});
