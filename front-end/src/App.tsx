import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RecoverPassword from "./pages/RecoverPassword";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} /> {/*Pagina de Login*/}
        <Route path="/recuperar-senha" element={<RecoverPassword />} /> {/*Pagina de Recuperação de senha*/} 
      </Routes>
    </Router>
  );
}

export default App;
