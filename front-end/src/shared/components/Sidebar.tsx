import { useState, useEffect, useMemo, Fragment } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
} from "lucide-react";

import Logo from "./Logo";
import { Avatar, NavigationMenu, Separator } from "radix-ui";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = useMemo(
    () => [
      { name: "Dashboard", icon: <LayoutDashboard />, path: "/app/dashboard" },
      {
        name: "Controle de Estoque",
        icon: <Package />,
        path: "/app/controle-estoque",
      },
      {
        name: "Etapas de Produção",
        icon: <Layers />,
        path: "/app/etapas-producao",
      },
      { name: "Pedidos", icon: <ShoppingCart />, path: "/app/pedidos" },
      { name: "Usuários", icon: <Users />, path: "/app/usuarios" },
      { name: "Fornecedores", icon: <Truck />, path: "/app/fornecedores" },
      { name: "Clientes", icon: <User />, path: "/app/clientes" },
      {
        name: "Logs",
        icon: <Logs />,
        path: "/app/logs",
      },
    ],
    []
  );

  const [activeItem, setActiveItem] = useState("");

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

  return (
    <div className="w-64 z-30 bg-verdeEscuroForte fixed top-0 left-0 text-white h-full flex flex-col">
      <Logo
        src="/logo-bioverde-branco.png"
        imgClassName="size-18"
        titleClassName="text-4xl text-center tracking-wide p-2 pt-4"
      />
      <NavigationMenu.Root className="h-full w-full custom-scrollbar overflow-y-auto mb-10">
        <NavigationMenu.List className="h-full w-full p-2">
          {menuItems.map((tab, index) =>
            tab.name !== "Usuários" && tab.name !== "Dashboard" ? (
              <NavigationMenu.Item
                key={index}
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
            ) : (
              <Fragment>
                <Separator.Root className="bg-separator h-0.25 w-9/10 m-auto" />
                <NavigationMenu.Item
                  key={index}
                  className={`h-12 w-full flex items-center p-3 my-2 gap-4 font-[inter] rounded-md cursor-pointer ${
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
            )
          )}
        </NavigationMenu.List>
      </NavigationMenu.Root>
      <div className="bg-verdeEscuroConta gap-4 p-3 w-64 flex place-items-center sticky bottom-0 left-0 -m-5 ">
        <Avatar.Root className="inline-flex size-[45px] select-none items-center justify-center overflow-hidden rounded-full bg-blackA1 align-middle">
          <Avatar.Fallback className="leading-1 flex size-full items-center justify-center bg-white text-black text-[15px] font-medium text-violet11 cursor-pointer">
            AD
          </Avatar.Fallback>
        </Avatar.Root>
        <div className="flex flex-col">
          <span className="text-sm font-[inter]">Nome Sobrenome</span>
          <span className="text-xs font-[inter]">Admin</span>
        </div>
        <LogOut
          size={30}
          className="p-1 rounded-2xl hover:cursor-pointer hover:text-cinzaClaro hover:bg-hoverMenu active:bg-brancoSal active:text-black"
        />
      </div>
    </div>
  );
}
