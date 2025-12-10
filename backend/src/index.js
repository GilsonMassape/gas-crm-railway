const express = require('express');
const cors = require('cors');
const { pool } = require('./db');
const {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    loginUser
} = require('./controllers/user.controller');

// =================================================================
// INÍCIO DA CORREÇÃO: Importação do Controlador do Caixa
// =================================================================
const { 
    abrirCaixaController, 
    getCaixaAtualController, 
    fecharCaixaController 
} = require('./controllers/caixa.controller');
// =================================================================
// FIM DA CORREÇÃO
// =================================================================

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running');
});

// Rotas de Usuário
app.get('/users', getUsers);
app.get('/users/:id', getUserById);
app.post('/users', createUser);
app.put('/users/:id', updateUser);
app.delete('/users/:id', deleteUser);
app.post('/login', loginUser);

// =================================================================
// INÍCIO DA CORREÇÃO: Rotas do Caixa
// =================================================================
// Rotas do Caixa
app.post('/caixa/abrir', abrirCaixaController);
app.get('/caixa/atual/:userId', getCaixaAtualController);
app.post('/caixa/fechar', fecharCaixaController);
// =================================================================
// FIM DA CORREÇÃO
// =================================================================

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
