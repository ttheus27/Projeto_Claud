/** Repository port. Implementations return domain records, never driver results. */
export function assertRepository(repository) {
  const methods = ['listar', 'buscarPorId', 'buscarPorOrcamento', 'criar', 'atualizar', 'excluir'];
  if (!repository || methods.some(method => typeof repository[method] !== "function")) {
    throw new TypeError("O repositório não implementa o contrato da aplicação.");
  }
  return repository;
}
