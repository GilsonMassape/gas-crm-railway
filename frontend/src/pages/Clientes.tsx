// src/pages/Clientes.tsx
import React, { useEffect, useState } from "react";
import api from "../services/api";

type Cliente = {
  id: number;
  nome: string;
  telefone?: string;
  endereco?: string;
  [key: string]: any;
};

const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientes = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get("/clientes");
        const data = response.data;

        // Garante que sempre teremos um array, qualquer que seja o formato do backend
        const listaClientes: Cliente[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.clientes)
          ? data.clientes
          : [];

        setClientes(listaClientes);
      } catch (err) {
        console.error("Erro ao carregar clientes:", err);
        setError("Erro ao carregar clientes.");
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);

  return (
    <div className="page-container">
      <h2>Clientes</h2>

      {loading && <p>Carregando clientes...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && clientes.length === 0 && (
        <p>Nenhum cliente encontrado.</p>
      )}

      {!loading && !error && clientes.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Endereço</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.id}</td>
                <td>{cliente.nome}</td>
                <td>{cliente.telefone || "-"}</td>
                <td>{cliente.endereco || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Clientes;
