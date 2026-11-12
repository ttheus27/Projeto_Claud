import React, { useState } from "react";
import { X } from "lucide-react";
import { calcularCustosOrcamento } from "../../orcamentos/domain/calcular-custos-orcamento";

export const STATUS_PEDIDO = ["Em Planejamento", "Em Usinagem CNC", "Aguardando Expedição", "Concluído"];

export default function PedidoForm({ pedido, orcamentos = [], onSave, onClose }) {
  const editing = Boolean(pedido?.id_pedido);
  const [data, setData] = useState(() => ({
    codigo_orcamento: "", cliente: "", descricao_peca: "", lote_producao: 1, valor_total: 0,
    status_producao: "Em Planejamento", data_entrega_prevista: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    ...pedido,
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const change = event => setData(current => ({ ...current, [event.target.name]: event.target.value }));
  const selectOrcamento = event => {
    const id = event.target.value;
    const orcamento = orcamentos.find(item => (item.id || item._id) === id);
    setData(current => ({ ...current, codigo_orcamento: id, ...(orcamento ? {
      cliente: orcamento.cliente, descricao_peca: orcamento.descricaoPeca,
      lote_producao: orcamento.lotePadrao, valor_total: Number(calcularCustosOrcamento(orcamento).precoTotalLote.toFixed(2)),
    } : {}) }));
  };
  const submit = async event => {
    event.preventDefault(); setSaving(true); setError("");
    try { await onSave({ ...data, lote_producao: Number(data.lote_producao), valor_total: Number(data.valor_total) }); }
    catch (error) { setError(error.message); }
    finally { setSaving(false); }
  };
  const inputClass = "mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-400 focus:outline-none";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <section role="dialog" aria-modal="true" aria-labelledby="pedido-form-title" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-slate-900 p-6 text-slate-200 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="pedido-form-title" className="text-lg font-bold">{editing ? `Editar pedido ${pedido.id_pedido}` : "Novo pedido"}</h2>
          <button type="button" aria-label="Fechar formulário" disabled={saving} onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <fieldset disabled={saving} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="text-sm sm:col-span-2">Orçamento de origem
              <input required name="codigo_orcamento" list="orcamentos-pedido" maxLength={64} value={data.codigo_orcamento} onChange={selectOrcamento} className={inputClass} />
              <datalist id="orcamentos-pedido">{orcamentos.map(item => <option key={item.id || item._id} value={item.id || item._id}>{item.codigoPeca} — {item.cliente}</option>)}</datalist>
            </label>
            <label className="text-sm">Cliente<input required name="cliente" maxLength={150} value={data.cliente} onChange={change} className={inputClass} /></label>
            <label className="text-sm">Descrição da peça<input required name="descricao_peca" maxLength={300} value={data.descricao_peca} onChange={change} className={inputClass} /></label>
            <label className="text-sm">Lote de produção<input required type="number" name="lote_producao" min="1" max="2147483647" step="1" value={data.lote_producao} onChange={change} className={inputClass} /></label>
            <label className="text-sm">Valor total (R$)<input required type="number" name="valor_total" min="0" max="999999999999.99" step="0.01" value={data.valor_total} onChange={change} className={inputClass} /></label>
            <label className="text-sm">Entrega prevista<input required type="date" name="data_entrega_prevista" value={data.data_entrega_prevista} onChange={change} className={inputClass} /></label>
            <label className="text-sm">Status de produção<select name="status_producao" value={data.status_producao} onChange={change} className={inputClass}>{STATUS_PEDIDO.map(status => <option key={status}>{status}</option>)}</select></label>
          </fieldset>
          {error && <p role="alert" className="rounded-lg bg-red-950 p-3 text-sm text-red-200">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" disabled={saving} onClick={onClose} className="rounded-lg border border-slate-600 px-4 py-2 text-sm">Cancelar</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Salvando..." : "Salvar pedido"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
