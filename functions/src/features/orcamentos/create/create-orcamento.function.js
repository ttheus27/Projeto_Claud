const { app } = require("@azure/functions");
const {
  emptyResponse,
  jsonResponse,
} = require("../../../shared/http/response");
const { makeCreateOrcamentoUseCase } = require("./create-orcamento.use-case");
const {
  mongoOrcamentoRepository,
} = require("../infrastructure/mongodb-orcamento.repository");
const {
  presentError,
  presentOrcamento,
} = require("../presentation/orcamento.presenter");

const executeCreateOrcamento = makeCreateOrcamentoUseCase({
  repository: mongoOrcamentoRepository,
});

app.http("CreateOrcamento", {
  methods: ["POST", "OPTIONS"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    if (request.method === "OPTIONS") {
      return emptyResponse();
    }

    context.log("Criando orçamento no MongoDB Atlas.");

    try {
      const body = await request.json();
      const orcamento = await executeCreateOrcamento(body);

      return jsonResponse(
        {
          mensagem: "Orçamento cadastrado com sucesso.",
          orcamento: presentOrcamento(orcamento),
        },
        201,
      );
    } catch (error) {
      context.error("Erro ao criar orçamento:", error);
      const response = presentError(error);
      return jsonResponse(response.body, response.status);
    }
  },
});
