export class SessionError extends Error {
  constructor(message, statusCode = 401) { super(message); this.name = "SessionError"; this.statusCode = statusCode; }
}
