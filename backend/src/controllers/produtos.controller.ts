import { Request, Response } from "express";
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.PGHOST || "crm_postgres",
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || "crm",
  password: process.env.PGPASSWORD || "crm",
  database: process.env.PGDATABASE || "crm",
});

export const listProdutos = async (_req: Request, res: Response) => {
  const r = await pool.query("SELECT id,nome,tipo,preco,estoque,created_at FROM produtos ORDER BY id DESC");
  res.json(r.rows);
};

export const createProduto = async (req: Request, res: Response) => {
  const { nome, tipo, preco, estoque = 0 } = req.body;
  const r = await pool.query(
    "INSERT INTO produtos (nome,tipo,preco,estoque) VALUES ($1,$2,$3,$4) RETURNING *",
    [nome, tipo, preco, estoque]
  );
  res.status(201).json(r.rows[0]);
};
