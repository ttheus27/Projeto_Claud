function makeDeleteOrcamentoUseCase({ repository }) {
  if (!repository || typeof repository.delete !== "function") {
    throw new Error(
      "O repositório de orçamentos não possui a operação de exclusão.",
    );
  }

  return async function executeDeleteOrcamento(id) {
    return repository.delete(id);
  };
}

module.exports = { makeDeleteOrcamentoUseCase };
