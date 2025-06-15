import { useEffect, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { useNavigate, useLocation, Outlet } from "react-router-dom";

const tabMap = {
  "/app/controle-estoque/lista-estoque": "list",
  "/app/controle-estoque/movimentacoes": "movements",
  "/app/controle-estoque/avisos": "notices",
} as const;

const reverseMap = {
  list: "/app/controle-estoque/lista-estoque",
  movements: "/app/controle-estoque/movimentacoes",
  notices: "/app/controle-estoque/avisos",
} as const;

type TabKey = keyof typeof reverseMap;

export default function InventoryControl() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("list");

  // Se o usuário acessar "/app/controle-estoque", redireciona para "/lista-estoque"
  useEffect(() => {
    if (location.pathname === "/app/controle-estoque") {
      navigate("/app/controle-estoque/lista-estoque", { replace: true });
    } else {
      const tab = tabMap[location.pathname as keyof typeof tabMap];
      if (tab) setActiveTab(tab as TabKey);
    }
  }, [location.pathname, navigate]);

  const handleChangeTab = (value: string) => {
    const path = reverseMap[value as TabKey];
    setActiveTab(value as TabKey);
    navigate(path);
  };

  return (
    <div className="flex-1 lg:p-6 lg:pl-[280px] pt-20 font-[inter]">
      <div className="h-10 w-full flex items-center justify-center mb-3">
        <span className="text-4xl font-semibold text-center">Controle de estoque</span>
      </div>

      <Tabs.Root className="w-full px-3" value={activeTab} onValueChange={handleChangeTab}>
        <Tabs.List className="flex gap-5 border-b border-verdePigmento relative">
          <Tabs.Trigger
            value="list"
            className={`relative px-4 py-2 text-verdePigmento font-medium cursor-pointer ${
              activeTab === "list" ? "select animation-tab" : ""
            }`}
          >
            Lotes em Estoque
          </Tabs.Trigger>

          <Tabs.Trigger
            value="movements"
            className={`relative px-4 py-2 text-verdePigmento font-medium cursor-pointer ${
              activeTab === "movements" ? "select animation-tab" : ""
            }`}
          >
            Movimentações do Estoque
          </Tabs.Trigger>

        </Tabs.List>

		{/* Conteúdo da aba selecionada */}
        <Outlet />
        
      </Tabs.Root>
    </div>
  );
}
