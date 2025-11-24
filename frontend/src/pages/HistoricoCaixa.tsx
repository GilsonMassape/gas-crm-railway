import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function HistoricoCaixa() {
  const [caixas, setCaixas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCaixas();
  }, []);

  async function loadCaixas() {
    try {
      const token = localStorage.getItem('token');
      // CORREÇÃO: Removido o prefixo /api/
      const response = await axios.get(`${API_URL}/caixa`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCaixas(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="p-4">Carregando...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Histórico de Caixas</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saldo Inicial</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saldo Final</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diferença</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {caixas.map((caixa) => (
              <tr key={caixa.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(caixa.data_abertura).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{caixa.usuario_abertura_nome}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  R$ {parseFloat(caixa.saldo_inicial).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {caixa.saldo_final_informado 
                    ? `R$ ${parseFloat(caixa.saldo_final_informado).toFixed(2)}`
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {caixa.diferenca !== null ? (
                    <span className={caixa.diferenca === 0 ? 'text-green-600' : 'text-red-600'}>
                      R$ {parseFloat(caixa.diferenca).toFixed(2)}
                    </span>
                  ) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${
                    caixa.status === 'aberto' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {caixa.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    to={`/caixa/${caixa.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Ver Detalhes
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
