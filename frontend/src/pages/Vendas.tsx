// src/pages/Vendas.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Vendas() {
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    cliente_id: "",
    usuario_id: 1, // fixo por enquanto
    produto_id: "",
    quantidade: 1,
    forma_pagamento: "pix",
  });

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [c, p, v] = await Promise.all([
        api.get("/clientes"),
        api.get("/produtos"),
        api.get("/vendas"),
      ]);

      setClientes(c.data || []);
      setProdutos(p.data || []);
      setVendas(v.data || []);
    } catch (err) {
      console.error("Erro ao carregar dados de vendas:", err);
    } finally {
      setLoading(false);
    }
  };

  const lançarVenda = async () => {
    try {
      await api.post("/vendas", {
        cliente_id: Number(form.cliente_id),
        usuario_id: Number(form.usuario_id),
        produto_id: Number(form.produto_id),
        quantidade: Number(form.quantidade),
        forma_pagamento: form.forma_pagamento,
      });

      setForm({
        cliente_id: "",
        usuario_id: 1,
        produto_id: "",
        quantidade: 1,
        forma_pagamento: "pix",
      });

      carregarDados();
    } catch (err) {
      console.error("Erro ao lançar venda:", err);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <div>
      <div className="card">
        <h3>Nova venda</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr",
            gap: 8,
          }}
        >
          {/* Cliente */}
          <select
            value={form.cliente_id}
            onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
          >
            <option value="">Cliente…</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>

          {/* Produto */}
          <select
            value={form.produto_id}
            onChange={(e) => setForm({ ...form, produto_id: e.target.value })}
          >
            <option value="">Produto…</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} (R$ {Number(p.preco).toFixed(2)})
              </option>
            ))}
          </select>

          {/* Quantidade */}
          <input
            type="number"
            min="1"
            value={form.quantidade}
            onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
          />

          {/* Forma de pagamento */}
          <select
            value={form.forma_pagamento}
            onChange={(e) => setForm({ ...form, forma_pagamento: e.target.value })}
          >
            <option value="pix">pix</option>
            <option value="dinheiro">dinheiro</option>
            <option value="cartão">cartão</option>
            <option value="fiado">fiado</option>
          </select>

          {/* Botão */}
          <button onClick={lançarVenda}>Lançar</button>
        </div>

        <small style={{ opacity: 0.7 }}>
          Usuário (vendedor) fixo em 1 por enquanto — depois faremos login com perfil.
        </small>
      </div>

      <div className="card">
        <h3>Vendas (recentes)</h3>

        {loading ? (
          <small>Carregando…</small>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Produto</th>
                <th>Qtd</th>
                <th>Valor</th>
                <th>Pagamento</th>
                <th>Data</th>
              </tr>
            </thead>

            <tbody>
              {vendas.map((v) => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>{v.cliente_nome}</td>
                  <td>{v.produto_nome}</td>
                  <td>{v.quantidade}</td>
                  <td>R$ {Number(v.valor_total).toFixed(2)}</td>
                  <td>{v.forma_pagamento}</td>
                  <td>{new Date(v.data_venda).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
