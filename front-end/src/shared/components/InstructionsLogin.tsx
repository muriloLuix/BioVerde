
export default function InstructionsLogin() {
    return(
        <div>
            <h3 className="font-[open_sans] text-base my-3">Para acessar sua conta, siga os passos abaixo:</h3>

            <ul className="font-[open_sans] text-sm text-gray-800 list-decimal pl-4">
            <li className="mb-2">Digite seu e-mail ou nome de usuário no campo correspondente.</li>
            <li className="mb-2">Insira sua senha corretamente (maiúsculas e minúsculas fazem diferença).</li> 
            <li className="mb-2">⚠️Caso esteja usando a senha temporária enviada ao seu email, clique em "Esqueci minha senha" para redefini-la!</li>
            <li className="mb-2">Clique no botão "Entrar" para acessar o sistema.</li>
            </ul>

            <p className="font-[open_sans] py-2 text-sm font-medium">🔒 Esqueceu sua senha?</p>
            <p className="font-[open_sans] text-gray-800 pb-2 text-sm pl-0">Clique em "Esqueci minha senha" e siga as instruções para redefinição.</p>
            <p className="font-[open_sans] py-2 text-sm font-medium">✅ Dicas de Segurança:</p>

            <ul className="font-[open_sans] text-sm text-gray-800 list-disc pl-8">
            <li className="mb-2">Nunca compartilhe sua senha com ninguém.</li>
            <li className="mb-2">Se estiver acessando de um computador público, não marque "Lembrar".</li>
            </ul>
            
            <p className="font-[open_sans] text-sm pt-2">Não tem cadastro ou precisa de ajuda? Entre em contato com o suporte. 🚀</p>
            
        </div>
    )
}