import { useState, useEffect, useMemo } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Package,          
  Boxes,            
  Layers,           
  Factory,          
  BarChart2,        
  ShoppingCart,     
  Users,           
  Truck,           
  User,             
  UserCircle,       
  Settings,
  Bell,      
} from "lucide-react";

import Logo from "./Logo";
import { Separator } from "radix-ui";

export default function LayoutSideBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = useMemo(
    () => [
      { name: "Dashboards", icon: <LayoutDashboard/>, path: "/app/dashboard" },
      { name: "Controle de Estoque", icon: <Package />, path: "/app/controle-estoque" },
      { name: "Estrutura de Produtos", icon: <Boxes />, path: "/app/estrututa-produtos" },
      { name: "Etapas de Produtos", icon: <Layers />, path: "/app/etapas-producao" },
      { name: "Consumo de Insumos", icon: <Factory />, path: "/app/consumo-insumos" },
      { name: "Relatórios", icon: <BarChart2 />, path: "/app/relatorios" },
      { name: "Pedidos", icon: <ShoppingCart />, path: "/app/pedidos" },
      { name: "Usuários", icon: <Users />, path: "/app/usuarios" },
      { name: "Fornecedores", icon: <Truck />, path: "/app/fornecedores" },
      { name: "Clientes", icon: <User />, path: "/app/clientes" },
      { name: "Conta", icon: <UserCircle />, },
      { name: "Configurações", icon: <Settings />, },
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
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-64 z-1000 bg-verdeEscuroForte fixed top-0 left-0 text-white h-full flex flex-col">
        <Logo
          src="/logo-bioverde-branco.png"
          imgClassName="h-15 w-15 md:w-20 md:h-19 md:mr-1"
          titleClassName="md:text-[40px] text-4xl md:mr-3 tracking-wide"
        />
        <Separator.Root className="bg-separator w-[81%] h-[1px] ml-5 mb-3 mt-0" />
        <nav className="flex-1 custom-scrollbar overflow-y-auto mb-13 pl-5">
          <ul>
            {menuItems.map((item) => (
              <React.Fragment key={item.name}>
                <li
                  className={`p-2.5 my-2 mr-5 cursor-pointer rounded-[5px] transition text-[15px] font-[inter] flex items-center justify-start gap-2  ${
                    activeItem === item.name
                      ? "bg-brancoSal text-black"
                      : "text-cinzaClaro hover:bg-hoverMenu"
                  } `}
                  onClick={() => mudarModulo(item)}
                >
                  {item.icon}
                  {item.name}
                </li>

                {(item.name === "Pedidos" || item.name === "Clientes") && (
                  <Separator.Root className="bg-separator w-[92%] h-[1px] my-4" />
                )}
              </React.Fragment>
            ))}
          </ul>
        </nav>
        <div className="bg-verdeEscuroConta gap-3 p-3 w-64 flex items-center sticky bottom-0 left-0 -m-5 ">
          <User size={40} />
          <div>
            <p className="text-sm font-[inter]">Nome Sobrenome</p>
            <p className="text-sm font-[inter]">Admin</p>
          </div>
          <Bell size={25} className="ml-auto" />
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 bg-brancoSal h-screen p-6 pl-[280px]">
        <Outlet />
      </main>
    </div>
  );
}
