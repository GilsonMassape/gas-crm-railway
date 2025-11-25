// C:\crm-gas\backend\src\controllers\clientes.controller.ts

import { Request, Response } from 'express';

// Controller de exemplo para listar clientes
export const getClients = (req: Request, res: Response) => {
    // Retorna um array vazio para evitar o TypeError: R.map is not a function no Frontend
    // O Frontend espera um array, então vamos dar um array vazio por enquanto.
    return res.status(200).json([]);
};

// Se você tiver outros métodos, adicione-os aqui
// export const createClient = (req: Request, res: Response) => { ... };
