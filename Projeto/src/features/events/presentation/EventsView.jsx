import React, { useCallback, useEffect, useRef, useState } from "react";
import { Activity, CheckCircle2, CircleAlert, Radio, RefreshCw } from "lucide-react";
import { eventsGateway } from "../infrastructure/events-gateway";

const POLL_INTERVAL_MS = 2000;
const MAX_VISIBLE_EVENTS = 50;
const eventNames = {
  "orcamento.criado": "Orçamento criado",
  "orcamento.atualizado": "Orçamento atualizado",
  "orcamento.excluido": "Orçamento excluído",
  "pedido.criado": "Pedido criado",
  "pedido.atualizado": "Pedido atualizado",
  "pedido.status_alterado": "Status do pedido alterado",
  "pedido.excluido": "Pedido excluído",
  "pedido.gerado_de_orcamento": "Pedido gerado a partir de orçamento",
};
const formatTime = value => new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "medium" }).format(new Date(value));

export default function EventsView() {
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const inFlight = useRef(false);

  const loadEvents = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setRefreshing(true);
    try {
      const result = await eventsGateway.listRecent();
      const receivedAt = new Date().toISOString();
      setEvents(current => {
        const known = new Set(current.map(event => event.id));
        const received = (result.events || []).filter(event => !known.has(event.id)).map(event => ({ ...event, receivedAt }));
        return [...received, ...current].slice(0, MAX_VISIBLE_EVENTS);
      });
      setError("");
      setConnected(true);
    } catch (loadError) {
      setError(loadError.message);
      setConnected(false);
    } finally {
      inFlight.current = false;
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
    const timer = window.setInterval(loadEvents, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [loadEvents]);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <section className="rounded-xl bg-slate-900 p-5 text-slate-100 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-lg font-bold"><Radio className="h-5 w-5 text-sky-400" />Eventos de negócio</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">O BFF publica um evento após uma alteração ser salva. Esta tela recebe os eventos automaticamente.</p>
            <p className="mt-2 text-xs text-slate-400">BFF → barramento de eventos em memória → painel consumidor · atualização a cada 2 segundos</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${connected ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
              <span className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "bg-amber-400"}`} />
              {connected ? "Consumidor conectado" : "Reconectando"}
            </span>
            <button onClick={loadEvents} disabled={refreshing} className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-xs font-semibold hover:bg-slate-600 disabled:opacity-50">
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />Atualizar
            </button>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-2 border-t border-slate-700 pt-4 text-xs text-slate-400">
          <Activity className="h-4 w-4 text-sky-400" />
          {events.length} evento{events.length === 1 ? "" : "s"} recebido{events.length === 1 ? "" : "s"} nesta sessão
        </div>
      </section>

      {error && <div role="alert" className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><CircleAlert className="h-4 w-4 shrink-0" />Feed temporariamente indisponível: {error}</div>}

      {events.length === 0 ? (
        <section className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <Radio className="mx-auto h-9 w-9 text-slate-300" />
          <h2 className="mt-3 font-semibold text-slate-700">Aguardando eventos</h2>
          <p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">Crie ou atualize um orçamento ou pedido. Depois que o serviço confirmar a gravação, o evento aparecerá aqui.</p>
        </section>
      ) : (
        <ol aria-label="Eventos recentes" className="space-y-3">
          {events.map(event => (
            <li key={event.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 rounded-lg bg-sky-50 p-2 text-sky-700"><Activity className="h-4 w-4" /></span>
                  <div>
                    <h2 className="font-semibold text-slate-800">{eventNames[event.type] || event.type}</h2>
                    <p className="mt-1 text-sm text-slate-600">{event.description}</p>
                    <p className="mt-1 text-xs text-slate-500">{event.source}{event.entityId ? ` · ${event.entityId}` : ""}{event.status ? ` · ${event.status}` : ""}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />Recebido</span>
              </div>
              <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500 sm:grid-cols-2">
                <p><span className="font-semibold text-slate-600">Publicado:</span> {formatTime(event.publishedAt)}</p>
                <p><span className="font-semibold text-slate-600">Consumido pelo painel:</span> {formatTime(event.receivedAt)}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
