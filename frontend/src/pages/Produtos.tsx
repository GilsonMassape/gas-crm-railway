// src/pages/Produtos.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    nome: "",
    tipo: "gás",
    preco: "",
    estoque: "",
  });

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      const res = await api.get("/produtos");
      setProdutos(res.data || []);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
    } finally {
      setLoading(false);
    }
  };

  const salvarProduto = async () => {
    try {
      await api.post("/produtos", {
        ...form,
        preco: Number(form.preco),
        estoque: Number(form.estoque),
      });

      setForm({ nome: "", tipo: "gás", preco: "", estoque: "" });
      carregarProdutos();
    } catch (err) {
      console.error("Erro ao salvar produto:", err);
    }
  };

  const removerProduto = async (id) => {
    try {
      await api.delete(`/produtos/${id}`);
      carregarProdutos();
    } catch (err) {
      console.error("Erro ao remover produto:", err);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  return (
    <div>
      <div className="card">
        <h3>Novo produto</h3>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 8 }}>
          <input
            placeholder="nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />

          <select
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          >
            <option value="gás">gás</option>
            <option value="água">água</option>
          </select>

          <input
            placeholder="preço"
            value={form.preco}
            onChange={(e) => setForm({ ...form, preco: e.target.value })}
          />

          <input
            placeholder="estoque"
            value={form.estoque}
            onChange={(e) => setForm({ ...form, estoque: e.target.value })}
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <button onClick={salvarProduto}>Salvar</button>
        </div>
      </div>

      <div className="card">
        <h3>Estoque</h3>

        {loading ? (
          <small>Carregando…</small>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {produtos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.nome}</td>
                  <td>{p.tipo}</td>
                  <td>R$ {Number(p.preco).toFixed(2)}</td>
                  <td>{p.estoque}</td>

                  <td>
                    <button onClick={() => removerProduto(p.id)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
