import { useState } from "react";

import {
  Logo,
  InstructionsLogin,
  EmailRecoverPassword,
  CodeRecoverPassword,
  NewPassword,
} from "./../../shared";

export type StepProps = {
  onNext: () => void;
  onBack?: () => void;
};

export default function RecoverPassword() {
  const [etapa, setEtapa] = useState(1);
  const [showPopup, setShowPopup] = useState(false);

  const handleNewPassword = () => {
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };

  return (
    <div className="h-full w-full">
      <div
        className=" md:h-screen bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('/fundo-login.png')" }}
      >
        <div className="flex-col md:flex md:flex-row max-w-4xl m-5 sombra rounded-2xl h-[610px]">
          {/* Informações e dicas */}
          <div className="w-full rounded-b-none md:rounded-bl-2xl md:w-1/2 bg-brancoSal rounded-2xl md:rounded-r-none p-6">
            <Logo
              src="/logo-bioverde.png"
              imgClassName="h-15 w-15 md:w-20 md:h-20 md:mr-4"
              titleClassName="md:text-5xl text-4xl tracking-wide"
              gap="gap-5"
            />
            <InstructionsLogin />
          </div>
          {/* Formulário de Recuperação de senha */}
          <div className="w-full rounded-t-none md:rounded-t-2xl md:w-1/2 p-6 text-white rounded-2xl md:rounded-l-none bg-verdeEscuroForte border-l border-black">
            <div className="h-full box-border py-10 flex flex-col gap-10">
              <span className="font-[koulen] text-4xl text-white text-center tracking-wide shadow-title">
                RECUPERAR SENHA
              </span>
              {etapa === 1 && (
                <EmailRecoverPassword onNext={() => setEtapa(2)} />
              )}
              {etapa === 2 && (
                <CodeRecoverPassword
                  onNext={() => setEtapa(3)}
                  onBack={() => setEtapa(1)}
                />
              )}
              {etapa === 3 && <NewPassword onNext={handleNewPassword} />}
            </div>
          </div>
        </div>

        {/* Pop-up de confirmação */}
        {showPopup && (
          <div className="fixed bottom-10 right-10 bg-green-500 text-white py-3 px-5 rounded-lg shadow-lg">
            Senha alterada com sucesso!
          </div>
        )}
      </div>
    </div>
  );
}
