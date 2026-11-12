import { validarIdOrcamento } from "../../../domain/orcamento.js";
import { NotFoundError } from "../../../domain/errors.js";
export const makeGetOrcamento = ({ repository }) => async id => {
  const record = await repository.buscarPorId(validarIdOrcamento(id));
  if (!record) throw new NotFoundError("Orçamento não encontrado.");
  return record;
};
