const { app } = require('@azure/functions');
const {
    emptyResponse,
    getCollection,
    jsonResponse,
    serializeOrcamento
} = require('./mongoClient');

app.http('GetOrcamentos', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        if (request.method === 'OPTIONS') {
            return emptyResponse();
        }

        context.log('Consultando orçamentos no MongoDB Atlas.');

        try {
            const collection = await getCollection();
            const orcamentos = await collection
                .find({})
                .sort({ atualizadoEm: -1, criadoEm: -1 })
                .toArray();

            return jsonResponse({
                orcamentos: orcamentos.map(serializeOrcamento)
            });
        } catch (error) {
            context.error('Erro ao consultar orçamentos:', error);
            return jsonResponse({ error: error.message }, 500);
        }
    }
});
