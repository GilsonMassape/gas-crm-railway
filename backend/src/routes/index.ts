import { Router } from 'express';
import authRoutes from './auth.routes';
import produtosRoutes from './produtos.routes';
import vendasRoutes from './vendas.routes';
import clientesRoutes from './clientes.routes';

const routes = Router();

// Adiciona o prefixo /api a todas as rotas
routes.use('/api', authRoutes);
routes.use('/api', produtosRoutes);
routes.use('/api', vendasRoutes);
routes.use('/api', clientesRoutes);

export default routes;

