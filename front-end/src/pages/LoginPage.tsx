import Logo from "../components/Logo"
import SecurityTips from "../components/SecurityTips"
import LoginForm from "../components/LoginForm"

export default function LoginPage() {

    return(
      <div className="h-screen bg-cover bg-center flex items-center justify-center" 
      style={{ backgroundImage: "url('/fundo-login.png')" }}>
        <div className="flex bg-neutral-50 max-w-4xl rounded-2xl">
            {/* Informações e dicas */}
            <div className="w-1/2 p-4">
                <Logo />
                <SecurityTips />
            </div>
            {/* Formulário de Login */}
            <div className="w-1/2 p-6 text-white rounded-2xl rounded-l-none bg-green-900">
                <h2 className="text-2xl font-bold text-center mb-4">LOGIN:</h2>
                <LoginForm />
            </div>
            
        </div>
      </div>
    )
}