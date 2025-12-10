import { useState } from "react";
import Clientes from "./pages/Clientes";
import Produtos from "./pages/Produtos";
import Vendas from "./pages/Vendas";
import Relatorios from "./pages/Relatorios";

export default function App() {
  const [tab, setTab] = useState("clientes");

  const tabs = [
    { key: "clientes", label: "Clientes" },
    { key: "produtos", label: "Produtos / Estoque" },
    { key: "vendas", label: "Vendas" },
    { key: "relatorios", label: "Relatórios" },
  ];

  return (
    <div className="app-container">
      <nav className="tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? "tab active" : "tab"}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="tab-content">
        {tab === "clientes" && <Clientes />}
        {tab === "produtos" && <Produtos />}
        {tab === "vendas" && <Vendas />}
        {tab === "relatorios" && <Relatorios />}
      </main>
    </div>
  );
}
