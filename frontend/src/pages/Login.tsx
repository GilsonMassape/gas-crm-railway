// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuthStore();

  const [email, setEmail] = useState("admin@admin.com");
  const [senha, setSenha] = useState("123456");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const sucesso = await login(email, senha);
    if (sucesso) {
      // 👇 depois de logar, manda para a tela principal
      navigate("/clientes"); // se preferir, pode usar "/" aqui
    }
  };

  return (
    <div className="login-page">
      <header className="app-header">
        <h1>CRM GAS — Vendas &amp; Estoque</h1>
      </header>

      <main className="login-container">
        <div className="login-card">
          <h2>CRM GAS • Login</h2>

          <form onSubmit={handleSubmit} className="login-form">
            <label className="login-label">
              E-mail
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                placeholder="Digite seu e-mail"
                required
              />
            </label>

            <label className="login-label">
              Senha
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="login-input"
                placeholder="Digite sua senha"
                required
              />
            </label>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
