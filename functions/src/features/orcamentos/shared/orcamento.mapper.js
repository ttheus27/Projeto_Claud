function sanitizeOrcamentoPayload(payload) {
    const { _id, ...orcamento } = payload || {};
    return orcamento;
}

function serializeOrcamento(orcamento) {
    if (!orcamento) return null;
    return {
        ...orcamento,
        _id: orcamento._id?.toString()
    };
}

module.exports = {
    sanitizeOrcamentoPayload,
    serializeOrcamento
};
