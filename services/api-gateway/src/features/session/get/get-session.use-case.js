import { SessionError } from "../../../domain/session-error.js";
export const makeGetSession = ({ sessions }) => token => {
  const user = sessions.get(token);
  if (!user) throw new SessionError("Entre na sua conta para continuar.");
  return user;
};
