import { useState } from "react";
import axios from "axios";
import { StepProps } from "../../pages";
import { Email } from "./../../shared";
import { Loader2 } from "lucide-react";

export default function EmailRecoverPassword({ onNext }: StepProps) {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const api = axios.create({
    baseURL: 'http://localhost/BioVerde/back-end/',
    withCredentials: true, 
    headers: {
      'Content-Type': 'application/json',
    }
  });

  const verificarEmail = async () => {

    if (!email) {
      setMensagem("Por favor, insira um e-mail.");
      return;
    }
  
    try {
      setLoading(true);
      const response = await api.post(
        "recuperar-senha/recuperar.senha.php",
        { email },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true
        }
      );
      console.log("Resposta do back-end:", response.data);
      
      if (response.data.success) {
        localStorage.setItem('session_id', response.data.session_id);
        setSuccess(true);
        setMensagem("Código enviado para seu e-mail!");
        setTimeout(() => {
          onNext();
        }, 2000);
      } else {
        setMensagem("E-mail não cadastrado.");
        setTimeout(() => {
          setMensagem("");
        }, 3000);
      }
    } catch (error) {
      setMensagem("Erro ao conectar com o servidor.");
      setTimeout(() => {
        setMensagem("");
      }, 2000);
      console.error(error);
    } finally {
      setLoading(false);
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
          value={email}
          onChange={(e) => { setEmail(e.target.value); }}
          required
          autoFocus 
        />
        {mensagem && (
          <p className={`w-full p-2 text-center rounded-sm ${success ? "bg-corSucesso" : "bg-corErro "}`}>
            {mensagem}
          </p>
        )}
        {/*Mensagem para erros*/}
        {/* <div className="flex justify-center items-center  w-full"> */}
          <button
            className="bg-verdePigmento cursor-pointer flex place-content-center tracking-wide w-full h-12 p-2 m-x-auto rounded text-white font-[bebas_neue] hover:bg-verdeGrama transition text-xl sombra"
            onClick={verificarEmail}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="animate-spin h-7 w-7" />
            ) : (
              "Enviar Código"
            )}
          </button>
        {/* </div> */}
      </div>
    </div>
  );
}
