import { createOrcamentoUseCases } from '../application/orcamento-use-cases';
import { createAzureOrcamentoGateway } from '../infrastructure/azure-orcamento-gateway';

export const orcamentoUseCases = createOrcamentoUseCases({
  gateway: createAzureOrcamentoGateway()
});
