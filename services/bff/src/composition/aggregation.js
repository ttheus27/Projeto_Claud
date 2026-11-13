import { createServiceClients } from "../infrastructure/http/service-clients.js";
import { makeAggregateData } from "../features/aggregation/application/aggregate-data.use-case.js";
export function getAggregatedData({ httpFetch = fetch } = {}) {
  const clients = createServiceClients({
    mongoUrl: process.env.MS_MONGO_URL || "http://localhost:3001/api/orcamentos",
    sqlUrl: process.env.MS_SQL_URL || "http://localhost:3002/api/pedidos",
    functionUrl: process.env.AZURE_FUNCTION_URL || "https://cloud-projeto-orc-f-app.azurewebsites.net/api/EnriquecerOrcamento",
    internalToken: process.env.INTERNAL_API_TOKEN,
    functionKey: process.env.AZURE_FUNCTION_KEY,
    httpFetch,
  });
  return makeAggregateData(clients)();
}
