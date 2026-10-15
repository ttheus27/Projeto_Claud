const { app } = require('@azure/functions');
const { emptyResponse, jsonResponse } = require('../../../shared/http/response');
const { executeListOrcamentos } = require('./list-orcamentos.use-case');

app.http('GetOrcamentos', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        if (request.method === 'OPTIONS') {
            return emptyResponse();
        }

        context.log('Consultando orçamentos no MongoDB Atlas.');

        try {
            const orcamentos = await executeListOrcamentos();
            return jsonResponse({ orcamentos });
        } catch (error) {
            context.error('Erro ao consultar orçamentos:', error);
            return jsonResponse({ error: error.message }, 500);
        }
    }
});
