const { app } = require('@azure/functions');
const { emptyResponse, jsonResponse } = require('../../../shared/http/response');
const { executeDeleteOrcamento } = require('./delete-orcamento.use-case');

app.http('DeleteOrcamento', {
    methods: ['DELETE', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        if (request.method === 'OPTIONS') {
            return emptyResponse();
        }

        const id = request.query.get('id');
        if (!id) {
            return jsonResponse({ error: 'Informe o id do orçamento para remover.' }, 400);
        }

        context.log(`Removendo orçamento "${id}" do MongoDB Atlas.`);

        try {
            const result = await executeDeleteOrcamento(id);

            if (result.deletedCount === 0) {
                return jsonResponse({ error: 'Orçamento não encontrado.' }, 404);
            }

            return jsonResponse({
                mensagem: 'Orçamento removido com sucesso.',
                id
            });
        } catch (error) {
            context.error('Erro ao remover orçamento:', error);
            return jsonResponse({ error: error.message }, 500);
        }
    }
});
