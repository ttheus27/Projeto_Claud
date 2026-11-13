import { makeListPedidos } from "../features/pedidos/list/list-pedido.use-case.js";
import { makeGetPedido } from "../features/pedidos/get/get-pedido.use-case.js";
import { makeCreatePedido } from "../features/pedidos/create/create-pedido.use-case.js";
import { makeUpdatePedido } from "../features/pedidos/update/update-pedido.use-case.js";
import { makeDeletePedido } from "../features/pedidos/delete/delete-pedido.use-case.js";
import { makeFindPedidosByOrcamento } from "../features/pedidos/by-orcamento/by-orcamento-pedido.use-case.js";
import { assertRepository } from "./ports/repository.js";
export function createPedidoUseCases(repository) {
  assertRepository(repository);
  return {
    listar: makeListPedidos({ repository }),
    buscarPorId: makeGetPedido({ repository }),
    criar: makeCreatePedido({ repository }),
    atualizar: makeUpdatePedido({ repository }),
    excluir: makeDeletePedido({ repository }),
    buscarPorOrcamento: makeFindPedidosByOrcamento({ repository }),
  };
}
