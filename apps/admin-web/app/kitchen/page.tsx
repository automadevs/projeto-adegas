"use client";

import { useEffect, useMemo, useState } from "react";
import { CookingPot } from "lucide-react";
import { loadOperationalTickets, subscribeOperationalSounds, subscribeOperationalTickets, updateOperationalTicket, type OperationalTicket, type OperationalTicketStatus } from "../_lib/operational-queue";
import { ProductThumb } from "../manager/_components/product-thumb";

export default function KitchenPage() {
  const [tickets, setTickets] = useState<OperationalTicket[]>(() => loadOperationalTickets());

  useEffect(() => subscribeOperationalTickets(setTickets), []);
  useEffect(() => subscribeOperationalSounds(() => {
    const context = typeof window !== "undefined" ? new AudioContext() : null;
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "square";
    oscillator.frequency.value = 880;
    gain.gain.value = 0.05;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.15);
    oscillator.stop(context.currentTime + 0.16);
    void context.close();
  }), []);

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
            <small>Modo demo local • sem banco</small>
          </div>
          <CookingPot aria-hidden="true" size={22} />
        </header>
        <div className="ops-list">
          {kitchenTickets.map((ticket) => (
            <article className="ops-card" key={ticket.id}>
              <div>
                <h2>{ticket.orderId.slice(0, 8)} - {ticket.customer}</h2>
                <ul className="ops-ticket-items">
                  {ticket.items.map((item) => (
                    <li className="ops-ticket-item" key={`${ticket.id}-${item.name}`}>
                      <ProductThumb fallbackLabel="Foto" image={item.image ?? null} />
                      <span>{item.quantity}x {item.name}</span>
                    </li>
                  ))}
                </ul>
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
