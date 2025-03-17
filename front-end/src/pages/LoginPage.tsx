import Logo from "../components/Logo";
import InstructionsLogin from "../components/InstructionsLogin";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
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
        {/* Formulário de Login */}
        <div className="w-full rounded-t-none md:rounded-t-2xl md:w-1/2 p-6 text-white rounded-2xl md:rounded-l-none bg-verdeEscuroForte border-l border-black">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
