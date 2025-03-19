import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios"; //Descomentar quando for usar o axios

import { Logo, InstructionsLogin, Password } from "./../shared";

export type StepProps = {
  onNext: () => void;
  onBack: () => void;
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
    <div
      className=" md:h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/fundo-login.png')" }}
    >
      <div className="flex-col md:flex md:flex-row max-w-4xl m-5 sombra rounded-2xl">
        {/* Informações e dicas */}
        <div className="w-full rounded-b-none md:rounded-bl-2xl md:w-1/2 bg-brancoSal rounded-2xl md:rounded-r-none p-6">
          <Logo />
          <InstructionsLogin />
        </div>
        {/* Formulário de Recuperação de senha */}
        <div className="w-full rounded-t-none md:rounded-t-2xl md:w-1/2 p-6 text-white rounded-2xl md:rounded-l-none bg-verdeEscuroForte border-l border-black">
          <div className="h-full box-border py-10 flex flex-col gap-10">
            <span className="font-[koulen] text-4xl text-white text-center tracking-wide shadow-title">
              RECUPERAR SENHA
            </span>
            {etapa === 1 && (
              <EmailInput
                onNext={() => setEtapa(2)}
                onBack={() => setEtapa(1)}
              />
            )}
            {etapa === 2 && (
              <CodigoInput
                onNext={() => setEtapa(3)}
                onBack={() => setEtapa(1)}
              />
            )}
            {etapa === 3 && (
              <NovaSenhaInput
                onNext={handleNewPassword}
                onBack={() => setEtapa(1)}
              />
            )}
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
  );
}

function EmailInput({ onNext }: StepProps) {
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

    onNext(); // Apenas enquanto o back-end não está pronto, quando estiver remover essa linha e descomentar as linhas de baixo

     try {
         //Aqui estou mandando o email para o back-end verificar se o email existe no banco de dados
         const response = await axios.post("http://localhost/bioverde/back-end/recuperar-senha/recuperar.senha.php", { email });
         if (response.data.success) {
             setMensagem("Código enviado para seu e-mail!");
             onNext();
         } else {
             setMensagem("E-mail não cadastrado.");
         }
     } catch {
         setMensagem("Erro ao conectar com o servidor.");
     }
  };

  return (
    <div className="h-full box-border p-6 flex flex-col justify-center ">
      <div className="h-full flex flex-col gap-8">
        <span className="font-[open_sans] text-lg shadow-text">
          Redefina a senha em duas Etapas
        </span>
        <span>Digite seu e-mail para receber um código de recuperação:</span>
        
        <input
          type="email"
          ref={emailInputRef}
          placeholder="Insira seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded text-black bg-brancoSal w-full outline-none"
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

function CodigoInput({ onNext, onBack }: StepProps) {
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
    } else {
      onNext();
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
          <p
            className="text-gray-300 cursor-pointer underline "
            onClick={onBack}
          >
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
        <p className="bg-corErro w-full p-3 text-center rounded-sm">
          {mensagem}
        </p>
      )}
      {/*Mensagem para erros*/}
      <button
        className="bg-verdePigmento cursor-pointer tracking-wide w-[200px] h-12 p-2 m-auto rounded text-white font-[bebas_neue] hover:bg-verdeGrama transition text-[25px] sombra"
        onClick={verificarCodigo}
      >
        Validar Código
      </button>
      <p>
        Se não encontrar o e-mail na sua caixa de entrada verifique a pasta de
        spam
      </p>
    </div>
  );
}

function NovaSenhaInput({ onNext }: StepProps) {
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
    } else if(senha.length < 6) {
      setMensagem("A senha deve ter pelo menos 6 caracteres");
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
