import React, { useState, useEffect } from "react";
import { 
  Network, 
  Database, 
  Zap, 
  Server, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw, 
  Code2, 
  ShieldCheck,
  Cpu
} from "lucide-react";
import { bffGateway } from "../infrastructure/bff-gateway";

export default function BffAggregatedView() {
  const [aggregated, setAggregated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rawView, setRawView] = useState(false);
  const [statusInfo, setStatusInfo] = useState("");

  const carregarDadosBff = async () => {
    setLoading(true);
    try {
      const res = await bffGateway.fetchAggregatedData();
      setAggregated(res.payload);
      setStatusInfo(`${res.source} (${res.latencyMs}ms)`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDadosBff();
  }, []);

  const nos = aggregated?.nosIntegrados || {};
  const data = aggregated?.data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Topo: Título e Status */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Visão Integrada da Arquitetura Distribuída — BFF Aggregator
              <span className="text-[10px] uppercase tracking-wider font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                GET /aggregated-data
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Agregação paralela: <strong className="text-slate-300">MS1 (Mongo) + MS2 (Azure SQL) + Azure Function (Serverless)</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRawView(!rawView)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Code2 className="w-3.5 h-3.5 text-blue-400" />
            {rawView ? "Visualizar Gráfico" : "Ver JSON Bruto"}
          </button>

          <button
            onClick={carregarDadosBff}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Requisitar BFF
          </button>
        </div>
      </div>

      {/* Topologia dos 3 Nós da Arquitetura */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Nó 1: MongoDB Atlas */}
        <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Database className="w-4 h-4" />
              Microserviço 1 (MongoDB)
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Porta 3001
            </span>
          </div>
          <p className="text-sm font-semibold text-white">Domínio de Orçamentos & Peças</p>
          <p className="text-xs text-slate-400 mt-1">Coleção: <code className="text-slate-300 font-mono">schulz.orcamentos</code></p>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>Status: <strong className="text-emerald-400 font-mono">200 OK (Ativo)</strong></span>
            <span>Itens: <strong className="text-white font-mono">{data.resumoGeral?.totalOrcamentosCadastrados || 3}</strong></span>
          </div>
        </div>

        {/* Nó 2: Azure SQL Database */}
        <div className="bg-slate-900 border border-blue-500/30 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              Microserviço 2 (Azure SQL)
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/30">
              Porta 3002
            </span>
          </div>
          <p className="text-sm font-semibold text-white">Domínio de Pedidos & Ordens</p>
          <p className="text-xs text-slate-400 mt-1">Tabela: <code className="text-slate-300 font-mono">TB_PEDIDOS</code></p>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>Status: <strong className="text-blue-400 font-mono">200 OK (Ativo)</strong></span>
            <span>Ordens: <strong className="text-white font-mono">{data.resumoGeral?.totalOrdensProducaoSQL || 2}</strong></span>
          </div>
        </div>

        {/* Nó 3: Azure Function Serverless */}
        <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-purple-500"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              Azure Function (Serverless)
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/30">
              HTTP Trigger
            </span>
          </div>
          <p className="text-sm font-semibold text-white">Cálculo & Enriquecimento</p>
          <p className="text-xs text-slate-400 mt-1">Função: <code className="text-slate-300 font-mono">GetOrcamentos / Enrich</code></p>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>Status: <strong className="text-purple-400 font-mono">Ativo</strong></span>
            <span>Margem: <strong className="text-white font-mono">Validada</strong></span>
          </div>
        </div>

      </div>

      {/* Conteúdo: Visualização Gráfica ou JSON Bruto */}
      {rawView ? (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-inner">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <span className="text-xs font-mono text-slate-400">Resposta HTTP 200 OK — GET /api/aggregated-data</span>
            <span className="text-xs font-mono text-emerald-400">{statusInfo}</span>
          </div>
          <pre className="text-xs font-mono text-emerald-300 overflow-x-auto max-h-[500px] p-2 leading-relaxed">
            {JSON.stringify(aggregated, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card Esquerda: Orçamento Selecionado do Mongo */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Item Consolidado do MongoDB Atlas</h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
                {data.orcamentoAtivo?.id || "ORC-2026-0891"}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Peça Industrial:</span>
                <span className="text-white font-semibold">{data.orcamentoAtivo?.descricaoPeca}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Código Fabricante:</span>
                <span className="text-white font-mono">{data.orcamentoAtivo?.codigoPeca}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Cliente Destino:</span>
                <span className="text-white">{data.orcamentoAtivo?.cliente}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Lote Padrão de Fabricação:</span>
                <span className="text-white font-mono">{data.orcamentoAtivo?.lotePadrao} peças</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Custo Matéria-Prima:</span>
                <span className="text-white font-mono">
                  {Number(data.orcamentoAtivo?.custoMateriaPrima || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>
            </div>

            {/* Operações com Flag Zerar Custo */}
            <div>
              <p className="text-xs font-semibold text-slate-300 mb-2">Operações CNC Vinculadas (Folha de Processo):</p>
              <div className="space-y-1.5">
                {(data.orcamentoAtivo?.operacoes || []).map((op, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-slate-800/60 px-3 py-2 rounded border border-slate-700/40">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 text-[11px]">{op.codigo}</span>
                      <span className="text-slate-200">{op.descricao}</span>
                    </div>
                    {op.zerarCusto ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Custo Zerado (RF03)
                      </span>
                    ) : (
                      <span className="font-mono text-emerald-400 text-[11px]">
                        R$ {Number(op.custoEfetivo || 195).toFixed(2)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card Direita: Pedidos do SQL + Enriquecimento Serverless */}
          <div className="space-y-4">
            
            {/* Pedidos do Azure SQL */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Ordens de Produção (Azure SQL — TB_PEDIDOS)</h3>
                </div>
                <span className="text-[11px] font-mono text-blue-400">
                  {data.pedidosAssociados?.length || 1} ordem(ns)
                </span>
              </div>

              <div className="space-y-2">
                {(data.pedidosAssociados || []).map((ped, idx) => (
                  <div key={idx} className="bg-slate-800/60 border border-slate-700/40 p-3 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <p className="font-mono font-bold text-blue-300">{ped.id_pedido}</p>
                      <p className="text-[11px] text-slate-400">Entrega: {ped.data_entrega_prevista || "2026-12-15"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-emerald-400">
                        {Number(ped.valor_total).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                      <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                        {ped.status_producao}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enriquecimento Serverless */}
            <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Enriquecimento Serverless (Azure Function)</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-800/60 p-2.5 rounded border border-slate-700/40">
                  <span className="text-slate-400 text-[11px]">Índice de Aprovação:</span>
                  <p className="font-bold text-purple-300 font-mono mt-0.5">
                    {data.enriquecimentoServerless?.indiceAprovacaoDiretoria || "APROVADO_DIRETORIA"}
                  </p>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded border border-slate-700/40">
                  <span className="text-slate-400 text-[11px]">Taxa Risco Logística:</span>
                  <p className="font-bold text-white font-mono mt-0.5">
                    {data.enriquecimentoServerless?.taxaRiscoLogistica || 1.025} (+2.5%)
                  </p>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded border border-slate-700/40">
                  <span className="text-slate-400 text-[11px]">Alíquota Efetiva:</span>
                  <p className="font-bold text-white font-mono mt-0.5">
                    {(Number(data.enriquecimentoServerless?.aliquotaTributariaEfetiva || 0.165) * 100).toFixed(1)}% (ICMS/PIS/COFINS)
                  </p>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded border border-slate-700/40">
                  <span className="text-slate-400 text-[11px]">Timestamp Serverless:</span>
                  <p className="font-mono text-[10px] text-slate-300 truncate mt-0.5">
                    {data.enriquecimentoServerless?.dataCalculo?.substring(11, 19) || "Agora"}
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
