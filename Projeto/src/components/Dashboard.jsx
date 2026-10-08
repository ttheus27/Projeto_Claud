import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  FileText, 
  Eye, 
  Calculator, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  TrendingUp, 
  ArrowRight,
  SlidersHorizontal,
  Plus,
  Trash2,
  Pencil
} from 'lucide-react';
import { calcularCustosOrcamento } from '../services/api';

export default function Dashboard({ 
  orcamentos, 
  onSelectOrcamento, 
  onOpenDrawing, 
  onOpenReports,
  onNewOrcamento,
  onDeleteOrcamento
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [clienteFilter, setClienteFilter] = useState('Todos');

  // Extrai lista única de clientes para filtro
  const clientesList = useMemo(() => {
    const set = new Set(orcamentos.map(o => o.cliente).filter(Boolean));
    return ['Todos', ...Array.from(set)];
  }, [orcamentos]);

  // Filtra os orçamentos conforme pesquisa e seleções
  const filteredOrcamentos = useMemo(() => {
    return orcamentos.filter(item => {
      const searchable = [
        item.codigoPeca,
        item.descricaoPeca,
        item.id || item._id,
        item.cliente
      ].join(' ').toLowerCase();

      const matchSearch = 
        searchable.includes(searchTerm.toLowerCase());
      
      const matchStatus = statusFilter === 'Todos' || item.status === statusFilter;
      const matchCliente = clienteFilter === 'Todos' || item.cliente === clienteFilter;

      return matchSearch && matchStatus && matchCliente;
    });
  }, [orcamentos, searchTerm, statusFilter, clienteFilter]);

  // Cálculos consolidados para os Cards de KPI
  const kpis = useMemo(() => {
    let totalValor = 0;
    let totalOperacoes = 0;
    let aprovadosCount = 0;

    orcamentos.forEach(item => {
      const calc = calcularCustosOrcamento(item);
      totalValor += calc.precoTotalLote;
      totalOperacoes += (item.operacoes || []).length;
      if (item.status === 'Aprovado') aprovadosCount++;
    });

    const taxaAprovacao = orcamentos.length > 0 ? ((aprovadosCount / orcamentos.length) * 100).toFixed(0) : 0;

    return {
      totalOrcamentos: orcamentos.length,
      totalValor,
      totalOperacoes,
      taxaAprovacao
    };
  }, [orcamentos]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Aprovado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Aprovado
          </span>
        );
      case 'Em Análise':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Em Análise
          </span>
        );
      case 'Pendente':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
            Pendente
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Title */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <span>Módulo de Engenharia & Custos</span>
            <span>•</span>
            <span>RF02 Consulta de Orçamentos</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Gestão Integrada de Orçamentos de Usinagem
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Centralização de peças, tempos de ciclo, folhas de processo CNC e precificação para a Schulz S/A.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={onNewOrcamento}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition hover:shadow"
          >
            <Plus className="w-4 h-4" />
            Novo Orçamento
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total em Orçamentos</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
              R$ {kpis.totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> Lotes integrados
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Peças Cadastradas</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
              {kpis.totalOrcamentos}
            </p>
            <span className="text-[11px] text-slate-500 font-medium">Itens de usinagem ativos</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Operações CNC Mapeadas</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
              {kpis.totalOperacoes}
            </p>
            <span className="text-[11px] text-slate-500 font-medium">Torneamento, Fresas, Retífica</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <Calculator className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Taxa de Aprovação</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
              {kpis.taxaAprovacao}%
            </p>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> Índice Comercial
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Filter and Search Bar (RF02) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código da peça, descrição, cliente ou ID do orçamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-none"
            />
          </div>

          {/* Client Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" /> Cliente:
            </span>
            <select
              value={clienteFilter}
              onChange={(e) => setClienteFilter(e.target.value)}
              className="w-full md:w-auto px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none"
            >
              {clientesList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-auto px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none"
            >
              <option value="Todos">Todos os Status</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Em Análise">Em Análise</option>
              <option value="Pendente">Pendente</option>
            </select>
          </div>

        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Mostrando <strong>{filteredOrcamentos.length}</strong> de <strong>{orcamentos.length}</strong> orçamentos</span>
          {(searchTerm || statusFilter !== 'Todos' || clienteFilter !== 'Todos') && (
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('Todos'); setClienteFilter('Todos'); }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Orçamentos Table / Cards List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Orçamento & Peça</th>
                <th className="py-3.5 px-4">Cliente / Unidade</th>
                <th className="py-3.5 px-4">Material / Peso</th>
                <th className="py-3.5 px-4">Lote Padrão</th>
                <th className="py-3.5 px-4 text-right">Custo Unitário</th>
                <th className="py-3.5 px-4 text-right">Preço Final</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrcamentos.map((orcamento) => {
                const calc = calcularCustosOrcamento(orcamento);
                const orcamentoId = orcamento.id || orcamento._id;

                return (
                  <tr 
                    key={orcamentoId}
                    className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                    onClick={() => onSelectOrcamento(orcamento)}
                  >
                    
                    {/* Identification */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <strong className="font-mono font-bold text-slate-900">{orcamentoId}</strong>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                              {orcamento.codigoPeca}
                            </span>
                          </div>
                          <p className="text-slate-600 font-medium text-xs mt-0.5 max-w-xs truncate">
                            {orcamento.descricaoPeca}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Cliente */}
                    <td className="py-4 px-4 text-slate-600">
                      <p className="font-semibold text-slate-800">{orcamento.cliente}</p>
                      <p className="text-[11px] text-slate-400">{orcamento.unidade}</p>
                    </td>

                    {/* Material */}
                    <td className="py-4 px-4 text-slate-600">
                      <p className="font-medium text-slate-800">{orcamento.material}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{orcamento.pesoKg} kg | {orcamento.dureza}</p>
                    </td>

                    {/* Lote */}
                    <td className="py-4 px-4 text-slate-700 font-mono font-semibold">
                      {Number(orcamento.lotePadrao || 0).toLocaleString()} un.
                    </td>

                    {/* Custo Direto */}
                    <td className="py-4 px-4 text-right font-mono text-slate-600">
                      R$ {calc.custoDiretoUnitario.toFixed(2)}
                    </td>

                    {/* Preço Final */}
                    <td className="py-4 px-4 text-right font-mono font-bold text-slate-900">
                      R$ {calc.precoFinalUnitario.toFixed(2)}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      {getStatusBadge(orcamento.status)}
                    </td>

                    {/* Quick Actions */}
                    <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        
                        {/* Desenho Técnico (RF04) */}
                        <button
                          onClick={() => onOpenDrawing(orcamento)}
                          title="Visualizar Desenho Técnico (RF04)"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Cálculo de Custos (RF03) */}
                        <button
                          onClick={() => onSelectOrcamento(orcamento)}
                          title="Editar orçamento"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* Integrador Reports (RF05) */}
                        <button
                          onClick={() => onOpenReports(orcamento)}
                          title="Gerar Relatório Integrador_Reports (RF05)"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                        >
                          <Sparkles className="w-4 h-4 text-indigo-500" />
                        </button>

                        <button
                          onClick={() => onDeleteOrcamento(orcamento)}
                          title="Remover orçamento"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrcamentos.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Search className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold text-slate-600">Nenhum orçamento encontrado</p>
            <p className="text-xs mt-1">Tente ajustar os termos de pesquisa ou filtros selecionados.</p>
          </div>
        )}
      </div>

    </div>
  );
}
