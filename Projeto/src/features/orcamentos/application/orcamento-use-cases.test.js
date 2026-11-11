import { describe, expect, it } from 'vitest';
import { createOrcamentoUseCases } from './orcamento-use-cases';

function createInMemoryOrcamentoGateway(initialOrcamentos = []) {
  const orcamentos = [...initialOrcamentos];

  return {
    orcamentos,
    async listar() {
      return { data: [...orcamentos] };
    },
    async criar(dadosOrcamento) {
      const orcamento = {
        ...dadosOrcamento,
        id: `ORC-${orcamentos.length + 1}`
      };
      orcamentos.push(orcamento);
      return orcamento;
    },
    async atualizar(dadosOrcamento) {
      const index = orcamentos.findIndex((orcamento) => orcamento.id === dadosOrcamento.id);
      const orcamento = { ...orcamentos[index], ...dadosOrcamento };
      orcamentos[index] = orcamento;
      return orcamento;
    },
    async excluir(id) {
      const index = orcamentos.findIndex((orcamento) => orcamento.id === id);
      if (index >= 0) orcamentos.splice(index, 1);
      return id;
    }
  };
}

describe('Casos de uso de orçamento', () => {
  it('DADO um orçamento novo QUANDO ele é salvo ENTÃO é incluído como pendente com datas de criação e atualização', async () => {
    const gateway = createInMemoryOrcamentoGateway();
    const useCases = createOrcamentoUseCases({
      gateway,
      clock: () => '2026-10-15T10:00:00.000Z'
    });

    const salvo = await useCases.salvar({
      codigoPeca: 'SCH-100',
      descricaoPeca: 'Corpo de compressor'
    });

    expect(salvo).toMatchObject({
      id: 'ORC-1',
      codigoPeca: 'SCH-100',
      status: 'Pendente',
      criadoEm: '2026-10-15T10:00:00.000Z',
      atualizadoEm: '2026-10-15T10:00:00.000Z'
    });
    expect(gateway.orcamentos).toHaveLength(1);
  });

  it('DADO um orçamento já cadastrado QUANDO ele é salvo após uma alteração ENTÃO preserva sua criação e registra uma nova atualização', async () => {
    const gateway = createInMemoryOrcamentoGateway([{
      id: 'ORC-200',
      descricaoPeca: 'Carcaça original',
      criadoEm: '2026-10-01T08:00:00.000Z',
      atualizadoEm: '2026-10-01T08:00:00.000Z'
    }]);
    const useCases = createOrcamentoUseCases({
      gateway,
      clock: () => '2026-10-15T10:00:00.000Z'
    });

    const salvo = await useCases.salvar({
      id: 'ORC-200',
      descricaoPeca: 'Carcaça revisada',
      criadoEm: '2026-10-01T08:00:00.000Z'
    });

    expect(salvo).toMatchObject({
      id: 'ORC-200',
      descricaoPeca: 'Carcaça revisada',
      criadoEm: '2026-10-01T08:00:00.000Z',
      atualizadoEm: '2026-10-15T10:00:00.000Z'
    });
    expect(gateway.orcamentos).toHaveLength(1);
  });

  it('DADO um item sem identificação persistida QUANDO a exclusão é solicitada ENTÃO informa que ele não pode ser removido', () => {
    const gateway = createInMemoryOrcamentoGateway();
    const useCases = createOrcamentoUseCases({ gateway });

    expect(() => useCases.excluir({ descricaoPeca: 'Peça ainda não salva' })).toThrow(
      'Orçamento sem ID não pode ser removido.'
    );
    expect(gateway.orcamentos).toHaveLength(0);
  });
});
