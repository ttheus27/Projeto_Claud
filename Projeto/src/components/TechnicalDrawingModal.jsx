import React from 'react';
import { X, Maximize2, Shield, Eye, Download, Info, CheckCircle2 } from 'lucide-react';

export default function TechnicalDrawingModal({ orcamento, onClose }) {
  if (!orcamento) return null;

  const dwg = orcamento.desenhoTecnico || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                Desenho Técnico & Especificações Dimensionais
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700">
                  {dwg.numero || 'DWG-SCHULZ'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Peça: <span className="text-slate-200 font-medium">{orcamento.descricaoPeca}</span> ({orcamento.codigoPeca})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Drawing Canvas & Metadata */}
        <div className="p-6 space-y-6">
          
          {/* Engineering Drawing Graphic Viewport */}
          <div className="bg-slate-950 rounded-xl border border-blue-900/40 p-4 relative overflow-hidden flex flex-col items-center justify-center min-h-[320px] shadow-inner">
            
            {/* Grid background simulation */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
            
            {/* Drawing SVG Graphic based on part type */}
            <div className="relative z-10 w-full max-w-xl flex items-center justify-center py-4">
              {dwg.svgTipo === 'virabrequim' && (
                <svg viewBox="0 0 500 180" className="w-full h-auto stroke-blue-400 fill-none">
                  {/* Center line */}
                  <line x1="20" y1="90" x2="480" y2="90" stroke="#0284c7" strokeDasharray="6 3" strokeWidth="1" opacity="0.6"/>
                  
                  {/* Shaft main journals and crankpins */}
                  <rect x="40" y="70" width="60" height="40" rx="2" fill="#0369a1" fillOpacity="0.2" strokeWidth="2"/>
                  <path d="M 100 70 L 130 35 L 170 35 L 200 70" strokeWidth="2" fill="#0284c7" fillOpacity="0.1"/>
                  <rect x="130" y="25" width="40" height="25" rx="3" fill="#38bdf8" fillOpacity="0.3" strokeWidth="2"/>
                  <rect x="200" y="70" width="70" height="40" rx="2" fill="#0369a1" fillOpacity="0.2" strokeWidth="2"/>
                  <path d="M 270 110 L 300 145 L 340 145 L 370 110" strokeWidth="2" fill="#0284c7" fillOpacity="0.1"/>
                  <rect x="300" y="130" width="40" height="25" rx="3" fill="#38bdf8" fillOpacity="0.3" strokeWidth="2"/>
                  <rect x="370" y="70" width="80" height="40" rx="2" fill="#0369a1" fillOpacity="0.2" strokeWidth="2"/>
                  
                  {/* Dimensions & annotations */}
                  <line x1="40" y1="165" x2="450" y2="165" stroke="#94a3b8" strokeWidth="1.5"/>
                  <line x1="40" y1="158" x2="40" y2="172" stroke="#94a3b8" strokeWidth="1.5"/>
                  <line x1="450" y1="158" x2="450" y2="172" stroke="#94a3b8" strokeWidth="1.5"/>
                  <text x="245" y="160" fill="#e2e8f0" fontSize="11" textAnchor="middle" fontFamily="monospace">L = 480 ± 0.15 mm</text>
                  
                  <text x="70" y="62" fill="#38bdf8" fontSize="10" textAnchor="middle" fontFamily="monospace">Ø 65 h6</text>
                  <text x="150" y="18" fill="#38bdf8" fontSize="10" textAnchor="middle" fontFamily="monospace">Ø 48 h6</text>
                </svg>
              )}

              {dwg.svgTipo === 'suporte' && (
                <svg viewBox="0 0 400 180" className="w-full h-auto stroke-blue-400 fill-none">
                  <path d="M 60 40 L 340 40 Q 360 40 360 60 L 360 120 Q 360 140 340 140 L 260 140 L 230 110 L 170 110 L 140 140 L 60 140 Q 40 140 40 120 L 40 60 Q 40 40 60 40 Z" strokeWidth="2.5" fill="#0369a1" fillOpacity="0.15"/>
                  <circle cx="90" cy="90" r="18" strokeWidth="2" fill="#0284c7" fillOpacity="0.3"/>
                  <circle cx="310" cy="90" r="18" strokeWidth="2" fill="#0284c7" fillOpacity="0.3"/>
                  <text x="90" y="94" fill="#bae6fd" fontSize="10" textAnchor="middle" fontFamily="monospace">2x M14</text>
                  <text x="310" y="94" fill="#bae6fd" fontSize="10" textAnchor="middle" fontFamily="monospace">2x M14</text>
                  <line x1="60" y1="160" x2="340" y2="160" stroke="#94a3b8" strokeWidth="1.5"/>
                  <text x="200" y="155" fill="#e2e8f0" fontSize="11" textAnchor="middle" fontFamily="monospace">210 mm</text>
                </svg>
              )}

              {(dwg.svgTipo === 'carcaca' || dwg.svgTipo === 'pistao' || !dwg.svgTipo) && (
                <svg viewBox="0 0 400 180" className="w-full h-auto stroke-blue-400 fill-none">
                  <rect x="80" y="30" width="240" height="120" rx="8" strokeWidth="2.5" fill="#0369a1" fillOpacity="0.15"/>
                  <circle cx="150" cy="90" r="32" strokeWidth="2" fill="#0284c7" fillOpacity="0.25"/>
                  <circle cx="250" cy="90" r="32" strokeWidth="2" fill="#0284c7" fillOpacity="0.25"/>
                  <line x1="80" y1="90" x2="320" y2="90" stroke="#0284c7" strokeDasharray="4 2" strokeWidth="1"/>
                  <text x="200" y="165" fill="#e2e8f0" fontSize="11" textAnchor="middle" fontFamily="monospace">Perfil Industrial Schulz</text>
                </svg>
              )}
            </div>

            {/* Stamp / Engineering Watermark */}
            <div className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-500 flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>SKA PLM Certified | ISO 9001 Schulz</span>
            </div>
          </div>

          {/* Technical Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
              <span className="text-[11px] text-slate-400 block font-medium">Revisão do Desenho</span>
              <strong className="text-sm font-semibold text-white">{dwg.revisao || 'Rev. Oficial'}</strong>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
              <span className="text-[11px] text-slate-400 block font-medium">Tolerância Geral</span>
              <strong className="text-sm font-semibold text-blue-300 font-mono">{dwg.toleranciaGeral || 'ISO 2768-mK'}</strong>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
              <span className="text-[11px] text-slate-400 block font-medium">Rugosidade Superficial</span>
              <strong className="text-sm font-semibold text-emerald-300 font-mono">{dwg.rugosidade || 'Ra 0.8 um'}</strong>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
              <span className="text-[11px] text-slate-400 block font-medium">Dimensões Brutas</span>
              <strong className="text-xs font-semibold text-slate-200">{dwg.dimensoes || 'Conforme modelo 3D CAD'}</strong>
            </div>
          </div>

          <div className="bg-blue-950/40 border border-blue-800/50 p-4 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-200">
              <p className="font-semibold text-white mb-0.5">Vínculo Direto ao Módulo de Orçamentos (RF04)</p>
              <p className="opacity-90">
                Os desenhos e especificações técnicas são carregados de forma centralizada pelo banco de dados da Schulz. Qualquer ajuste de tolerância dimensional afeta diretamente o cálculo de tempos de usinagem e seleção de ferramentas CNC.
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Código Schulz: {orcamento.codigoPeca}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
          >
            Fechar Visualizador
          </button>
        </div>

      </div>
    </div>
  );
}
