import React, { createContext, useContext, useEffect, useState } from "react";
import { API_BASE_URL, requestApi } from "../../shared/http/api-client";

const SessionContext = createContext(null);
export function useSession() { return useContext(SessionContext); }
export default function SessionGate({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState("aluno");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    requestApi(`${API_BASE_URL}/session`).then(result => { if (active) setUser(result.user); }).catch(error => {
      if (active && error.status !== 401) setError(error.message);
    }).finally(() => { if (active) setChecking(false); });
    const expired = () => setUser(null);
    window.addEventListener("session-expired", expired);
    return () => { active = false; window.removeEventListener("session-expired", expired); };
  }, []);
  const login = async event => {
    event.preventDefault(); setBusy(true); setError("");
    try { const result = await requestApi(`${API_BASE_URL}/session`, { method: "POST", body: { username, password } }); setUser(result.user); setPassword(""); }
    catch (error) { setError(error.message); }
    finally { setBusy(false); }
  };
  const logout = async () => {
    try { await requestApi(`${API_BASE_URL}/session`, { method: "DELETE" }); setUser(null); }
    catch (error) { setError(error.message); }
  };
  if (checking) return <div role="status" className="min-h-screen grid place-items-center bg-slate-100 text-slate-600">Verificando sessão...</div>;
  if (user) return <SessionContext.Provider value={{ user, logout }}>{children}</SessionContext.Provider>;
  return <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
    <form onSubmit={login} className="w-full max-w-sm rounded-2xl bg-slate-900 p-7 shadow-xl text-slate-200 space-y-5">
      <div><h1 className="text-xl font-bold text-white">Integrador de Orçamentos</h1><p className="mt-2 text-sm text-slate-400">Entre para acessar orçamentos e pedidos.</p></div>
      <label className="block text-sm">Usuário<input required autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-white" /></label>
      <label className="block text-sm">Senha<input required type="password" autoComplete="current-password" maxLength={256} value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-white" /></label>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <button disabled={busy} className="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white disabled:opacity-50">{busy ? "Entrando..." : "Entrar"}</button>
    </form>
  </div>;
}
