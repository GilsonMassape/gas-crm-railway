import { Router } from 'express';
import clientes from "./clientes.routes";
import produtos from "./produtos.routes";
import vendas from "./vendas.routes";
import relatorios from "./relatorios.routes";
import authRoutes from "./auth.routes"; // NOVO: Importa a rota de autenticação

const router = Router();

router.use("/clientes", clientes);
router.use("/produtos", produtos);
router.use("/vendas", vendas);
router.use("/relatorios", relatorios);
router.use("/auth", authRoutes); // NOVO: Usa a rota de autenticação

export default router;
