import { createPedidoUseCases } from "../application/pedido-use-cases.js";
import { pedidoRepository } from "../infrastructure/pedido.repository.js";
export const pedidoUseCases = createPedidoUseCases(pedidoRepository);
