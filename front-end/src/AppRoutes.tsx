import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { LayoutSideBar } from "./shared/index.tsx";
import {
  LoginPage,
  RecoverPassword,
  UsersPage,
  Dashboard,
  Clients,
  ConsumptionSupplies,
  InventoryControl,
  ProductionSteps,
  ProductStructure,
  Reports,
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
        <Route path="/app" element={<LayoutSideBar />}>
          {/* Todos as rotas a partir daqui terão o sideBar */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="controle-estoque" element={<InventoryControl />} />
          <Route path="estrututa-produtos" element={<ProductStructure />} />
          <Route path="etapas-producao" element={<ProductionSteps />} />
          <Route path="consumo-insumos" element={<ConsumptionSupplies />} />
          <Route path="relatorios" element={<Reports />} />
          <Route path="pedidos" element={<Requests />} />
          <Route path="usuarios" element={<UsersPage />} />
          <Route path="fornecedores" element={<Suppliers />} />
          <Route path="clientes" element={<Clients />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;
