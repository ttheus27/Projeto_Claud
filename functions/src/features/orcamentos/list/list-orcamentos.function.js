const { app } = require("@azure/functions");
const {
  emptyResponse,
  jsonResponse,
} = require("../../../shared/http/response");
const { makeListOrcamentosUseCase } = require("./list-orcamentos.use-case");
const {
  mongoOrcamentoRepository,
} = require("../infrastructure/mongodb-orcamento.repository");
const {
  presentError,
  presentOrcamentos,
} = require("../presentation/orcamento.presenter");

const executeListOrcamentos = makeListOrcamentosUseCase({
  repository: mongoOrcamentoRepository,
});

app.http("GetOrcamentos", {
  methods: ["GET", "OPTIONS"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    if (request.method === "OPTIONS") {
      return emptyResponse();
    }

    context.log("Consultando orçamentos no MongoDB Atlas.");

    try {
      const orcamentos = await executeListOrcamentos();
      return jsonResponse({ orcamentos: presentOrcamentos(orcamentos) });
    } catch (error) {
      context.error("Erro ao consultar orçamentos:", error);
      const response = presentError(error);
      return jsonResponse(response.body, response.status);
    }
  },
});
