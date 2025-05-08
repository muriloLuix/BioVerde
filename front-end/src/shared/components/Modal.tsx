import { useEffect, useRef } from "react";
import { Dialog, Form } from "radix-ui";
import { Loader2, X } from "lucide-react";

type ModalProps = {
	openModal: boolean;
	setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
	buttonName?: string;
	children?: React.ReactNode;
	buttonClassname?: string;
	modalTitle: string | React.ReactNode;
	modalSecondTitle?: string | React.ReactNode;
	obsText?: string;
	withExitButton?: boolean;
	withXButton?: boolean;
	submitButtonText?: string;
	cancelButtonText?: string;
	registerButtonText?: string;
	modalWidth?: string;
	isLoading?: boolean;
	isRegister?: boolean;
	isOrderModal?: boolean;
	totalPedido?: number;
	onExit?: () => void;
	onDelete?: () => void;
	onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Modal = ({
	openModal,
	setOpenModal,
	children,
	buttonName,
	buttonClassname,
	modalTitle,
	modalSecondTitle,
	withExitButton,
	withXButton,
	modalWidth,
	obsText,
	cancelButtonText,
	submitButtonText,
	registerButtonText,
	isOrderModal,
	isLoading,
	isRegister,
	totalPedido,
	onExit,
	onSubmit,
	onDelete,
}: ModalProps) => {

	//Função para limpar os dados após o modal fechar
	const prevOpenRef = useRef(openModal);
	useEffect(() => {
		if (prevOpenRef.current && !openModal) {
			onExit?.();
		}
		prevOpenRef.current = openModal;
	}, [openModal, onExit]);

	return (
		<Dialog.Root open={openModal} onOpenChange={setOpenModal}>
			<Dialog.Trigger asChild>
				<button className={buttonClassname ? buttonClassname : "hidden"}>
					{buttonName}
				</button>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="bg-black/50 fixed inset-0 z-40" />
				<Dialog.Content
					className={`fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${modalWidth} p-6 bg-brancoSal rounded-lg shadow-lg max-h-[90vh] overflow-auto custom-scrollbar-modal`}
				>
					<Dialog.Title className="text-2xl font-[inter] font-semibold flex justify-between items-center">
						{modalTitle}
						{withXButton ? (
							<Dialog.Close asChild>
								<button 
								className="text-gray-700 hover:text-gray-800 cursor-pointer rounded-full p-1 hover:bg-gray-200"
								>
									<X />
								</button>
							</Dialog.Close>
						) : modalSecondTitle}	
					</Dialog.Title>
					<Dialog.Description className="py-4 px-2 pb-0 flex flex-col gap-2">
						{withExitButton ? (
							<>
								{isOrderModal ? (
									children
								) : obsText ? (
									<p className="text-gray-800 break-words">{obsText}</p>
								) : (
									<p className="text-gray-800 break-words">
										Não há nenhuma observação.
									</p>
								)}

								<div
									className={`mt-3 ${
										isOrderModal && "flex justify-between items-center"
									}`}
								>
									{isOrderModal && (
										<span className="text-lg">
											Total do Pedido:{" "}
											<strong>R$ {totalPedido?.toFixed(2)}</strong>
										</span>
									)}
									<Dialog.Close asChild>
										<div className="flex justify-end">
											<button
												className="bg-verdeMedio p-2 w-[88.52px] rounded-xl text-white cursor-pointer flex place-content-center gap-2 hover:bg-verdeEscuro"
											>
												Fechar
											</button>
										</div>
									</Dialog.Close>
								</div>
							</>
						) : (
							<Form.Root
								className="flex flex-col"
								onSubmit={(e) => {
									if (onSubmit) {
										onSubmit(e);
									} else if (onDelete) {
										e.preventDefault();
										onDelete();
									}
								}}
							>
								{children}
									{isRegister ? (
										<Form.Submit asChild>
											<div className="flex place-content-center mt-6">
											<button
												type="submit"
												className="bg-verdePigmento p-4 font-semibold rounded-lg text-white cursor-pointer sombra  hover:bg-verdeGrama flex place-content-center w-50"
												// disabled={loading.size > 0}
											>
												{isLoading ? (
													<Loader2 className="animate-spin h-6 w-6" />
												) : (
													registerButtonText
												)}
											</button>
											</div>
										</Form.Submit>
									) : (
										<div className="flex justify-end items-center gap-3 m-2">
											<Dialog.Close asChild>
												<button
												type="button"
												className="bg-gray-300 p-3 px-6 rounded-xl text-black cursor-pointer flex place-content-center gap-2 hover:bg-gray-400"
												>
													{cancelButtonText}
												</button>
											</Dialog.Close>
											
											<Form.Submit>
												<button
												type="submit"
												className="bg-verdePigmento p-3 px-6 w-[88.52px] rounded-xl text-white cursor-pointer flex place-content-center gap-2  hover:bg-verdeGrama"
												// disabled={!!loading?.size}
												>
												{isLoading ? (
													<Loader2 className="animate-spin h-6 w-6" />
												) : (
													submitButtonText
												)}
												</button>
											</Form.Submit>
										</div>
									)}
							</Form.Root>
						)}
					</Dialog.Description>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
};

export default Modal;
