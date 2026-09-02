import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Eye, 
  Sparkles, 
  Calculator, 
  DollarSign, 
  Clock, 
  Layers, 
  Info, 
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  Percent,
  Cpu
} from 'lucide-react';
import { calcularCustosOrcamento } from '../services/api';
import { CENTROS_DE_CUSTO } from '../data/mockData';

export default function OrcamentoDetail({ 
  orcamento, 
  onSave, 
  onBack, 
  onOpenDrawing, 
  onOpenReports 
}) {
  const [formData, setFormData] = useState(JSON.parse(JSON.stringify(orcamento)));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(JSON.parse(JSON.stringify(orcamento)));
  }, [orcamento]);

  // Cálculos reativos instantâneos
  const calculations = calcularCustosOrcamento(formData);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOperationChange = (index, field, value) => {
    setFormData(prev => {
      const ops = [...prev.operacoes];
      ops[index] = {
        ...ops[index],
        [field]: value
      };
      return {
        ...prev,
        operacoes: ops
      };
    });
  };

  // Toggle da flag RF03: Zerar Custo de Usinagem
  const toggleZerarCusto = (index) => {
    setFormData(prev => {
      const ops = [...prev.operacoes];
      ops[index] = {
        ...ops[index],
        zerarCusto: !ops[index].zerarCusto
      };
      return {
        ...prev,
        operacoes: ops
      };
    });
  };

  const handleAddOperation = () => {
    const newOp = {
      id: `OP-${(formData.operacoes.length + 1) * 10}`,
      ordem: formData.operacoes.length + 1,
      codigo: 'USIN-NOVA-01',
      descricao: 'Nova Operação de Usinagem CNC',
      centroTrabalho: 'Centro de Usinagem 3 Eixos',
      tempoSetupMin: 30,
      tempoCicloMin: 5.0,
      custoHoraMaquina: 180.00,
      custoHoraHomem: 40.00,
      custoFerramentalItem: 5.00,
      zerarCusto: false,
      observacao: 'Inserido pelo operador de orçamentos'
    };

    setFormData(prev => ({
      ...prev,
      operacoes: [...prev.operacoes, newOp]
    }));
  };

  const handleRemoveOperation = (index) => {
    setFormData(prev => {
      const ops = prev.operacoes.filter((_, i) => i !== index);
      return {
        ...prev,
        operacoes: ops
      };
    });
  };

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData, "Atualização de parâmetros de usinagem e operações");
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSaveSubmit} className="space-y-6 pb-12">
      
      {/* Top Action Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
            title="Voltar para a listagem"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {formData.id}
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                {formData.descricaoPeca}
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Cliente: <strong className="text-slate-700">{formData.cliente}</strong> • Código Schulz: <span className="font-mono">{formData.codigoPeca}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          
          <button
            type="button"
            onClick={() => onOpenDrawing(formData)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <Eye className="w-4 h-4 text-blue-600" />
            Desenho Técnico (RF04)
          </button>

          <button
            type="button"
            onClick={() => onOpenReports(formData)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Relatório Formal (RF05)
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Salvando...' : 'Salvar Orçamento'}
          </button>

        </div>

      </div>

      {/* Summary Cost Breakdown Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Matéria-Prima</span>
          <span className="text-sm font-extrabold font-mono text-slate-800">
            R$ {Number(formData.custoMateriaPrima).toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">por unidade</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Usinagem CNC</span>
          <span className="text-sm font-extrabold font-mono text-blue-600">
            R$ {calculations.totalUsinagemPeca.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">soma operações</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Custo Direto Total</span>
          <span className="text-sm font-extrabold font-mono text-slate-900">
            R$ {calculations.custoDiretoUnitario.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">MP + Usinagem</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Margem Lucro</span>
          <span className="text-sm font-extrabold font-mono text-emerald-600">
            {formData.margemLucroPercentual}%
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">+ R$ {calculations.valorLucroUnitario.toFixed(2)}</span>
        </div>

        <div className="bg-blue-900 text-white p-3.5 rounded-xl border border-blue-950 shadow-md">
          <span className="text-[10px] uppercase font-bold text-blue-300 block tracking-wider">Preço Unitário</span>
          <span className="text-base font-extrabold font-mono text-white">
            R$ {calculations.precoFinalUnitario.toFixed(2)}
          </span>
          <span className="text-[10px] text-blue-200 block mt-0.5">com impostos</span>
        </div>

        <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-950 shadow-md">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total do Lote</span>
          <span className="text-base font-extrabold font-mono text-emerald-400">
            R$ {calculations.precoTotalLote.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">{calculations.lote} unidades</span>
        </div>

      </div>

      {/* General Information & Cost Parameters */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
          <Layers className="w-4 h-4 text-blue-600" />
          1. Parâmetros Gerais da Peça e Lote (RF06)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Descrição da Peça</label>
            <input
              type="text"
              value={formData.descricaoPeca}
              onChange={(e) => handleFieldChange('descricaoPeca', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Código Schulz / Desenho</label>
            <input
              type="text"
              value={formData.codigoPeca}
              onChange={(e) => handleFieldChange('codigoPeca', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none font-mono text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Material Especificado</label>
            <input
              type="text"
              value={formData.material}
              onChange={(e) => handleFieldChange('material', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Centro de Custo Responsável</label>
            <select
              value={formData.centroCusto}
              onChange={(e) => handleFieldChange('centroCusto', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none font-medium text-slate-800"
            >
              {CENTROS_DE_CUSTO.map(cc => (
                <option key={cc.codigo} value={`${cc.codigo} (${cc.nome})`}>
                  {cc.codigo} - {cc.nome} (R$ {cc.taxaHoraMedia}/h)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Tamanho do Lote Padrão (un.)</label>
            <input
              type="number"
              min="1"
              value={formData.lotePadrao}
              onChange={(e) => handleFieldChange('lotePadrao', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none font-mono text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Custo Matéria-Prima (R$/un.)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.custoMateriaPrima}
              onChange={(e) => handleFieldChange('custoMateriaPrima', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none font-mono text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Margem de Lucro Desejada (%)</label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={formData.margemLucroPercentual}
              onChange={(e) => handleFieldChange('margemLucroPercentual', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none font-mono text-emerald-700 font-semibold"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Alíquota de Impostos (%)</label>
            <input
              type="number"
              step="0.25"
              min="0"
              value={formData.impostosPercentual}
              onChange={(e) => handleFieldChange('impostosPercentual', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none font-mono text-slate-700"
            />
          </div>

        </div>

      </div>

      {/* Operations and Machining Cost Calculator (RF03) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              2. Folha de Processos de Usinagem & Custos de Operação (RF03)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Utilize a flag <strong>"Zerar Custo"</strong> para operações bonificadas, retrabalho interno ou garantia de processo.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddOperation}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar Operação
          </button>
        </div>

        {/* Operations List */}
        <div className="space-y-4">
          {calculations.operacoesDetalhadas.map((op, index) => {
            const isZeroed = Boolean(op.zerarCusto);

            return (
              <div 
                key={op.id || index}
                className={`p-4 rounded-xl border transition-all ${
                  isZeroed 
                    ? 'bg-amber-50/50 border-amber-300 shadow-sm' 
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                
                {/* Header of Operation Item */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                      {op.id || `OP-${(index+1)*10}`}
                    </span>
                    <input
                      type="text"
                      value={op.descricao}
                      onChange={(e) => handleOperationChange(index, 'descricao', e.target.value)}
                      placeholder="Descrição da operação de usinagem"
                      className="text-xs font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none min-w-[260px]"
                    />
                  </div>

                  {/* Flag Zerar Custo (RF03 Core Feature) */}
                  <div className="flex items-center gap-3">
                    
                    <button
                      type="button"
                      onClick={() => toggleZerarCusto(index)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition ${
                        isZeroed
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                      }`}
                      title="Clique para alternar a flag de zeramento de custo (RF03)"
                    >
                      {isZeroed ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-white" />
                          <span>Flag: Custo Zerado (RF03)</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-slate-400" />
                          <span>Custo Padrão</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveOperation(index)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                      title="Excluir operação"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>

                </div>

                {/* Operation Input Fields & Calculations */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-3 text-xs">
                  
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Centro / Máquina</label>
                    <input
                      type="text"
                      value={op.centroTrabalho}
                      onChange={(e) => handleOperationChange(index, 'centroTrabalho', e.target.value)}
                      className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 focus:border-blue-500 outline-none text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Setup (min)</label>
                    <input
                      type="number"
                      min="0"
                      value={op.tempoSetupMin}
                      onChange={(e) => handleOperationChange(index, 'tempoSetupMin', Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 focus:border-blue-500 outline-none font-mono text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Ciclo Unit. (min)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={op.tempoCicloMin}
                      onChange={(e) => handleOperationChange(index, 'tempoCicloMin', Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 focus:border-blue-500 outline-none font-mono text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Taxa Máq. (R$/h)</label>
                    <input
                      type="number"
                      min="0"
                      value={op.custoHoraMaquina}
                      onChange={(e) => handleOperationChange(index, 'custoHoraMaquina', Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 focus:border-blue-500 outline-none font-mono text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Ferramentas (R$/un.)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={op.custoFerramentalItem}
                      onChange={(e) => handleOperationChange(index, 'custoFerramentalItem', Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 focus:border-blue-500 outline-none font-mono text-slate-800"
                    />
                  </div>

                  {/* Effective Cost Result */}
                  <div className="bg-white p-2 rounded-lg border border-slate-200 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Subtotal Operação</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`font-mono font-bold text-sm ${isZeroed ? 'line-through text-slate-400' : 'text-blue-700'}`}>
                        R$ {op.subtotalNominal.toFixed(2)}
                      </span>
                      {isZeroed && (
                        <span className="font-mono font-bold text-sm text-amber-600">
                          R$ 0,00
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Observation / Justification */}
                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center gap-2 text-[11px]">
                  <span className="text-slate-400 font-medium">Nota técnica:</span>
                  <input
                    type="text"
                    value={op.observacao || ''}
                    onChange={(e) => handleOperationChange(index, 'observacao', e.target.value)}
                    placeholder="Ex: Inserto específico, motivo do zeramento ou observação operacional"
                    className="flex-1 bg-transparent border-none text-slate-600 focus:ring-0 text-[11px] placeholder:text-slate-400 outline-none"
                  />
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </form>
  );
}
