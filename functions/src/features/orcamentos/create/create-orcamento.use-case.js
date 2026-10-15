const { criarNovoOrcamento } = require("../domain/orcamento");

function makeCreateOrcamentoUseCase({
  repository,
  clock = () => new Date().toISOString(),
  idGenerator,
}) {
  if (!repository || typeof repository.create !== "function") {
    throw new Error(
      "O repositório de orçamentos não possui a operação de criação.",
    );
  }

  return async function executeCreateOrcamento(body) {
    const orcamento = criarNovoOrcamento(body, {
      instant: clock(),
      idGenerator,
    });

    return repository.create(orcamento);
  };
}

module.exports = { makeCreateOrcamentoUseCase };
