import React, { useState } from "react";
import { RefreshCw, Server } from "lucide-react";
import { ORCAMENTO_API_CONFIGURATION } from "../infrastructure/orcamento-gateway";
export default function ApiStatusBanner({ apiInfo, onRefresh, isRefreshing }) {
  const [details, setDetails] = useState(false);
  return <div className="bg-slate-900 border-b border-slate-700 px-4 py-2 text-xs text-slate-300">
    <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2"><Server className="w-4 h-4 text-blue-400" /><strong>API Gateway → BFF → MongoDB Atlas</strong><span>{isRefreshing ? "Consultando..." : apiInfo ? `${apiInfo.status} OK • ${apiInfo.latencyMs}ms` : "Sem confirmação de conexão"}</span></div>
      <div className="flex gap-3"><button onClick={() => setDetails(!details)} className="text-blue-300 underline">{details ? "Ocultar endpoints" : "Ver endpoints CRUD"}</button><button onClick={onRefresh} disabled={isRefreshing} className="flex items-center gap-1 rounded bg-blue-600 px-2 py-1 text-white disabled:opacity-50"><RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />Sincronizar</button></div>
    </div>
    {details && <div className="max-w-7xl mx-auto pt-3 space-y-1 font-mono">
      <p>GET / POST {ORCAMENTO_API_CONFIGURATION.endpoints.listar}</p>
      <p>GET / PUT / DELETE {ORCAMENTO_API_CONFIGURATION.endpoints.atualizar}</p>
      <p>Azure Function: cálculo de custos chamado pelo BFF em /api/aggregated-data.</p>
      <div className="flex flex-wrap gap-4 pt-2"><a href="/api/docs/mongo/" target="_blank" rel="noreferrer" className="text-blue-300 underline">Swagger Orçamentos</a><a href="/api/docs/sql/" target="_blank" rel="noreferrer" className="text-blue-300 underline">Swagger Pedidos</a><a href="/api/docs/bff/" target="_blank" rel="noreferrer" className="text-blue-300 underline">Swagger BFF</a></div>
    </div>}
  </div>;
}
