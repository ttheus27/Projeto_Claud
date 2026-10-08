const { app } = require('@azure/functions');
const {
    buildIdFilter,
    emptyResponse,
    getCollection,
    jsonResponse,
    sanitizeOrcamentoPayload,
    serializeOrcamento
} = require('./mongoClient');

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
            const collection = await getCollection();
            const payload = {
                ...sanitizeOrcamentoPayload(body),
                atualizadoEm: new Date().toISOString()
            };

            const result = await collection.findOneAndUpdate(
                buildIdFilter(id),
                { $set: payload },
                { returnDocument: 'after' }
            );
            const updated = result?.value || result;

            if (!updated) {
                return jsonResponse({ error: 'Orçamento não encontrado.' }, 404);
            }

            return jsonResponse({
                mensagem: 'Orçamento atualizado com sucesso.',
                orcamento: serializeOrcamento(updated)
            });
        } catch (error) {
            context.error('Erro ao atualizar orçamento:', error);
            return jsonResponse({ error: error.message }, 500);
        }
    }
});
