import { SessionError } from "../../../domain/session-error.js";
export const makeLogin = ({ credentialsVerifier, sessions }) => async data => {
  if (!data || typeof data.username !== "string" || typeof data.password !== "string" || data.username.length > 128 || data.password.length > 256) throw new SessionError("Informe usuário e senha.", 400);
  const user = await credentialsVerifier.verify(data);
  if (!user) throw new SessionError("Usuário ou senha inválidos.");
  return sessions.create(user);
};
