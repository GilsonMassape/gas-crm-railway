import { createBrowserRouter } from "react-router-dom";

import App from "./App";
import Login from "./pages/Login";
import Clientes from "./pages/Clientes";
import Produtos from "./pages/Produtos";
import Vendas from "./pages/Vendas";
import Relatorios from "./pages/Relatorios";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "clientes", element: <Clientes /> },
      { path: "produtos", element: <Produtos /> },
      { path: "vendas", element: <Vendas /> },
      { path: "relatorios", element: <Relatorios /> },
    ],
  },
  { path: "/login", element: <Login /> },
]);

export default router;
