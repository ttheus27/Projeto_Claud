import React, { useState, useEffect } from "react";
import { 
  Package, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Database, 
  TrendingUp,
  RefreshCw,
  Calendar,
  Factory
} from "lucide-react";
import { pedidosGateway } from "../infrastructure/pedidos-gateway";

export default function PedidosView({ onSelectOrcamentoRef }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("TODOS");
  const [sourceInfo, setSourceInfo] = useState("");

  const carregarPedidos = async () => {
    setLoading(true);
    try {
      const res = await pedidosGateway.listar();
      setPedidos(res.data);
      setSourceInfo(`${res.source} (${res.latencyMs}ms)`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPedidos();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    await pedidosGateway.atualizarStatus(id, status);
    await carregarPedidos();
  };

  const pedidosFiltrados = pedidos.filter(p => {
    const matchBusca = 
      (p.id_pedido || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.codigo_orcamento || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.descricao_peca || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.cliente || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatus = filtroStatus === "TODOS" || p.status_producao === filtroStatus;
    return matchBusca && matchStatus;
  });

  const totalValor = pedidos.reduce((acc, p) => acc + (Number(p.valor_total) || 0), 0);
  const emProducao = pedidos.filter(p => p.status_producao === "Em Usinagem CNC").length;
  const concluidos = pedidos.filter(p => p.status_producao === "Concluído").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner de Integração SQL */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Microserviço 2 — Gestão de Pedidos & Ordens Industriais
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                TB_PEDIDOS (Azure SQL)
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Origem dos dados: <strong className="text-slate-300 font-mono">{sourceInfo || "Conectando..."}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={carregarPedidos}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Sincronizar SQL
        </button>
      </div>

      {/* Cards de Métricas do SQL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total de Ordens na TB_PEDIDOS</span>
            <Package className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{pedidos.length}</p>
          <span className="text-[11px] text-slate-500">Ordens de produção geradas</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Em Usinagem CNC</span>
            <Factory className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-400 mt-2">{emProducao}</p>
          <span className="text-[11px] text-slate-500">Máquinas em operação ativa</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Ordens Concluídas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 mt-2">{concluidos}</p>
          <span className="text-[11px] text-slate-500">Prontas para expedição</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Faturamento da Linha (R$)</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-extrabold text-indigo-300 mt-2">
            {totalValor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
          <span className="text-[11px] text-slate-500">Somatório de lote da fábrica</span>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por Pedido, Orçamento, Peça ou Cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {["TODOS", "Em Planejamento", "Em Usinagem CNC", "Aguardando Expedição", "Concluído"].map(status => (
            <button
              key={status}
              onClick={() => setFiltroStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filtroStatus === status
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Ordens SQL */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">ID Pedido (PK)</th>
                <th className="py-3 px-4">Orçamento Origem</th>
                <th className="py-3 px-4">Peça / Descrição</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4 text-right">Lote</th>
                <th className="py-3 px-4 text-right">Valor Total (R$)</th>
                <th className="py-3 px-4">Entrega Prevista</th>
                <th className="py-3 px-4 text-center">Status Produção</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {pedidosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    Nenhum pedido encontrado no banco relacional.
                  </td>
                </tr>
              ) : (
                pedidosFiltrados.map((pedido) => (
                  <tr key={pedido.id_pedido} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                      {pedido.id_pedido}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {pedido.codigo_orcamento}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      {pedido.descricao_peca}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {pedido.cliente}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold">
                      {pedido.lote_producao} un
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                      {Number(pedido.valor_total).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {pedido.data_entrega_prevista}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        pedido.status_producao === "Concluído"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : pedido.status_producao === "Em Usinagem CNC"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse"
                          : pedido.status_producao === "Aguardando Expedição"
                          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                          : "bg-blue-500/10 text-blue-300 border-blue-500/30"
                      }`}>
                        {pedido.status_producao}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <select
                        value={pedido.status_producao}
                        onChange={(e) => handleUpdateStatus(pedido.id_pedido, e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-[11px] focus:outline-none focus:border-blue-500"
                      >
                        <option value="Em Planejamento">Em Planejamento</option>
                        <option value="Em Usinagem CNC">Em Usinagem CNC</option>
                        <option value="Aguardando Expedição">Aguardando Expedição</option>
                        <option value="Concluído">Concluído</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
