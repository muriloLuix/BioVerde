import { useState } from "react";
import axios from "axios";

export default function LoginForm() {
  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
            <label htmlFor="user" className="font-[kufam] text-lg shadow-text">Usuário:</label>
            <input type="text" id="user" placeholder="Usuário" value={user} onChange={(e) => setUser(e.target.value)} className="p-2 rounded text-black bg-brancoSal" />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="font-[kufam] text-lg shadow-text">Email:</label>
            <input type="email" id="email" placeholder="E-mail" value={email}  onChange={(e) => setEmail(e.target.value)} className="p-2 rounded text-black bg-brancoSal" />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="font-[kufam] text-lg shadow-text">Senha:</label>
            <input type="password" id="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="p-2 rounded text-black bg-brancoSal" />
          </div>

          <div className="flex justify-between items-center mt-1">
            <div className="flex gap-1 items-center">
              <input type="checkbox" name="remember" id="remember" className="mb-0.5" />
              <label htmlFor="remember" className="font-[kufam] text-sm text-gray-300">Lembrar-me</label>
            </div>
            <a href="#" className="font-[kufam] text-sm text-gray-300 hover:underline italic">Esqueceu a senha?</a>
          </div>
          
          <button type="submit" className="bg-verdePigmento cursor-pointer tracking-wide w-[200px] h-12 m-auto p-2 rounded text-white font-[koulen] hover:bg-verdeGrama transition text-2xl sombra">ENTRAR</button>
        </form>
    );
}