import { Fragment, ReactNode, useEffect, useState } from "react";
import { NavigationMenu, Separator } from "radix-ui";

interface MenuItem {
  name: string;
  icon: ReactNode;
  path: string;
  restricted?: boolean;
}

interface NavBarProps {
  menuItems: MenuItem[];
  activeItem: string;
  mudarModulo: (item: { name: string; path?: string }) => void;
}

const NavBar = ({ menuItems, activeItem, mudarModulo }: NavBarProps) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  // Verifica o tamanho da tela e atualiza o estado
  const handleResize = () => {
    setIsMobile(window.innerWidth < 1024);
  };

  useEffect(() => {
    handleResize(); // Verifica ao montar
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Evita scroll do body quando o menu estiver aberto
  useEffect(() => {
    document.body.style.overflow = menuOpen && isMobile ? "hidden" : "";
  }, [menuOpen, isMobile]);

  // Fecha o menu após clicar em um item
  const handleItemClick = (tab: MenuItem) => {
    mudarModulo(tab);
    if (isMobile) setMenuOpen(false);
  };

  return (
    <>
      {/* Botão Hamburger - aparece somente em mobile */}
      {isMobile && (
        <button
          className="lg:hidden fixed top-[22px] left-4 z-[1000] flex flex-col gap-1.5"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Menu"
        >
          <span
            className={`w-6 h-0.5 bg-white transition-transform ${
              menuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          ></span>
          <span
            className={`w-6 h-0.5 bg-white transition-opacity ${
              menuOpen ? "opacity-0" : ""
            }`}
          ></span>
          <span
            className={`w-6 h-0.5 bg-white transition-transform ${
              menuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          ></span>
        </button>
      )}

      <NavigationMenu.Root
        className={`fixed top-15 lg:top-20 left-0 h-full lg:w-64 w-full bg-verdeEscuroForte shadow-lg z-[999] transition-transform duration-300 overflow-y-auto custom-scrollbar 
        ${isMobile ? (menuOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
        ${isMobile ? "p-1 px-3 " : ""}
        `}
      >
        <NavigationMenu.List className="h-full w-full p-2 overflow-y-auto custom-scrollbar mb-13 lg:mb-36">
          {menuItems.map((tab, idx) => {
            const showSep = tab.name === "Dashboard"|| tab.name === "Usuários";
            const isActive = activeItem === tab.name;

            return (
              <Fragment key={idx}>
                {showSep && <Separator.Root className="bg-separator h-[1px] w-[100%] lg:w-[90%] m-auto" />}
                <NavigationMenu.Item
                  className={`
                    h-12 w-full flex items-center p-3 my-2 gap-4 font-[inter] rounded-md cursor-pointer
                    ${isActive ? "bg-brancoSal text-black" : "text-cinzaClaro hover:bg-hoverMenu"}
                  `}
                  onClick={() => handleItemClick(tab)}
                >
                  {tab.icon}
                  {tab.name}
                </NavigationMenu.Item>
              </Fragment>
            );
          })}
        </NavigationMenu.List>
      </NavigationMenu.Root>
    </>
  );
};

export default NavBar;
