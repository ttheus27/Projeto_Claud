import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import ApiStatusBanner from "./features/orcamentos/presentation/ApiStatusBanner";
import Toast from "./components/Toast";
import Dashboard from "./features/orcamentos/presentation/Dashboard";
import OrcamentoDetail from "./features/orcamentos/presentation/OrcamentoDetail";
import IntegradorReports from "./features/orcamentos/presentation/IntegradorReports";
import TechnicalDrawingModal from "./features/orcamentos/presentation/TechnicalDrawingModal";
import ImportModal from "./features/orcamentos/presentation/ImportModal";
import { criarOrcamentoEmBranco } from "./features/orcamentos/application/criar-orcamento-em-branco";
import { orcamentoUseCases } from "./features/orcamentos/composition/orcamento-use-cases";
import {
  getOrcamentoId,
  isOrcamentoPersistido,
} from "./features/orcamentos/domain/orcamento";

export default function App() {
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [orcamentos, setOrcamentos] = useState([]);
  const [selectedOrcamento, setSelectedOrcamento] = useState(null);
  const [drawingOrcamento, setDrawingOrcamento] = useState(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [apiInfo, setApiInfo] = useState(null);
  const [isLoadingApi, setIsLoadingApi] = useState(true);

  const showToast = (title, message, type = "success") => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const loadOrcamentos = async (showFeedback = false) => {
    setIsLoadingApi(true);

    try {
      const response = await orcamentoUseCases.listar();
      setOrcamentos(response.data);
      setApiInfo(response);

      if (selectedOrcamento) {
        const selectedId = getOrcamentoId(selectedOrcamento);
        const refreshed = response.data.find(
          (orcamento) => getOrcamentoId(orcamento) === selectedId,
        );
        if (refreshed) setSelectedOrcamento(refreshed);
      }

      if (showFeedback) {
        showToast(
          "Azure Function Sincronizada",
          `GET /api/GetOrcamentos carregou os dados do MongoDB Atlas (${response.latencyMs}ms).`,
          "success",
        );
      }
    } catch {
      showToast(
        "Erro na Conexão",
        "Não foi possível sincronizar com o backend.",
        "error",
      );
    } finally {
      setIsLoadingApi(false);
    }
  };

  useEffect(() => {
    loadOrcamentos();
  }, []);

  const handleSelectOrcamento = (orcamento) => {
    setSelectedOrcamento(orcamento);
    setCurrentTab("detail");
  };

  const handleOpenReports = (orcamento) => {
    setSelectedOrcamento(orcamento);
    setCurrentTab("reports");
  };

  const handleSaveOrcamento = async (updatedData) => {
    try {
      const isExisting = isOrcamentoPersistido(updatedData);
      const saved = await orcamentoUseCases.salvar(updatedData);

      setSelectedOrcamento(saved);
      await loadOrcamentos();
      showToast(
        isExisting ? "Orçamento Salvo e Recalculado" : "Orçamento Criado",
        `O item ${saved.codigoPeca} foi ${isExisting ? "atualizado" : "gravado"} no MongoDB Atlas.`,
        "success",
      );
    } catch (error) {
      showToast("Erro ao Salvar", error.message, "error");
    }
  };

  const handleImportSuccess = async (importedData) => {
    try {
      const created = await orcamentoUseCases.importar(importedData);
      await loadOrcamentos();
      setSelectedOrcamento(created);
      setCurrentTab("detail");
      showToast(
        "Planilha Importada com Sucesso",
        `Orçamento ${getOrcamentoId(created)} gravado a partir do arquivo Schulz.`,
        "success",
      );
    } catch (error) {
      showToast("Erro na Importação", error.message, "error");
    }
  };

  const handleCreateNewBlank = () => {
    setSelectedOrcamento(criarOrcamentoEmBranco());
    setCurrentTab("detail");
  };

  const handleDeleteOrcamento = async (orcamento) => {
    const id = getOrcamentoId(orcamento);
    if (!id) return;

    const confirmed = window.confirm(
      `Remover o orçamento ${id}? Esta ação será gravada no MongoDB Atlas.`,
    );
    if (!confirmed) return;

    try {
      await orcamentoUseCases.excluir(orcamento);
      setOrcamentos((current) =>
        current.filter((item) => getOrcamentoId(item) !== id),
      );

      if (selectedOrcamento && getOrcamentoId(selectedOrcamento) === id) {
        setSelectedOrcamento(null);
        setCurrentTab("dashboard");
      }

      showToast(
        "Orçamento Removido",
        `O orçamento ${id} foi removido da base.`,
        "success",
      );
    } catch (error) {
      showToast("Erro ao Remover", error.message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenImport={() => setIsImportOpen(true)}
        selectedOrcamento={selectedOrcamento}
      />

      <ApiStatusBanner
        apiInfo={apiInfo}
        onRefresh={() => loadOrcamentos(true)}
        isRefreshing={isLoadingApi}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === "dashboard" && (
          <Dashboard
            orcamentos={orcamentos}
            onSelectOrcamento={handleSelectOrcamento}
            onOpenDrawing={setDrawingOrcamento}
            onOpenReports={handleOpenReports}
            onNewOrcamento={handleCreateNewBlank}
            onDeleteOrcamento={handleDeleteOrcamento}
          />
        )}

        {currentTab === "detail" && selectedOrcamento && (
          <OrcamentoDetail
            orcamento={selectedOrcamento}
            onSave={handleSaveOrcamento}
            onBack={() => setCurrentTab("dashboard")}
            onOpenDrawing={setDrawingOrcamento}
            onOpenReports={(orcamento) => {
              setSelectedOrcamento(orcamento);
              setCurrentTab("reports");
            }}
            onDelete={handleDeleteOrcamento}
          />
        )}

        {currentTab === "reports" && selectedOrcamento && (
          <IntegradorReports
            orcamento={selectedOrcamento}
            onBack={() => setCurrentTab("detail")}
          />
        )}
      </main>

      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-200">
              Integrador de Orçamentos — Cliente Schulz S/A
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Projeto Acadêmico PJBL • Frontend React integrado a Azure
              Functions &amp; MongoDB Atlas
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-400">
              Desenvolvido por SKA Automação de Engenharias Ltda
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-blue-400 font-mono border border-slate-700">
              v2.6.0-pjbl
            </span>
          </div>
        </div>
      </footer>

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

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
