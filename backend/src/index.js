import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
import salesRoutes from "./routes/salesRoutes.js";

dotenv.config();

const app = express();

/* ============================================
   CORS CORRIGIDO – FUNCIONA NA RENDER + VERCEL
   ============================================ */

const allowedOrigins = [
  "http://localhost:5173",               
  "http://localhost:3000",               
  "https://gas-crm-railway.vercel.app",  // FRONTEND PRODUÇÃO
];

// Se a Render tiver FRONTEND_URL, adiciona
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite mobile, Postman, chamadas internas etc.
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Libera subdomínios do Vercel (*.vercel.app)
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      return callback(
        new Error("CORS bloqueado para a origem: " + origin),
        false
      );
    },
    credentials: true,
  })
);

app.use(express.json());

/* ============================================
   ROTAS
   ============================================ */

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

  const { rows } = await pool.query(q, [
    nome,
    telefone,
    endereco,
    bairro,
    cidade,
    id,
  ]);

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

  const { rows } = await pool.query(q, [
    nome,
    tipo,
    preco,
    estoque,
    id,
  ]);

  res.json(rows[0]);
});

app.delete("/api/produtos/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM produtos WHERE id=$1", [id]);
  res.status(204).end();
});

// ------- VENDAS -------
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
    const { cliente_id, usuario_id, produto_id, quantidade, forma_pagamento } =
      req.body;

    await client.query("BEGIN");

    const { rows: prodRows } = await client.query(
      "SELECT preco, estoque FROM produtos WHERE id=$1 FOR UPDATE",
      [produto_id]
    );

    if (!prodRows.length) throw new Error("Produto não encontrado");
    if (prodRows[0].estoque < quantidade) throw new Error("Estoque insuficiente");

    const valor_total = Number(prodRows[0].preco) * Number(quantidade);

    const ins = `INSERT INTO vendas (cliente_id, usuario_id, produto_id, quantidade, valor_total, forma_pagamento)
                 VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;

    const { rows: vendaRows } = await client.query(ins, [
      cliente_id,
      usuario_id,
      produto_id,
      quantidade,
      valor_total,
      forma_pagamento,
    ]);

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

// ------- RELATÓRIO -------
app.get("/api/relatorios/lucro", async (req, res) => {
  const { inicio, fim } = req.query;

  const { rows } = await pool.query(
    `SELECT COALESCE(SUM(valor_total),0) as total
     FROM vendas
     WHERE date(data_venda) BETWEEN $1 AND $2`,
    [inicio, fim]
  );

  res.json({
    periodo: { inicio, fim },
    total: Number(rows[0].total),
  });
});

// Rotas adicionais de vendas
app.use("/api/sales", salesRoutes);

// Porta
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Backend rodando na porta " + port);
});
