import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Usuario } from '../types';
import { useAuthStore } from '../store/authStore';

export default function Usuarios() {
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    perfil: 'vendedor',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const queryClient = useQueryClient();

  // Apenas administradores podem acessar esta página
  if (user?.perfil !== 'admin') {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-red-600">Acesso Negado</h2>
        <p>Apenas administradores podem gerenciar usuários.</p>
      </div>
    );
  }

  // Buscar usuários
  const { data: usuarios, isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const response = await api.get<{ data: Usuario[] }>('/usuarios');
      return response.data.data;
    },
  });

  // Criar usuário
  const createMutation = useMutation({
    mutationFn: (newUsuario: typeof form) => api.post('/usuarios', newUsuario),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setForm({ nome: '', email: '', senha: '', perfil: 'vendedor' });
      setSuccess('Usuário criado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Erro ao criar usuário');
      setTimeout(() => setError(''), 5000);
    },
  });

  // Deletar usuário
  const deleteMutation = useMutation({
    // CORREÇÃO: Removido o prefixo /api/
    mutationFn: (id: number) => api.delete(`/usuarios/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setSuccess('Usuário removido com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Erro ao remover usuário');
      setTimeout(() => setError(''), 5000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  const handleDelete = (id: number) => {
    if (id === user?.id) {
      alert('Você não pode deletar seu próprio usuário!');
      return;
    }
    if (confirm('Tem certeza que deseja remover este usuário?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gerenciamento de Usuários</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

      {/* Formulário de Criação */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Novo Usuário</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            placeholder="Nome *"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            required
            className="border rounded px-3 py-2"
          />
          <input
            type="email"
            placeholder="Email *"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="border rounded px-3 py-2"
          />
          <input
            type="password"
            placeholder="Senha *"
            value={form.senha}
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
            required
            className="border rounded px-3 py-2"
          />
          <select
            value={form.perfil}
            onChange={(e) => setForm({ ...form, perfil: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="vendedor">Vendedor</option>
            <option value="admin">Administrador</option>
          </select>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition col-span-full md:col-span-1"
          >
            {createMutation.isPending ? 'Salvando...' : 'Cadastrar Usuário'}
          </button>
        </form>
      </div>

      {/* Lista de Usuários */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Usuários Cadastrados</h2>
        {isLoading ? (
          <p>Carregando...</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perfil</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuarios?.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{usuario.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.perfil}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(usuario.id)}
                      disabled={deleteMutation.isPending || usuario.id === user?.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
