// front-end/src/components/Sidebar.tsx
import axios from "axios";
import { useState, useEffect, useMemo, Fragment } from "react";
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
  LogOut,
  Loader2, 
} from "lucide-react";

import Logo from "./Logo";
import { Avatar, NavigationMenu, Separator } from "radix-ui";
import { ConfirmationModal } from "../../shared";

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

      <div className="w-64 z-30 bg-verdeEscuroForte fixed top-0 left-0 text-white h-full flex flex-col">
        <Logo
          src="/logo-bioverde-branco.png"
          imgClassName="size-18"
          titleClassName="text-4xl text-center tracking-wide p-2 pt-4"
        />

        <NavigationMenu.Root className="h-full w-full custom-scrollbar overflow-y-auto mb-10">
          <NavigationMenu.List className="h-full w-full p-2">
            {menuItems.map((tab, idx) => {
              const showSep = tab.name === "Dashboard" || tab.name === "Usuários";
              return (
                <Fragment key={idx}>
                  {showSep && (
                    <Separator.Root className="bg-separator h-0.25 w-9/10 m-auto" />
                  )}
                  <NavigationMenu.Item
                    className={`
                      h-12 w-full flex items-center p-3 my-2 gap-4 font-[inter] rounded-md cursor-pointer
                      ${activeItem === tab.name
                        ? "bg-brancoSal text-black"
                        : "text-cinzaClaro hover:bg-hoverMenu"
                      }
                    `}
                    onClick={() => mudarModulo(tab)}
                  >
                    {tab.icon}
                    {tab.name}
                  </NavigationMenu.Item>
                </Fragment>
              );
            })}
          </NavigationMenu.List>
        </NavigationMenu.Root>

        <div className="bg-verdeEscuroConta gap-5 p-3 w-64 flex items-center sticky bottom-0 left-0 -m-5">
          <Avatar.Root className="inline-flex size-[45px] select-none items-center justify-center overflow-hidden rounded-full bg-blackA1">
            <Avatar.Fallback className="leading-1 flex size-full items-center justify-center bg-white text-black text-[15px] font-medium cursor-pointer">
              {userInitials || "AD"}
            </Avatar.Fallback>
          </Avatar.Root>
          <div className="flex flex-col">
            <span className="text-sm font-[inter]">{userName}</span>
            <span className="text-xs font-[inter]">{userLevel}</span>
          </div>
          <LogOut
            size={30}
            className="p-1 rounded-2xl hover:cursor-pointer hover:text-cinzaClaro hover:bg-hoverMenu active:bg-brancoSal active:text-black"
            onClick={() => setOpenLogoutModal(true)}
          />
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
