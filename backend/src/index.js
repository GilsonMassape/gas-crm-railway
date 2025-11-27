import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();

// --- INÍCIO DA CORREÇÃO DE CORS ---
// Domínios permitidos para CORS
// Adicionamos o novo domínio do Vercel diretamente, além do que está na variável de ambiente.
const allowedOrigins = [
    'http://localhost:3000',
    'https://gas-crm-railway.vercel.app', // NOVO DOMÍNIO PRINCIPAL DO VERCEL
    'https://crm-gas.vercel.app', // Domínio antigo (mantido por segurança )
    process.env.FRONTEND_URL, // O domínio que está na variável de ambiente do Render
];

// Configuração do CORS
app.use(cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Permite requisições sem 'origin' (como apps mobile ou curl)
        if (!origin) return callback(null, true);
        
        // Verifica se a origem está na lista de permitidos
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // Se não estiver na lista, verifica se é um subdomínio de preview do Vercel
        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    },
    credentials: true,
}));
// --- FIM DA CORREÇÃO DE CORS ---

app.use(express.json());
app.use(routes);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
