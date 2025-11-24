import { useState, useEffect } from 'react';
import api from '../services/api';
import { Send, Users, MessageSquare, History, Plus, Trash2 } from 'lucide-react';

interface Template {
  id: number;
  nome: string;
  titulo: string;
  conteudo: string;
  variaveis: string[];
  ativo: boolean;
}

interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  bairro: string;
  produto_nome: string;
  produto_tipo: string;
  dias_restantes: number;
}

interface Historico {
  id: number;
  template_nome: string;
  cliente_nome: string;
  telefone: string;
  mensagem: string;
  status: string;
  enviado_em: string;
  enviado_por_nome: string;
}

export default function WhatsApp() {
  const [activeTab, setActiveTab] = useState<'enviar' | 'templates' | 'historico'>('enviar');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [historico, setHistorico] = useState<Historico[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [selectedClientes, setSelectedClientes] = useState<number[]>([]);
  const [filtros, setFiltros] = useState({
    dias_antecedencia: 5,
    tipo_produto: '',
    status: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    nome: '',
    titulo: '',
    conteudo: ''
  });

  useEffect(() => {
    loadTemplates();
    loadHistorico();
  }, []);

  useEffect(() => {
    if (activeTab === 'enviar') {
      loadClientes();
    }
  }, [activeTab, filtros]);

  const loadTemplates = async () => {
    try {
      const response = await api.get('/whatsapp/templates');
      setTemplates(response.data);
    } catch (err: any) {
      console.error('Erro ao carregar templates:', err);
    }
  };

  const loadClientes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/whatsapp/clientes-para-envio', {
        params: filtros
      });
      setClientes(response.data);
    } catch (err: any) {
      console.error('Erro ao carregar clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadHistorico = async () => {
    try {
      const response = await api.get('/whatsapp/historico');
      setHistorico(response.data.data || []);
    } catch (err: any) {
      console.error('Erro ao carregar histórico:', err);
    }
  };

  const handleEnviarMensagens = async () => {
    if (!selectedTemplate) {
      setError('Selecione um template');
      return;
    }

    if (selectedClientes.length === 0) {
      setError('Selecione pelo menos um cliente');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.post('/whatsapp/enviar', {
        template_id: selectedTemplate,
        clientes_ids: selectedClientes
      });

      setSuccess(`${response.data.total} mensagens enviadas com sucesso!`);
      
      // Abrir links do WhatsApp em novas abas
      response.data.mensagens.forEach((msg: any) => {
        window.open(msg.whatsapp_link, '_blank');
      });

      setSelectedClientes([]);
      loadHistorico();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao enviar mensagens');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      setLoading(true);
      await api.post('/whatsapp/templates', templateForm);
      setSuccess('Template criado com sucesso!');
      setShowTemplateForm(false);
      setTemplateForm({ nome: '', titulo: '', conteudo: '' });
      loadTemplates();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar template');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este template?')) return;

    try {
      // CORREÇÃO: Removido o prefixo /api/
      await api.delete(`/whatsapp/templates/${id}`);
      setSuccess('Template deletado com sucesso!');
      loadTemplates();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao deletar template');
      setTimeout(() => setError(''), 5000);
    }
  };

  const toggleCliente = (id: number) => {
    if (selectedClientes.includes(id)) {
      setSelectedClientes(selectedClientes.filter(c => c !== id));
    } else {
      setSelectedClientes([...selectedClientes, id]);
    }
  };

  const toggleTodos = () => {
    if (selectedClientes.length === clientes.length) {
      setSelectedClientes([]);
    } else {
      setSelectedClientes(clientes.map(c => c.id));
    }
  };

  const getStatusColor = (dias: number) => {
    if (dias < 0) return 'text-red-600 bg-red-100';
    if (dias <= 5) return 'text-orange-600 bg-orange-100';
    return 'text-green-600 bg-green-100';
  };

  const getStatusText = (dias: number) => {
    if (dias < 0) return 'Atrasado';
    if (dias <= 5) return 'Próximo';
    return 'Normal';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">WhatsApp - Mensagens</h1>
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

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('enviar')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition ${
              activeTab === 'enviar'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Send size={20} />
            Enviar Mensagens
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition ${
              activeTab === 'templates'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <MessageSquare size={20} />
            Templates
          </button>
          <button
            onClick={() => setActiveTab('historico')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition ${
              activeTab === 'historico'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <History size={20} />
            Histórico
          </button>
        </div>

        <div className="p-6">
          {/* Tab: Enviar Mensagens */}
          {activeTab === 'enviar' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Dias de Antecedência</label>
                  <input
                    type="number"
                    value={filtros.dias_antecedencia}
                    onChange={(e) => setFiltros({ ...filtros, dias_antecedencia: parseInt(e.target.value) })}
                    className="w-full border rounded px-3 py-2"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Produto</label>
                  <select
                    value={filtros.tipo_produto}
                    onChange={(e) => setFiltros({ ...filtros, tipo_produto: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Todos</option>
                    <option value="gas">Gás</option>
                    <option value="agua">Água</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={filtros.status}
                    onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Todos</option>
                    <option value="urgente">Urgente</option>
                    <option value="proximo">Próximo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Template</label>
                  <select
                    value={selectedTemplate || ''}
                    onChange={(e) => setSelectedTemplate(parseInt(e.target.value))}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Selecione um template</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>{t.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users size={20} className="text-gray-600" />
                  <span className="font-medium">
                    {selectedClientes.length} de {clientes.length} clientes selecionados
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={toggleTodos}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition"
                  >
                    {selectedClientes.length === clientes.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                  </button>
                  <button
                    onClick={handleEnviarMensagens}
                    disabled={loading || selectedClientes.length === 0 || !selectedTemplate}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send size={18} />
                    Enviar Mensagens
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8 text-gray-500">Carregando...</div>
              ) : clientes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum cliente encontrado com os filtros selecionados.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">
                          <input
                            type="checkbox"
                            checked={selectedClientes.length === clientes.length}
                            onChange={toggleTodos}
                            className="w-4 h-4"
                          />
                        </th>
                        <th className="px-4 py-2 text-left">Cliente</th>
                        <th className="px-4 py-2 text-left">Telefone</th>
                        <th className="px-4 py-2 text-left">Bairro</th>
                        <th className="px-4 py-2 text-left">Produto</th>
                        <th className="px-4 py-2 text-left">Dias Restantes</th>
                        <th className="px-4 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientes.map((cliente) => (
                        <tr key={cliente.id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedClientes.includes(cliente.id)}
                              onChange={() => toggleCliente(cliente.id)}
                              className="w-4 h-4"
                            />
                          </td>
                          <td className="px-4 py-3">{cliente.nome}</td>
                          <td className="px-4 py-3">{cliente.telefone}</td>
                          <td className="px-4 py-3">{cliente.bairro}</td>
                          <td className="px-4 py-3">{cliente.produto_nome}</td>
                          <td className="px-4 py-3">{Math.ceil(cliente.dias_restantes)} dias</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(cliente.dias_restantes)}`}>
                              {getStatusText(cliente.dias_restantes)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab: Templates */}
          {activeTab === 'templates' && (
            <div>
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => setShowTemplateForm(!showTemplateForm)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition flex items-center gap-2"
                >
                  <Plus size={18} />
                  {showTemplateForm ? 'Cancelar' : 'Novo Template'}
                </button>
              </div>

              {showTemplateForm && (
                <div className="bg-gray-50 p-4 rounded mb-6">
                  <h3 className="font-bold mb-4">Novo Template</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nome</label>
                      <input
                        type="text"
                        value={templateForm.nome}
                        onChange={(e) => setTemplateForm({ ...templateForm, nome: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        placeholder="Ex: Alerta Recompra Gás"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Título</label>
                      <input
                        type="text"
                        value={templateForm.titulo}
                        onChange={(e) => setTemplateForm({ ...templateForm, titulo: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        placeholder="Ex: Lembrete: Seu gás está acabando!"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Conteúdo</label>
                      <textarea
                        value={templateForm.conteudo}
                        onChange={(e) => setTemplateForm({ ...templateForm, conteudo: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        rows={6}
                        placeholder="Use {nome}, {produto}, {dias} para variáveis"
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Variáveis disponíveis: {'{nome}'}, {'{produto}'}, {'{dias}'}, {'{telefone}'}
                      </p>
                    </div>
                    <button
                      onClick={handleSaveTemplate}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
                    >
                      Salvar Template
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">Nome</th>
                      <th className="px-4 py-3 text-left">Título</th>
                      <th className="px-4 py-3 text-left">Conteúdo (Início)</th>
                      <th className="px-4 py-3 text-left">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.map((t) => (
                      <tr key={t.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{t.nome}</td>
                        <td className="px-4 py-3">{t.titulo}</td>
                        <td className="px-4 py-3 text-sm">{t.conteudo.substring(0, 50)}...</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteTemplate(t.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: Histórico */}
          {activeTab === 'historico' && (
            <div>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">Data</th>
                      <th className="px-4 py-3 text-left">Cliente</th>
                      <th className="px-4 py-3 text-left">Template</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Enviado Por</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historico.map((h) => (
                      <tr key={h.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{new Date(h.enviado_em).toLocaleString('pt-BR')}</td>
                        <td className="px-4 py-3 font-medium">{h.cliente_nome}</td>
                        <td className="px-4 py-3">{h.template_nome}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded ${
                            h.status === 'enviado' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {h.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{h.enviado_por_nome}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
