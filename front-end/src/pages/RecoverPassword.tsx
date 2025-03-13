import { useState, useEffect  } from "react";
import axios from "axios";
import Logo from "../components/Logo"
import InstructionsLogin from "../components/InstructionsLogin"

type StepProps = {
    onNext: () => void;
    onBack : () => void;
};

export default function RecoverPassword() {
    const [etapa, setEtapa] = useState(1);

    return(
      <div className="h-screen bg-cover bg-center flex items-center justify-center" 
      style={{ backgroundImage: "url('/fundo-login.png')" }}>
        <div className="flex max-w-4xl m-5 sombra rounded-2xl">
            {/* Informações e dicas */}
            <div className="w-1/2 bg-brancoSal rounded-2xl rounded-r-none p-6">
                <Logo />
                <InstructionsLogin />
            </div>
            {/* Formulário de Recuperação de senha */}
            <div className="w-1/2 p-6 text-white rounded-2xl rounded-l-none bg-verdeEscuroForte border-l border-black">
                <h2 className="shadow-title font-[koulen] text-5xl text-center tracking-wide text-white mt-[22px] mb-9">RECUPERAR SENHA:</h2>
                <div>
                    {etapa === 1 && <EmailInput onNext={() => setEtapa(2)} onBack={() => setEtapa(1)} />}
                    {etapa === 2 && <CodigoInput onNext={() => setEtapa(3)} onBack={() => setEtapa(1)} />}
                    {etapa === 3 && <NovaSenhaInput onNext={() => alert("Senha alterada!")} onBack={() => setEtapa(1)} />}
                </div>
            </div>  
            
        </div>
      </div>
    )
}

function EmailInput({ onNext }: StepProps) {
    const [email, setEmail] = useState("");
    const [mensagem, setMensagem] = useState("");

    const verificarEmail = async () => {

      if (!email) {
        setMensagem("Por favor, insira um e-mail.");
        return;
      }

      try {
          //Aqui estou mandando o email para o back-end verificar se o email existe no banco de dados
          const response = await axios.post("http://localhost/bioverde-backend/api/verificar_email.php", { email });
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
      <div className="flex flex-col items-start gap-5">
        <h2 className="font-[open_sans] text-lg shadow-text">Redefina a senha em duas Etapas</h2>
        <div>
            <p className="mb-1">Digite seu e-mail para receber um código de recuperação:</p>
            <input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 rounded text-black bg-brancoSal w-full"
            />
        </div>
        {mensagem && <p className="bg-corErro w-full p-3 text-center rounded-sm">{mensagem}</p>}
        <button className="bg-verdePigmento cursor-pointer tracking-wide w-[200px] h-12 p-2 m-auto rounded text-white font-[bebas_neue] hover:bg-verdeGrama transition text-[25px] sombra" onClick={verificarEmail}>Enviar Código</button>
      </div>
    );
}

function CodigoInput({ onNext, onBack }: StepProps) {
    const [codigo, setCodigo] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [timer, setTimer] = useState(0);

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
        return;
      } else {
        onNext();
      }

    }

    const reenviarCodigo = () => {
      setTimer(60); // Inicia o timer de 60 segundos
      // Aqui você pode chamar a API para enviar um novo código
    };
    
    return (
      <div className="flex flex-col items-start gap-5">
        <h2 className="font-[open_sans] text-lg shadow-text">Verificação</h2>
        <div className="flex flex-col gap-2">
            <p className="mb-1">Digite o código de recuperação enviado ao seu e-mail. 
                <p className="text-gray-300 cursor-pointer underline " onClick={onBack}>Alterar</p>
            </p>
            <input
              type="text"
              placeholder="Código"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="p-2 rounded text-black bg-brancoSal w-full"
            />
            <button 
              className={`w-[155px] text-start ${timer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-300 cursor-pointer hover:underline'}`}
              onClick={reenviarCodigo} 
              disabled={timer > 0}
              >{timer > 0 ? `Reenviar Código (${timer}s)` : "Reenviar Código"}
            </button>
        </div>
        {mensagem && <p className="bg-corErro w-full p-3 text-center rounded-sm">{mensagem}</p>}
        <button 
          className="bg-verdePigmento cursor-pointer tracking-wide w-[200px] h-12 p-2 m-auto rounded text-white font-[bebas_neue] hover:bg-verdeGrama transition text-[25px] sombra" 
          onClick={verificarCodigo} 
          >Validar Código
        </button>
        <p>Se não encontrar o e-mail na sua caixa de entrada verifique a pasta de spam</p>
      </div>
    );
}

function NovaSenhaInput({ onNext }: StepProps) {
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");

    return (
    <div className="flex flex-col gap-5">
        <h2 className="font-[open_sans] text-lg shadow-text">Crie um nova senha</h2> 
        <p >Digite sua nova senha e confirme:</p>
        <input 
        type="password" 
        placeholder="Nova Senha" 
        value={senha} 
        onChange={(e) => setSenha(e.target.value)}
        className="p-2 rounded text-black bg-brancoSal w-full"
        />
        <input 
        type="password" 
        placeholder="Confirme a Nova Senha" 
        value={confirmarSenha} 
        onChange={(e) => setConfirmarSenha(e.target.value)}
        className="p-2 rounded text-black bg-brancoSal w-full"
        />
        <button className="bg-verdePigmento cursor-pointer tracking-wide w-[200px] h-12 p-2 m-auto rounded text-white font-[bebas_neue] hover:bg-verdeGrama transition text-[25px] sombra" onClick={onNext}>Redefinir Senha</button>
    </div>
    );
}
  
  
  