import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Saúde
app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ------- CLIENTES -------
app.get("/api/clientes", async (_req, res) => {
  const { rows } = await pool.query("SELECT * FROM clientes ORDER BY id");
  res.json(rows);
});

app.post("/api/clientes", async (req, res) => {
  const { nome, telefone, endereco, bairro, cidade } = req.body;
  const q = `INSERT INTO clientes (nome, telefone, endereco, bairro, cidade)
             VALUES ($1,$2,$3,$4,$5) RETURNING *`;
  const { rows } = await pool.query(q, [nome, telefone, endereco, bairro, cidade]);
  res.status(201).json(rows[0]);
});

app.put("/api/clientes/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, telefone, endereco, bairro, cidade } = req.body;
  const q = `UPDATE clientes SET nome=$1, telefone=$2, endereco=$3, bairro=$4, cidade=$5
             WHERE id=$6 RETURNING *`;
  const { rows } = await pool.query(q, [nome, telefone, endereco, bairro, cidade, id]);
  res.json(rows[0]);
});

app.delete("/api/clientes/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM clientes WHERE id=$1", [id]);
  res.status(204).end();
});

// ------- PRODUTOS -------
app.get("/api/produtos", async (_req, res) => {
  const { rows } = await pool.query("SELECT * FROM produtos ORDER BY id");
  res.json(rows);
});

app.post("/api/produtos", async (req, res) => {
  const { nome, tipo, preco, estoque } = req.body;
  const q = `INSERT INTO produtos (nome, tipo, preco, estoque)
             VALUES ($1,$2,$3,$4) RETURNING *`;
  const { rows } = await pool.query(q, [nome, tipo, preco, estoque]);
  res.status(201).json(rows[0]);
});

app.put("/api/produtos/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, tipo, preco, estoque } = req.body;
  const q = `UPDATE produtos SET nome=$1, tipo=$2, preco=$3, estoque=$4
             WHERE id=$5 RETURNING *`;
  const { rows } = await pool.query(q, [nome, tipo, preco, estoque, id]);
  res.json(rows[0]);
});

app.delete("/api/produtos/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM produtos WHERE id=$1", [id]);
  res.status(204).end();
});

// ------- VENDAS (com baixa de estoque) -------
app.get("/api/vendas", async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT v.*, c.nome AS cliente_nome, p.nome AS produto_nome
     FROM vendas v
     JOIN clientes c ON c.id=v.cliente_id
     JOIN produtos p ON p.id=v.produto_id
     ORDER BY v.id DESC`
  );
  res.json(rows);
});

app.post("/api/vendas", async (req, res) => {
  const client = await pool.connect();
  try {
    const { cliente_id, usuario_id, produto_id, quantidade, forma_pagamento } = req.body;

    await client.query("BEGIN");

    // Busca preço do produto
    const { rows: prodRows } = await client.query(
      "SELECT preco, estoque FROM produtos WHERE id=$1 FOR UPDATE",
      [produto_id]
    );
    if (!prodRows.length) throw new Error("Produto não encontrado");
    if (prodRows[0].estoque < quantidade) throw new Error("Estoque insuficiente");

    const valor_total = Number(prodRows[0].preco) * Number(quantidade);

    // Insere venda
    const ins = `INSERT INTO vendas (cliente_id, usuario_id, produto_id, quantidade, valor_total, forma_pagamento)
                 VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
    const { rows: vendaRows } = await client.query(ins, [
      cliente_id, usuario_id, produto_id, quantidade, valor_total, forma_pagamento
    ]);

    // Atualiza estoque
    await client.query(
      "UPDATE produtos SET estoque = estoque - $1 WHERE id=$2",
      [quantidade, produto_id]
    );

    await client.query("COMMIT");
    res.status(201).json(vendaRows[0]);
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(400).json({ error: e.message });
  } finally {
    client.release();
  }
});

// ------- Relatórios simples -------
app.get("/api/relatorios/lucro", async (req, res) => {
  const { inicio, fim } = req.query; // 'YYYY-MM-DD'
  const { rows } = await pool.query(
    `SELECT COALESCE(SUM(valor_total),0) as total
     FROM vendas
     WHERE date(data_venda) BETWEEN $1 AND $2`,
    [inicio, fim]
  );
  res.json({ periodo: { inicio, fim }, total: Number(rows[0].total) });
});
// Rotas de Vendas (Sales)

import salesRoutes from './routes/salesRoutes.js';
app.use('/api/sales', salesRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Backend rodando na porta " + port));
