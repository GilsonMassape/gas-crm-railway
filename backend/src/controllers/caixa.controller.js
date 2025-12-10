const { abrirCaixa, getCaixaAtual, fecharCaixa } = require('../services/caixa.service');

const abrirCaixaController = async (req, res) => {
    try {
        const { userId, saldoInicial } = req.body;
        const caixa = await abrirCaixa(userId, saldoInicial);
        res.status(201).json(caixa);
    } catch (error) {
        console.error('Erro ao abrir caixa:', error);
        res.status(500).json({ error: error.message });
    }
};

const getCaixaAtualController = async (req, res) => {
    try {
        // Assumindo que o userId virá como parâmetro de rota (ex: /caixa/atual/1)
        const { userId } = req.params; 
        const caixa = await getCaixaAtual(parseInt(userId));
        res.json(caixa);
    } catch (error) {
        console.error('Erro ao obter caixa atual:', error);
        res.status(500).json({ error: error.message });
    }
};

const fecharCaixaController = async (req, res) => {
    try {
        const { userId, saldoFinal } = req.body;
        const caixa = await fecharCaixa(userId, saldoFinal);
        res.json(caixa);
    } catch (error) {
        console.error('Erro ao fechar caixa:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    abrirCaixaController,
    getCaixaAtualController,
    fecharCaixaController
};
