import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordProps = {
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  passwordValue: string;
};

const Password = ({ setPassword, passwordValue }: PasswordProps) => {
  const [isHidden, setIsHidden] = useState(false);

  return (
    <div className="relative">
      <input
        type={isHidden ? "text" : "password"}
        id="password"
        placeholder="Senha"
        value={passwordValue}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 rounded text-black bg-brancoSal w-full outline-hidden"
      />
      {/* Botão de Mostrar/Ocultar Senha */}
      <button
        type="button"
        onClick={() => setIsHidden(!isHidden)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
      >
        {isHidden ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
};

export default Password;
