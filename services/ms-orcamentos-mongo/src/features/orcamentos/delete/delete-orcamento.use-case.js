import { validarIdOrcamento } from "../../../domain/orcamento.js";
import { NotFoundError } from "../../../domain/errors.js";
export const makeDeleteOrcamento = ({ repository }) => async id => {
  if (!await repository.excluir(validarIdOrcamento(id))) throw new NotFoundError("Orçamento não encontrado.");
  return id;
};
