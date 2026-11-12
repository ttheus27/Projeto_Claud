import { createOrcamentoUseCases } from "../application/orcamento-use-cases.js";
import { orcamentoRepository } from "../infrastructure/orcamento.repository.js";
export const orcamentoUseCases = createOrcamentoUseCases(orcamentoRepository);
