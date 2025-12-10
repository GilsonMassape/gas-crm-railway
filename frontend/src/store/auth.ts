// src/store/auth.js
import { create } from "zustand";
import api from "../services/api";

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,

  // -------- LOGIN --------
  login: async (email, senha) => {
    set({ loading: true, error: null });

    try {
      const res = await api.post("/auth/login", { email, senha });

      const { token, user } = res.data;

      localStorage.setItem("token", token);

      set({ user, token, loading: false });

      return true;
    } catch (err) {
      set({
        error: err?.response?.data?.error || "Erro ao fazer login",
        loading: false,
      });
      return false;
    }
  },

  // -------- LOGOUT --------
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
    window.location.href = "/login";
  },

  // -------- BUSCAR PERFIL PELO TOKEN --------
  loadUserFromToken: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    set({ loading: true });

    try {
      const res = await api.get("/auth/me");
      set({ user: res.data, loading: false });
    } catch (err) {
      localStorage.removeItem("token");
      set({ user: null, token: null, loading: false });
    }
  },
}));
