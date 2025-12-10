import React from "react";
import { Outlet, Link } from "react-router-dom";

export default function App() {
  return (
    <div>
      <header style={{ background: "#f4b400", padding: "15px" }}>
        <h2>CRM GAS — Vendas & Estoque</h2>

        <nav style={{ marginTop: "10px" }}>
          <Link style={{ marginRight: 15 }} to="/clientes">Clientes</Link>
          <Link style={{ marginRight: 15 }} to="/produtos">Produtos</Link>
          <Link style={{ marginRight: 15 }} to="/vendas">Vendas</Link>
          <Link style={{ marginRight: 15 }} to="/relatorios">Relatórios</Link>
        </nav>
      </header>

      <main style={{ padding: 20 }}>
        <Outlet />
      </main>
    </div>
  );
}
