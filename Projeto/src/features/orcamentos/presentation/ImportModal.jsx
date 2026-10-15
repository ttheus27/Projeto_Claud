import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  FileCheck
} from 'lucide-react';

export default function ImportModal({ isOpen, onClose, onImportSuccess }) {
  if (!isOpen) return null;

  const [selectedPreset, setSelectedPreset] = useState('bloco');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  // Pre-sets de importação simulando planilhas de clientes Schulz
  const samplePresets = {
    bloco: {
      nomeArquivo: "Planilha_Orcamento_Bloco_Motor_V6_Schulz.xlsx",
      tamanho: "248 KB",
      cliente: "Schulz Automotiva S/A",
      unidade: "Divisão Motores Diesel & GNV",
      codigoPeca: "SCH-AUT-9050",
      descricaoPeca: "Cabeçote de Cilindro em Alumínio 4 Válvulas",
      material: "Liga AlSi7Mg0.3 T6",
      dureza: "95-115 HB",
      pesoKg: 11.2,
      lotePadrao: 800,
      custoMateriaPrima: 210.00,
      margemLucroPercentual: 24.0,
      impostosPercentual: 14.25,
      centroCusto: "CC-340 (Usinagem de Alumínio e Leves)",
      operacoes: [
        {
          id: "OP-10",
          ordem: 1,
          codigo: "USIN-FRE-09",
          descricao: "Faceamento Superior/Inferior em Centro 5 Eixos",
          centroTrabalho: "Centro Horizontal Grob G550",
          tempoSetupMin: 60,
          tempoCicloMin: 16.5,
          custoHoraMaquina: 280.00,
          custoHoraHomem: 45.00,
          custoFerramentalItem: 22.00,
          zerarCusto: false,
          observacao: "Inserto CBN de altíssima velocidade"
        },
        {
          id: "OP-20",
          ordem: 2,
          codigo: "USIN-GUI-01",
          descricao: "Mandrilamento das Guias e Sedes de Válvulas",
          centroTrabalho: "Centro Horizontal Grob G550",
          tempoSetupMin: 45,
          tempoCicloMin: 12.0,
          custoHoraMaquina: 280.00,
          custoHoraHomem: 45.00,
          custoFerramentalItem: 38.00,
          zerarCusto: false,
          observacao: "Tolerância H7 com acabamento espelhado"
        },
        {
          id: "OP-30",
          ordem: 3,
          codigo: "LAV-IND-01",
          descricao: "Lavagem Industrial Robotizada de Alta Pressão",
          centroTrabalho: "Lavadora BvL Twister",
          tempoSetupMin: 15,
          tempoCicloMin: 3.0,
          custoHoraMaquina: 95.00,
          custoHoraHomem: 30.00,
          custoFerramentalItem: 0.00,
          zerarCusto: true, // Flag zerada de fábrica
          observacao: "Lavagem incluída no pacote de fornecimento de matéria-prima (Custo Zerado)"
        }
      ]
    },
    rotor: {
      nomeArquivo: "Engenharia_Rotor_Compressor_Rotativo_Schulz.xlsx",
      tamanho: "312 KB",
      cliente: "Schulz Compressores S/A",
      unidade: "Divisão Rotores Industriais",
      codigoPeca: "SCH-ROT-3310",
      descricaoPeca: "Par de Rotores Helicoidais Macho/Fêmea 160mm",
      material: "Aço Carbono SAE 1045 Forjado",
      dureza: "220-250 HB",
      pesoKg: 19.5,
      lotePadrao: 250,
      custoMateriaPrima: 340.00,
      margemLucroPercentual: 28.0,
      impostosPercentual: 14.25,
      centroCusto: "CC-310 (Usinagem Pesada CNC)",
      operacoes: [
        {
          id: "OP-10",
          ordem: 1,
          codigo: "USIN-ROT-01",
          descricao: "Fresamento Helicoidal de Rotores em Torno Holroyd",
          centroTrabalho: "Fresadora Especial Holroyd TG350",
          tempoSetupMin: 120,
          tempoCicloMin: 45.0,
          custoHoraMaquina: 350.00,
          custoHoraHomem: 55.00,
          custoFerramentalItem: 65.00,
          zerarCusto: false,
          observacao: "Perfil assimétrico Schulz patenteado"
        }
      ]
    }
  };

  const handleValidateAndImport = async () => {
    setIsValidating(true);
    setValidationResult(null);

    // Simulação do motor de validação de integridade RF07
    await new Promise(resolve => setTimeout(resolve, 800));

    const selectedData = samplePresets[selectedPreset];

    setValidationResult({
      status: 'success',
      totalLinhas: selectedData.operacoes.length + 1,
      inconsistencias: 0,
      dadosValidados: selectedData
    });
    setIsValidating(false);
  };

  const handleConfirmImport = () => {
    if (validationResult && validationResult.dadosValidados) {
      onImportSuccess(validationResult.dadosValidados);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Importação de Planilhas de Orçamento (RF01)
              </h3>
              <p className="text-xs text-slate-500">
                Leitura de arquivos base Schulz e validação de consistência (RF07)
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
        <div className="p-6 space-y-5">
          
          {/* Dropzone Simulation */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-500 transition bg-slate-50/50">
            <UploadCloud className="w-10 h-10 text-blue-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800">
              Selecione o arquivo de orçamento da Schulz (.xlsx, .ods, .csv)
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Simule a importação selecionando um dos modelos abaixo:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-left">
              <div 
                onClick={() => { setSelectedPreset('bloco'); setValidationResult(null); }}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  selectedPreset === 'bloco'
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-200'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-xs text-slate-800">Cabeçote de Cilindro V6</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Schulz Automotiva • 3 operações</p>
              </div>

              <div 
                onClick={() => { setSelectedPreset('rotor'); setValidationResult(null); }}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  selectedPreset === 'rotor'
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-200'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-xs text-slate-800">Rotores Helicoidais 160mm</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Schulz Compressores • Usinagem Especial</p>
              </div>
            </div>

          </div>

          {/* Validation Result Box (RF07) */}
          {validationResult && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Validação de Integridade Concluída com Sucesso (RF07)
              </div>
              <ul className="space-y-1 text-[11px] text-emerald-700 list-disc list-inside">
                <li>Formato de colunas e tipos de dados compatíveis com a base Schulz.</li>
                <li>{validationResult.dadosValidados.operacoes.length} operações identificadas com centros de custo válidos.</li>
                <li>Cálculos de amortização de setup e taxas horárias pré-validados.</li>
              </ul>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancelar
          </button>

          {!validationResult ? (
            <button
              onClick={handleValidateAndImport}
              disabled={isValidating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              {isValidating ? 'Validando Integridade...' : 'Validar Planilha (RF07)'}
            </button>
          ) : (
            <button
              onClick={handleConfirmImport}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
            >
              <FileCheck className="w-4 h-4" />
              Gravar Orçamento na Base
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
