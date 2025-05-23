import axios from "axios";

interface CheckAuthParams {
	navigate: (path: string) => void;
	setMessage: (msg: string) => void;
	setOpenNoticeModal: (open: boolean) => void;
}

export const checkAuth = async ({
	navigate,
	setMessage,
	setOpenNoticeModal,
}: CheckAuthParams): Promise<void> => {
	try {
		const response = await axios.get(
			"http://localhost/BioVerde/back-end/auth/check_session.php",
			{ withCredentials: true }
		);

		if (!response.data.loggedIn) {
			setMessage("Sessão expirada. Por favor, faça login novamente.");
			setOpenNoticeModal(true);
			setTimeout(() => {
				navigate("/");
			}, 1900);
		}
	} catch (error) {
		console.error("Erro ao verificar sessão:", error);
		setMessage("Sessão expirada. Por favor, faça login novamente.");
		setOpenNoticeModal(true);
		setTimeout(() => {
			navigate("/");
		}, 1900);
	}
};
