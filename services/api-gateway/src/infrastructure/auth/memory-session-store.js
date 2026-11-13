import { randomBytes, createHash } from "node:crypto";
import { SessionError } from "../../domain/session-error.js";
export function createMemorySessionStore({ durationMs, now = () => Date.now(), maxSessions = 1000 }) {
  const sessions = new Map();
  const hash = token => createHash("sha256").update(token).digest("hex");
  return {
    create(user) {
      for (const [key, value] of sessions) if (value.expires <= now()) sessions.delete(key);
      if (sessions.size >= maxSessions) throw new SessionError("Limite de sessões atingido. Tente novamente mais tarde.", 503);
      const token = randomBytes(32).toString("base64url");
      sessions.set(hash(token), { user, expires: now() + durationMs });
      return { token, user };
    },
    get(token) {
      if (typeof token !== "string" || !token) return null;
      const key = hash(token); const value = sessions.get(key);
      if (!value || value.expires <= now()) { sessions.delete(key); return null; }
      return value.user;
    },
    delete(token) { if (token) sessions.delete(hash(token)); },
  };
}
