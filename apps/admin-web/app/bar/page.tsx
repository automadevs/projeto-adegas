"use client";

import { useEffect, useMemo, useState } from "react";
import { Martini } from "lucide-react";
import { loadOperationalTickets, subscribeOperationalSounds, subscribeOperationalTickets, updateOperationalTicket, type OperationalTicket, type OperationalTicketStatus } from "../_lib/operational-queue";

export default function BarPage() {
  const [tickets, setTickets] = useState<OperationalTicket[]>(() => loadOperationalTickets());

  useEffect(() => subscribeOperationalTickets(setTickets), []);
  useEffect(() => subscribeOperationalSounds(() => {
    const context = typeof window !== "undefined" ? new AudioContext() : null;
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.value = 660;
    gain.gain.value = 0.04;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.12);
    oscillator.stop(context.currentTime + 0.13);
    void context.close();
  }), []);

  const barTickets = useMemo(() => tickets.filter((ticket) => ticket.sector === "bar"), [tickets]);

  function setTicketStatus(id: string, status: OperationalTicketStatus): void {
    updateOperationalTicket(id, status);
  }

  return (
    <main className="ops-shell">
      <section className="ops-panel">
        <header className="ops-topbar">
          <div>
            <h1>Bar</h1>
            <p>Fila de drinks, doses e combos com controle simples de preparo.</p>
            <small>Modo demo local • sem banco</small>
          </div>
          <Martini aria-hidden="true" size={22} />
        </header>
        <div className="ops-list">
          {barTickets.map((ticket) => (
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
          {barTickets.length === 0 ? <p className="ops-empty">Nenhum pedido enviado para o bar.</p> : null}
        </div>
      </section>
    </main>
  );
}
