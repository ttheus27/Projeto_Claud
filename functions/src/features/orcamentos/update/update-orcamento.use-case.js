const { prepararAtualizacaoOrcamento } = require("../domain/orcamento");

function makeUpdateOrcamentoUseCase({
  repository,
  clock = () => new Date().toISOString(),
}) {
  if (!repository || typeof repository.update !== "function") {
    throw new Error(
      "O repositório de orçamentos não possui a operação de atualização.",
    );
  }

  return async function executeUpdateOrcamento(id, body) {
    const payload = prepararAtualizacaoOrcamento(body, { instant: clock() });
    return repository.update(id, payload);
  };
}

module.exports = { makeUpdateOrcamentoUseCase };
