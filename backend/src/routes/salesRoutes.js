// C:\crm-gas\backend\src\routes\salesRoutes.js
import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// Exemplo simples para validar a rota de vendas
router.get('/health', (req, res) => {
  res.json({ ok: true, scope: 'sales' });
});

// (Depois moveremos as rotas de vendas pra cá, se quiser)
export default router;
