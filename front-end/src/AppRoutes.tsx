import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/page/LoginPage";
import RecoverPassword from "./pages/page/RecoverPassword";
import LayoutSideBar from "./Layout/LayoutSideBar";
import UsersPage from "./pages/UsersPage";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ConsumptionSupplies from "./pages/ConsumptionSupplies";
import InventoryControl from "./pages/InventoryControl";
import ProductionSteps from "./pages/ProductionSteps";
import ProductStructure from "./pages/ProductStructure";
import Reports from "./pages/Reports";
import Requests from "./pages/Requests";
import Suppliers from "./pages/Suppliers";


const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/recuperar-senha" element={<RecoverPassword />} />

        {/* Layout SideBar Fixo */}
        <Route path="/app" element={<LayoutSideBar />} >
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
