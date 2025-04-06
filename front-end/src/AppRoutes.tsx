import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { Home } from "./shared/index.tsx";
import {
  LoginPage,
  RecoverPassword,
  UsersPage,
  Dashboard,
  Clients,
  ManagePrices,
  InventoryControl,
  ProductionSteps,
  Logs,
  Requests,
  Suppliers,
} from "./pages/index.tsx";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/recuperar-senha" element={<RecoverPassword />} />

        {/* Layout SideBar Fixo */}
        <Route path="/app" element={<Home />}>
          {/* Todos as rotas a partir daqui terão o sideBar */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="controle-estoque" element={<InventoryControl />} />
          <Route path="etapas-producao" element={<ProductionSteps />} />
          <Route path="pedidos" element={<Requests />} />
          <Route path="usuarios" element={<UsersPage />} />
          <Route path="fornecedores" element={<Suppliers />} />
          <Route path="clientes" element={<Clients />} />
          <Route path="precos" element={<ManagePrices />} />
          <Route path="logs" element={<Logs />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;
