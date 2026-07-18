"use client";

export type OperationalSector = "bar" | "kitchen";
export type OperationalTicketStatus = "novo" | "recebido" | "pronto";

export interface OperationalTicketItem {
  readonly name: string;
  readonly quantity: number;
}

export interface OperationalTicket {
  readonly createdAt: string;
  readonly customer: string;
  readonly id: string;
  readonly orderId: string;
  readonly sector: OperationalSector;
  readonly status: OperationalTicketStatus;
  readonly totalCents: string;
  readonly items: readonly OperationalTicketItem[];
}

export interface OperationalOrderLine {
  readonly category: string;
  readonly name: string;
  readonly quantity: number;
}

const QUEUE_KEY = "adegaos-operational-tickets-v1";
const QUEUE_EVENT = "adegaos-operational-tickets";
const SOUND_EVENT = "adegaos-demo-sound";

const barCategories = new Set(["Doses", "Combos", "Cachacas", "Drinks", "Energetico e Ice", "Cervejas 600ml", "Cervejas Long Neck"]);

export function sectorForCategory(category: string): OperationalSector {
  return barCategories.has(category) ? "bar" : "kitchen";
}

export function loadOperationalTickets(): OperationalTicket[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(QUEUE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isOperationalTicket);
  } catch {
    return [];
  }
}

export function publishOperationalOrder(input: {
  readonly customer: string;
  readonly lines: readonly OperationalOrderLine[];
  readonly orderId: string;
  readonly totalCents: string;
}): OperationalTicket[] {
  const createdAt = new Date().toISOString();
  const grouped = new Map<OperationalSector, OperationalTicketItem[]>();

  for (const line of input.lines) {
    const sector = sectorForCategory(line.category);
    const items = grouped.get(sector) ?? [];
    items.push({ name: line.name, quantity: line.quantity });
    grouped.set(sector, items);
  }

  const tickets = Array.from(grouped.entries()).map(([sector, items]) => ({
    createdAt,
    customer: input.customer,
    id: `${input.orderId}-${sector}`,
    items,
    orderId: input.orderId,
    sector,
    status: "novo" as const,
    totalCents: input.totalCents
  }));

  saveOperationalTickets([...tickets, ...loadOperationalTickets()].slice(0, 80));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SOUND_EVENT, { detail: { type: "new-ticket" } }));
  }
  return tickets;
}

export function updateOperationalTicket(ticketId: string, status: OperationalTicketStatus): void {
  const currentTickets = loadOperationalTickets();
  const nextTickets = currentTickets.map((ticket) => (
    ticket.id === ticketId ? { ...ticket, status } : ticket
  ));
  saveOperationalTickets(nextTickets);
  if (typeof window !== "undefined" && status === "pronto") {
    window.dispatchEvent(new CustomEvent(SOUND_EVENT, { detail: { type: "ready-ticket" } }));
  }
}

export function subscribeOperationalTickets(callback: (tickets: OperationalTicket[]) => void): () => void {
  if (typeof window === "undefined") return () => undefined;

  const onChange = () => callback(loadOperationalTickets());
  window.addEventListener(QUEUE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(QUEUE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function subscribeOperationalSounds(callback: (eventType: "new-ticket" | "ready-ticket") => void): () => void {
  if (typeof window === "undefined") return () => undefined;

  const onSound = (event: Event) => {
    const detail = (event as CustomEvent<{ type?: "new-ticket" | "ready-ticket" }>).detail;
    if (detail?.type === "new-ticket" || detail?.type === "ready-ticket") {
      callback(detail.type);
    }
  };

  window.addEventListener(SOUND_EVENT, onSound as EventListener);
  return () => window.removeEventListener(SOUND_EVENT, onSound as EventListener);
}

function saveOperationalTickets(tickets: readonly OperationalTicket[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(tickets));
  window.dispatchEvent(new Event(QUEUE_EVENT));
}

function isOperationalTicket(value: unknown): value is OperationalTicket {
  if (typeof value !== "object" || value === null) return false;
  const ticket = value as Partial<OperationalTicket>;
  return (
    typeof ticket.id === "string" &&
    typeof ticket.orderId === "string" &&
    (ticket.sector === "bar" || ticket.sector === "kitchen") &&
    (ticket.status === "novo" || ticket.status === "recebido" || ticket.status === "pronto") &&
    Array.isArray(ticket.items)
  );
}
