import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { StepProps } from "../../pages";
import { Password } from "./../../shared";

export default function NewPassword({ onNext }: StepProps) {
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const newPasswordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    newPasswordInputRef.current?.focus();
  }, []);

  const redefinirSenha = async () => {
    if (!senha || !confirmarSenha) {
      setMensagem("Por favor, insira a nova senha nos dois campos.");
      newPasswordInputRef.current?.focus();
    } else if (senha.length < 8) {
      setMensagem("A senha deve ter pelo menos 8 caracteres");
    } else if (senha === confirmarSenha) {
      //Aqui ficará a logica para verificar qual email esta sendo feito a troca de senha e então alterar
      setMensagem("");
      onNext();
    } else {
      setMensagem("As Senhas devem ser iguais.");
      newPasswordInputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <span className="font-[open_sans] text-lg shadow-text">
        Crie um nova senha
      </span>
      <p>Digite sua nova senha e confirme:</p>
      <Password
        passwordId="new-password"
        passwordInputRef={newPasswordInputRef}
        passwordValue={senha}
        passwordPlaceholder="Insira sua nova senha"
        passwordFunction={(e) => setSenha(e.target.value)}
      />
      <Password
        passwordId="confirm-password"
        passwordValue={confirmarSenha}
        passwordPlaceholder="Confirme sua nova senha"
        passwordFunction={(e) => setConfirmarSenha(e.target.value)}
      />
      {mensagem && (
        <p className="bg-corErro w-full p-3 text-center rounded-sm">
          {mensagem}
        </p>
      )}
      <button
        className="bg-verdePigmento cursor-pointer tracking-wide w-[200px] h-12 p-2 m-auto rounded text-white font-[bebas_neue] hover:bg-verdeGrama transition text-[25px] sombra"
        onClick={redefinirSenha}
      >
        Redefinir Senha
      </button>
      <Link to={"/"} className="text-gray-300 cursor-pointer hover:underline">
        <i className="fa-solid fa-arrow-left" /> Voltar para o login
      </Link>
    </div>
  );
}
