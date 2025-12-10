// src/pages/Relatorios.jsx
import React, { useState } from "react";
import api from "../services/api";

export default function Relatorios() {
  const hoje = new Date().toISOString().slice(0, 10);

  const [inicio, setInicio] = useState(hoje);
  const [fim, setFim] = useState(hoje);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(false);

  const calcular = async () => {
    try {
      setLoading(true);
      const r = await api.get(`/relatorios/lucro?inicio=${inicio}&fim=${fim}`);
      setTotal(r.data?.total || 0);
    } catch (err) {
      console.error("Erro ao carregar relatório:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Relatório de lucro (período)</h3>

      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <input
          type="date"
          value={inicio}
          onChange={(e) => setInicio(e.target.value)}
        />

        <span>até</span>

        <input
          type="date"
          value={fim}
          onChange={(e) => setFim(e.target.value)}
        />

        <button onClick={calcular}>Calcular</button>
      </div>

      {loading && <small>Gerando relatório…</small>}

      {total !== null && !loading && (
        <p style={{ marginTop: 10 }}>
          Total do período: <b>R$ {Number(total).toFixed(2)}</b>
        </p>
      )}
    </div>
  );
}
