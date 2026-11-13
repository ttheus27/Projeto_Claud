import { createHttpApp } from "../presentation/app.js";
import { createPasswordVerifier } from "../infrastructure/auth/password-verifier.js";
import { createMemorySessionStore } from "../infrastructure/auth/memory-session-store.js";
import { createBffProxy } from "../infrastructure/http/bff-proxy.js";
import { makeLogin } from "../features/session/login/login.use-case.js";
import { makeGetSession } from "../features/session/get/get-session.use-case.js";
import { makeLogout } from "../features/session/logout/logout.use-case.js";
export function createGateway({ bffUrl, internalToken, username, password, httpFetch, ...httpOptions }) {
  if (!bffUrl || !internalToken || !username || !password) throw new Error("Configure BFF_URL, INTERNAL_API_TOKEN, GATEWAY_USERNAME e GATEWAY_PASSWORD no backend do gateway.");
  const durationMs = 8 * 60 * 60 * 1000;
  const sessions = createMemorySessionStore({ durationMs });
  const credentialsVerifier = createPasswordVerifier(username, password);
  const sessionUseCases = { login: makeLogin({ credentialsVerifier, sessions }), get: makeGetSession({ sessions }), logout: makeLogout({ sessions }) };
  return createHttpApp({ sessionUseCases, proxy: createBffProxy({ bffUrl, internalToken, httpFetch }), durationMs, ...httpOptions });
}
