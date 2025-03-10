
export default function LoginForm() {
    return (
        <form className="flex flex-col gap-6">

          <div className="flex flex-col gap-1">
            <label htmlFor="user" className="font-[kufam] text-lg shadow-text">Usuário:</label>
            <input type="text" id="user" placeholder="Usuário" className="p-2 rounded text-black bg-brancoSal" />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="font-[kufam] text-lg shadow-text">Email:</label>
            <input type="email" id="email" placeholder="E-mail" className="p-2 rounded text-black bg-brancoSal" />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="font-[kufam] text-lg shadow-text">Senha:</label>
            <input type="password" id="password" placeholder="Senha" className="p-2 rounded text-black bg-brancoSal" />
          </div>

          <div className="flex justify-between items-center mt-1">
            <div className="flex gap-1 items-center">
              <input type="checkbox" name="remember" id="remember" className="mb-0.5" />
              <label htmlFor="remember" className="font-[kufam] text-sm text-gray-300">Lembrar-me</label>
            </div>
            <a href="#" className="font-[kufam] text-sm text-gray-300 hover:underline italic">Esqueceu a senha?</a>
          </div>
          
          <button className="bg-verdePigmento cursor-pointer tracking-wide w-[200px] h-12 m-auto p-2 rounded text-white font-[koulen] hover:bg-verdeGrama transition text-2xl sombra">ENTRAR</button>
        </form>
    );
}