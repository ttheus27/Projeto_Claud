import { getOrcamentoId, isOrcamentoPersistido } from '../domain/orcamento';

function assertGateway(gateway) {
  const requiredMethods = ['listar', 'criar', 'atualizar', 'excluir'];
  const isValid = gateway && requiredMethods.every((method) => typeof gateway[method] === 'function');

  if (!isValid) {
    throw new Error('O gateway de orçamentos não possui o contrato esperado.');
  }
}

export function createOrcamentoUseCases({ gateway, clock = () => new Date().toISOString() }) {
  assertGateway(gateway);

  const criar = async (dadosOrcamento) => {
    const agora = clock();
    return gateway.criar({
      ...dadosOrcamento,
      criadoEm: dadosOrcamento.criadoEm || agora,
      atualizadoEm: agora,
      status: dadosOrcamento.status || 'Pendente'
    });
  };

  return {
    listar: () => gateway.listar(),

    salvar: (dadosOrcamento) => {
      if (!isOrcamentoPersistido(dadosOrcamento)) {
        return criar(dadosOrcamento);
      }

      return gateway.atualizar({
        ...dadosOrcamento,
        atualizadoEm: clock()
      });
    },

    importar: criar,

    excluir: (orcamento) => {
      const id = typeof orcamento === 'string' ? orcamento : getOrcamentoId(orcamento);

      if (!id) {
        throw new Error('Orçamento sem ID não pode ser removido.');
      }

      return gateway.excluir(id);
    }
  };
}
