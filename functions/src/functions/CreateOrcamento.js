const { app } = require('@azure/functions');
const {
    emptyResponse,
    getCollection,
    jsonResponse,
    sanitizeOrcamentoPayload,
    serializeOrcamento
} = require('./mongoClient');

function gerarCodigoOrcamento() {
    const ano = new Date().getFullYear();
    const sufixo = Date.now().toString().slice(-6);
    return `ORC-${ano}-${sufixo}`;
}

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
            const collection = await getCollection();
            const agora = new Date().toISOString();
            const orcamento = {
                ...sanitizeOrcamentoPayload(body),
                id: body.id || gerarCodigoOrcamento(),
                status: body.status || 'Pendente',
                criadoEm: body.criadoEm || agora,
                atualizadoEm: agora
            };

            const result = await collection.insertOne(orcamento);
            const inserted = await collection.findOne({ _id: result.insertedId });

            return jsonResponse({
                mensagem: 'Orçamento cadastrado com sucesso.',
                orcamento: serializeOrcamento(inserted)
            }, 201);
        } catch (error) {
            context.error('Erro ao criar orçamento:', error);
            return jsonResponse({ error: error.message }, 500);
        }
    }
});
