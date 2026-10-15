const { app } = require("@azure/functions");
const {
  emptyResponse,
  jsonResponse,
} = require("../../../shared/http/response");
const { makeUpdateOrcamentoUseCase } = require("./update-orcamento.use-case");
const {
  mongoOrcamentoRepository,
} = require("../infrastructure/mongodb-orcamento.repository");
const {
  presentError,
  presentOrcamento,
} = require("../presentation/orcamento.presenter");

const executeUpdateOrcamento = makeUpdateOrcamentoUseCase({
  repository: mongoOrcamentoRepository,
});

app.http("UpdateOrcamento", {
  methods: ["PUT", "OPTIONS"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    if (request.method === "OPTIONS") {
      return emptyResponse();
    }

    try {
      const body = await request.json();
      const id = request.query.get("id") || body.id || body._id;

      if (!id) {
        return jsonResponse(
          { error: "Informe o id do orçamento para atualizar." },
          400,
        );
      }

      context.log(`Atualizando orçamento "${id}" no MongoDB Atlas.`);
      const updated = await executeUpdateOrcamento(id, body);
      const orcamento = updated?.value || updated;

      if (!orcamento) {
        return jsonResponse({ error: "Orçamento não encontrado." }, 404);
      }

      return jsonResponse({
        mensagem: "Orçamento atualizado com sucesso.",
        orcamento: presentOrcamento(orcamento),
      });
    } catch (error) {
      context.error("Erro ao atualizar orçamento:", error);
      const response = presentError(error);
      return jsonResponse(response.body, response.status);
    }
  },
});
