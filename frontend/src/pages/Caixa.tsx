import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function Caixa() {
  const [caixaAtual, setCaixaAtual] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saldoInicial, setSaldoInicial] = useState('');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    loadCaixaAtual();
  }, []);

  async function loadCaixaAtual() {
    try {
      const token = localStorage.getItem('token');
      // CORREÇÃO: Removido o prefixo /api/
      const response = await axios.get(`${API_URL}/caixa/atual`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCaixaAtual(response.data.data);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Erro ao carregar caixa:', error);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAbrirCaixa(e: React.FormEvent) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      // CORREÇÃO: Removido o prefixo /api/
      await axios.post(`${API_URL}/caixa/abrir`, {
        saldo_inicial: parseFloat(saldoInicial),
        observacoes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Caixa aberto com sucesso!');
      loadCaixaAtual();
      setSaldoInicial('');
      setObservacoes('');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao abrir caixa');
    }
  }

  async function handleFecharCaixa() {
    const saldoFinal = prompt('Informe o saldo final contado:');
    if (!saldoFinal) return;

    try {
      const token = localStorage.getItem('token');
      // CORREÇÃO: Removido o prefixo /api/
      await axios.post(`${API_URL}/caixa/${caixaAtual.id}/fechar`, {
        saldo_final_informado: parseFloat(saldoFinal)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Caixa fechado com sucesso!');
      loadCaixaAtual();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao fechar caixa');
    }
  }

  if (loading) {
    return <div className="p-4">Carregando...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Caixa Diário</h1>

      {!caixaAtual ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Abrir Caixa</h2>
          <form onSubmit={handleAbrirCaixa} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Saldo Inicial</label>
              <input
                type="number"
                step="0.01"
                value={saldoInicial}
                onChange={(e) => setSaldoInicial(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Observações</label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full border rounded px-3 py-2"
                rows={3}
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Abrir Caixa
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Caixa Aberto</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Saldo Inicial</p>
                <p className="text-2xl font-bold">R$ {parseFloat(caixaAtual.saldo_inicial).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Entradas</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {parseFloat(caixaAtual.total_entradas || 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Saídas</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {parseFloat(caixaAtual.total_saidas || 0).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">Saldo Atual</p>
              <p className="text-3xl font-bold text-blue-600">
                R$ {caixaAtual.saldo_atual?.toFixed(2)}
              </p>
            </div>
            <button
              onClick={handleFecharCaixa}
              className="mt-6 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
            >
              Fechar Caixa
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
