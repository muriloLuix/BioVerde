import { useState } from "react";
import {
	EmailRecoverPassword,
	CodeRecoverPassword,
	NewPassword,
} from "./../../shared";

export default function RecoverPassword() {
	const [etapa, setEtapa] = useState(1);
	const [showPopup, setShowPopup] = useState(false);

	const handleNewPassword = () => {
		setShowPopup(true);
		setTimeout(() => {
			setShowPopup(false);
		}, 3000);
	};

	return (
		<div className="flex flex-col md:flex-row h-screen font-montserrat">
			{/* Seção esquerda com conteúdo */}
			<div className="w-full md:w-1/2 flex items-center justify-center bg-[#F2F0EF] px-6 py-12 shadow-lg">
				<div className="max-w-md w-full">
					<div className="flex items-center mb-6 gap-4">
						<img
							src="/logo-bioverde.png"
							alt="Logo Bio Verde"
							className="h-14 w-14 md:h-20 md:w-20"
						/>
						<h1 className="text-4xl md:text-5xl font-bold tracking-wide text-green-700">
							BIOVERDE
						</h1>
					</div>
					<h2 className="text-2xl font-bold italic mb-1">Recuperar Senha</h2>
					<p className="text-gray-600 mb-8">
						Informe os dados necessários para redefinir sua senha.
					</p>
					<div className="space-y-6">
						{etapa === 1 && <EmailRecoverPassword onNext={() => setEtapa(2)} />}
						{etapa === 2 && (
							<CodeRecoverPassword
								onNext={() => setEtapa(3)}
								onBack={() => setEtapa(1)}
							/>
						)}
						{etapa === 3 && <NewPassword onNext={handleNewPassword} />}
					</div>
				</div>
			</div>

			<div className="hidden md:flex w-1/2 relative font-montserrat">
				{/* Imagem de fundo */}
				<img
					src="/soja.jpg"
					alt="Agricultura"
					className="absolute inset-0 w-full h-full object-cover"
				/>

				{/* Overlay esverdeado claro */}
				<div className="absolute inset-0 bg-green-200 opacity-40 mix-blend-multiply"></div>

				{/* Texto alinhado à direita e centralizado verticalmente */}
				<div className="relative z-10 flex items-center justify-end w-full h-full pr-10">
					<div className="text-white text-4xl font-semibold text-right">
						<p className="leading-relaxed">Da terra com cuidado,</p>
						<p>para sua mesa com saúde.</p>
					</div>
				</div>
			</div>

			{/* Pop-up de confirmação */}
			{showPopup && (
				<div className="fixed bottom-10 right-10 bg-green-600 text-white py-3 px-5 rounded-lg shadow-lg font-semibold">
					Senha alterada com sucesso!
				</div>
			)}
		</div>
	);
}
