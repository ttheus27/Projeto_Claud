const { deleteOrcamento } = require('../shared/orcamento.repository');

async function executeDeleteOrcamento(id) {
    return deleteOrcamento(id);
}

module.exports = { executeDeleteOrcamento };
