import { createBrowserRouter } from "react-router-dom";
import Clientes from "./pages/Clientes";
import Produtos from "./pages/Produtos";
import Relatorios from "./pages/Relatorios";

const router = createBrowserRouter([
  { path: "/", element: <div style={{padding:16}}>Home</div> },
  { path: "/clientes", element: <Clientes /> },
  { path: "/produtos", element: <Produtos /> },
  { path: "/vendas", element: <Vendas /> },
  { path: "/relatorios", element: <Relatorios /> },
]);

export default router;
