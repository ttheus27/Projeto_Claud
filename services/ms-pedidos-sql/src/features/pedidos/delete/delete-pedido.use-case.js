import { validarIdPedido } from "../../../domain/pedido.js";
import { NotFoundError } from "../../../domain/errors.js";
export const makeDeletePedido = ({ repository }) => async id => {
  if (!await repository.excluir(validarIdPedido(id))) throw new NotFoundError("Pedido não encontrado.");
  return id;
};
