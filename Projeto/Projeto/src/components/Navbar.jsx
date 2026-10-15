import React from 'react';
import { 
  Layers, 
  LayoutDashboard, 
  FileSpreadsheet, 
  FileText, 
  Sparkles
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  onOpenImport, 
  selectedOrcamento 
}) {
  const selectedId = selectedOrcamento?.id || selectedOrcamento?._id || "Novo";

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center shadow-inner border border-blue-400/30">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-300">
                  Integrador de Orçamentos
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Schulz S/A
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Desenvolvido por <strong className="text-orange-400 font-semibold">SKA Automação de Engenharias</strong>
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Consulta e Orçamentos (RF02)
            </button>

            {selectedOrcamento && (
              <button
                onClick={() => setCurrentTab('detail')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  currentTab === 'detail'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                Cálculo de Custos (RF03)
                <span className="bg-slate-800 text-blue-300 text-[10px] px-1.5 py-0.5 rounded font-mono">
                  {selectedId}
                </span>
              </button>
            )}

            {selectedOrcamento && (
              <button
                onClick={() => setCurrentTab('reports')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  currentTab === 'reports'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Integrador_Reports (RF05)
              </button>
            )}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenImport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Importar dados de planilha Schulz (RF01)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Importar Planilha</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
