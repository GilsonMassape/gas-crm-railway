import React, { useState, useEffect } from "react";
import api from "../services/api"; // IMPORTAÇÃO CORRETA DO AXIOS

export default function Relatorios() {
  const [vendas, setVendas] = useState<any[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [consultar, setConsultar] = useState(null);

  const getUrlSearchParams = (de: string, ate: string) => {
    const params = new URLSearchParams();
    params.append("de", de);
    params.append("ate", ate);
    return params;
  };

  const consultarVendas = async () => {
    const de = "2023-01-01"; // Defina a data inicial padrão
    const ate = new Date().toISOString().split('T')[0]; // Data atual

    const sq = getUrlSearchParams(de, ate);

    // CORREÇÃO: Usando a instância 'api' do Axios e a rota correta
    const res = await api.get("/relatorios/vendas?" + sq.toString());
    setTotal(res.data.total);
    setVendas(res.data.vendas);
  };

  useEffect(() => {
    // Chama a função de consulta ao carregar a página
    consultarVendas();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Relatórios de Vendas</h2>
      {/* O restante do seu JSX para exibir o relatório */}
      <p>Total de Vendas: R$ {total !== null ? total.toFixed(2) : 'Carregando...'}</p>
      {/* Tabela de vendas, se houver */}
    </div>
  );
}
