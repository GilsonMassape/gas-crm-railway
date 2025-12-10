// backend/src/services/caixa.service.ts

import { pool } from '../db';

export async function abrirCaixa(userId: number, saldoInicial: number) {
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

export async function getCaixaAtual(userId: number) {
    // CORREÇÃO APLICADA: Trocando 'usuario_abertura_id' por 'usuario_id'
    const result = await pool.query(
        `SELECT * FROM caixas 
         WHERE usuario_id = $1 AND status = 'aberto'`,
        [userId]
    );

    // CORREÇÃO DE LÓGICA: Retorna o primeiro resultado ou null se não houver caixa aberto
    return result.rows[0] || null;
}

export async function fecharCaixa(userId: number, saldoFinal: number) {
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
