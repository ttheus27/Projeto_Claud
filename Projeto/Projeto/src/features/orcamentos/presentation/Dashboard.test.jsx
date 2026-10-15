import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Dashboard from "./Dashboard";

const callbacks = {
  onSelectOrcamento: vi.fn(),
  onOpenDrawing: vi.fn(),
  onOpenReports: vi.fn(),
  onNewOrcamento: vi.fn(),
  onDeleteOrcamento: vi.fn(),
};

const orcamentos = [
  {
    id: "ORC-ROTOR",
    codigoPeca: "SCH-ROT-3310",
    descricaoPeca: "Rotor helicoidal",
    cliente: "Schulz Compressores S/A",
    unidade: "Joinville",
    material: "Aço 1045",
    pesoKg: 5,
    dureza: "180 HB",
    lotePadrao: 10,
    status: "Aprovado",
    custoMateriaPrima: 100,
    margemLucroPercentual: 20,
    impostosPercentual: 10,
    operacoes: [],
  },
  {
    id: "ORC-BLOCO",
    codigoPeca: "SCH-BLC-9010",
    descricaoPeca: "Bloco de motor",
    cliente: "Schulz Automotiva S/A",
    unidade: "Joinville",
    material: "Alumínio",
    pesoKg: 8,
    dureza: "95 HB",
    lotePadrao: 20,
    status: "Pendente",
    custoMateriaPrima: 120,
    margemLucroPercentual: 15,
    impostosPercentual: 10,
    operacoes: [],
  },
];

describe("Consulta de orçamentos no dashboard", () => {
  it("DADO orçamentos de peças distintas QUANDO a peça é pesquisada pelo código ENTÃO exibe somente o orçamento correspondente", async () => {
    const user = userEvent.setup();

    render(<Dashboard orcamentos={orcamentos} {...callbacks} />);

    await user.type(
      screen.getByPlaceholderText(
        "Buscar por código da peça, descrição, cliente ou ID do orçamento...",
      ),
      "ROT-3310",
    );

    expect(screen.getByText("Rotor helicoidal")).toBeInTheDocument();
    expect(screen.queryByText("Bloco de motor")).not.toBeInTheDocument();
  });
});
