import { Router } from 'express';
// Importe seus controllers de clientes aqui
import { getClients } from '../controllers/clientController'; // ASSUMIMOS que você tem um controller chamado getClients

const router = Router();

// Exemplo de rota GET para listar clientes
router.get('/', getClients); // DESCOMENTADO

// Exemplo de rota POST para criar cliente
// router.post('/', createClient);

export default router;
