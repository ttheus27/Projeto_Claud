import { API_BASE_URL, requestApi } from "../../../shared/http/api-client";
export const bffGateway = {
  async fetchAggregatedData() {
    const start = Date.now();
    const payload = await requestApi(`${API_BASE_URL}/aggregated-data`, { timeoutMs: 140000 });
    return { payload, source: "API Gateway → BFF", latencyMs: Date.now() - start, isLive: true };
  },
};
