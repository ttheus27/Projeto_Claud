import { getAggregatedData } from "./aggregation.js";
import { createHttpForwarder } from "../infrastructure/http/proxy.js";
import { makeGenerateOrder } from "../features/pedidos/application/generate-order.use-case.js";

export function createBffDependencies() {
  const mongoUrl = process.env.MS_MONGO_URL || "http://localhost:3001/api/orcamentos";
  const sqlUrl = process.env.MS_SQL_URL || "http://localhost:3002/api/pedidos";
  const forward = createHttpForwarder({ internalToken: process.env.INTERNAL_API_TOKEN });
  return {
    aggregate: () => getAggregatedData(), forward, mongoUrl, sqlUrl,
    generateOrder: makeGenerateOrder({ createOrder: body => forward({ target: sqlUrl, method: "POST", body }) }),
    docsTargets: { mongo: new URL(mongoUrl).origin, sql: new URL(sqlUrl).origin, bff: `http://127.0.0.1:${process.env.PORT || 8080}` },
  };
}
