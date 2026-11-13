import React, { useEffect, useState } from "react";
import { RefreshCw, Network } from "lucide-react";
import { bffGateway } from "../infrastructure/bff-gateway";

const nodes = [
  ["microservico1Mongo", "Microserviço 1 — Orçamentos", "MongoDB Atlas"],
  ["microservico2Sql", "Microserviço 2 — Pedidos", "Azure SQL Database"],
  ["azureFunctionServerless", "Azure Function", "Cálculo e enriquecimento"],
];
const currency = value => Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export default function BffAggregatedView() {
  const [aggregated, setAggregated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [raw, setRaw] = useState(false);
  const [error, setError] = useState("");
  const [source, setSource] = useState("");
  const load = async () => {
    setLoading(true); setError("");
    try { const result = await bffGateway.fetchAggregatedData(); setAggregated(result.payload); setSource(`${result.source} (${result.latencyMs}ms)`); }
    catch (error) { setError(error.message); setAggregated(null); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const data = aggregated?.data;
  const enrichment = data?.enriquecimentoServerless;
  return <div className="space-y-5">
    <div className="rounded-xl bg-slate-900 p-5 text-slate-200 flex flex-wrap justify-between items-center gap-4">
      <div><h1 className="text-lg font-bold flex items-center gap-2"><Network className="w-5 h-5 text-blue-400" />Visão integrada — BFF</h1><p className="mt-1 text-xs text-slate-400">Frontend → API Gateway → BFF → microserviços + Azure Function</p><p className="mt-1 text-xs">{source}</p></div>
      <div className="flex gap-3"><button onClick={() => setRaw(!raw)} className="rounded bg-slate-700 px-3 py-2 text-xs">{raw ? "Visualizar resumo" : "Ver JSON Bruto"}</button><button onClick={load} disabled={loading} className="rounded bg-blue-600 px-3 py-2 text-xs flex gap-2 items-center disabled:opacity-50"><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />Requisitar BFF</button></div>
    </div>
    {loading && <p role="status" className="text-sm text-slate-600">Consultando os serviços e calculando os custos...</p>}
    {error && <p role="alert" className="rounded-lg bg-red-950 p-4 text-sm text-red-200">{error}</p>}
    {aggregated?.status === "partial" && <div role="alert" className="rounded-lg bg-amber-100 p-4 text-sm text-amber-900">Resposta parcial: {aggregated.errors.map(item => item.error).join(" ")}</div>}
    <div className="grid gap-4 md:grid-cols-3">{nodes.map(([key, title, label]) => {
      const node = aggregated?.nosIntegrados?.[key];
      return <div key={key} className="rounded-xl bg-slate-900 border border-slate-700 p-5 text-slate-200"><h2 className="font-bold text-sm">{title}</h2><p className="text-xs text-slate-400 mt-2">{label}</p><p className={`mt-3 font-semibold text-sm ${node?.status === "online" ? "text-emerald-400" : "text-amber-400"}`}>{node?.status === "online" ? "Online" : node?.status === "offline" ? "Indisponível" : "Aguardando consulta"}</p></div>;
    })}</div>
    {aggregated && (raw ? <pre className="max-h-[650px] overflow-auto rounded-xl bg-slate-950 p-5 text-xs text-emerald-300">{JSON.stringify(aggregated, null, 2)}</pre> : <>
      <div className="grid gap-4 md:grid-cols-3">{[["Orçamentos", data.resumoGeral.totalOrcamentosCadastrados], ["Pedidos", data.resumoGeral.totalOrdensProducaoSQL], ["Valor dos pedidos", currency(data.resumoGeral.valorTotalOrdensSQL)]].map(([label, value]) => <div key={label} className="rounded-xl bg-white border p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-xl font-bold">{value}</p></div>)}</div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl bg-slate-900 p-5 text-slate-200"><h2 className="font-bold">Orçamento consultado no Atlas</h2>{data.orcamentoAtivo ? <div className="mt-3 space-y-2 text-sm"><p>{data.orcamentoAtivo.id}</p><p>{data.orcamentoAtivo.descricaoPeca}</p><p>{data.orcamentoAtivo.cliente}</p><p>Lote: {data.orcamentoAtivo.lotePadrao}</p><p>Pedidos relacionados: {data.pedidosAssociados.length}</p></div> : <p className="mt-3 text-sm text-slate-400">Nenhum orçamento disponível.</p>}</section>
        <section className="rounded-xl bg-slate-900 p-5 text-slate-200"><h2 className="font-bold">Resultado da Azure Function</h2>{enrichment ? <div className="mt-3 space-y-2 text-sm"><p>Preço do lote: {currency(enrichment.precoTotalLote)}</p><p>Preço unitário: {currency(enrichment.custos?.precoFinalUnitario)}</p><p>Impostos: {(enrichment.aliquotaTributariaEfetiva * 100).toFixed(2)}%</p><p>Data do cálculo: {new Date(enrichment.dataCalculo).toLocaleString("pt-BR")}</p></div> : <p className="mt-3 text-sm text-amber-300">Cálculo indisponível.</p>}</section>
      </div>
    </>)}
  </div>;
}
