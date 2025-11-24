import { Router } from "express";
import clientes from "./clientes.routes";
import produtos from "./produtos.routes";
import vendas from "./vendas.routes";
import relatorios from "./relatorios.routes";

const router = Router();

router.use("/clientes", clientes);
router.use("/produtos", produtos);
router.use("/vendas", vendas);
router.use("/relatorios", relatorios);

export default router;

