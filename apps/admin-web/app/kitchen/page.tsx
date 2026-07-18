"use client";

import { useEffect, useMemo, useState } from "react";
import { CookingPot } from "lucide-react";
import { loadOperationalTickets, subscribeOperationalTickets, updateOperationalTicket, type OperationalTicket, type OperationalTicketStatus } from "../_lib/operational-queue";

export default function KitchenPage() {
  const [tickets, setTickets] = useState<OperationalTicket[]>(() => loadOperationalTickets());

  useEffect(() => subscribeOperationalTickets(setTickets), []);

  const kitchenTickets = useMemo(() => tickets.filter((ticket) => ticket.sector === "kitchen"), [tickets]);

  function setTicketStatus(id: string, status: OperationalTicketStatus): void {
    updateOperationalTicket(id, status);
  }

  return (
    <main className="ops-shell">
      <section className="ops-panel">
        <header className="ops-topbar">
          <div>
            <h1>Cozinha</h1>
            <p>Recebimento e preparo dos pedidos do setor.</p>
          </div>
          <CookingPot aria-hidden="true" size={22} />
        </header>
        <div className="ops-list">
          {kitchenTickets.map((ticket) => (
            <article className="ops-card" key={ticket.id}>
              <div>
                <h2>{ticket.orderId.slice(0, 8)} - {ticket.customer}</h2>
                <p>{ticket.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}</p>
                <small>Status: {ticket.status === "novo" ? "Novo" : ticket.status === "recebido" ? "Recebido" : "Pronto"}</small>
              </div>
              <div className="ops-actions">
                <button disabled={ticket.status !== "novo"} onClick={() => setTicketStatus(ticket.id, "recebido")} type="button">Receber</button>
                <button className="primary" disabled={ticket.status === "pronto"} onClick={() => setTicketStatus(ticket.id, "pronto")} type="button">Pronto</button>
              </div>
            </article>
          ))}
          {kitchenTickets.length === 0 ? <p className="ops-empty">Nenhum pedido enviado para a cozinha.</p> : null}
        </div>
      </section>
    </main>
  );
}
