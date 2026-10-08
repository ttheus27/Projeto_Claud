import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ApiStatusBanner from './components/ApiStatusBanner';
import Dashboard from './components/Dashboard';
import OrcamentoDetail from './components/OrcamentoDetail';
import IntegradorReports from './components/IntegradorReports';
import TechnicalDrawingModal from './components/TechnicalDrawingModal';
import ImportModal from './components/ImportModal';
import Toast from './components/Toast';
import { 
  fetchOrcamentosAzureFunction, 
  updateOrcamento, 
  createOrcamento,
  deleteOrcamento
} from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [orcamentos, setOrcamentos] = useState([]);
  const [selectedOrcamento, setSelectedOrcamento] = useState(null);
  const [drawingOrcamento, setDrawingOrcamento] = useState(null);
  
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [apiInfo, setApiInfo] = useState(null);
  const [isLoadingApi, setIsLoadingApi] = useState(true);

  const showToast = (title, message, type = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const getOrcamentoId = (orcamento) => orcamento?.id || orcamento?._id;

  // Carregamento inicial via Azure Function (GET)
  const loadOrcamentos = async (showFeedback = false) => {
    setIsLoadingApi(true);
    try {
      const response = await fetchOrcamentosAzureFunction();
      setOrcamentos(response.data);
      setApiInfo(response);

      // Se houver um selecionado, atualiza a referência
      if (selectedOrcamento) {
        const selectedId = getOrcamentoId(selectedOrcamento);
        const found = response.data.find(o => getOrcamentoId(o) === selectedId);
        if (found) setSelectedOrcamento(found);
      }

      if (showFeedback) {
        showToast(
          "Azure Function Sincronizada",
          `GET /api/GetOrcamentos carregou os dados do MongoDB Atlas (${response.latencyMs}ms).`,
          "success"
        );
      }
    } catch (err) {
      showToast("Erro na Conexão", "Não foi possível sincronizar com o backend.", "error");
    } finally {
      setIsLoadingApi(false);
    }
  };

  useEffect(() => {
    loadOrcamentos();
  }, []);

  const handleSelectOrcamento = (orcamento) => {
    setSelectedOrcamento(orcamento);
    setCurrentTab('detail');
  };

  const handleOpenReports = (orcamento) => {
    setSelectedOrcamento(orcamento);
    setCurrentTab('reports');
  };

  const handleSaveOrcamento = async (updatedData) => {
    try {
      const isExisting = Boolean(getOrcamentoId(updatedData));
      const saved = isExisting
        ? await updateOrcamento(updatedData)
        : await createOrcamento(updatedData);

      setSelectedOrcamento(saved);
      await loadOrcamentos(false);
      showToast(
        isExisting ? "Orçamento Salvo e Recalculado" : "Orçamento Criado",
        `O item ${saved.codigoPeca} foi ${isExisting ? "atualizado" : "gravado"} no MongoDB Atlas.`,
        "success"
      );
    } catch (err) {
      showToast("Erro ao Salvar", err.message, "error");
    }
  };

  const handleImportSuccess = async (importedData) => {
    try {
      const created = await createOrcamento(importedData);
      await loadOrcamentos(false);
      setSelectedOrcamento(created);
      setCurrentTab('detail');
      showToast(
        "Planilha Importada com Sucesso",
        `Orçamento ${created.id || created._id} gravado a partir do arquivo Schulz.`,
        "success"
      );
    } catch (err) {
      showToast("Erro na Importação", err.message, "error");
    }
  };

  const handleCreateNewBlank = () => {
    const blank = {
      cliente: "Schulz Compressores S/A",
      unidade: "Planta Principal Joinville",
      codigoPeca: "SCH-NOVA-001",
      descricaoPeca: "Novo Componente Usinado de Alta Precisão",
      material: "Aço ABNT 1045",
      dureza: "180 HB",
      pesoKg: 3.5,
      lotePadrao: 500,
      status: "Pendente",
      responsavel: "Engenharia Schulz",
      centroCusto: "CC-310 (Usinagem Pesada CNC)",
      custoMateriaPrima: 50.00,
      margemLucroPercentual: 20.0,
      impostosPercentual: 14.25,
      desenhoTecnico: {
        numero: "DWG-SCH-NOVO",
        revisao: "Rev. 0",
        toleranciaGeral: "ISO 2768-mK",
        rugosidade: "Ra 1.6 um",
        dimensoes: "150mm x 100mm",
        svgTipo: "carcaca"
      },
      operacoes: [
        {
          id: "OP-10",
          ordem: 1,
          codigo: "USIN-TOR-01",
          descricao: "Torneamento e Faceamento Inicial",
          centroTrabalho: "Torno CNC",
          tempoSetupMin: 30,
          tempoCicloMin: 6.0,
          custoHoraMaquina: 180.00,
          custoHoraHomem: 40.00,
          custoFerramentalItem: 8.00,
          zerarCusto: false,
          observacao: "Primeira operação"
        }
      ]
    };

    setSelectedOrcamento(blank);
    setCurrentTab('detail');
  };

  const handleDeleteOrcamento = async (orcamento) => {
    const id = getOrcamentoId(orcamento);
    if (!id) return;

    const confirmed = window.confirm(`Remover o orçamento ${id}? Esta ação será gravada no MongoDB Atlas.`);
    if (!confirmed) return;

    try {
      await deleteOrcamento(orcamento);
      setOrcamentos(prev => prev.filter(item => getOrcamentoId(item) !== id));
      if (selectedOrcamento && getOrcamentoId(selectedOrcamento) === id) {
        setSelectedOrcamento(null);
        setCurrentTab('dashboard');
      }
      showToast("Orçamento Removido", `O orçamento ${id} foi removido da base.`, "success");
    } catch (err) {
      showToast("Erro ao Remover", err.message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenImport={() => setIsImportOpen(true)}
        selectedOrcamento={selectedOrcamento}
      />

      {/* Azure Functions CRUD Status */}
      <ApiStatusBanner
        apiInfo={apiInfo}
        onRefresh={() => loadOrcamentos(true)}
        isRefreshing={isLoadingApi}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {currentTab === 'dashboard' && (
          <Dashboard
            orcamentos={orcamentos}
            onSelectOrcamento={handleSelectOrcamento}
            onOpenDrawing={(orc) => setDrawingOrcamento(orc)}
            onOpenReports={handleOpenReports}
            onNewOrcamento={handleCreateNewBlank}
            onDeleteOrcamento={handleDeleteOrcamento}
          />
        )}

        {currentTab === 'detail' && selectedOrcamento && (
          <OrcamentoDetail
            orcamento={selectedOrcamento}
            onSave={handleSaveOrcamento}
            onBack={() => setCurrentTab('dashboard')}
            onOpenDrawing={(orc) => setDrawingOrcamento(orc)}
            onOpenReports={(orc) => { setSelectedOrcamento(orc); setCurrentTab('reports'); }}
            onDelete={handleDeleteOrcamento}
          />
        )}

        {currentTab === 'reports' && selectedOrcamento && (
          <IntegradorReports
            orcamento={selectedOrcamento}
            onBack={() => setCurrentTab('detail')}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-200">
              Integrador de Orçamentos — Cliente Schulz S/A
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Projeto Acadêmico PJBL • Frontend React integrado a Azure Functions & MongoDB Atlas
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-400">Desenvolvido por SKA Automação de Engenharias Ltda</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-blue-400 font-mono border border-slate-700">v2.6.0-pjbl</span>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      {drawingOrcamento && (
        <TechnicalDrawingModal
          orcamento={drawingOrcamento}
          onClose={() => setDrawingOrcamento(null)}
        />
      )}

      {isImportOpen && (
        <ImportModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onImportSuccess={handleImportSuccess}
        />
      )}

      {/* Notifications */}
      <Toast toast={toast} onClose={() => setToast(null)} />

    </div>
  );
}
