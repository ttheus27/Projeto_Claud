import { createOrcamentoUseCases } from '../application/orcamento-use-cases';
import { createOrcamentoGateway } from '../infrastructure/orcamento-gateway';

export const orcamentoUseCases = createOrcamentoUseCases({
  gateway: createOrcamentoGateway()
});
