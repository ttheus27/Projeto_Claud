import React, { useState } from 'react';
import { Cloud, RefreshCw, Database, Server, Terminal } from 'lucide-react';
import { ENDPOINTS_CONFIG } from '../services/api';

export default function ApiStatusBanner({ apiInfo, onRefresh, isRefreshing }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-blue-900/50 text-slate-300 text-xs py-2 px-4 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Endpoint Connection Status */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Azure Functions CRUD
          </span>

          <div className="flex items-center gap-1 font-mono text-[11px] text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700/60">
            <Server className="w-3 h-3 text-blue-400" />
            <span className="text-blue-300">GET</span>
            <span className="text-slate-400 truncate max-w-xs md:max-w-md">
              {ENDPOINTS_CONFIG.azureFunctionGetOrcamentos}
            </span>
          </div>

          {apiInfo && (
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Latência: <strong className="text-slate-200 font-mono">{apiInfo.latencyMs}ms</strong> | Status: <strong className="text-emerald-400 font-mono">200 OK</strong>
            </span>
          )}
        </div>

        {/* Right: Actions and endpoint details */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-[11px] text-blue-300 hover:text-blue-200 underline flex items-center gap-1"
          >
            <Terminal className="w-3 h-3" />
            {showDetails ? 'Ocultar Arquitetura' : 'Ver Endpoints CRUD'}
          </button>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] transition shadow disabled:opacity-50"
            title="Recarregar dados da Azure Function"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sincronizar</span>
          </button>
        </div>

      </div>

      {/* Expanded API Architecture Info */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-slate-800 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300 bg-slate-900/90 p-3 rounded-lg border">
          <div>
            <h4 className="font-semibold text-blue-300 flex items-center gap-1.5 mb-1 text-xs">
              <Cloud className="w-3.5 h-3.5 text-blue-400" />
              1. Azure Functions (Backend Serverless)
            </h4>
            <p className="text-[11px] text-slate-400 mb-1">
              Quatro endpoints HTTP para criar, consultar, editar e remover orçamentos:
            </p>
            <code className="text-[10px] block p-1.5 rounded bg-slate-950 font-mono text-emerald-300 border border-slate-800 truncate">
              GET {ENDPOINTS_CONFIG.azureFunctionGetOrcamentos}
            </code>
            <code className="text-[10px] block p-1.5 mt-1 rounded bg-slate-950 font-mono text-emerald-300 border border-slate-800 truncate">
              POST {ENDPOINTS_CONFIG.azureFunctionCreateOrcamento}
            </code>
            <code className="text-[10px] block p-1.5 mt-1 rounded bg-slate-950 font-mono text-emerald-300 border border-slate-800 truncate">
              PUT {ENDPOINTS_CONFIG.azureFunctionUpdateOrcamento}
            </code>
            <code className="text-[10px] block p-1.5 mt-1 rounded bg-slate-950 font-mono text-emerald-300 border border-slate-800 truncate">
              DELETE {ENDPOINTS_CONFIG.azureFunctionDeleteOrcamento}
            </code>
          </div>

          <div>
            <h4 className="font-semibold text-emerald-300 flex items-center gap-1.5 mb-1 text-xs">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              2. MongoDB Atlas
            </h4>
            <p className="text-[11px] text-slate-400 mb-1">
              Os orçamentos agora são persistidos no Atlas pelas Azure Functions. Centros de custo permanecem como dados de consumo na aplicação.
            </p>
            <code className="text-[10px] block p-1.5 rounded bg-slate-950 font-mono text-amber-300 border border-slate-800 truncate">
              Provider: {ENDPOINTS_CONFIG.currentProvider}
            </code>
          </div>
        </div>
      )}
    </div>
  );
}
