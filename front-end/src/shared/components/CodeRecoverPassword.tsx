import { useState, useEffect, useRef } from "react";
import { StepProps } from "./../../pages";
import axios from "axios";
 import { Loader2 } from "lucide-react";

type CodeRecoverPasswordProps = StepProps

export default function CodeRecoverPassword({ onNext, onBack }: CodeRecoverPasswordProps) {
  const [codigo, setCodigo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [timer, setTimer] = useState(0);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    codeInputRef.current?.focus();
    aguardarReenvio(); 
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const verificarCodigo = async () => {
    if (!codigo) {
      setMensagem("Por favor, insira o código de verificação.");
      codeInputRef.current?.focus();
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost/BioVerde/back-end/recuperar-senha/verificar-codigo.php",
        { codigo }, 
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Resposta do back-end:", response.data);

      if (response.data.success) {
        setSuccess(true);
        setMensagem("Código validado com sucesso!");
        setTimeout(() => {
          onNext();
        }, 1000);
      } else {
        setMensagem(response.data.message);
      }
    } catch (error) {
      setMensagem("Erro ao validar o código.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const enviarCodigo = async () => {   
    try {
      setLoading(true); 
      const response = await axios.post(
        "http://localhost/BioVerde/back-end/recuperar-senha/reenviar.codigo.php",
        {}, 
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true
        }
      );

      console.log("Resposta do back-end:", response.data);

      if (response.data.success) {
        setSuccess(true);
        setMensagem("Código reenviado com sucesso!");
      } else {
        setMensagem(response.data.message);
      }
    } catch (error) {
      setMensagem("Erro ao reenviar o código.");
      console.error(error);
    } finally {
      setLoading(false);
    }
};

const aguardarReenvio = () => {
  setTimer(60); 
};

  return (
    <div className="flex flex-col items-start gap-5">
      <h2 className="font-[open_sans] text-lg shadow-text">Verificação</h2>
      <div className="flex flex-col gap-2">
        <span className="mb-1">
          Digite o código de recuperação enviado ao seu e-mail.
          <p className="text-gray-300 cursor-pointer underline" onClick={onBack}>
            Alterar
          </p>
        </span>
        <input
          type="text"
          ref={codeInputRef}
          placeholder="Código"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          className="p-2 rounded text-black bg-brancoSal w-full"
        />
        <button
          className={`w-[155px] text-start ${
            timer > 0
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-300 cursor-pointer hover:underline"
          }`}
          onClick={enviarCodigo}
          disabled={timer > 0}
        >
          {timer > 0 ? `Reenviar Código (${timer}s)` : "Reenviar Código"}
        </button>
      </div>
      {mensagem && (
        <p className={`w-full p-2 text-center rounded-sm ${success ? "bg-corSucesso" : "bg-corErro "}`}>
          {mensagem}
        </p>
      )}
      <button
        className="bg-verdePigmento cursor-pointer flex place-content-center tracking-wide w-[200px] h-12 p-2 m-auto rounded text-white font-[bebas_neue] hover:bg-verdeGrama transition text-[25px] sombra"
        onClick={verificarCodigo}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="animate-spin h-7 w-7" />
        ) : (
          "Validar Código"
        )}
      </button>
      <p>
        Se não encontrar o e-mail na sua caixa de entrada verifique a pasta de spam
      </p>
    </div>
  );
}