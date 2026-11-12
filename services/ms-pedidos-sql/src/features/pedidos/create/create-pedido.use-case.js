import { validarEFormatarPedido } from "../../../domain/pedido.js";
export const makeCreatePedido = ({ repository }) => data => repository.criar(validarEFormatarPedido(data));
