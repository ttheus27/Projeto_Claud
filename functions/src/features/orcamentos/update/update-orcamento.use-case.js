const { sanitizeOrcamentoPayload, serializeOrcamento } = require('../shared/orcamento.mapper');
const { updateOrcamento } = require('../shared/orcamento.repository');

async function executeUpdateOrcamento(id, body) {
    const payload = {
        ...sanitizeOrcamentoPayload(body),
        atualizadoEm: new Date().toISOString()
    };

    const result = await updateOrcamento(id, payload);
    const updated = result?.value || result;
    return serializeOrcamento(updated);
}

module.exports = { executeUpdateOrcamento };
