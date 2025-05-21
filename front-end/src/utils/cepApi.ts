type CepResponse = {
	erro?: boolean;
	logradouro: string;
	localidade: string;
	uf: string;
};

export async function cepApi(
	cep: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	setFormData: React.Dispatch<React.SetStateAction<any>>,
	setOpenModal: (open: boolean) => void,
	setMessage: (msg: string) => void,
	setSuccessMsg: (sucessMsg: boolean) => void
) {
	const cepLimpo = cep.replace(/\D/g, "");

	if (cepLimpo.length !== 8) {
		return;
	}

	setSuccessMsg(false);

	try {
		const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
		const data: CepResponse = await response.json();

		if (data.erro) {
			setOpenModal(true);
			setMessage("CEP não encontrado.");
			return data.erro;
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		setFormData((prevData: any) => ({
			...prevData,
			endereco: data.logradouro,
			estado: data.uf,
			cidade: data.localidade,
		}));

		return data;
	} catch (error) {
		console.error("Erro ao buscar o CEP:", error);
		alert("Erro ao buscar o CEP. Tente novamente.");
	}
}
