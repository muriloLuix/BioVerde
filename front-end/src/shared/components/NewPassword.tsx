import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { StepProps } from "../../pages";
import { Password } from "./../../shared";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export default function NewPassword({ onNext }: StepProps) {
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const newPasswordInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();


  useEffect(() => {
    newPasswordInputRef.current?.focus();
  }, []);

  const api = axios.create({
    baseURL: 'http://localhost/BioVerde/back-end/',
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  const redefinirSenha = async () => {
    if (!senha || !confirmarSenha) {
      setMensagem("Por favor, insira a nova senha nos dois campos.");
      newPasswordInputRef.current?.focus();
      return;
    } else if (senha.length < 8) {
      setMensagem("A senha deve ter pelo menos 8 caracteres");
      return;
    } else if (senha !== confirmarSenha) {
      setMensagem("As Senhas devem ser iguais.");
      newPasswordInputRef.current?.focus();
      return;
    }

    try {
      const sessionId = localStorage.getItem('session_id');
      const response = await api.post(
        'recuperar-senha/nova.senha.php',
        { senha },    {
          headers: {
            'X-Session-ID': sessionId
          }
        }
      );
      
      if (response.data.success) {
        setMensagem("Senha redefinida com sucesso!");
        setTimeout(() => {
          onNext();
          navigate("/");
        }, 3000);
      } else {
        setMensagem(response.data.message);
      }
    } catch (error) {
      setMensagem("Erro ao redefinir a senha.");

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
