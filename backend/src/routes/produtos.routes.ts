import { Router } from "express";
import { listProdutos, createProduto } from "../controllers/produtos.controller";

const router = Router();
router.get("/", listProdutos);
router.post("/", createProduto);

export default router;
