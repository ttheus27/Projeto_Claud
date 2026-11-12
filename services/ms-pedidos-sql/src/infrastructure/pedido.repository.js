import { ConflictError } from "../domain/errors.js";
import { getPool, sql } from "./database.js";

function present(row) {
  if (!row) return null;
  return { ...row, data_entrega_prevista: row.data_entrega_prevista.toISOString().slice(0, 10),
    criado_em: row.criado_em.toISOString(), atualizado_em: row.atualizado_em.toISOString() };
}
function bind(request, pedido) {
  return request.input("id", sql.NVarChar(64), pedido.id_pedido)
    .input("orcamento", sql.NVarChar(64), pedido.codigo_orcamento)
    .input("cliente", sql.NVarChar(150), pedido.cliente)
    .input("descricao", sql.NVarChar(300), pedido.descricao_peca)
    .input("lote", sql.Int, pedido.lote_producao)
    .input("valor", sql.Decimal(18, 2), pedido.valor_total)
    .input("status", sql.NVarChar(32), pedido.status_producao)
    .input("entrega", sql.Date, new Date(`${pedido.data_entrega_prevista}T00:00:00Z`));
}
export const pedidoRepository = {
  async listar() {
    const result = await (await getPool()).request().query("SELECT * FROM dbo.TB_PEDIDOS ORDER BY atualizado_em DESC, id_pedido");
    return result.recordset.map(present);
  },
  async buscarPorId(id) {
    const result = await (await getPool()).request().input("id", sql.NVarChar(64), id)
      .query("SELECT * FROM dbo.TB_PEDIDOS WHERE id_pedido = @id");
    return present(result.recordset[0]);
  },
  async buscarPorOrcamento(codigo) {
    const result = await (await getPool()).request().input("codigo", sql.NVarChar(64), codigo)
      .query("SELECT * FROM dbo.TB_PEDIDOS WHERE codigo_orcamento = @codigo ORDER BY atualizado_em DESC");
    return result.recordset.map(present);
  },
  async criar(pedido) {
    try {
    const result = await bind((await getPool()).request(), pedido).query(`
      INSERT INTO dbo.TB_PEDIDOS
        (id_pedido, codigo_orcamento, cliente, descricao_peca, lote_producao, valor_total, status_producao, data_entrega_prevista)
      OUTPUT INSERTED.*
      VALUES (@id, @orcamento, @cliente, @descricao, @lote, @valor, @status, @entrega)`);
    return present(result.recordset[0]);
    } catch (error) {
      if ([2601, 2627].includes(error.number)) throw new ConflictError("Já existe um pedido com esse identificador.");
      throw error;
    }
  },
  async atualizar(id, pedido) {
    const result = await bind((await getPool()).request(), { ...pedido, id_pedido: id }).query(`
      UPDATE dbo.TB_PEDIDOS SET codigo_orcamento = @orcamento, cliente = @cliente,
        descricao_peca = @descricao, lote_producao = @lote, valor_total = @valor,
        status_producao = @status, data_entrega_prevista = @entrega, atualizado_em = SYSUTCDATETIME()
      OUTPUT INSERTED.* WHERE id_pedido = @id`);
    return present(result.recordset[0]);
  },
  async excluir(id) {
    const result = await (await getPool()).request().input("id", sql.NVarChar(64), id)
      .query("DELETE FROM dbo.TB_PEDIDOS OUTPUT DELETED.id_pedido WHERE id_pedido = @id");
    return result.recordset.length > 0;
  },
};
