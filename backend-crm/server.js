const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido.' });
        req.user = user;
        next();
    });
};

// AUTH ROUTES
app.post('/api/setup/registrar-admin', async (req, res) => {
    try {
        const { username, password } = req.body;
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

        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });
        res.json({ message: 'Login bem-sucedido!', role: user.rows[0].role });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

app.post('/api/logout', (req, res) => {
    res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });
    res.json({ message: 'Logout bem-sucedido!' });
});

app.get('/api/auth-status', authenticateToken, (req, res) => {
    res.json({ authenticated: true, role: req.user.role });
});

// CLIENTES ROUTES
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

app.get('/api/bairros', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT DISTINCT bairro FROM clientes WHERE bairro IS NOT NULL AND bairro != \'\' ORDER BY bairro ASC');
        res.json(result.rows.map(row => row.bairro));
    } catch (error) {
        console.error('Erro ao buscar bairros:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

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

// PRODUTOS ROUTES
app.get('/api/produtos', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM produtos ORDER BY nome ASC');
        res.json({ data: result.rows });
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
});

app.post('/api/produtos', authenticateToken, async (req, res) => {
    try {
        const { nome, tipo, preco, estoque } = req.body;
        const result = await pool.query(
            'INSERT INTO produtos (nome, tipo, preco, estoque) VALUES ($1, $2, $3, $4) RETURNING *',
            [nome, tipo, preco, estoque]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        res.status(500).json({ error: 'Erro ao criar produto' });
    }
});

app.put('/api/produtos/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, tipo, preco, estoque } = req.body;
        const result = await pool.query(
            'UPDATE produtos SET nome = $1, tipo = $2, preco = $3, estoque = $4 WHERE id = $5 RETURNING *',
            [nome, tipo, preco, estoque, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
});

app.delete('/api/produtos/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM produtos WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        res.json({ message: 'Produto deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        res.status(500).json({ error: 'Erro ao deletar produto' });
    }
});

// ESTOQUE ROUTES
app.get('/api/estoque/atual', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                p.id as produto_id,
                p.nome as produto_nome,
                p.tipo,
                p.estoque as estoque_atual,
                COALESCE(SUM(CASE WHEN e.tipo = 'entrada' THEN e.quantidade ELSE 0 END), 0) as total_entradas,
                COALESCE(SUM(CASE WHEN e.tipo IN ('saida', 'avaria') THEN e.quantidade ELSE 0 END), 0) as total_avarias,
                CASE 
                    WHEN p.estoque < 10 THEN 'crítico'
                    WHEN p.estoque < 30 THEN 'baixo'
                    ELSE 'normal'
                END as status
            FROM produtos p
            LEFT JOIN estoque_movimentacoes e ON p.id = e.produto_id
            GROUP BY p.id, p.nome, p.tipo, p.estoque
            ORDER BY p.nome ASC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar estoque atual:', error);
        res.status(500).json({ error: 'Erro ao buscar estoque atual' });
    }
});

app.post('/api/estoque/entrada', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { produto_id, quantidade, observacao } = req.body;
        
        await client.query('BEGIN');
        
        // Registrar movimentação
        await client.query(
            'INSERT INTO estoque_movimentacoes (produto_id, tipo, quantidade, observacao) VALUES ($1, $2, $3, $4)',
            [produto_id, 'entrada', quantidade, observacao]
        );
        
        // Atualizar estoque do produto
        await client.query(
            'UPDATE produtos SET estoque = estoque + $1 WHERE id = $2',
            [quantidade, produto_id]
        );
        
        await client.query('COMMIT');
        res.json({ message: 'Entrada registrada com sucesso' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao registrar entrada:', error);
        res.status(500).json({ error: 'Erro ao registrar entrada' });
    } finally {
        client.release();
    }
});

app.post('/api/estoque/avaria', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { produto_id, quantidade, observacao } = req.body;
        
        await client.query('BEGIN');
        
        // Verificar se tem estoque suficiente
        const produto = await client.query('SELECT estoque FROM produtos WHERE id = $1', [produto_id]);
        if (produto.rows[0].estoque < quantidade) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Estoque insuficiente' });
        }
        
        // Registrar movimentação
        await client.query(
            'INSERT INTO estoque_movimentacoes (produto_id, tipo, quantidade, observacao) VALUES ($1, $2, $3, $4)',
            [produto_id, 'avaria', quantidade, observacao]
        );
        
        // Atualizar estoque do produto
        await client.query(
            'UPDATE produtos SET estoque = estoque - $1 WHERE id = $2',
            [quantidade, produto_id]
        );
        
        await client.query('COMMIT');
        res.json({ message: 'Avaria registrada com sucesso' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao registrar avaria:', error);
        res.status(500).json({ error: 'Erro ao registrar avaria' });
    } finally {
        client.release();
    }
});

app.get('/api/estoque/historico', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                e.id,
                e.produto_id,
                p.nome as produto_nome,
                e.tipo,
                e.quantidade,
                e.observacao,
                e.data_movimentacao
            FROM estoque_movimentacoes e
            JOIN produtos p ON e.produto_id = p.id
            ORDER BY e.data_movimentacao DESC
            LIMIT 100
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
