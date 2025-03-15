import Logo from "../components/Logo";
import InstructionsLogin from "../components/InstructionsLogin";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <div
      className="h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/fundo-login.png')" }}
    >
      <div className="flex max-w-4xl m-5 sombra rounded-2xl">
        {/* Informações e dicas */}
        <div className="w-1/2 bg-brancoSal rounded-2xl rounded-r-none p-6">
          <Logo />
          <InstructionsLogin />
        </div>
        {/* Formulário de Login */}
        <div className="w-1/2 p-6 text-white rounded-2xl rounded-l-none bg-verdeEscuroForte border-l border-black">
          <h2 className="shadow-title font-[koulen] text-5xl text-center tracking-wide text-white mt-[22px] mb-9">
            LOGIN
          </h2>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
