import { Router } from 'express';
import { loginController } from '../controllers/auth.controller'; // Assumindo que você tem um controller

const authRoutes = Router();

// Rota de Login (POST /auth/login)
authRoutes.post('/login', loginController);

// Rota de Registro (POST /auth/register)
// authRoutes.post('/register', registerController); 

export default authRoutes;
