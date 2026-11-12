import { validarIdPedido } from "../../../domain/pedido.js";
import { NotFoundError } from "../../../domain/errors.js";
export const makeGetPedido = ({ repository }) => async id => {
  const record = await repository.buscarPorId(validarIdPedido(id));
  if (!record) throw new NotFoundError("Pedido não encontrado.");
  return record;
};
