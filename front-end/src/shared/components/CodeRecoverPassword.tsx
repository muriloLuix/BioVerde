import { useState, useEffect, useRef } from "react";
import { StepProps } from "./../../pages";
import axios from "axios";
import { Loader2 } from "lucide-react";

type CodeRecoverPasswordProps = StepProps;

export default function CodeRecoverPassword({
	onNext,
	onBack,
}: CodeRecoverPasswordProps) {
	const [codigo, setCodigo] = useState("");
	const [mensagem, setMensagem] = useState("");
	const [timer, setTimer] = useState(0);
	const codeInputRef = useRef<HTMLInputElement>(null);
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	useEffect(() => {
		codeInputRef.current?.focus();
		aguardarReenvio();
	}, []);

	useEffect(() => {
		if (timer > 0) {
			const interval = setInterval(() => {
				setTimer((prev) => prev - 1);
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [timer]);

	const verificarCodigo = async () => {
		if (!codigo) {
			setMensagem("Por favor, insira o código de verificação.");
			codeInputRef.current?.focus();
			return;
		}

		try {
			setLoading(true);
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/recuperar-senha/verificar-codigo.php",
				{ codigo }
			);

			if (response.data.success) {
				setSuccess(true);
				setMensagem("Código validado com sucesso!");
				setTimeout(() => {
					onNext();
				}, 1000);
			} else {
				setSuccess(false);
				setMensagem(response.data.message);
			}
		} catch (error) {
			setSuccess(false);
			setMensagem("Erro ao validar o código.");
		} finally {
			setLoading(false);
		}
	};

	const enviarCodigo = async () => {
		try {
			setLoading(true);
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/recuperar-senha/reenviar.codigo.php",
				{},
				{
					withCredentials: true,
					headers: { "Content-Type": "application/json" },
				}
			);

			if (response.data.success) {
				setSuccess(true);
				setMensagem("Código reenviado com sucesso!");
				aguardarReenvio();
			} else {
				setSuccess(false);
				setMensagem(response.data.message);
			}
		} catch (error) {
			setSuccess(false);
			setMensagem("Erro ao reenviar o código.");
		} finally {
			setLoading(false);
		}
	};

	const aguardarReenvio = () => {
		setTimer(60);
	};

	return (
		<div className="bg-[#F2F0EF] w-full font-montserrat space-y-6">
			<div>
				<h2 className="text-lg font-semibold text-gray-700">Verificação</h2>
				<p className="text-sm text-gray-600">
					Digite o código de recuperação enviado ao seu e-mail.
					<span
						onClick={onBack}
						className="ml-2 text-green-700 hover:underline cursor-pointer"
					>
						Alterar e-mail
					</span>
				</p>
			</div>

			<input
				type="text"
				ref={codeInputRef}
				placeholder="Código"
				value={codigo}
				onChange={(e) => setCodigo(e.target.value)}
				className="bg-[#F8F7F6] w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-black"
			/>

			<button
				onClick={enviarCodigo}
				disabled={timer > 0}
				className={`text-sm ${
					timer > 0
						? "text-gray-400 cursor-not-allowed"
						: "text-green-700 hover:underline cursor-pointer"
				}`}
			>
				{timer > 0 ? `Reenviar Código (${timer}s)` : "Reenviar Código"}
			</button>

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
				onClick={verificarCodigo}
				disabled={loading}
				className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded shadow transition duration-200 flex justify-center items-center hover:cursor-pointer"
			>
				{loading ? (
					<Loader2 className="animate-spin h-6 w-6" />
				) : (
					"Validar Código"
				)}
			</button>

			<p className="text-xs text-gray-500 text-center">
				Se não encontrar o e-mail na sua caixa de entrada, verifique a pasta de
				spam.
			</p>
		</div>
	);
}
