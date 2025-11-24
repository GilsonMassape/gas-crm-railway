import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  bairro: string;
}

interface Produto {
  id: number;
  nome: string;
  tipo: string;
  preco: number;
  estoque: number;
}

interface Venda {
  id: number;
  cliente_id: number;
  cliente_nome: string;
  cliente_telefone: string;
  cliente_bairro: string;
  produto_id: number;
  produto_nome: string;
  produto_tipo: string;
  quantidade: number;
  valor_total: number;
  forma_pagamento: string;
  data_venda: string;
  vendedor_nome: string;
}

interface VendaForm {
  cliente_id: string;
  produto_id: string;
  quantidade: string;
  valor_total: string;
  forma_pagamento: string;
  data_venda: string;
}

export default function Vendas() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<VendaForm>({
    cliente_id: '',
    produto_id: '',
    quantidade: '1',
    valor_total: '',
    forma_pagamento: 'pix',
    data_venda: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Calcular valor total automaticamente
    if (formData.produto_id && formData.quantidade) {
      const produto = produtos.find((p) => p.id === parseInt(formData.produto_id));
      if (produto) {
        const total = produto.preco * parseInt(formData.quantidade);
        const novoValorTotal = total.toFixed(2);
        setFormData((prev) => {
          if (prev.valor_total !== novoValorTotal) {
            return { ...prev, valor_total: novoValorTotal };
          }
          return prev;
        });
      }
    }
  }, [formData.produto_id, formData.quantidade, produtos]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vendasRes, clientesRes, produtosRes] = await Promise.all([
        api.get('/vendas', { params: { limit: 100 } }),
        api.get('/clientes', { params: { limit: 100 } }),
        api.get('/produtos', { params: { limit: 100 } }),
      ]);

      setVendas(vendasRes.data.data || []);
      setClientes(clientesRes.data.data || []);
      setProdutos(produtosRes.data.data || []);
      
      // Calcular estatísticas localmente se não houver endpoint
      const vendasData = vendasRes.data.data || [];
      const totalVendas = vendasData.length;
      const valorTotal = vendasData.reduce((sum: number, v: Venda) => sum + parseFloat(v.valor_total.toString()), 0);
      const quantidadeTotal = vendasData.reduce((sum: number, v: Venda) => sum + v.quantidade, 0);
      const ticketMedio = totalVendas > 0 ? valorTotal / totalVendas : 0;
      
      setStats({
        total_vendas: totalVendas,
        valor_total: Number(valorTotal).toFixed(2),
        ticket_medio: Number(ticketMedio).toFixed(2),
        quantidade_total: quantidadeTotal,
      });
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const data = {
        cliente_id: parseInt(formData.cliente_id),
        produto_id: parseInt(formData.produto_id),
        quantidade: parseInt(formData.quantidade),
        valor_total: parseFloat(formData.valor_total),
        forma_pagamento: formData.forma_pagamento,
        data_venda: new Date(formData.data_venda + 'T00:00:00').toISOString(),
      };

      await api.post('/vendas', data);
      setSuccess('Venda registrada com sucesso!');
      resetForm();
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao registrar venda');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta venda? O estoque será devolvido.'))
      return;

    try {
      // CORREÇÃO: Removido o prefixo /api/
      await api.delete(`/vendas/${id}`);
      setSuccess('Venda deletada com sucesso!');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao deletar venda');
      setTimeout(() => setError(''), 5000);
    }
  };

  const resetForm = () => {
    setFormData({
      cliente_id: '',
      produto_id: '',
      quantidade: '1',
      valor_total: '',
      forma_pagamento: 'pix',
      data_venda: new Date().toISOString().split('T')[0],
    });
    setShowForm(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Vendas</h1>
      </div>

        {/* Mensagens */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-gray-600 text-sm">Total de Vendas</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.total_vendas || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-gray-600 text-sm">Valor Total</h3>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(parseFloat(stats.valor_total || 0))}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-gray-600 text-sm">Ticket Médio</h3>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(parseFloat(stats.ticket_medio || 0))}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-gray-600 text-sm">Quantidade Total</h3>
              <p className="text-2xl font-bold text-orange-600">
                {stats.quantidade_total || 0}
              </p>
            </div>
          </div>
        )}

        {/* Botão Nova Venda */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition"
          >
            {showForm ? 'Cancelar' : '+ Nova Venda'}
          </button>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Nova Venda</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cliente *</label>
                <select
                  value={formData.cliente_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cliente_id: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={String(cliente.id)}>
                      {cliente.nome} - {cliente.telefone} ({cliente.bairro})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Produto *</label>
                <select
                  value={formData.produto_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, produto_id: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Selecione um produto</option>
                  {produtos.map((produto) => (
         <option key={produto.id} value={String(produto.id)}>           {produto.nome} - {formatCurrency(produto.preco)} (Estoque:{' '}
                      {produto.estoque})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantidade *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantidade}
                  onChange={(e) => setFormData((prev) => ({ ...prev, quantidade: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valor Total (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valor_total}
                  onChange={(e) => setFormData((prev) => ({ ...prev, valor_total: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Forma de Pagamento *</label>
                <select
                  value={formData.forma_pagamento}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, forma_pagamento: e.target.value }))
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="pix">PIX</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="cartão">Cartão</option>
                  <option value="fiado">Fiado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data da Venda *</label>
                <input
                  type="date"
                  value={formData.data_venda}
                  onChange={(e) => setFormData((prev) => ({ ...prev, data_venda: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition"
                >
                  Registrar Venda
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Vendas */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="text-xl font-bold">Histórico de Vendas ({vendas.length})</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-500">Carregando...</div>
          ) : vendas.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhuma venda registrada. Clique em "Nova Venda" para adicionar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">Data</th>
                    <th className="px-4 py-3 text-left">Cliente</th>
                    <th className="px-4 py-3 text-left">Produto</th>
                    <th className="px-4 py-3 text-center">Qtd</th>
                    <th className="px-4 py-3 text-right">Valor</th>
                    <th className="px-4 py-3 text-left">Pagamento</th>
                    <th className="px-4 py-3 text-left">Vendedor</th>
                    <th className="px-4 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {vendas.map((venda) => (
                    <tr key={venda.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{formatDate(venda.data_venda)}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{venda.cliente_nome}</div>
                        <div className="text-xs text-gray-500">{venda.cliente_bairro}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{venda.produto_nome}</div>
                        <div className="text-xs text-gray-500">{venda.produto_tipo}</div>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold">
                        {venda.quantidade}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600">
                        {formatCurrency(venda.valor_total)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            venda.forma_pagamento === 'pix'
                              ? 'bg-blue-100 text-blue-800'
                              : venda.forma_pagamento === 'dinheiro'
                              ? 'bg-green-100 text-green-800'
                              : venda.forma_pagamento === 'cartão'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {venda.forma_pagamento}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{venda.vendedor_nome}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDelete(venda.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition text-sm"
                        >
                          Deletar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </div>
  );
}
