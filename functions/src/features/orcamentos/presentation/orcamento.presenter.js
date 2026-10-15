function presentOrcamento(orcamento) {
  if (!orcamento) return null;

  return {
    ...orcamento,
    _id: orcamento._id?.toString()
  };
}

function presentOrcamentos(orcamentos) {
  return orcamentos.map(presentOrcamento);
}

function presentError(error) {
  return {
    status: error.statusCode || 500,
    body: { error: error.message }
  };
}

module.exports = {
  presentError,
  presentOrcamento,
  presentOrcamentos
};
