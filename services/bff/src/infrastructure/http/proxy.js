export function createHttpForwarder({ internalToken, httpFetch = fetch }) {
  return async ({ target, method, body, requestId }) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 155000);
    try {
      const response = await httpFetch(target, {
        method, signal: controller.signal, redirect: "manual",
        headers: { "x-internal-api-token": internalToken, ...(requestId ? { "x-request-id": requestId } : {}), ...(["POST", "PUT"].includes(method) ? { "Content-Type": "application/json" } : {}) },
        ...(["POST", "PUT"].includes(method) ? { body: JSON.stringify(body) } : {}),
      });
      return { status: response.status, contentType: response.headers.get("content-type"), location: response.headers.get("location"), body: Buffer.from(await response.arrayBuffer()) };
    } finally { clearTimeout(timer); }
  };
}
