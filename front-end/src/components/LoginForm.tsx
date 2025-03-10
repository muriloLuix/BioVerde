
export default function LoginForm() {
    return (
        <form className="flex flex-col gap-4">
          <input type="text" placeholder="Usuário" className="p-2 rounded text-black" />
          <input type="email" placeholder="E-mail" className="p-2 rounded text-black" />
          <input type="password" placeholder="Senha" className="p-2 rounded text-black" />
          <a href="#" className="text-sm text-gray-300 hover:underline">Esqueceu a senha?</a>
          <button className="bg-green-500 p-2 rounded text-white font-bold hover:bg-green-600 transition">ENTRAR</button>
        </form>
    );
}