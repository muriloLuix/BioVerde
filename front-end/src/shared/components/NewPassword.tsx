import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Password } from "./../../shared";
import axios from "axios";
import { Toast } from "radix-ui";
import { Loader2 } from "lucide-react";
import { StepProps } from "../../utils/types";

export default function NewPassword({ onNext }: StepProps) {
	const [senha, setSenha] = useState("");
	const [confirmarSenha, setConfirmarSenha] = useState("");
	const [mensagem, setMensagem] = useState("");
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();

	const api = axios.create({
		baseURL: "http://localhost/BioVerde/back-end/",
		withCredentials: true,
		headers: {
			"Content-Type": "application/json",
		},
	});

	const redefinirSenha = async () => {
		if (!senha || !confirmarSenha) {
			setMensagem("Por favor, insira a nova senha nos dois campos.");
			return;
		}
		if (senha.length < 8) {
			setMensagem("A senha deve ter pelo menos 8 caracteres.");
			return;
		}
		if (senha !== confirmarSenha) {
			setMensagem("As senhas devem ser iguais.");
			return;
		}

		try {
			setLoading(true);
			const sessionId = localStorage.getItem("session_id");

			const response = await api.post(
				"recuperar-senha/nova.senha.php",
				{ senha },
				{
					headers: { "X-Session-ID": sessionId || "" },
				}
			);

			if (response.data.success) {
				setMensagem("");
				setOpen(true);
				setTimeout(() => {
					onNext();
					navigate("/");
				}, 3000);
			} else {
				setMensagem(response.data.message);
			}
		} catch {
			setMensagem("Erro ao redefinir a senha.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="bg-[#F2F0EF] w-full font-montserrat space-y-6">
			<div>
				<h2 className="text-lg font-semibold text-gray-700">Nova Senha</h2>
				<p className="text-sm text-gray-600">
					Digite e confirme sua nova senha abaixo.
				</p>
			</div>

			<Password
				id="newPassword"
				name="newPassword"
				placeholder="Nova senha"
				value={senha}
				onChange={(e) => setSenha(e.target.value)}
				className="bg-[#F8F7F6] w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
			/>

			<Password
				id="confirmPassword"
				name="confirmPassword"
				placeholder="Confirmar nova senha"
				value={confirmarSenha}
				onChange={(e) => setConfirmarSenha(e.target.value)}
				className="bg-[#F8F7F6] w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
			/>

			{mensagem && (
				<p className="text-red-600 bg-red-100 p-2 text-center rounded text-sm font-medium">
					{mensagem}
				</p>
			)}

			<button
				onClick={redefinirSenha}
				disabled={loading}
				className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded shadow transition duration-200 flex justify-center items-center hover:cursor-pointer"
			>
				{loading ? (
					<Loader2 className="animate-spin h-6 w-6" />
				) : (
					"Redefinir Senha"
				)}
			</button>

			<Link
				to="/"
				className="text-sm text-gray-500 hover:underline text-center block"
			>
				← Voltar para o login
			</Link>

			<Toast.Provider swipeDirection="right">
				<Toast.Root
					className="fixed bottom-4 left-4 w-80 p-4 rounded-lg text-white bg-green-700 shadow-lg z-50"
					open={open}
					onOpenChange={setOpen}
					duration={3000}
				>
					<Toast.Title className="font-bold">Sucesso!</Toast.Title>
					<Toast.Description>Senha redefinida com sucesso!</Toast.Description>
				</Toast.Root>

				<Toast.Viewport className="fixed bottom-4 left-4 z-50" />
			</Toast.Provider>
		</div>
	);
}
