const { app } = require('@azure/functions');
const { emptyResponse, jsonResponse } = require('../../../shared/http/response');
const { executeCreateOrcamento } = require('./create-orcamento.use-case');

app.http('CreateOrcamento', {
    methods: ['POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        if (request.method === 'OPTIONS') {
            return emptyResponse();
        }

        context.log('Criando orçamento no MongoDB Atlas.');

        try {
            const body = await request.json();
            const orcamento = await executeCreateOrcamento(body);

            return jsonResponse({
                mensagem: 'Orçamento cadastrado com sucesso.',
                orcamento
            }, 201);
        } catch (error) {
            context.error('Erro ao criar orçamento:', error);
            return jsonResponse({ error: error.message }, 500);
        }
    }
});
