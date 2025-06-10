import { useState } from "react";
import axios from "axios";
import { StepProps } from "../../pages";
import { Email } from "./../../shared";
import { Loader2 } from "lucide-react";

export default function EmailRecoverPassword({ onNext }: StepProps) {
	const [email, setEmail] = useState("");
	const [mensagem, setMensagem] = useState("");
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	const api = axios.create({
		baseURL: "http://localhost/BioVerde/back-end/",
		withCredentials: true,
		headers: {
			"Content-Type": "application/json",
		},
	});

	const verificarEmail = async () => {
		if (!email) {
			setMensagem("Por favor, insira um e-mail.");
			return;
		}

		try {
			setLoading(true);
			const response = await api.post("recuperar-senha/recuperar.senha.php", {
				email,
			});

      if (response.data.success) {
        localStorage.setItem("session_id", response.data.session_id);
        setSuccess(true);
        setMensagem("Código enviado para seu e-mail!");
        setTimeout(() => {
          onNext();
        }, 2000);
      } else {
        setMensagem("E-mail não cadastrado.");
        setSuccess(false);
        setTimeout(() => setMensagem(""), 3000);
      }
    } catch {
      setMensagem("Erro ao conectar com o servidor.");
      setSuccess(false);
      setTimeout(() => setMensagem(""), 3000);
    } finally {
      setLoading(false);
    }
  };

	return (
		<div className="w-full space-y-6 font-montserrat">
			<Email
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				required
				autoFocus
				className="bg-[#F8F7F6] w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
			/>

			{mensagem && (
				<p
					className={`text-center p-2 rounded font-medium text-sm ${
						success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"
					}`}
				>
					{mensagem}
				</p>
			)}

      <button
        onClick={verificarEmail}
        disabled={loading}
        className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded shadow transition duration-200 flex justify-center items-center cursor-pointer"
      >
        {loading ? (
          <Loader2 className="animate-spin h-6 w-6" />
        ) : (
          "Enviar Código"
        )}
      </button>
    </div>
  );
}
