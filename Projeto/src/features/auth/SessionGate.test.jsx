import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import SessionGate from "./SessionGate";
import { requestApi } from "../../shared/http/api-client";
vi.mock("../../shared/http/api-client", () => ({ API_BASE_URL: "/api", requestApi: vi.fn() }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });
describe("sessão do gateway", () => {
  it("exibe o conteúdo somente depois do login confirmado", async () => {
    requestApi.mockRejectedValueOnce(Object.assign(new Error("Entre na conta"), { status: 401 })).mockResolvedValueOnce({ user: "aluno" });
    const user = userEvent.setup();
    render(<SessionGate><div>Área autenticada</div></SessionGate>);
    await screen.findByLabelText("Senha");
    expect(screen.queryByText("Área autenticada")).not.toBeInTheDocument();
    await user.type(screen.getByLabelText("Senha"), "senha-teste");
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByText("Área autenticada")).toBeInTheDocument();
    expect(requestApi).toHaveBeenLastCalledWith("/api/session", expect.objectContaining({ method: "POST", body: { username: "aluno", password: "senha-teste" } }));
  });
});
