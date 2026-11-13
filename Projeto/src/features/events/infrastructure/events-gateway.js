import { API_BASE_URL, requestApi } from "../../../shared/http/api-client";

export const eventsGateway = {
  listRecent: () => requestApi(`${API_BASE_URL}/events?limit=50`, { timeoutMs: 10000 }),
};
