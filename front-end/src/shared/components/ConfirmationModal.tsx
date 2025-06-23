import { AlertDialog } from "radix-ui";
import { Loader2 } from "lucide-react";

type ConfirmationModalProps = {
	openModal: boolean;
	setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
	confirmationText: string;
	confirmationButtonName?: string;
	confirmationButtonClassname?: string;
	confirmationLeftButtonText: string;
	confirmationRightButtonText: string;
	confirmationModalTitle?: string;
	onConfirm?: (event: React.MouseEvent<HTMLButtonElement>) => void;
	loading?: Set<string>;
	isLoading?: boolean;
	isLogout?: boolean;
};

const ConfirmationModal = ({
	openModal,
	setOpenModal,
	confirmationText,
	confirmationButtonName,
	confirmationButtonClassname,
	confirmationLeftButtonText,
	confirmationRightButtonText,
	confirmationModalTitle,
	onConfirm,
	isLoading,
	isLogout,
}: ConfirmationModalProps) => {
	return (
		<AlertDialog.Root open={openModal} onOpenChange={setOpenModal}>
			<AlertDialog.Trigger asChild>
				<button
					className={
						confirmationButtonClassname ? confirmationButtonClassname : "hidden"
					}
				>
					{confirmationButtonName}
				</button>
			</AlertDialog.Trigger>
			<AlertDialog.Portal>
				<AlertDialog.Overlay className="bg-black/50 fixed inset-0 z-100" />
				<AlertDialog.Content
					className={`fixed z-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 bg-brancoSal rounded-xl shadow-lg`}
				>
					<AlertDialog.Title className="text-xl font-[inter] font-bold">
						{confirmationModalTitle}
					</AlertDialog.Title>
					<AlertDialog.Description className="py-3 px-2 my-2 text-gray-800">
						{confirmationText}
					</AlertDialog.Description>
					<div className="gap-3 flex justify-end">
						<AlertDialog.Cancel asChild>
							<button
								type="button"
								className="bg-gray-100 py-3 px-6 rounded-xl text-black cursor-pointer flex place-content-center gap-2 hover:bg-gray-200"
								aria-label="Close"
							>
								{confirmationLeftButtonText}
							</button>
						</AlertDialog.Cancel>
						<AlertDialog.Action asChild>
							<button
								type="button"
								className={`bg-red-600 py-3 px-6 rounded-xl text-white cursor-pointer flex place-content-center gap-2 hover:bg-red-700 ${
									isLogout ? "w-[100px]" : "w-[186px]"
								}`}
								onClick={onConfirm}
							>
								{isLoading ? (
									<Loader2 className="animate-spin h-6 w-6" />
								) : (
									confirmationRightButtonText
								)}
							</button>
						</AlertDialog.Action>
					</div>
				</AlertDialog.Content>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	);
};

export default ConfirmationModal;
