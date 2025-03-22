import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { StepProps } from "../../pages";
import { Email } from "./../../shared";

export default function EmailRecoverPassword({ onNext }: StepProps) {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const verificarEmail = async () => {
  
    if (!email) {
      setMensagem("Por favor, insira um e-mail.");
      emailInputRef.current?.focus();
      return;
    }
  
    try {
      const response = await axios.post(
        "http://localhost/BioVerde/back-end/recuperar-senha/recuperar.senha.php",
        { email }
      );
      
      if (response.data.success) {
        setMensagem("Código enviado para seu e-mail!");
        setTimeout(() => {
          onNext();
        }, 2000);
      } else {
        setMensagem("E-mail não cadastrado.");
        setTimeout(() => {
          setMensagem("");
        }, 2000);
      }
    } catch (error) {
      setMensagem("Erro ao conectar com o servidor.");
      setTimeout(() => {
        setMensagem("");
      }, 2000);
      console.error(error);
    }
  };
  

  return (
    <div className="h-full box-border p-6 flex flex-col justify-center ">
      <div className="h-full flex flex-col gap-8">
        <span className="font-[open_sans] text-lg shadow-text">
          Redefina a senha em duas Etapas
        </span>
        <span>Digite seu e-mail para receber um código de recuperação:</span>
        <Email
          emailId="email"
          emailInputRef={emailInputRef}
          emailValue={email}
          emailPlaceholder="E-mail"
          emailFunction={(e) => {
            setEmail(e.target.value);
          }}
        />
        {mensagem && (
          <p className="bg-corErro w-full p-3 text-center rounded-sm">
            {mensagem}
          </p>
        )}
        {/*Mensagem para erros*/}
        <button
          className="bg-verdePigmento cursor-pointer tracking-wide w-full h-12 p-2 m-auto rounded text-white font-[bebas_neue] hover:bg-verdeGrama transition text-xl sombra"
          onClick={verificarEmail}
        >
          Enviar Código
        </button>
      </div>
    </div>
  );
}
