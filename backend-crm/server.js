const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Carregar variáveis de ambiente do .env
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Configuração do CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Permitir acesso do frontend
    credentials: true // Importante para cookies e sessões
} ));

// Middlewares
app.use(express.json()); // Para parsear JSON no corpo das requisições
app.use(cookieParser()); // Para parsear cookies

// Configuração do banco de dados PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Necessário para Render ou outros provedores com SSL self-signed
    }
});

// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido.' });
        req.user = user;
        next();
    });
};

// Rota de registro de admin (apenas para configuração inicial)
app.post('/api/setup/registrar-admin', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Verificar se já existe algum admin
        const adminCheck = await pool.query('SELECT * FROM users WHERE role = $1', ['admin']);
        if (adminCheck.rows.length > 0) {
            return res.status(403).json({ message: 'Admin já registrado. Operação não permitida.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *',
            [username, hashedPassword, 'admin']
        );
        res.status(201).json({ message: 'Admin registrado com sucesso!', user: newUser.rows[0] });
    } catch (error) {
        console.error('Erro ao registrar admin:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// Rota para verificar se o admin já foi registrado (SEM AUTENTICAÇÃO)
app.get('/api/setup/verificar-admin', async (req, res) => {
    try {
        const adminCheck = await pool.query('SELECT * FROM users WHERE role = $1', ['admin']);
        if (adminCheck.rows.length > 0) {
            return res.json({ adminRegistered: true });
        } else {
            return res.json({ adminRegistered: false });
        }
    } catch (error) {
        console.error('Erro ao verificar admin:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// Rota de login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Credenciais inválidas.' });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Credenciais inválidas.' });
        }

        const token = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' } );
        res.json({ message: 'Login bem-sucedido!', role: user.rows[0].role });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// Rota de logout
app.post('/api/logout', (req, res) => {
    res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' } );
    res.json({ message: 'Logout bem-sucedido!' });
});

// Rota para verificar o status de autenticação
app.get('/api/auth-status', authenticateToken, (req, res) => {
    res.json({ authenticated: true, role: req.user.role });
});

// Rotas de gerenciamento de clientes (protegidas)
app.get('/api/clientes', authenticateToken, async (req, res) => {
    try {
        const { search, bairro, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM clientes';
        let countQuery = 'SELECT COUNT(*) FROM clientes';
        const params = [];
        const countParams = [];
        const conditions = [];

        if (search) {
            conditions.push(`(nome ILIKE $${params.length + 1} OR telefone ILIKE $${params.length + 1})`);
            params.push(`%${search}%`);
            countParams.push(`%${search}%`);
        }
        if (bairro) {
            conditions.push(`bairro ILIKE $${params.length + 1}`);
            params.push(`%${bairro}%`);
            countParams.push(`%${bairro}%`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
            countQuery += ' WHERE ' + conditions.join(' AND ');
        }

        query += ` ORDER BY nome ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);
        const totalClientes = await pool.query(countQuery, countParams);

        res.json({
            clientes: result.rows,
            totalPages: Math.ceil(totalClientes.rows[0].count / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

app.post('/api/clientes', authenticateToken, async (req, res) => {
    try {
        const { nome, telefone, endereco, bairro, observacoes } = req.body;
        const newClient = await pool.query(
            'INSERT INTO clientes (nome, telefone, endereco, bairro, observacoes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [nome, telefone, endereco, bairro, observacoes]
        );
        res.status(201).json(newClient.rows[0]);
    } catch (error) {
        console.error('Erro ao adicionar cliente:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

app.put('/api/clientes/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, telefone, endereco, bairro, observacoes } = req.body;
        const updatedClient = await pool.query(
            'UPDATE clientes SET nome = $1, telefone = $2, endereco = $3, bairro = $4, observacoes = $5 WHERE id = $6 RETURNING *',
            [nome, telefone, endereco, bairro, observacoes, id]
        );
        if (updatedClient.rows.length === 0) {
            return res.status(404).json({ message: 'Cliente não encontrado.' });
        }
        res.json(updatedClient.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

app.delete('/api/clientes/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedClient = await pool.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [id]);
        if (deletedClient.rows.length === 0) {
            return res.status(404).json({ message: 'Cliente não encontrado.' });
        }
        res.json({ message: 'Cliente excluído com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// Rota para obter bairros únicos (para filtros)
app.get('/api/bairros', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT DISTINCT bairro FROM clientes WHERE bairro IS NOT NULL AND bairro != \'\' ORDER BY bairro ASC');
        res.json(result.rows.map(row => row.bairro));
    } catch (error) {
        console.error('Erro ao buscar bairros:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// Rota de relatórios (exemplo: contagem de clientes por bairro)
app.get('/api/relatorios/clientes-por-bairro', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT bairro, COUNT(*) FROM clientes GROUP BY bairro ORDER BY COUNT(*) DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao gerar relatório de clientes por bairro:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
