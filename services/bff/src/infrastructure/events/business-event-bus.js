import { randomUUID } from "node:crypto";

const MAX_EVENTS = 100;

export function createBusinessEventBus({ clock = () => new Date().toISOString(), createId = randomUUID } = {}) {
  let events = [];

  return {
    publish(event) {
      const published = { id: createId(), publishedAt: clock(), ...event };
      events = [published, ...events].slice(0, MAX_EVENTS);
      return published;
    },
    list(limit = 50) {
      const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 50, 1), MAX_EVENTS);
      return events.slice(0, safeLimit);
    },
  };
}
