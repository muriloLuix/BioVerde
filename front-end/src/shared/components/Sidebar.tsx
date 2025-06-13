// front-end/src/components/Sidebar.tsx
import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import usePageTitle from "../../hooks/usePageTitle";
import {
  LayoutDashboard,
  Package,
  Layers,
  Logs,
  ShoppingCart,
  Users,
  Truck,
  User,
  Loader2, 
} from "lucide-react";
import Logo from "./Logo";
import { ConfirmationModal, UserProfile, NavBar } from "../../shared";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [openLogoutModal, setOpenLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut]       = useState(false);
  const [userName, setUserName]           = useState("");
  const [userLevel, setUserLevel]         = useState("");
  const [userInitials, setUserInitials]   = useState("");
  const [activeItem, setActiveItem]       = useState("");

  usePageTitle();

  // Puxa dados do usuário
  useEffect(() => {
    axios
      .get("http://localhost/BioVerde/back-end/auth/usuario_logado.php", {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      })
      .then(({ data }) => {
        setUserName(data.userName);
        setUserLevel(data.userLevel);
        const nomes = data.userName.trim().split(" ");
        const iniciais =
          (nomes[0]?.charAt(0) || "") +
          (nomes[nomes.length - 1]?.charAt(0) || "");
        setUserInitials(iniciais.toUpperCase());
      })
      .catch((err) =>
        console.error("Erro ao buscar informações do usuário:", err)
      );
  }, []);

  const menuItems = useMemo(() => {
    const base = [
      { name: "Dashboard",           icon: <LayoutDashboard />, path: "/app/dashboard" },
      { name: "Controle de Estoque", icon: <Package />,         path: "/app/controle-estoque" },
      { name: "Etapas de Produção",  icon: <Layers />,          path: "/app/etapas-producao" },
      { name: "Pedidos",             icon: <ShoppingCart />,    path: "/app/pedidos" },
      { name: "Usuários",            icon: <Users />,           path: "/app/usuarios", restricted: true },
      { name: "Fornecedores",        icon: <Truck />,           path: "/app/fornecedores", restricted: true },
      { name: "Clientes",            icon: <User />,            path: "/app/clientes", restricted: true },
      { name: "Logs",                icon: <Logs />,            path: "/app/logs", restricted: true },
    ];
    if (userLevel === "Funcionário") return base.filter(i => !i.restricted);
    return base;
  }, [userLevel]);

  useEffect(() => {
    const ativo = menuItems.find(i => i.path === location.pathname);
    if (ativo) setActiveItem(ativo.name);
  }, [menuItems, location.pathname]);

  const mudarModulo = (item: { name: string; path?: string }) => {
    setActiveItem(item.name);
    if (item.path) navigate(item.path);
  };

  const handleLogout = async () => {
    setOpenLogoutModal(false);
    setLoggingOut(true);

    try {
      const { data } = await axios.post(
        "http://localhost/BioVerde/back-end/auth/logout.php",
        {},
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (data.success) {
        localStorage.removeItem("remember");
        localStorage.removeItem("email");
        localStorage.removeItem("password");
        sessionStorage.clear();
        navigate("/");
      } else {
        console.error("Erro ao fazer logout:", data.message);
        setLoggingOut(false);
      }
    } catch (err) {
      console.error("Erro ao conectar: ", axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err);
      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* OVERLAY SUAVE */}
      <div
        className={`
          fixed inset-0 z-50 flex items-center justify-center
          backdrop-blur-sm
          bg-black bg-opacity-30
          transition-opacity duration-300 ease-out
          ${loggingOut ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      >
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="animate-spin h-12 w-12 text-white" />
          <span className="text-white font-medium opacity-90">Saindo...</span>
        </div>
      </div>

      <div className="lg:w-64 w-full z-30 bg-verdeEscuroForte fixed top-0 left-0 text-white lg:h-screen h-16 flex lg:flex-col">
        
        <div className="absolute w-full h-16 lg:h-20 flex items-center justify-center">
          <Logo
            src="/logo-bioverde-branco.png"
            imgClassName="size-14 lg:size-18"
            titleClassName="lg:text-4xl text-3xl text-center tracking-wide p-2 pt-4"
          />
        </div>

        
        <div className="lg:flex lg:flex-col lg:h-full w-full">
            <NavBar
              menuItems={menuItems}
              activeItem={activeItem}
              mudarModulo={mudarModulo}
            />

          <div className="absolute w-full h-16 flex justify-end lg:z-1000 lg:bottom-1">
            <UserProfile
              userInitials={userInitials}
              userName={userName}
              userLevel={userLevel}
              setOpenLogoutModal={() => setOpenLogoutModal(true)}
            />
          </div>

        </div>

        <ConfirmationModal
          isLogout
          openModal={openLogoutModal}
          setOpenModal={setOpenLogoutModal}
          confirmationModalTitle="Deseja realmente sair do sistema?"
          confirmationText="Você será deslogado e redirecionado para a tela de login."
          confirmationRightButtonText="Sim, sair"
          confirmationLeftButtonText="Cancelar"
          onConfirm={handleLogout}
        />
      </div>
    </>
  );
}
