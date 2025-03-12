import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const response = await axios.post("http://localhost/bioverde-backend/api/login.php", {
            user,
            email,
            password
        });
        alert(response.data.message);
    } catch  {
        alert("Erro ao conectar com o servidor.");
    }
  };

    return (
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>

          <div className="flex flex-col gap-1">
            <label htmlFor="user" className="font-[open_sans] text-lg shadow-text">Usuário:</label>
            <input type="text" id="user" placeholder="Usuário" value={user} onChange={(e) => setUser(e.target.value)} className="p-2 rounded text-black bg-brancoSal" />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="font-[open_sans] text-lg shadow-text">Email:</label>
            <input type="email" id="email" placeholder="E-mail" value={email}  onChange={(e) => setEmail(e.target.value)} className="p-2 rounded text-black bg-brancoSal " />
          </div>

          <div className="flex flex-col gap-1 relative">
            <label htmlFor="password" className="font-[open_sans] text-lg shadow-text">Senha:</label>
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="p-2 rounded text-black bg-brancoSal w-full pr-10"
                />
                {/* Botão de Mostrar/Ocultar Senha */}
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
          </div>

          <div className="flex justify-between items-center mt-1">
            <div className="flex gap-1 items-center">
              <input type="checkbox" name="remember" id="remember"/>
              <label htmlFor="remember" className="font-[open_sans] text-sm text-gray-300">Lembrar-me</label>
            </div>
            <Link to="/recuperar-senha" className="font-[open_sans] text-sm text-gray-300 hover:underline italic">Esqueceu a senha?</Link>
          </div>
          
          <button type="submit" className="bg-verdePigmento cursor-pointer tracking-wide w-[200px] h-12 m-auto p-2 rounded text-white font-[koulen] hover:bg-verdeGrama transition text-2xl sombra">ENTRAR</button>
        </form>
    );
}