import { Toast } from "radix-ui";
import { X } from "lucide-react";

type NoticeModalProps = {
	successMsg: boolean;
	message: string;
	setOpenNoticeModal: React.Dispatch<React.SetStateAction<boolean>>;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const NoticeModal = ({
	successMsg,
	message,
	setOpenNoticeModal,
}: NoticeModalProps) => {
	return (
		<Toast.Provider swipeDirection="right">
			<Toast.Root
				className={`sm:w-95 w-[90vw] p-4 rounded-lg text-white sombra ${
					successMsg ? "bg-verdePigmento" : "bg-ErroModal"
				}`}
			>
				<div className="flex justify-between items-center pb-2">
					<Toast.Title className="font-bold text-lg">
						{successMsg ? "SUCESSO" : "ALERTA"}
					</Toast.Title>
					<Toast.Close className="ml-4 p-1 rounded-full hover:bg-white/20 cursor-pointer [grid-area: _close]">
						<X size={25} onClick={() => setOpenNoticeModal(false)} />
					</Toast.Close>
				</div>
				<Toast.Description>{message}</Toast.Description>
			</Toast.Root>

			<Toast.Viewport className="fixed bottom-4 right-4 z-1000" />
		</Toast.Provider>
	);
};

export default NoticeModal;
