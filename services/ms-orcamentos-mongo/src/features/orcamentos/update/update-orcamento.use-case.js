import { validarEFormatarOrcamento, validarIdOrcamento, OrcamentoValidationError } from "../../../domain/orcamento.js";
import { NotFoundError } from "../../../domain/errors.js";
export const makeUpdateOrcamento = ({ repository }) => async (id, data) => {
  id = validarIdOrcamento(id);
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new OrcamentoValidationError("Envie um objeto JSON para atualizar o registro.");
  const current = await repository.buscarPorId(id);
  if (!current) throw new NotFoundError("Orçamento não encontrado.");
  const payload = validarEFormatarOrcamento({ ...current, ...data, id: current.id, criadoEm: current.criadoEm }, true);
  const updated = await repository.atualizar(id, payload);
  if (!updated) throw new NotFoundError("Orçamento não encontrado.");
  return updated;
};
