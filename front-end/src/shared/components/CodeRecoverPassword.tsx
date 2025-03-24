import { useState, useEffect, useRef } from "react";
import { StepProps } from "./../../pages";
import axios from "axios";

interface CodeRecoverPasswordProps extends StepProps {}

export default function CodeRecoverPassword({ onNext, onBack }: CodeRecoverPasswordProps) {
  const [codigo, setCodigo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [timer, setTimer] = useState(0);
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    codeInputRef.current?.focus();
    enviarCodigo();
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
      const response = await axios.post(
        "http://localhost/BioVerde/back-end/recuperar-senha/verificar-codigo.php",
        { codigo }, 
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // console.log("Resposta do back-end:", response.data);

      if (response.data.success) {
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
    }
  };

  const enviarCodigo = () => {
    setTimer(60); // Inicia o timer de 60 segundos
    // Aqui você pode chamar a API para enviar um novo código
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
        <p className="bg-corErro w-full p-3 text-center rounded-sm">{mensagem}</p>
      )}
      <button
        className="bg-verdePigmento cursor-pointer tracking-wide w-[200px] h-12 p-2 m-auto rounded text-white font-[bebas_neue] hover:bg-verdeGrama transition text-[25px] sombra"
        onClick={verificarCodigo}
      >
        Validar Código
      </button>
      <p>
        Se não encontrar o e-mail na sua caixa de entrada verifique a pasta de spam
      </p>
    </div>
  );
}