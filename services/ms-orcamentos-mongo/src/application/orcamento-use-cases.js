import { makeListOrcamentos } from "../features/orcamentos/list/list-orcamento.use-case.js";
import { makeGetOrcamento } from "../features/orcamentos/get/get-orcamento.use-case.js";
import { makeCreateOrcamento } from "../features/orcamentos/create/create-orcamento.use-case.js";
import { makeUpdateOrcamento } from "../features/orcamentos/update/update-orcamento.use-case.js";
import { makeDeleteOrcamento } from "../features/orcamentos/delete/delete-orcamento.use-case.js";
import { assertRepository } from "./ports/repository.js";
export function createOrcamentoUseCases(repository) {
  assertRepository(repository);
  return {
    listar: makeListOrcamentos({ repository }),
    buscarPorId: makeGetOrcamento({ repository }),
    criar: makeCreateOrcamento({ repository }),
    atualizar: makeUpdateOrcamento({ repository }),
    excluir: makeDeleteOrcamento({ repository }),
  };
}
