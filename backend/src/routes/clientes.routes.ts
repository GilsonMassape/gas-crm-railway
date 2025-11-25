// C:\crm-gas\backend\src\routes\clientes.routes.ts

import { Router } from 'express';
// Importa o controller que você acabou de criar
import { getClients } from '../controllers/clientes.controller'; // Corrigido para o nome do arquivo que você criou

const router = Router();

// Rota GET para listar clientes
router.get('/', getClients);

// ... (outras rotas)

export default router;
