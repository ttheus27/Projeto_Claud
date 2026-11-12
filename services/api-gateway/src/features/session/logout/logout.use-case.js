import { SessionError } from "../../../domain/session-error.js";
export const makeLogout = ({ sessions }) => token => {
  if (!sessions.get(token)) throw new SessionError("Entre na sua conta para continuar.");
  sessions.delete(token);
};
