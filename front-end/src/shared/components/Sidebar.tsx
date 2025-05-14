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
    Boxes
  } from "lucide-react";

  import Logo from "./Logo";
  import { Avatar, NavigationMenu, Separator } from "radix-ui";
  import { ConfirmationModal } from "../../shared";

  export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [openLogoutModal, setOpenLogoutModal] = useState(false);
    const [userName, setUserName] = useState("");
    const [userLevel, setUserLevel] = useState("");
    const [userInitials, setUserInitials] = useState("");
    const [activeItem, setActiveItem] = useState("");

    usePageTitle(); //Para mudar o Title da aba do navegador que o usuário está

    //Puxar dados do usuário logado
    useEffect(() => {
      axios
        .get("http://localhost/BioVerde/back-end/auth/usuario_logado.php", {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        })
        .then((response) => {
          console.log("Retorno do usuário logado:", response.data);
          const { userName, userLevel } = response.data;

          setUserName(userName);
          setUserLevel(userLevel);

          // Gerar iniciais
          const nomes = userName.trim().split(" ");
          const primeiraInicial = nomes[0]?.charAt(0).toUpperCase() || "";
          const ultimaInicial =
            nomes.length > 1
              ? nomes[nomes.length - 1]?.charAt(0).toUpperCase()
              : "";
          setUserInitials(primeiraInicial + ultimaInicial);
        })
        .catch((error) => {
          console.error("Erro ao buscar informações do usuário:", error);
        });
    }, []);

    const menuItems = useMemo(() => {
      const baseItems = [
        { name: "Dashboard",           icon: <LayoutDashboard />, path: "/app/dashboard" },
        { name: "Controle de Estoque", icon: <Package />,         path: "/app/controle-estoque" },
        { name: "Etapas de Produção",  icon: <Layers />,          path: "/app/etapas-producao" },
        { name: "Pedidos",             icon: <ShoppingCart />,    path: "/app/pedidos" },
        { name: "Lotes",               icon: <Boxes />,           path: "/app/lotes" },
        { name: "Usuários",            icon: <Users />,           path: "/app/usuarios", restricted: true },
        { name: "Fornecedores",        icon: <Truck />,           path: "/app/fornecedores", restricted: true },
        { name: "Clientes",            icon: <User />,            path: "/app/clientes", restricted: true },
        { name: "Logs",                icon: <Logs />,            path: "/app/logs", restricted: true },
      ];

      // Filtra se o nível for Funcionário
      if (userLevel === "Funcionário") {
        return baseItems.filter((item) => !item.restricted);
      }

      return baseItems;
    }, [userLevel]);

    useEffect(() => {
      const active = menuItems.find((item) => item.path === location.pathname);
      if (active) {
        setActiveItem(active.name);
      }
    }, [menuItems, location.pathname]);

    const mudarModulo = (item: { name: string; path?: string }) => {
      setActiveItem(item.name);

      if (!item.path) return;
      navigate(item.path);
    };

    const handleLogout = async () => {
      try {
        const response = await axios.post(
          "http://localhost/BioVerde/back-end/auth/logout.php",
          {},
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        if (response.data.success) {
          navigate("/"); // redireciona para a tela de login
        } else {
          console.error("Erro ao fazer logout:", response.data.message);
        }
      } catch (error) {
        let errorMessage = "Erro ao conectar com o servidor";
        if (axios.isAxiosError(error)) {
          errorMessage = error.response?.data?.message || error.message;
        }
        console.error(errorMessage);
      }
    };

    return (
      <div className="w-64 z-30 bg-verdeEscuroForte fixed top-0 left-0 text-white h-full flex flex-col">
        <Logo
          src="/logo-bioverde-branco.png"
          imgClassName="size-18"
          titleClassName="text-4xl text-center tracking-wide p-2 pt-4"
        />
        <NavigationMenu.Root className="h-full w-full custom-scrollbar overflow-y-auto mb-10">
          <NavigationMenu.List className="h-full w-full p-2">
            {menuItems.map((tab, index) => {
              const showSeparator = (menuItems[index]?.name === "Dashboard" || menuItems[index]?.name === "Usuários");

              return (
                <Fragment key={index}>
                  {showSeparator && (
                    <Separator.Root className="bg-separator h-0.25 w-9/10 m-auto" />
                  )}

                  <NavigationMenu.Item
                    className={`h-12 w-full flex items-center p-3 my-2 gap-4 font-[inter] rounded-md cursor-pointer  ${
                      activeItem === tab.name
                        ? "bg-brancoSal text-black"
                        : "text-cinzaClaro hover:bg-hoverMenu"
                    }`}
                    onClick={() => mudarModulo(tab)}
                  >
                    <Fragment>
                      {tab.icon}
                      {tab.name}
                    </Fragment>
                  </NavigationMenu.Item>
                </Fragment>
              );
            })}
          </NavigationMenu.List>
        </NavigationMenu.Root>
        <div className="bg-verdeEscuroConta gap-5 p-3 w-64 flex place-items-center sticky bottom-0 left-0 -m-5 ">
          <Avatar.Root className="inline-flex size-[45px] select-none items-center justify-center overflow-hidden rounded-full bg-blackA1 align-middle">
            <Avatar.Fallback className="leading-1 flex size-full items-center justify-center bg-white text-black text-[15px] font-medium text-violet11 cursor-pointer">
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
    );
  }
