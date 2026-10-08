const { sanitizeOrcamentoPayload, serializeOrcamento } = require('../shared/orcamento.mapper');
const { createOrcamento } = require('../shared/orcamento.repository');

function gerarCodigoOrcamento() {
    const ano = new Date().getFullYear();
    const sufixo = Date.now().toString().slice(-6);
    return `ORC-${ano}-${sufixo}`;
}

async function executeCreateOrcamento(body) {
    const agora = new Date().toISOString();
    const orcamento = {
        ...sanitizeOrcamentoPayload(body),
        id: body.id || gerarCodigoOrcamento(),
        status: body.status || 'Pendente',
        criadoEm: body.criadoEm || agora,
        atualizadoEm: agora
    };

    const inserted = await createOrcamento(orcamento);
    return serializeOrcamento(inserted);
}

module.exports = { executeCreateOrcamento };
