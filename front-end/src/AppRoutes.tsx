import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RecoverPassword from "./pages/RecoverPassword";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/*Pagina de Login*/}
        <Route path="/" element={<LoginPage />} />
        {/*Pagina de Recuperação de senha*/}
        <Route path="/recuperar-senha" element={<RecoverPassword />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
