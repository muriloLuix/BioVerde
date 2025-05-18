import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./shared/components/ProtectedRoute.tsx";

import { Home } from "./shared/index.tsx";
import {
	LoginPage,
	RecoverPassword,
	UsersPage,
	Dashboard,
	Clients,
	InventoryControl,
	ProductionSteps,
	Logs,
	Orders,
	Suppliers,
	Batchs,
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
					<Route path="pedidos" element={<Orders />} />
					<Route path="lotes" element={<Batchs />} />
					<Route
						path="usuarios"
						element={
							<ProtectedRoute nivelMinimo={2}>
								<UsersPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="fornecedores"
						element={
							<ProtectedRoute nivelMinimo={2}>
								<Suppliers />
							</ProtectedRoute>
						}
					/>
					<Route
						path="clientes"
						element={
							<ProtectedRoute nivelMinimo={2}>
								<Clients />
							</ProtectedRoute>
						}
					/>
					<Route
						path="logs"
						element={
							<ProtectedRoute nivelMinimo={2}>
								<Logs />
							</ProtectedRoute>
						}
					/>
				</Route>
			</Routes>
		</Router>
	);
};

export default AppRoutes;
