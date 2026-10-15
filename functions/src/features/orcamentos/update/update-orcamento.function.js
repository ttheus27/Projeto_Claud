const { app } = require('@azure/functions');
const { emptyResponse, jsonResponse } = require('../../../shared/http/response');
const { executeUpdateOrcamento } = require('./update-orcamento.use-case');

app.http('UpdateOrcamento', {
    methods: ['PUT', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        if (request.method === 'OPTIONS') {
            return emptyResponse();
        }

        const body = await request.json().catch(() => ({}));
        const id = request.query.get('id') || body.id || body._id;

        if (!id) {
            return jsonResponse({ error: 'Informe o id do orçamento para atualizar.' }, 400);
        }

        context.log(`Atualizando orçamento "${id}" no MongoDB Atlas.`);

        try {
            const orcamento = await executeUpdateOrcamento(id, body);

            if (!orcamento) {
                return jsonResponse({ error: 'Orçamento não encontrado.' }, 404);
            }

            return jsonResponse({
                mensagem: 'Orçamento atualizado com sucesso.',
                orcamento
            });
        } catch (error) {
            context.error('Erro ao atualizar orçamento:', error);
            return jsonResponse({ error: error.message }, 500);
        }
    }
});
