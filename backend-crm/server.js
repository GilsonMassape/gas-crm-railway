require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-super-seguro-aqui-123';

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Middleware de autenticação
function authenticateToken(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
}

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    mensagem: 'API do CRM de Gás - Dr. Gilson',
    versao: '2.0.0',
    status: 'online',
    servidor: 'Railway'
  });
});

// ==================== ROTAS DE AUTENTICAÇÃO ====================

// Criar administrador inicial
app.post('/api/setup/criar-admin', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // Verificar se já existe algum usuário
    const usuariosExistentes = await pool.query('SELECT COUNT(*) FROM usuarios');
    if (parseInt(usuariosExistentes.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Administrador já existe' });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar usuário admin
    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha, tipo) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, tipo',
      [nome, email, senhaHash, 'admin']
    );

    const usuario = result.rows[0];

    // Gerar token
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
    });

    res.json({
      mensagem: 'Administrador criado com sucesso',
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo },
      token
    });
  } catch (error) {
    console.error('Erro ao criar admin:', error);
    res.status(500).json({ error: 'Erro ao criar administrador' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const usuario = result.rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      mensagem: 'Login realizado com sucesso',
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo },
      token
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Verificar autenticação
app.get('/api/auth/verificar', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nome, email, tipo FROM usuarios WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ usuario: result.rows[0] });
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    res.status(500).json({ error: 'Erro ao verificar autenticação' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ mensagem: 'Logout realizado com sucesso' });
});

// ==================== ROTAS DE CLIENTES ====================

// Listar todos os clientes
app.get('/api/clientes', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, 
        CASE 
          WHEN c.ultima_compra IS NULL THEN false
          WHEN CURRENT_DATE - c.ultima_compra >= c.ciclo_compra THEN true
          ELSE false
        END as em_alerta
      FROM clientes c
      ORDER BY c.nome ASC
    `);

    res.json({ clientes: result.rows });
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ error: 'Erro ao listar clientes' });
  }
});

// Criar novo cliente
app.post('/api/clientes', authenticateToken, async (req, res) => {
  try {
    const { nome, telefone, endereco, ciclo_compra } = req.body;

    const result = await pool.query(
      'INSERT INTO clientes (nome, telefone, endereco, ciclo_compra) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, telefone, endereco, ciclo_compra || 30]
    );

    res.json({ mensagem: 'Cliente cadastrado com sucesso', cliente: result.rows[0] });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro ao cadastrar cliente' });
  }
});

// Atualizar cliente
app.put('/api/clientes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone, endereco, ciclo_compra } = req.body;

    const result = await pool.query(
      'UPDATE clientes SET nome = $1, telefone = $2, endereco = $3, ciclo_compra = $4, atualizado_em = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [nome, telefone, endereco, ciclo_compra, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({ mensagem: 'Cliente atualizado com sucesso', cliente: result.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

// Deletar cliente
app.delete('/api/clientes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({ mensagem: 'Cliente deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ error: 'Erro ao deletar cliente' });
  }
});

// Registrar compra
app.post('/api/clientes/:id/compra', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { data_compra, valor, observacoes } = req.body;

    // Registrar compra
    await pool.query(
      'INSERT INTO compras (cliente_id, data_compra, valor, observacoes) VALUES ($1, $2, $3, $4)',
      [id, data_compra || new Date(), valor, observacoes]
    );

    // Atualizar última compra do cliente
    await pool.query(
      'UPDATE clientes SET ultima_compra = $1, atualizado_em = CURRENT_TIMESTAMP WHERE id = $2',
      [data_compra || new Date(), id]
    );

    res.json({ mensagem: 'Compra registrada com sucesso' });
  } catch (error) {
    console.error('Erro ao registrar compra:', error);
    res.status(500).json({ error: 'Erro ao registrar compra' });
  }
});

// ==================== ROTAS DE USUÁRIOS ====================

// Listar usuários
app.get('/api/usuarios', authenticateToken, async (req, res) => {
  try {
    // Apenas admins podem listar usuários
    if (req.user.tipo !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const result = await pool.query('SELECT id, nome, email, tipo, criado_em FROM usuarios ORDER BY nome ASC');
    res.json({ usuarios: result.rows });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

// Criar novo usuário
app.post('/api/usuarios', authenticateToken, async (req, res) => {
  try {
    // Apenas admins podem criar usuários
    if (req.user.tipo !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { nome, email, senha, tipo } = req.body;

    // Verificar se email já existe
    const emailExiste = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (emailExiste.rows.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha, tipo) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, tipo',
      [nome, email, senhaHash, tipo || 'comum']
    );

    res.json({ mensagem: 'Usuário criado com sucesso', usuario: result.rows[0] });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// Deletar usuário
app.delete('/api/usuarios/:id', authenticateToken, async (req, res) => {
  try {
    // Apenas admins podem deletar usuários
    if (req.user.tipo !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { id } = req.params;

    // Não pode deletar a si mesmo
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Você não pode deletar sua própria conta' });
    }

    const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ mensagem: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
});

// ==================== ROTAS DE ESTATÍSTICAS ====================

app.get('/api/estatisticas', authenticateToken, async (req, res) => {
  try {
    // Total de clientes
    const totalClientes = await pool.query('SELECT COUNT(*) FROM clientes');
    
    // Clientes em alerta
    const clientesAlerta = await pool.query(`
      SELECT COUNT(*) FROM clientes 
      WHERE ultima_compra IS NULL 
      OR CURRENT_DATE - ultima_compra >= ciclo_compra
    `);

    // Compras hoje
    const comprasHoje = await pool.query(`
      SELECT COUNT(*) FROM compras 
      WHERE DATE(data_compra) = CURRENT_DATE
    `);

    res.json({
      total_clientes: parseInt(totalClientes.rows[0].count),
      clientes_alerta: parseInt(clientesAlerta.rows[0].count),
      mensagens_hoje: parseInt(comprasHoje.rows[0].count)
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// Inicializar servidor
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();

