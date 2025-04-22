import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const usePageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let title = "BioVerde";

    switch (true) {
      case path.includes("/dashboard"):
        title += " - Dashboard";
        break;
      case path.includes("/controle-estoque"):
        title += " - Controle de Estoque";
        break;
      case path.includes("/etapas-producao"):
        title += " - Etapas de Produção";
        break;
      case path.includes("/pedidos"):
        title += " - Pedidos";
        break;
      case path.includes("/usuarios"):
        title += " - Usuários";
        break;
      case path.includes("/fornecedores"):
        title += " - Fornecedores";
        break;
      case path.includes("/clientes"):
        title += " - Clientes";
        break;
      case path.includes("/logs"):
        title += " - Logs";
        break;
      default:
        title += "";
    }

    document.title = title;
  }, [location.pathname]);
};

export default usePageTitle;
