import { describe, expect, it, vi } from "vitest";
import { createOrcamentoGateway } from "./orcamento-gateway";

describe("gateway de orçamentos", () => {
  it("mantém uma coleção vazia como vazia e usa a sessão do gateway", async () => {
    const httpFetch = vi.fn().mockResolvedValue({ ok: true, status: 200, text: async () => JSON.stringify({ data: [], origem: "MongoDB Atlas" }) });
    const result = await createOrcamentoGateway({ httpFetch }).listar();
    expect(result.data).toEqual([]);
    expect(httpFetch).toHaveBeenCalledWith("/api/orcamentos", expect.objectContaining({ credentials: "include" }));
  });
  it("não anuncia gravação bem-sucedida quando o backend rejeita a alteração", async () => {
    const httpFetch = vi.fn().mockResolvedValue({ ok: false, status: 503, text: async () => JSON.stringify({ error: "Atlas indisponível" }) });
    const gateway = createOrcamentoGateway({ httpFetch });
    await expect(gateway.criar({ descricaoPeca: "Peça" })).rejects.toThrow("Atlas indisponível");
    await expect(gateway.excluir("ORC-TEST")).rejects.toThrow("Atlas indisponível");
  });
});
