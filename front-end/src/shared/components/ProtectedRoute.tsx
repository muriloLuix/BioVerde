import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import './../../styles/forbidden.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  nivelMinimo: number;
}

const ProtectedRoute = ({ children, nivelMinimo }: ProtectedRouteProps) => {
  const [autorizado, setAutorizado] = useState<boolean | null>(null);

  useEffect(() => {
    const verificarAutorizacao = async () => {
      try {
        const res = await axios.get("http://localhost/BioVerde/back-end/auth/check_authorization.php", {
          withCredentials: true,
        });

        if (res.data.success && res.data.nivel_acesso >= nivelMinimo) {
          setAutorizado(true);
        } else {
          setAutorizado(false);
        }
      } catch {
        setAutorizado(false);
      }
    };

    verificarAutorizacao();
  }, [nivelMinimo]);

  if (autorizado === null) {
    return (
      <div className="flex flex-1 justify-center items-center p-6 lg:pl-[280px] font-[inter] h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-black" />
      </div>
    );  
  }

  if (autorizado === false) {
    return (
      <div className="flex flex-1 justify-center items-center p-6 lg:pl-[280px] font-[inter] h-screen">
        <div className="container">
            <div className="forbidden-sign"></div>
            <h1>O acesso a esta página é restrito</h1>
            <p>Você não tem permissão para visualizar esta página.</p>
            <p>Faça logout do sistema ou fale com seu supervisor.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
