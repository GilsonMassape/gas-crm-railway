const { pool } = require('../db');

async function abrirCaixa(userId, saldoInicial) {
    // 1. Verificar se já existe um caixa aberto para este usuário
    const caixaAtual = await getCaixaAtual(userId);
    if (caixaAtual) {
        throw new Error('Você já possui um caixa aberto');
    }

    // 2. Abrir o novo caixa
    const result = await pool.query(
        `INSERT INTO caixas (usuario_id, saldo_inicial, status, data_abertura) 
         VALUES ($1, $2, 'aberto', NOW()) 
         RETURNING *`,
        [userId, saldoInicial]
    );

    return result.rows[0];
}

async function getCaixaAtual(userId) {
    // CORREÇÃO: Usando 'usuario_id' que é a coluna correta
    const result = await pool.query(
        `SELECT * FROM caixas 
         WHERE usuario_id = $1 AND status = 'aberto'`,
        [userId]
    );

    return result.rows[0] || null;
}

async function fecharCaixa(userId, saldoFinal) {
    // 1. Obter o caixa atual
    const caixaAtual = await getCaixaAtual(userId);
    if (!caixaAtual) {
        throw new Error('Nenhum caixa aberto para fechar');
    }

    // 2. Fechar o caixa
    const result = await pool.query(
        `UPDATE caixas 
         SET saldo_final = $1, status = 'fechado', data_fechamento = NOW() 
         WHERE id = $2 
         RETURNING *`,
        [saldoFinal, caixaAtual.id]
    );

    return result.rows[0];
}

module.exports = {
    abrirCaixa,
    getCaixaAtual,
    fecharCaixa
};
