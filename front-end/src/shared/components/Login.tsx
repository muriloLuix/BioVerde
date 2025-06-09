// Login.tsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Toast } from "radix-ui";
import { Loader2 } from "lucide-react";
import axios from "axios";
import Password from "./Password";
import Email from "./Email";

const MIN_PASSWORD_LENGTH = 8;

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isChecked, setIsChecked] = useState(false);
	const [message, setMessage] = useState("");
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		// validação antes de enviar
		if (password.length < MIN_PASSWORD_LENGTH) {
			setMessage(
				`A senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`
			);
			return;
		}

		setMessage("");
		setLoading(true);

		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/login/login.php",
				{ email, password },
				{
					headers: { "Content-Type": "application/json" },
					withCredentials: true,
				}
			);

			if (response.data.success) {
				setMessage("");
				setOpen(true);
				setTimeout(() => navigate("/app/dashboard"), 1000);
			} else {
				setMessage(response.data.message);
			}
		} catch (error) {
			setMessage("Erro ao conectar com o servidor");
		} finally {
			setLoading(false);
		}
	};

	// mostrar erro inline enquanto digita
	const passwordTooShort =
		password.length > 0 && password.length < MIN_PASSWORD_LENGTH;

	return (
		<Form.Root onSubmit={handleSubmit} className="space-y-6 font-montserrat">
			{/* Campo de e-mail */}
			<Form.Field name="email" className="w-full">
				<Form.Label className="block text-sm font-medium text-gray-700">
					E-mail
				</Form.Label>
				<Form.Control asChild>
					<Email
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						autoFocus
						className="bg-[#F8F7F6] mt-1 block w-full border border-gray-400 rounded-md shadow-sm p-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
						placeholder="Insira seu e-mail"
					/>
				</Form.Control>
			</Form.Field>

			{/* Campo de senha */}
			<Form.Field name="password" className="w-full">
				<Form.Label className="block text-sm font-medium text-gray-700">
					Senha
				</Form.Label>
				<Form.Control asChild>
					<Password
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="bg-[#F8F7F6] mt-1 block w-full border border-gray-400 rounded-md shadow-sm p-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
						placeholder="Insira sua senha"
					/>
				</Form.Control>
				{passwordTooShort && (
					<p className="text-red-600 text-sm mt-1">
						A senha deve ter no mínimo {MIN_PASSWORD_LENGTH} caracteres.
					</p>
				)}
			</Form.Field>

			{/* Lembrar acesso e recuperar senha */}
			<div className="flex items-center justify-between text-sm">
				<label className="flex items-center space-x-2 text-gray-700">
					<input
						type="checkbox"
						checked={isChecked}
						onChange={() => setIsChecked(!isChecked)}
						className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
					/>
					<span>Lembrar o acesso</span>
				</label>
				<Link
					to="/recuperar-senha"
					className="text-sm text-gray-600 hover:underline"
				>
					Esqueceu sua senha?
				</Link>
			</div>

			{/* Mensagem de erro geral (servidor, validação no submit, etc.) */}
			{message && (
				<p className="text-red-600 bg-red-100 p-2 text-center rounded">
					{message}
				</p>
			)}

			{/* Botão de envio */}
			<Form.Submit asChild>
				<button
					type="submit"
					className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded shadow transition duration-200 hover:cursor-pointer"
					disabled={loading}
				>
					{loading ? (
						<Loader2 className="m-auto animate-spin h-6 w-6" />
					) : (
						"Entrar"
					)}
				</button>
			</Form.Submit>

			{/* Toast de sucesso */}
			<Toast.Provider swipeDirection="right">
				<Toast.Root
					className="fixed bottom-4 left-4 w-80 p-4 rounded-lg text-white bg-green-700 shadow-lg z-50"
					open={open}
					onOpenChange={setOpen}
					duration={3000}
				>
					<Toast.Title className="font-bold">Sucesso!</Toast.Title>
					<Toast.Description>Login realizado com sucesso!</Toast.Description>
				</Toast.Root>

				<Toast.Viewport className="fixed bottom-4 left-4 z-50" />
			</Toast.Provider>
		</Form.Root>
	);
}
