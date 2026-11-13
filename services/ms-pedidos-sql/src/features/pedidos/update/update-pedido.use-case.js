import { validarEFormatarPedido, validarIdPedido, PedidoValidationError } from "../../../domain/pedido.js";
import { NotFoundError } from "../../../domain/errors.js";
export const makeUpdatePedido = ({ repository }) => async (id, data) => {
  id = validarIdPedido(id);
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new PedidoValidationError("Envie um objeto JSON para atualizar o registro.");
  const current = await repository.buscarPorId(id);
  if (!current) throw new NotFoundError("Pedido não encontrado.");
  const payload = validarEFormatarPedido({ ...current, ...data, id_pedido: current.id_pedido, criado_em: current.criado_em }, true);
  const updated = await repository.atualizar(id, payload);
  if (!updated) throw new NotFoundError("Pedido não encontrado.");
  return updated;
};
