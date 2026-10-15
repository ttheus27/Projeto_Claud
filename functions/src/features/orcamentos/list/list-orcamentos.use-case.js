function makeListOrcamentosUseCase({ repository }) {
  if (!repository || typeof repository.list !== "function") {
    throw new Error(
      "O repositório de orçamentos não possui a operação de consulta.",
    );
  }

  return async function executeListOrcamentos() {
    return repository.list();
  };
}

module.exports = { makeListOrcamentosUseCase };
