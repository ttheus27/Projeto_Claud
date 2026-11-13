import { validarIdPedido } from "../../../domain/pedido.js";
export const makeFindPedidosByOrcamento = ({ repository }) => codigo => repository.buscarPorOrcamento(validarIdPedido(codigo));
