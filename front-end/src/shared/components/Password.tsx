import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordProps = {
  passwordValue: string;
  passwordId: string;
  passwordPlaceholder: string;
  passwordInputRef?: React.RefObject<HTMLInputElement | null>;
  passwordFunction: React.ChangeEventHandler<HTMLInputElement> | undefined;
};

const Password = ({
  passwordValue,
  passwordId,
  passwordPlaceholder,
  passwordInputRef,
  passwordFunction,
}: PasswordProps) => {
  const [isHidden, setIsHidden] = useState(false);

  return (
    <div className="relative">
      <input
        type={isHidden ? "text" : "password"}
        id={passwordId}
        ref={passwordInputRef}
        placeholder={passwordPlaceholder}
        value={passwordValue}
        onChange={passwordFunction}
        className="p-2 rounded text-black bg-brancoSal w-full outline-hidden"
        minLength={8}
        required
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
