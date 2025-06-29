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
	withExitButton?: boolean;
	withXButton?: boolean;
	leftButtonText?: string;
	rightButtonText?: string;
	modalWidth?: string;
	isLoading?: boolean;
	isRegister?: boolean;
	registerButtonText?: string;
	isOrderModal?: boolean;
	isSideButton?: boolean;
	totalPedido?: number;
	onCancel?: () => void;
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
	modalWidth,
	rightButtonText,
	leftButtonText,
	isOrderModal,
	isLoading,
	totalPedido,
	withXButton,
	isRegister,
	registerButtonText,
	isSideButton,
	onCancel,
	onSubmit,
	onDelete,
}: ModalProps) => {
	return (
		<Dialog.Root open={openModal} onOpenChange={setOpenModal}>
			<Dialog.Trigger asChild>
				<button className={buttonClassname ? buttonClassname : "hidden"}>
					{buttonName}
				</button>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="bg-black/50 fixed inset-0 z-50" />
				<Dialog.Content
					className={`fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${modalWidth} p-6 bg-brancoSal rounded-lg shadow-lg md:max-h-[90vh] max-h-[100vh] overflow-auto custom-scrollbar-modal`}
				>
					<Dialog.Title className="text-2xl font-[inter] font-semibold flex justify-between items-center">
						{modalTitle}
						{withXButton ? (
							<Dialog.Close asChild>
								<button className="text-gray-700 hover:text-gray-800 cursor-pointer rounded-full p-1 hover:bg-gray-200">
									<X />
								</button>
							</Dialog.Close>
						) : (
							modalSecondTitle
						)}
					</Dialog.Title>
					<Dialog.Description
						className={`py-4 px-2 pb-0 flex flex-col gap-2 ${
							isOrderModal && "justify-between min-h-[40vh]"
						}`}
					>
						{withExitButton ? (
							<>
								{children}

								<div
									className={`mt-3 ${
										isOrderModal && "flex justify-between items-center"
									}`}
								>
									{isOrderModal && (
										<span className="lg:text-lg text-sm">
											Total do Pedido:{" "}
											<strong>R$ {totalPedido?.toFixed(2)}</strong>
										</span>
									)}
									<Dialog.Close asChild>
										<div className="flex justify-end">
											<button
												className="bg-green-600 p-2 w-[88.52px] rounded-xl text-white cursor-pointer flex place-content-center gap-2 hover:bg-green-700"
												aria-label="Close"
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
								<div className={`${isSideButton && "flex"}`}>
									{children}
									{isRegister ? (
										<Form.Submit asChild>
											<div className="flex place-content-center mt-6">
												<button
													type="submit"
													className={`bg-green-600 font-semibold rounded-lg text-white cursor-pointer sombra  hover:bg-green-700 flex place-content-center ${
														isSideButton
															? "p-2 w-40 h-11 mt-3 ml-7 text-sm"
															: "p-4 w-50"
													}`}
												>
													{isLoading ? (
														<Loader2 className="animate-spin h-6 w-6" />
													) : (
														<span className={`${isSideButton && "mt-1"}`}>
															{registerButtonText}
														</span>
													)}
												</button>
											</div>
										</Form.Submit>
									) : (
										<div className="flex justify-end items-center gap-3 m-2">
											<Dialog.Close asChild>
												<button
													type="button"
													onClick={onCancel}
													className="bg-gray-100 py-3 px-6 rounded-xl text-black cursor-pointer flex place-content-center gap-2 hover:bg-gray-200"
													aria-label="Close"
												>
													{leftButtonText}
												</button>
											</Dialog.Close>

											<Form.Submit>
												<button
													type="submit"
													className="bg-green-600 py-3 px-6 w-[88.52px] rounded-xl text-white cursor-pointer flex place-content-center gap-2  hover:bg-green-700"
												>
													{isLoading ? (
														<Loader2 className="animate-spin h-6 w-6" />
													) : (
														rightButtonText
													)}
												</button>
											</Form.Submit>
										</div>
									)}
								</div>
							</Form.Root>
						)}
					</Dialog.Description>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
};

export default Modal;
