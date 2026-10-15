export function getOrcamentoId(orcamento) {
  return orcamento?.id || orcamento?._id;
}

export function isOrcamentoPersistido(orcamento) {
  return Boolean(getOrcamentoId(orcamento));
}
