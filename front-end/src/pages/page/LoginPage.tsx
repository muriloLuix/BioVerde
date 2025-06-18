import { Login } from "../../shared";
import { motion } from "framer-motion";
import usePageTitle from "../../hooks/usePageTitle";

export default function LoginPage() {
	usePageTitle();
	return (
		<div className="flex flex-col lg:flex-row h-screen font-montserrat">
			{/* Seção de Login */}
			<div className="w-full h-full lg:w-1/2 flex items-center justify-center bg-[#F2F0EF] px-6 py-12 shadow-lg">
				<div className="max-w-md w-full">
					{/* Logo */}
					<motion.div
						initial={{ y: 0, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="flex items-center  mb-6 gap-4"
					>
						<img
							src="/logo-bioverde.png"
							alt="Logo Bio Verde"
							className="h-14 w-14 lg:h-20 lg:w-20"
						/>
						<h1 className="text-4xl lg:text-5xl font-bold tracking-wide text-green-700">
							BIOVERDE
						</h1>
					</motion.div>

					<h2 className="text-2xl font-bold italic mb-1">Seja bem vindo</h2>
					<p className="text-gray-600 mb-8">
						Por favor, faça o login na sua conta.
					</p>
					<Login />
				</div>
			</div>
			{/* Seção com imagem */}
			<div className="hidden md:flex w-1/2 relative font-montserrat">
				{/* Imagem de fundo */}
				<img
					src="/soja.jpg"
					alt="Agricultura"
					className="absolute inset-0 w-full h-full object-cover"
				/>
				<h2 className="text-2xl font-bold italic mb-1">Seja bem vindo</h2>
				<p className="text-gray-600 mb-8">
					Por favor, faça o login na sua conta.
				</p>
				<Login />
			</div>
		</div>
	);
}
