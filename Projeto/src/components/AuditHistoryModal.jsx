import React from 'react';
import { X, History, User, Clock, Shield } from 'lucide-react';
import { getAuditLogs } from '../services/api';

export default function AuditHistoryModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const logs = getAuditLogs();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Trilha de Auditoria e Histórico (RF09)
              </h3>
              <p className="text-xs text-slate-500">
                Registro de alterações, recálculos e flags acionadas em orçamentos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[420px] overflow-y-auto space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition text-xs space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-700">{log.orcamentoId}</span>
                  <span className="font-semibold text-slate-800 px-2 py-0.5 rounded bg-slate-200 text-[10px]">
                    {log.acao}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" /> {log.dataHora}
                </span>
              </div>

              <p className="text-slate-600">{log.detalhes}</p>
              
              <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1">
                <User className="w-3 h-3 text-slate-400" />
                <span>Responsável: <strong className="text-slate-600 font-mono">{log.usuario}</strong></span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition"
          >
            Fechar Auditoria
          </button>
        </div>

      </div>
    </div>
  );
}
