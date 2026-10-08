const { serializeOrcamento } = require('../shared/orcamento.mapper');
const { listOrcamentos } = require('../shared/orcamento.repository');

async function executeListOrcamentos() {
    const orcamentos = await listOrcamentos();
    return orcamentos.map(serializeOrcamento);
}

module.exports = { executeListOrcamentos };
