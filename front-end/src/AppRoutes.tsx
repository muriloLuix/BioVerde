import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginPage, RecoverPassword } from "./pages";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/recuperar-senha" element={<RecoverPassword />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
