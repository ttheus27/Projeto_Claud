const STORAGE_KEY = "integrador_pedidos_data_v1";

const INITIAL_PEDIDOS = [
  {
    id_pedido: "PED-2026-901",
    codigo_orcamento: "ORC-2026-0891",
    cliente: "Schulz Compressores S/A",
    descricao_peca: "Virabrequim Monobloco Forjado 2 Cilindros",
    lote_producao: 500,
    valor_total: 147850.00,
    status_producao: "Em Usinagem CNC",
    data_entrega_prevista: "2026-12-15",
    criado_em: "2026-08-20T10:00:00Z",
    atualizado_em: "2026-08-26T11:30:00Z"
  },
  {
    id_pedido: "PED-2026-902",
    codigo_orcamento: "ORC-2026-0912",
    cliente: "Schulz Automotiva S/A",
    descricao_peca: "Suporte de Pinça de Freio Dianteiro (Ferro Nodular)",
    lote_producao: 1200,
    valor_total: 129480.00,
    status_producao: "Em Planejamento",
    data_entrega_prevista: "2027-01-20",
    criado_em: "2026-09-05T14:15:00Z",
    atualizado_em: "2026-09-08T16:50:00Z"
  }
];

function getLocalPedidos() {
  if (typeof window === "undefined" || !window.localStorage) {
    return [...INITIAL_PEDIDOS];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PEDIDOS));
      return [...INITIAL_PEDIDOS];
    }
    return JSON.parse(raw);
  } catch {
    return [...INITIAL_PEDIDOS];
  }
}

function saveLocalPedidos(pedidos) {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pedidos));
    } catch {}
  }
}

const DEFAULT_PEDIDOS_URL = import.meta.env.VITE_PEDIDOS_URL || "http://localhost:8080/api/pedidos";

export const pedidosGateway = {
  async listar() {
    const startedAt = Date.now();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1800);
      const res = await fetch(DEFAULT_PEDIDOS_URL, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const payload = await res.json();
        const data = payload.data || payload;
        saveLocalPedidos(data);
        return {
          data,
          source: "BFF Proxy -> Azure SQL Database (TB_PEDIDOS)",
          latencyMs: Date.now() - startedAt,
          status: 200
        };
      }
    } catch (e) {
      // Fallback
    }

    return {
      data: getLocalPedidos(),
      source: "Motor SQL Local (TB_PEDIDOS Cache)",
      latencyMs: Date.now() - startedAt,
      status: 200
    };
  },

  async criar(novoPedido) {
    try {
      const res = await fetch(DEFAULT_PEDIDOS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoPedido)
      });
      if (res.ok) {
        const payload = await res.json();
        const criado = payload.pedido || payload;
        const lista = getLocalPedidos();
        lista.unshift(criado);
        saveLocalPedidos(lista);
        return criado;
      }
    } catch {}

    const lista = getLocalPedidos();
    const id = `PED-2026-${Math.floor(100 + Math.random() * 900)}`;
    const criado = {
      ...novoPedido,
      id_pedido: id,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString()
    };
    lista.unshift(criado);
    saveLocalPedidos(lista);
    return criado;
  },

  async atualizarStatus(id, novoStatus) {
    try {
      await fetch(`${DEFAULT_PEDIDOS_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status_producao: novoStatus })
      });
    } catch {}

    const lista = getLocalPedidos();
    const idx = lista.findIndex(p => p.id_pedido === id);
    if (idx !== -1) {
      lista[idx].status_producao = novoStatus;
      lista[idx].atualizado_em = new Date().toISOString();
      saveLocalPedidos(lista);
      return lista[idx];
    }
    return null;
  }
};
