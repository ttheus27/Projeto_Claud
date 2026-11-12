import { sqlEngine } from "./database.js";

export const pedidoRepository = {
  async listar() {
    return sqlEngine.query("SELECT * FROM TB_PEDIDOS");
  },

  async buscarPorId(id) {
    const rows = sqlEngine.query("SELECT * FROM TB_PEDIDOS WHERE id_pedido =", [id]);
    return rows.length > 0 ? rows[0] : null;
  },

  async buscarPorOrcamento(codigoOrcamento) {
    return sqlEngine.query("SELECT * FROM TB_PEDIDOS WHERE codigo_orcamento =", [codigoOrcamento]);
  },

  async criar(pedido) {
    sqlEngine.query("INSERT INTO TB_PEDIDOS VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [pedido]);
    return pedido;
  },

  async atualizar(id, dados) {
    const res = sqlEngine.query("UPDATE TB_PEDIDOS SET ... WHERE id_pedido =", [dados, id]);
    return res.rowCount > 0 ? res.updatedRow : null;
  },

  async excluir(id) {
    const res = sqlEngine.query("DELETE FROM TB_PEDIDOS WHERE id_pedido =", [id]);
    return res.rowCount > 0;
  }
};
