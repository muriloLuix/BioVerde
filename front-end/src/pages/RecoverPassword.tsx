import { useState } from "react";
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
        <button className="bg-verdePigmento cursor-pointer tracking-wide w-[200px] h-12 p-2 m-auto rounded text-white font-[bebas_neue] hover:bg-verdeGrama transition text-[25px] sombra" onClick={onNext}>Enviar Código</button>
      </div>
    );
}

function CodigoInput({ onNext, onBack }: StepProps) {
    const [codigo, setCodigo] = useState("");
    
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
            <p>Reenviar Código</p>
        </div>
        <button className="bg-verdePigmento cursor-pointer tracking-wide w-[200px] h-12 p-2 m-auto rounded text-white font-[bebas_neue] hover:bg-verdeGrama transition text-[25px] sombra" onClick={onNext}>Validar Código</button>
        <p>Se não encontrar o e-mail na sua caixa de entrada verifique a pasta de spam</p>
      </div>
    );
}

function NovaSenhaInput({ onNext }: StepProps) {
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");

    return (
    <div className="flex flex-col gap-5">
        <h2 className="font-[open_sans] text-lg shadow-text">Crie um nova senha:</h2> 
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
  
  
  