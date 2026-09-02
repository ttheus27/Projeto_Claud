import React from 'react';
import { 
  Printer, 
  Download, 
  ArrowLeft, 
  FileText, 
  CheckCircle, 
  Building, 
  ShieldCheck,
  Share2,
  Calendar,
  Layers
} from 'lucide-react';
import { calcularCustosOrcamento } from '../services/api';

export default function IntegradorReports({ orcamento, onBack }) {
  if (!orcamento) return null;

  const calc = calcularCustosOrcamento(orcamento);
  const dataHoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const reportPayload = {
      modulo: "Integrador_Reports_v2.6",
      cliente: orcamento.cliente,
      orcamentoId: orcamento.id,
      codigoPeca: orcamento.codigoPeca,
      descricaoPeca: orcamento.descricaoPeca,
      emissao: new Date().toISOString(),
      centroCusto: orcamento.centroCusto,
      calculoCustos: calc,
      operacoes: orcamento.operacoes
    };

    const blob = new Blob([JSON.stringify(reportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Relatorio_Integrador_${orcamento.id}_${orcamento.codigoPeca}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      
      {/* Top Action Bar (hidden when printing) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
            title="Voltar"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Módulo Integrador_Reports (RF05)</span>
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                Proposta Comercial Oficial
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Documento formal para homologação técnica e decisão comercial da Schulz S/A
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Exportar dados integrados para outros sistemas (RF10)"
          >
            <Download className="w-4 h-4 text-slate-600" />
            Exportar JSON (RF10)
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            Imprimir / Gerar PDF
          </button>
        </div>
      </div>

      {/* Official Report Document Body (A4 Style) */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-lg p-8 sm:p-12 space-y-8 text-slate-800">
        
        {/* Document Header with Corporate Logos */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b-2 border-slate-900 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-900 flex items-center justify-center text-white font-extrabold text-xl shadow">
                S
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                  SCHULZ S/A
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Divisão de Usinagem, Compressores & Autopeças
                </p>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="inline-block bg-slate-100 px-3 py-1 rounded text-xs font-mono font-bold text-slate-800 border border-slate-200">
              ORÇAMENTO Nº {orcamento.id}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center sm:justify-end gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /> Emissão: {dataHoje}
            </p>
            <p className="text-[11px] text-slate-400">
              Sistema: Integrador de Orçamentos — SKA
            </p>
          </div>
        </div>

        {/* Section 1: Customer & Product Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200 text-xs">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-600" /> Dados do Cliente & Unidade
            </h4>
            <p><strong className="text-slate-600">Razão Social:</strong> {orcamento.cliente}</p>
            <p><strong className="text-slate-600">Unidade Operacional:</strong> {orcamento.unidade}</p>
            <p><strong className="text-slate-600">Responsável Técnico:</strong> {orcamento.responsavel}</p>
            <p><strong className="text-slate-600">Centro de Custo:</strong> {orcamento.centroCusto}</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" /> Especificação do Item
            </h4>
            <p><strong className="text-slate-600">Código da Peça:</strong> <span className="font-mono font-semibold">{orcamento.codigoPeca}</span></p>
            <p><strong className="text-slate-600">Descrição:</strong> {orcamento.descricaoPeca}</p>
            <p><strong className="text-slate-600">Material:</strong> {orcamento.material} ({orcamento.dureza})</p>
            <p><strong className="text-slate-600">Lote de Fabricação:</strong> <span className="font-mono font-bold">{orcamento.lotePadrao.toLocaleString()} unidades</span></p>
          </div>
        </div>

        {/* Section 2: Machining Operations Breakdown Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Demonstrativo de Operações & Tempos de Usinagem
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Seq.</th>
                  <th className="py-2.5 px-3">Operação / Descrição</th>
                  <th className="py-2.5 px-3">Centro de Trabalho</th>
                  <th className="py-2.5 px-3 text-right">Setup (min)</th>
                  <th className="py-2.5 px-3 text-right">Ciclo (min)</th>
                  <th className="py-2.5 px-3 text-right">Subtotal Unit.</th>
                  <th className="py-2.5 px-3 text-center">Status Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {calc.operacoesDetalhadas.map((op, idx) => (
                  <tr key={op.id || idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-500">{op.id}</td>
                    <td className="py-2 px-3 font-sans font-medium text-slate-900">{op.descricao}</td>
                    <td className="py-2 px-3 font-sans text-slate-600">{op.centroTrabalho}</td>
                    <td className="py-2 px-3 text-right text-slate-700">{op.tempoSetupMin}</td>
                    <td className="py-2 px-3 text-right text-slate-700">{op.tempoCicloMin.toFixed(1)}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      R$ {op.custoEfetivo.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-center font-sans">
                      {op.zerarCusto ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                          Custo Zerado (Flag)
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Padrão</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Cost & Commercial Pricing Synthesis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
          
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Composição de Tempos & Custos Diretos
            </h4>
            <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-600 font-sans">Tempo Total de Ciclo CNC:</span>
                <span className="font-bold">{calc.totalTempoCicloMin.toFixed(1)} min/peça</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-sans">Matéria-Prima Unitária:</span>
                <span>R$ {calc.materiaPrima.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-sans">Total de Usinagem & Mão de Obra:</span>
                <span>R$ {calc.totalUsinagemPeca.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-300 font-bold text-slate-900">
                <span className="font-sans">Custo Direto de Fabricação:</span>
                <span>R$ {calc.custoDiretoUnitario.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Precificação Comercial & Condições
            </h4>
            <div className="space-y-2 bg-blue-50 p-4 rounded-xl border border-blue-200 font-mono text-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-600 font-sans">Margem de Lucro Industrial:</span>
                <span className="font-semibold text-emerald-700">{orcamento.margemLucroPercentual}% (+ R$ {calc.valorLucroUnitario.toFixed(2)})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-sans">Impostos e Tributos (ICMS/PIS/COFINS):</span>
                <span>{orcamento.impostosPercentual}% (+ R$ {calc.valorImpostosUnitario.toFixed(2)})</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-blue-300 text-sm font-bold text-blue-950">
                <span className="font-sans">Preço Unitário Homologado:</span>
                <span>R$ {calc.precoFinalUnitario.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-blue-900 pt-1">
                <span className="font-sans">Valor Total do Lote ({calc.lote} un.):</span>
                <span>R$ {calc.precoTotalLote.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Section 4: Signatures and Validation */}
        <div className="pt-10 border-t border-slate-200 grid grid-cols-2 gap-12 text-center text-xs">
          <div>
            <div className="border-b border-slate-400 pb-1 mb-2 font-semibold text-slate-800">
              {orcamento.responsavel}
            </div>
            <p className="text-slate-500">Engenharia de Processos & Orçamentos Schulz</p>
          </div>

          <div>
            <div className="border-b border-slate-400 pb-1 mb-2 font-semibold text-slate-800">
              SKA Automação de Engenharias Ltda
            </div>
            <p className="text-slate-500">Validação Integrador de Orçamentos v2.6</p>
          </div>
        </div>

      </div>

    </div>
  );
}
