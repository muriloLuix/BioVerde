import { useState, useRef, useEffect } from "react";
import { Avatar } from "radix-ui";
import { LogOut } from "lucide-react";

interface UserProfileProps {
  userInitials: string;
  userName: string;
  userLevel: string;
  setOpenLogoutModal: () => void;
}

const UserProfile = ({
  userInitials,
  userName,
  userLevel,
  setOpenLogoutModal,
}: UserProfileProps) => {
  const [showUserInfo, setShowUserInfo] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null); 
  const [animateDropdown, setAnimateDropdown] = useState(false);

  // Fecha dropdown ao clicar fora (apenas em mobile)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        window.innerWidth < 1024 &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowUserInfo(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    if (window.innerWidth < 1024) {
      if (showUserInfo) {
        setAnimateDropdown(false);
        setTimeout(() => setShowUserInfo(false), 200);
      } else {
        setShowUserInfo(true);
        setTimeout(() => setAnimateDropdown(true), 10); // atraso mínimo p/ ativar classe com transição
      }
    }
  };

  return (
    <div className="relative p-3 pl-0 lg:p-0 " ref={containerRef}>
      {/* Avatar + conteúdo fixo */}
      <div
        className={`lg:bg-verdeEscuroConta sticky bottom-0 left-0
        flex items-center transition-all duration-300 
        gap-5 pl-0 w-fit lg:w-64 lg:gap-5 lg:p-3`}
      >
        <Avatar.Root
          className="inline-flex lg:size-11 size-10 select-none items-center justify-center overflow-hidden rounded-full bg-white text-black font-medium"
          onClick={toggleDropdown}
        >
          <Avatar.Fallback className="leading-1 flex size-full items-center justify-center text-[15px]">
            {userInitials || "AD"}
          </Avatar.Fallback>
        </Avatar.Root>

        {/* Conteúdo desktop (sempre visível em telas grandes) */}
        <div className="hidden lg:flex items-center gap-5">
          <div className="flex flex-col">
            <span className="text-sm font-[inter]">{userName}</span>
            <span className="text-xs font-[inter]">{userLevel}</span>
          </div>
          <button title="Sair">
              <LogOut
                size={30}
                className="p-1 rounded-2xl hover:cursor-pointer hover:text-cinzaClaro hover:bg-hoverMenu active:bg-brancoSal active:text-black"
                onClick={setOpenLogoutModal}
              />
          </button>
        </div>
      </div>

      {/* Dropdown mobile */}
      {showUserInfo && (
        <div className={`absolute top-full bg-verdeEscuroConta right-0 shadow-lg rounded-xl 
            rounded-tr-none p-4 min-w-50 z-1000 lg:hidden transition-all duration-200 transform 
            ${animateDropdown ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`
        }>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">
              {userName}
            </span>
            <span className="text-xs">
              {userLevel}
            </span>
          </div>
          <div 
            className="flex items-center gap-2 mt-3 p-1 rounded-xl w-fit hover:cursor-pointer hover:text-cinzaClaro hover:bg-hoverMenu"
            onClick={setOpenLogoutModal}
          >
            <span className="text-sm text-white font-semibold">Sair</span>
            <LogOut
              size={21}
              className="text-white"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
